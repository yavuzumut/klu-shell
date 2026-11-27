import { complete } from '../core/shell/completion';
import type { Shell } from '../core/shell/Shell';
import type { CommandRecord } from '../core/shell/types';

/** The subset of xterm's Terminal the editor needs (easy to fake in tests). */
export interface TerminalLike {
  write(data: string): void;
  readonly cols: number;
}

export interface LineEditorOptions {
  /** Called after every executed line; may return extra text to print before the next prompt. */
  onExecuted?: (record: CommandRecord) => string | void;
}

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1b\[[0-9;]*[A-Za-z]/g;
// eslint-disable-next-line no-control-regex
const ESCAPE_SEQ = /^\x1b(?:\[[0-9;]*[A-Za-z~]|O[A-Za-z])/;

const visibleLength = (s: string) => s.replace(ANSI_RE, '').length;
const safeTerminalText = (s: string) => s.replace(/[\x00-\x1f\x7f-\x9f]/g, (char) => `\\x${char.charCodeAt(0).toString(16).padStart(2, '0')}`);

/**
 * Readline-like line editor on top of a raw terminal:
 * cursor movement, history (↑/↓), tab completion, Ctrl shortcuts.
 */
export class LineEditor {
  private buffer = '';
  private cursor = 0;
  /** Cursor offset (in cells from the prompt start) as currently drawn on screen. */
  private drawnCursor = 0;
  private historyIndex: number | null = null;
  private draft = '';
  private busy = false;

  constructor(
    private term: TerminalLike,
    private shell: Shell,
    private options: LineEditorOptions = {},
  ) {}

  /** Print the first prompt. */
  start(): void {
    this.drawnCursor = 0;
    this.render();
  }

  get value(): string {
    return this.buffer;
  }

  get isBusy(): boolean {
    return this.busy;
  }

  // ------------------------------------------------------------- rendering

  private get promptLength(): number {
    return visibleLength(this.shell.prompt);
  }

  /** Redraw prompt + buffer, handling lines that wrap past the terminal width. */
  render(): void {
    const cols = Math.max(1, this.term.cols);
    const pl = this.promptLength;
    let out = '';
    const drawnRow = Math.floor((pl + this.drawnCursor) / cols);
    if (drawnRow > 0) out += `\x1b[${drawnRow}A`;
    const displayBuffer = safeTerminalText(this.buffer);
    const displayCursor = visibleLength(safeTerminalText(this.buffer.slice(0, this.cursor)));
    out += '\r\x1b[J' + this.shell.prompt + displayBuffer;

    const end = pl + visibleLength(displayBuffer);
    // At an exact multiple of cols xterm keeps the cursor in a "pending wrap"
    // state on the previous row; force the wrap so our row math stays valid.
    if (end > 0 && end % cols === 0) out += ' \b';

    const target = pl + displayCursor;
    const up = Math.floor(end / cols) - Math.floor(target / cols);
    if (up > 0) out += `\x1b[${up}A`;
    out += '\r';
    const col = target % cols;
    if (col > 0) out += `\x1b[${col}C`;

    this.term.write(out);
    this.drawnCursor = this.cursor;
  }

  /** Move the cursor below the current input so new output starts on a clean line. */
  private moveBelowInput(): void {
    this.cursor = this.buffer.length;
    this.render();
    this.term.write('\r\n');
  }

  /** Print a message above the prompt (e.g. lesson notifications). */
  printAbove(text: string): void {
    if (this.busy) {
      this.term.write(text.endsWith('\n') ? text : text + '\n');
      return;
    }
    const cols = Math.max(1, this.term.cols);
    const drawnRow = Math.floor((this.promptLength + this.drawnCursor) / cols);
    let out = drawnRow > 0 ? `\x1b[${drawnRow}A` : '';
    out += '\r\x1b[J' + text + (text.endsWith('\n') ? '' : '\n');
    this.term.write(out);
    this.drawnCursor = 0;
    this.render();
  }

  /** Clear the screen, optionally print a banner, and show a fresh prompt. */
  resetScreen(banner?: string): void {
    this.buffer = '';
    this.cursor = 0;
    this.historyIndex = null;
    this.term.write('\x1b[2J\x1b[3J\x1b[H' + (banner ? (banner.endsWith('\n') ? banner : banner + '\n') : ''));
    this.drawnCursor = 0;
    this.render();
  }

  // ----------------------------------------------------------------- input

  /** Insert text at the cursor (used by clickable example commands). */
  insert(text: string): void {
    if (this.busy) return;
    const clean = text.replace(/[\r\n]+/g, ' ');
    this.buffer = this.buffer.slice(0, this.cursor) + clean + this.buffer.slice(this.cursor);
    this.cursor += clean.length;
    this.render();
  }

  /** Replace the whole input line. */
  setValue(text: string): void {
    this.buffer = text;
    this.cursor = text.length;
    this.render();
  }

  /** Feed raw data from xterm's onData. */
  handleData(data: string): void {
    let i = 0;
    while (i < data.length) {
      if (this.busy) return; // ignore typing while a command runs
      const rest = data.slice(i);
      const esc = ESCAPE_SEQ.exec(rest);
      if (esc) {
        this.handleEscape(esc[0]);
        i += esc[0].length;
        continue;
      }
      const ch = data[i];
      i++;
      switch (ch) {
        case '\r':
        case '\n':
          void this.submit();
          // Remaining pasted text is dropped while the command runs.
          return;
        case '\x7f':
        case '\b':
          if (this.cursor > 0) {
            this.buffer = this.buffer.slice(0, this.cursor - 1) + this.buffer.slice(this.cursor);
            this.cursor--;
            this.render();
          }
          break;
        case '\t':
          this.tabComplete();
          break;
        case '\x03': // Ctrl+C
          this.cursor = this.buffer.length;
          this.render();
          this.term.write('^C\r\n');
          this.buffer = '';
          this.cursor = 0;
          this.historyIndex = null;
          this.drawnCursor = 0;
          this.render();
          break;
        case '\x0c': // Ctrl+L
          this.term.write('\x1b[2J\x1b[3J\x1b[H');
          this.drawnCursor = 0;
          this.render();
          break;
        case '\x01': // Ctrl+A
          this.cursor = 0;
          this.render();
          break;
        case '\x05': // Ctrl+E
          this.cursor = this.buffer.length;
          this.render();
          break;
        case '\x15': // Ctrl+U
          this.buffer = this.buffer.slice(this.cursor);
          this.cursor = 0;
          this.render();
          break;
        case '\x0b': // Ctrl+K
          this.buffer = this.buffer.slice(0, this.cursor);
          this.render();
          break;
        case '\x17': {
          // Ctrl+W: delete previous word
          const before = this.buffer.slice(0, this.cursor).replace(/\S+\s*$/, '');
          this.buffer = before + this.buffer.slice(this.cursor);
          this.cursor = before.length;
          this.render();
          break;
        }
        default:
          if (ch >= ' ' && ch !== '\x7f') {
            // Batch consecutive printable characters (fast typing / paste)
            let text = ch;
            while (i < data.length && data[i] >= ' ' && data[i] !== '\x7f' && data[i] !== '\x1b') {
              text += data[i++];
            }
            this.insert(text);
          }
      }
    }
  }

  private handleEscape(seq: string): void {
    switch (seq) {
      case '\x1b[A':
      case '\x1bOA':
        this.historyUp();
        break;
      case '\x1b[B':
      case '\x1bOB':
        this.historyDown();
        break;
      case '\x1b[C':
      case '\x1bOC':
        if (this.cursor < this.buffer.length) {
          this.cursor++;
          this.render();
        }
        break;
      case '\x1b[D':
      case '\x1bOD':
        if (this.cursor > 0) {
          this.cursor--;
          this.render();
        }
        break;
      case '\x1b[H':
      case '\x1bOH':
      case '\x1b[1~':
        this.cursor = 0;
        this.render();
        break;
      case '\x1b[F':
      case '\x1bOF':
      case '\x1b[4~':
        this.cursor = this.buffer.length;
        this.render();
        break;
      case '\x1b[3~': // Delete
        if (this.cursor < this.buffer.length) {
          this.buffer = this.buffer.slice(0, this.cursor) + this.buffer.slice(this.cursor + 1);
          this.render();
        }
        break;
    }
  }

  private historyUp(): void {
    const history = this.shell.history;
    if (!history.length) return;
    if (this.historyIndex === null) {
      this.draft = this.buffer;
      this.historyIndex = history.length;
    }
    if (this.historyIndex > 0) this.historyIndex--;
    this.setValue(history[this.historyIndex]);
  }

  private historyDown(): void {
    if (this.historyIndex === null) return;
    const history = this.shell.history;
    this.historyIndex++;
    if (this.historyIndex >= history.length) {
      this.historyIndex = null;
      this.setValue(this.draft);
    } else {
      this.setValue(history[this.historyIndex]);
    }
  }

  private tabComplete(): void {
    const before = this.buffer.slice(0, this.cursor);
    const after = this.buffer.slice(this.cursor);
    const result = complete(before, this.shell);
    if (result.options.length) {
      this.moveBelowInput();
      this.term.write(result.options.join('  ') + '\r\n');
      this.drawnCursor = 0;
      this.cursor = before.length;
      this.render();
      return;
    }
    if (result.line !== before) {
      this.buffer = result.line + after;
      this.cursor = result.line.length;
      this.render();
    }
  }

  private async submit(): Promise<void> {
    const line = this.buffer;
    this.moveBelowInput();
    this.buffer = '';
    this.cursor = 0;
    this.historyIndex = null;
    this.draft = '';

    if (line.trim()) {
      this.busy = true;
      try {
        const record = await this.shell.execute(line);
        const text = record.output.map((c) => c.text).join('');
        if (text) {
          this.term.write(text);
          // Keep the prompt at column 0 unless the screen was just cleared.
          if (!text.endsWith('\n') && !text.endsWith('\x1b[H')) this.term.write('\r\n');
        }
        const extra = this.options.onExecuted?.(record);
        if (extra) this.term.write(extra.endsWith('\n') ? extra : extra + '\n');
      } finally {
        this.busy = false;
      }
    }
    this.drawnCursor = 0;
    this.render();
  }
}
