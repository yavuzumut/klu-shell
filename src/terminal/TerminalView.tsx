import { FitAddon } from '@xterm/addon-fit';
import { Terminal, type ITheme } from '@xterm/xterm';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { Shell } from '../core/shell/Shell';
import type { CommandRecord } from '../core/shell/types';
import { LineEditor } from './LineEditor';

export interface TerminalHandle {
  /** Type text into the input line (does not execute). */
  insert(text: string): void;
  /** Replace the whole input line with new text. */
  setLine(text: string): void;
  /** Send raw key data, e.g. '\t' or '\x1b[A' (mobile key bar). */
  sendKey(data: string): void;
  focus(): void;
  refreshPrompt(): void;
  printAbove(text: string): void;
  resetScreen(banner?: string): void;
}

interface Props {
  shell: Shell;
  onExecuted?: (record: CommandRecord) => string | void;
  terminalTheme?: ITheme;
}

const THEME = {
  background: '#0b0f17',
  foreground: '#d6deeb',
  cursor: '#7ee787',
  cursorAccent: '#0b0f17',
  selectionBackground: '#264f78',
  black: '#1b2130',
  red: '#ff7b72',
  green: '#7ee787',
  yellow: '#e3b341',
  blue: '#79c0ff',
  magenta: '#d2a8ff',
  cyan: '#56d4dd',
  white: '#d6deeb',
  brightBlack: '#6e7681',
  brightRed: '#ffa198',
  brightGreen: '#aff5b4',
  brightYellow: '#f8e3a1',
  brightBlue: '#a5d6ff',
  brightMagenta: '#e2c5ff',
  brightCyan: '#b3f0ff',
  brightWhite: '#ffffff',
};

export const TerminalView = forwardRef<TerminalHandle, Props>(function TerminalView(
  { shell, onExecuted, terminalTheme },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const editorRef = useRef<LineEditor | null>(null);
  const onExecutedRef = useRef(onExecuted);
  onExecutedRef.current = onExecuted;

  useEffect(() => {
    const container = containerRef.current!;
    // A dedicated element per mount, so a deferred dispose can't touch a newer terminal.
    const host = document.createElement('div');
    host.style.height = '100%';
    container.appendChild(host);
    const small = window.matchMedia('(max-width: 600px)').matches;
    const term = new Terminal({
      convertEol: true,
      cursorBlink: true,
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Menlo, Consolas, monospace',
      fontSize: small ? 13 : 14,
      lineHeight: 1.25,
      scrollback: 2000,
      theme: terminalTheme ?? THEME,
      allowProposedApi: false,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(host);
    const safeFit = () => {
      if (container.offsetWidth > 0 && container.offsetHeight > 0) {
        try {
          fit.fit();
        } catch {
          /* container not measurable yet */
        }
      }
    };
    safeFit();

    const editor = new LineEditor(term, shell, { onExecuted: (r) => onExecutedRef.current?.(r) });
    editor.start();
    const sub = term.onData((d) => editor.handleData(d));

    const observer = new ResizeObserver(() => safeFit());
    observer.observe(container);

    termRef.current = term;
    editorRef.current = editor;
    term.focus();

    return () => {
      observer.disconnect();
      sub.dispose();
      host.remove();
      termRef.current = null;
      editorRef.current = null;
      // xterm schedules an internal Viewport timer during open(); disposing
      // synchronously (e.g. StrictMode's mount/unmount/mount) makes it crash.
      setTimeout(() => term.dispose(), 0);
    };
  }, [shell]);

  // Dynamically update terminal theme on change without resetting or clearing text
  useEffect(() => {
    if (termRef.current && terminalTheme) {
      termRef.current.options.theme = terminalTheme;
    }
  }, [terminalTheme]);

  useImperativeHandle(ref, () => ({
    insert: (text) => {
      editorRef.current?.insert(text);
      termRef.current?.focus();
    },
    setLine: (text) => {
      editorRef.current?.setValue(text);
      termRef.current?.focus();
    },
    sendKey: (data) => {
      editorRef.current?.handleData(data);
      termRef.current?.focus();
    },
    focus: () => termRef.current?.focus(),
    refreshPrompt: () => editorRef.current?.render(),
    printAbove: (text) => editorRef.current?.printAbove(text),
    resetScreen: (banner) => editorRef.current?.resetScreen(banner),
  }));

  return <div className="terminal-host" ref={containerRef} onClick={() => termRef.current?.focus()} />;
});
