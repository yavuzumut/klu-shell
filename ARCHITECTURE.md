# KLU — Mimari Dokümantasyonu (ARCHITECTURE.md)

Bu belge, **KLU** projesinin mimari tasarımını, temel modüllerini, veri yapılarını, bileşen etkileşimlerini ve geliştirme yönergelerini ayrıntılı olarak açıklamaktadır. Belgede yer alan tüm teknik detaylar doğrudan kaynak kodlar üzerinden doğrulanmıştır.

---

## 1. Proje Özeti ve Teknoloji Yığını

KLU, modern web tarayıcıları üzerinde çalışan, tamamen istemci taraflı (zero-backend, client-side only) etkileşimli bir Linux kabuk ve terminal simülasyonudur.

Herhangi bir uzak sunucuya, Docker konteynerine, WebSocket bağlantısına veya sanal makineye (VM) ihtiyaç duymaz. Bütün kabuk ayrıştırma (parsing), boru hatları (pipeline), dosya sistemi (VirtualFS), komut yürütme ve durum yönetimi doğrudan kullanıcının tarayıcısında (`in-memory`) gerçekleşir.

### Teknoloji Bileşenleri (`package.json`)
- **Arayüz Kütüphanesi:** React 18 (`react`: `^18.3.1`, `react-dom`: `^18.3.1`)
- **Derleme ve Geliştirme Aracı:** Vite (`vite`: `^7.3.8`, `@vitejs/plugin-react`: `^4.3.2`)
- **Programlama Dili:** TypeScript (`typescript`: `~5.6.2`, `@types/react`: `^18.3.11`, `@types/react-dom`: `^18.3.1`)
- **Terminal Motoru:** `@xterm/xterm` (`^5.5.0`) ve `@xterm/addon-fit` (`^0.10.0`)
- **Birim ve Entegrasyon Testleri:** Vitest (`vitest`: `^5.1.1`)
- **Markdown Dönüştürücü:** Marked (`marked`: `^14.1.0`)
- **Çalışma Zamanı (engines):** Node.js (`node`: `>=22.12.0`)

---

## 2. Klasör Yapısı ve Modül Sorumlulukları

```text
termi/
├── public/                 # Statik web varlıkları (maskot, logo, favicon)
├── src/
│   ├── cheatsheet/         # Hile Kağıdı sekmesi ve veri kaynağı
│   ├── components/         # Ortak React kullanıcı arayüzü bileşenleri
│   ├── core/               # Çekirdek simülasyon motoru (FS, Shell, Commands, Test)
│   │   ├── commands/       # Dahili Linux komutları ve komut kayıt defteri
│   │   ├── fs/             # Sanal dosya sistemi (VirtualFS) ve başlangıç ağacı
│   │   ├── shell/          # Kabuk ayrıştırıcı, boru hatları, glob, otomatik tamamlama
│   │   └── test/           # Birim test yardımcıları ve test ortamı
│   ├── explore/            # Meraklısına sekmesi ve modern CLI araç kartları
│   ├── git/                # Git bilgilendirme sekmesi ve görsel anlatım verisi
│   ├── lessons/            # Ders ve görev mantığı, doğrulayıcı, ders içerikleri
│   │   └── content/        # Seviye 0 ve Seviye 1 ders tanımları
│   ├── state/              # İlerleme (progress) durumu ve localStorage entegrasyonu
│   ├── terminal/           # xterm.js React sarmalayıcısı ve satır düzenleyici
│   ├── themes/             # Tema tanımları, vurgu rengi ve xterm renk paleti yönetimi
│   ├── App.tsx             # Ana uygulama kabuğu, modlar arası yönlendirme
│   ├── main.tsx            # React kök başlatıcı (root entry)
│   └── styles.css          # Genel stiller, tematik CSS değişkenleri, duyarlı düzen
```

### Modül Sorumlulukları
1. **`src/core/fs`:** Ağaç tabanlı bellek içi dosya sistemi. CRUD operasyonları, POSIX hata kodları, mutasyon olayları (`VirtualFS.subscribe`) ve başlangıç dosya yapısı tohumlama (`src/core/fs/defaultTree.ts`).
2. **`src/core/shell`:** POSIX benzeri kabuk yorumlayıcısı. Komut satırı tokenlaştırma/ayrıştırma (`src/core/shell/parser.ts`), tilde ve değişken genişletme, dosya adı desenleri (`src/core/shell/glob.ts`), boru hatları (`|`), mantıksal zincirler (`&&`, `||`), I/O yönlendirmeleri (`<`, `>`, `>>`, `2>`, `2>>`), geçmiş (`history`) ve Tab tamamlama (`src/core/shell/completion.ts`).
3. **`src/core/commands`:** Dahili komutların (`pwd`, `ls`, `cd`, `mkdir`, `touch`, `cat`, `echo`, `cp`, `mv`, `rm`, `clear`, `help`, `man`, `history`) bireysel implementasyonları ve merkezi kayıt defteri (`src/core/commands/index.ts`).
4. **`src/core/test`:** Test ortamında bağımsız kabuk (`createTestShell`), ANSI temizleme (`stripAnsi`) ve zaman sabitleme (`FIXED_NOW`) yardımcıları (`src/core/test/helpers.ts`).
5. **`src/lessons`:** Eğitim motoru. Görev tipleri (`src/lessons/types.ts`), komut/dosya durumu doğrulayıcı (`src/lessons/validator.ts`), oturum hazırlayıcı (`src/lessons/session.ts`) ve seviye/ders kataloğu (`src/lessons/content/index.ts`).
6. **`src/state`:** Kullanıcı ilerlemesinin (`completed`, `attempts`, `revealed`, `history`) takibi ve `localStorage` ile kalıcı senkronizasyonu (`src/state/useProgress.ts`).
7. **`src/themes`:** 5 farklı renk paleti (Koyu, Açık, Dracula, Solarized Dark, Retro Yeşil), kullanıcı tanımlı özel vurgu rengi yönetimi ve xterm.js terminal temasıyla canlı eşzamanlanması (`src/themes/themeManager.ts`, `src/themes/useTheme.ts`, `src/themes/themes.ts`).
8. **`src/components`:** React bileşenleri. Başlık ve mod sekmeleri (`src/components/Header.tsx`), sol gezinme çekmecesi (`src/components/LessonDrawer.tsx`), ders paneli ve görev kartları (`src/components/LessonPanel.tsx`), canlı dosya ağacı görünümü (`src/components/FileTree.tsx`), tema seçici açılır menü (`src/components/ThemeSelector.tsx`).
9. **`src/cheatsheet`:** Temel komutların hızlı başvuru tablosu (`src/cheatsheet/CheatSheetView.tsx`, `src/cheatsheet/data.ts`).
10. **`src/explore`:** Gerçek Linux CLI araçlarını tanıtan kartlar (`src/explore/ExploreView.tsx`, `src/explore/data.ts`).
11. **`src/git`:** Git sürüm kontrol kavramları, 3 alan modeli ve yol haritası (`src/git/GitIntroView.tsx`, `src/git/intro.ts`).
12. **`src/terminal`:** `@xterm/xterm` kütüphanesini React yaşam döngüsüne bağlayan görünüm bileşeni (`src/terminal/TerminalView.tsx`, `src/terminal/LineEditor.ts`).

---

## 3. Komut Sistemi (Command System)

KLU'daki her komut bağımsız bir TypeScript modülü olarak yazılır ve ortak bir kayıt defterine (`CommandRegistry`) kaydedilir.

### `CommandContext` Arayüzü
// Kaynak dosya: src/core/shell/types.ts
```typescript
/** Everything a command needs while it runs. */
export interface CommandContext {
  /** Name the command was invoked with (argv[0]). */
  name: string;
  fs: VirtualFS;
  shell: Shell;
  /** Current working directory (absolute). */
  cwd: string;
  env: Record<string, string>;
  /** Data piped/redirected into the command, or null when reading from the terminal. */
  stdin: string | null;
  /** True when stdout goes straight to the terminal (enables colors/columns). */
  isTTY: boolean;
  stdout(text: string): void;
  stderr(text: string): void;
  /** Resolve a user supplied path against the cwd. */
  resolve(path: string): string;
}
```

### `CommandDefinition` Arayüzü
// Kaynak dosya: src/core/shell/types.ts
```typescript
export interface CommandDefinition {
  name: string;
  /** One-line Turkish summary used by `help`. */
  summary: string;
  /** Usage line, e.g. "ls [-la] [DOSYA]...". */
  usage: string;
  /** Turkish manual page body used by `man`. */
  manPage: string;
  /** Run the command and return an exit code (0 = success). */
  run(args: string[], ctx: CommandContext): number | Promise<number>;
  /** Optional: restrict tab completion of arguments ("dirs" only for cd). */
  completion?: 'files' | 'dirs' | 'commands' | 'none';
}
```

### Örnek Komut İncelemesi: `pwd`
// Kaynak dosya: src/core/commands/pwd.ts
```typescript
import type { CommandDefinition } from '../shell/types';

export const pwd: CommandDefinition = {
  name: 'pwd',
  summary: 'Bulunduğun dizinin tam yolunu yazdırır.',
  usage: 'pwd',
  completion: 'none',
  manPage: `AD
    pwd - çalışma dizininin adını yazdırır (print working directory)

KULLANIM
    pwd

AÇIKLAMA
    Şu anda içinde bulunduğun dizinin kök dizinden (/) başlayan tam
    yolunu (mutlak yol) ekrana yazar.

ÖRNEK
    $ pwd
    /home/kullanici`,
  run(_args, ctx) {
    ctx.stdout(ctx.shell.cwd + '\n');
    return 0;
  },
};
```

### Registry Mekanizması
// Kaynak dosya: src/core/shell/registry.ts
```typescript
import type { CommandDefinition } from './types';

/** Holds all available commands. Commands register themselves via `register`. */
export class CommandRegistry {
  private commands = new Map<string, CommandDefinition>();

  register(def: CommandDefinition): this {
    this.commands.set(def.name, def);
    return this;
  }

  get(name: string): CommandDefinition | undefined {
    return this.commands.get(name);
  }

  has(name: string): boolean {
    return this.commands.has(name);
  }

  list(): CommandDefinition[] {
    return [...this.commands.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  names(): string[] {
    return this.list().map((c) => c.name);
  }
}
```

// Kaynak dosya: src/core/commands/index.ts
```typescript
export const ALL_COMMANDS: CommandDefinition[] = [
  pwd,
  ls,
  cd,
  mkdir,
  touch,
  cat,
  echo,
  cp,
  mv,
  rm,
  clear,
  help,
  man,
  history,
  // Seviye 2: metin işleme, filtreleme ve arama
  head,
  tail,
  wc,
  grep,
  sort,
  uniq,
  find,
  // Seviye 3: izinler, sistem bilgisi, ortam, süreçler
  chmod,
  whoami,
  uname,
  date,
  env,
  exportCmd,
  which,
  ps,
  kill,
  stat,
  realpath,
  basename,
];

export function createRegistry(commands: CommandDefinition[] = ALL_COMMANDS): CommandRegistry {
  const registry = new CommandRegistry();
  commands.forEach((c) => registry.register(c));
  return registry;
}
```

### Yeni Komut Ekleme Adımları (`src/core/commands/index.ts` yönergesine göre)
1. `src/core/commands/<name>.ts` dosyası oluşturun ve `CommandDefinition` tipinde bir nesne dışa aktarın (`export`).
2. Yeni komutu `src/core/commands/index.ts` içine import edin ve `ALL_COMMANDS` dizisine ekleyin.
3. `src/core/commands/commands.test.ts` dosyasına komutun birim testlerini ekleyin.

### Shell'in Komut Satırını İşleme Aşamaları (`src/core/shell/Shell.ts`)
Kullanıcı Enter tuşuna bastığında `Shell.execute(line)` şu işlem adımlarını yürütür:
1. **Ayrıştırma (`parse` - `src/core/shell/parser.ts`):** `parse(trimmed, { vars: this.env, home: this.fs.home })` çağrılır. Komut dizisi boru hatlarına (`Pipeline`), mantıksal zincirlere (`;`, `&&`, `||`) ve yönlendirmelere ayrıştırılır; ortam değişkenleri (`$VAR`, `${VAR}`) ve tilde (`~`) açılır.
2. **Mantıksal Akış Denetimi (`execute` - `src/core/shell/Shell.ts`):** Komut listesi öğeleri sırayla koşturulur. Önceki komut başarısız olduysa ve bağlaç `&&` ise veya önceki komut başarılı olduysa ve bağlaç `||` ise sıradaki boru hattı atlanır.
3. **Sözcük ve Glob Genişletmesi (`expandWords` - `src/core/shell/Shell.ts`):** Basit komuttaki sözcüklerde joker karakterler varsa (`w.glob === true`), `expandGlob()` (`src/core/shell/glob.ts`) ile sanal dosya sistemi üzerindeki eşleşen dosya yollarına genişletilir.
4. **Değişken Atamaları:** Argümanlar yalnızca `DEGISKEN=deger` biçimindeyse komut çalıştırılmaz; doğrudan `this.env` tablosu güncellenir.
5. **Yönlendirmeler ve Boru Hattı (`runPipeline` - `src/core/shell/Shell.ts`):**
   - Giriş yönlendirmesi (`< path`): `this.fs.readFile(path)` ile okunup `stdin` akışına verilir.
   - Çıkış yönlendirmeleri (`>`, `>>`, `2>`, `2>>`): Hedef dosyalar bash standardına uygun olarak hemen oluşturulur veya kesilir (`this.fs.writeFile`).
   - Boru hattı (`cmd1 | cmd2`): Önceki komutun çıktısı yakalanarak sonraki komutun `stdin` akışına aktarılır.
6. **Yürütme (`runCommand` - `src/core/shell/Shell.ts`):** Komut adı kayıt defterinde aranır (`this.registry.get(name)`). Bulunamazsa stderr'e `bash: <name>: command not found` yazılır ve çıkış kodu `127` döner. Bulunursa `def.run(args, ctx)` çalıştırılır.
7. **Çıkış ve Durum Kaydı:** Çıkış kodu `this.lastExitCode` ve `this.env['?']` değişkenine atanır, komut geçmişi (`this.history`) güncellenir (`MAX_HISTORY = 500`) ve `CommandRecord` nesnesi dinleyicilere bildirilir.

---

## 4. VirtualFS (Sanal Dosya Sistemi)

`VirtualFS` (`src/core/fs/VirtualFS.ts`), Linux dosya hiyerarşisini bellekte bir nesne ağacı olarak simüle eden çekirdek sınıftır.

### Düğüm Yapısı
// Kaynak dosya: src/core/fs/VirtualFS.ts
```typescript
interface BaseNode {
  name: string;
  /** Permission bits, e.g. 0o755. Not enforced yet (reserved for chmod). */
  mode: number;
  owner: string;
  group: string;
  /** Last modification time (ms since epoch). */
  mtime: number;
}

export interface FileNode extends BaseNode {
  type: 'file';
  content: string;
}

export interface DirNode extends BaseNode {
  type: 'dir';
  children: Record<string, FsNode>;
}

export type FsNode = FileNode | DirNode;
```

`DirNode.children` bir `Record<string, FsNode>` nesnesidir. JavaScript prototip zincirinden (`Object.prototype`) miras alınacak `toString`, `valueOf`, `constructor`, `__proto__` gibi yerleşik özelliklerin sanal dosya sistemi işlemleriyle çakışmasını veya prototip kirlenmesini (prototype pollution) önlemek için, dizin oluşturma (`makeDir`) ve ağaç klonlama (`cloneNode`) süreçlerinde `children` nesnesi `Object.create(null)` ile prototipsiz olarak üretilir:

// Kaynak dosya: src/core/fs/VirtualFS.ts
```typescript
  private makeDir(name: string, owner = this.user): DirNode {
    return { type: 'dir', name, children: Object.create(null), mode: 0o755, owner, group: owner, mtime: this.now() };
  }
```

// Kaynak dosya: src/core/fs/VirtualFS.ts
```typescript
function cloneNode(node: FsNode): FsNode {
  if (node.type === 'file') return { ...node };
  const children: Record<string, FsNode> = Object.create(null);
  for (const [k, v] of Object.entries(node.children)) children[k] = cloneNode(v);
  return { ...node, children };
}
```

### Olay Dinleyici / Abonelik Mekanizması (`subscribe`)
// Kaynak dosya: src/core/fs/VirtualFS.ts
```typescript
export type FsChangeAction = 'create' | 'modify' | 'delete' | 'move';

export interface FsChangeEvent {
  action: FsChangeAction;
  path: string;
  targetPath?: string;
}

export type FsChangeListener = (event: FsChangeEvent) => void;
```

### Temel Public Metotlar ve İmzaları (`VirtualFS.ts`)
| Metot İmzası | Açıklama |
|---|---|
| `subscribe(listener: FsChangeListener): () => void` | Dosya sistemi mutasyon olaylarını (`create`, `modify`, `delete`, `move`) dinler; dinleyiciyi kaldıran fonksiyon döner. |
| `resolve(path: string, cwd = '/'): string` | Bağıl yolları (`.`, `..`, `~`, `~/...`) `cwd` bağlamında mutlak ve normalize edilmiş yola çevirir. |
| `prettyPath(abs: string): string` | Kullanıcının ev dizinini (`/home/kullanici`) `~` kısaltmasıyla gösterir. |
| `lookup(abs: string): FsNode` | Verilen mutlak yoldaki düğümü döner; bulamazsa `ENOENT`, yolda dizin olmayan parça varsa `ENOTDIR` fırlatır. |
| `tryLookup(abs: string): FsNode \| null` | Düğümü arar; bulamazsa hata fırlatmak yerine `null` döner. |
| `exists(abs: string): boolean` | Verilen mutlak yolda bir dosya veya dizin olup olmadığını döner (`true`/`false`). |
| `isDir(abs: string): boolean` | Verilen yolun var olan bir dizin olup olmadığını denetler. |
| `isFile(abs: string): boolean` | Verilen yolun var olan normal bir dosya olup olmadığını denetler. |
| `readdir(abs: string): FsNode[]` | Dizindeki çocuk düğümleri (`children`) isimlerine göre alfabetik sıralı dizi olarak döner (`ENOTDIR` denetimli). |
| `readFile(abs: string): string` | Dosyanın metin içeriğini döner (`EISDIR` ve `ENOENT` denetimli). |
| `writeFile(abs: string, content: string, options: { append?: boolean } = {}): void` | Dosyaya yazar; yoksa oluşturur, varsa üzerine yazar (`append: true` ise sonuna ekler). `create` veya `modify` olayı yayınlar. |
| `touch(abs: string): void` | Dosya varsa `mtime` değerini günceller (`modify`), yoksa boş dosya oluşturur (`create`). |
| `mkdir(abs: string, options: { parents?: boolean } = {}): void` | Yeni dizin oluşturur (`create`). `parents: true` (`mkdir -p`) ise eksik üst dizinleri de oluşturur ve var olan dizinlerde hata fırlatmaz. |
| `remove(abs: string, options: { recursive?: boolean } = {}): void` | Dosyayı veya dizini siler (`delete`). Dizin silerken `recursive: true` verilmezse `EISDIR` fırlatır. |
| `rmdir(abs: string): void` | Yalnızca boş olan bir dizini siler; doluysa `ENOTEMPTY`, dizin değilse `ENOTDIR` fırlatır. |
| `copy(src: string, dest: string, options: { recursive?: boolean } = {}): void` | Düğümü kopyalar (`create`). Dizin kopyalamada `recursive: true` gerekir; bir dizin kendi içine kopyalanamaz (`isSubPath`). |
| `move(src: string, dest: string): void` | Düğümü taşır veya adını değiştirir (`move`). Hedef dolu dizinse `ENOTEMPTY` fırlatır. |
| `seed(seed: FsSeed): void` | Dizin ve dosya tohumlarını (`seed.dirs`, `seed.files`) sanal dosya sistemine topluca aktarır. |
| `chown(abs: string, owner: string, options: { recursive?: boolean; mode?: number } = {}): void` | Düğümün sahibini/grubunu günceller (`recursive: true` ile alt öğelere de uygular). |
| `toJSON(): DirNode` | Kök düğümden itibaren tüm ağacın bağımsız derin kopyasını (`cloneNode`) nesne olarak döner. |
| `static fromJSON(root: DirNode, options: VirtualFSOptions = {}): VirtualFS` | Verilen `DirNode` kökünden yeni bir `VirtualFS` örneği oluşturur. |
| `clone(): VirtualFS` | Mevcut dosya sisteminin bağımsız bir klonunu üretir. |

### Hata Kodları (`FsErrorCode` ve `FsError`)
Gerçek Linux POSIX hata kodları aynen kullanılır:
- `ENOENT`: "No such file or directory"
- `EEXIST`: "File exists"
- `ENOTDIR`: "Not a directory"
- `EISDIR`: "Is a directory"
- `ENOTEMPTY`: "Directory not empty"
- `EINVAL`: "Invalid argument"

### Canlı Dosya Ağacı Entegrasyonu (`src/components/FileTree.tsx`)
`FileTree` bileşeni `VirtualFS` abonelik mekanizmasını doğrudan kullanır:
1. `useEffect` içerisinde `fs.subscribe` çağrılır ve `setVersion((v) => v + 1)` ile ağacın React render döngüsü tetiklenir.
2. Bir dosya veya klasör oluşturulduğunda (`action === 'create'` veya `'move'`), etkilenen öğenin tüm üst dizinleri `openDirs` kümesine otomatik olarak eklenir; böylece kullanıcı terminalde bir dosya oluşturduğu an ağaçta ilgili klasör otomatik açılır.
3. Yeni veya taşınan öğenin yolu `highlightedPath` prop'u (veya bileşen içi `internalHighlight` durumu) üzerinden eşleştirilerek `tree-node-highlight` CSS sınıfı verilir ve CSS animasyonu (`--tree-flash-start` / `--tree-flash-glow`) ile parlama efekti uygulanır.

---

## 5. Ders Sistemi (Lessons System)

KLU'nun eğitim yapısı `src/lessons/` altında kurgulanmıştır.

### Veri Tipleri
// Kaynak dosya: src/lessons/types.ts
```typescript
/** State a task check can look at after each command. */
export interface CheckState {
  fs: VirtualFS;
  cwd: string;
  /** The command line that was just executed. */
  last: CommandRecord;
  /** All command records since the lesson started (oldest first). */
  records: CommandRecord[];
}

/**
 * Declarative task checks. They are plain data so lessons can be written in
 * JSON as well as TypeScript. Paths may use `~`.
 */
export type TaskCheck =
  /** A path exists (optionally of a given kind). */
  | { type: 'pathExists'; path: string; kind?: 'file' | 'dir' }
  /** A path does not exist. */
  | { type: 'pathNotExists'; path: string }
  /** A file contains the given text. */
  | { type: 'fileContains'; path: string; text: string }
  /** The current working directory equals `path`. */
  | { type: 'cwdIs'; path: string }
  /**
   * The last command line ran `command` successfully.
   * `args`: each must appear as an argument; `flags`: each short flag
   * must be given (in any form: `-la`, `-a -l`, ...).
   */
  | { type: 'commandUsed'; command: string; args?: string[]; flags?: string[]; allowFailure?: boolean }
  /** The last command printed `text` (stdout). */
  | { type: 'outputContains'; text: string }
  | { type: 'all'; checks: TaskCheck[] }
  | { type: 'any'; checks: TaskCheck[] }
  | { type: 'not'; check: TaskCheck }
  /** Escape hatch for TS lessons. */
  | { type: 'custom'; fn: (state: CheckState) => boolean };

export interface Task {
  id: string;
  /** Markdown allowed (inline). */
  description: string;
  /** Shown progressively after wrong attempts. */
  hints: string[];
  /** Command(s) that solve the task; offered after 3 wrong attempts. */
  solution: string;
  check: TaskCheck;
  /**
   * Commands that should not count as wrong attempts for this task
   * (useful for multi-step tasks). Exploration commands like ls/pwd/cat
   * never count.
   */
  neutralCommands?: string[];
}

export interface LessonSetup extends FsSeed {
  /** Starting working directory (default: home). */
  cwd?: string;
}

export interface Lesson {
  id: string;
  title: string;
  /** Short one-liner shown in lesson lists. */
  summary: string;
  /** Lesson body in Markdown. */
  content: string;
  /** Example commands shown as clickable chips. */
  examples: string[];
  setup?: LessonSetup;
  tasks: Task[];
}

export interface Level {
  id: string;
  number: number;
  title: string;
  description: string;
  lessons: Lesson[];
  /** Level is visible but locked until its content is written. */
  comingSoon?: boolean;
}
```

### Doğrulama Mekanizması (`src/lessons/validator.ts`)
// Kaynak dosya: src/lessons/validator.ts
```typescript
/** Commands used to look around; they never count as a wrong attempt. */
export const EXPLORATION_COMMANDS = new Set(['ls', 'pwd', 'cat', 'help', 'man', 'clear', 'history', 'echo']);
```

Kullanıcı her komut çalıştırdığında `evaluateCommand(lesson, completed, state)` fonksiyonu çağrılır:
1. `activeTask(lesson, completed)` fonksiyonuyla henüz tamamlanmamış ilk görev (`Task`) bulunur.
2. Görevin `check` kuralı `evaluateCheck(task.check, state)` ile değerlendirilir. Kural sağlanmışsa `{ completedTaskId: task.id, wrongAttempt: false, activeTaskId: task.id }` döner.
3. Kural sağlanmamışsa `isWrongAttempt(task, state.last)` çağrılır:
   - Komut satırı sözdizimi hatası veya başarısız çıkış kodu verdiyse (`record.exitCode !== 0`), her zaman yanlış deneme sayılır.
   - Görevin beklediği komut (`expectedCommands(task.check)`) çalıştırılmış ama görev henüz tamamlanamamışsa yanlış deneme sayılır.
   - **Nötr Komutlar (`neutralCommands`):** `EXPLORATION_COMMANDS` kümesinde yer alan keşif komutları (`ls`, `pwd`, `cat`, `help`, `man`, `clear`, `history`, `echo`) ve görev tanımında belirtilmiş olan `task.neutralCommands` listesindeki komutlar **asla yanlış deneme olarak sayılmaz**. Bu sayede kullanıcı hedef dizini incelerken veya çok adımlı görevlerde ara komutlar denerken hata sayacı artmaz.
   - Nötr olmayan ilgisiz bir komut çalıştırılmışsa yanlış deneme sayısı 1 artırılır.

### Çözümü Göster Eşiği
`src/components/LessonPanel.tsx` içerisinde çözüm görüntüleme eşiği tanımlıdır:
```typescript
const SOLUTION_THRESHOLD = 3;
```
Kullanıcı bir görevde 3 kez hatalı deneme yaptığında panelde "Çözümü Göster" düğmesi aktifleşir.

### Seviye Kataloğu (`src/lessons/content/index.ts`)
Katalog `LEVELS` dizisi olarak tanımlanmıştır:
1. **Seviye 0 (`level-0`):** "Başlamadan Önce" (5 Ders — `src/lessons/content/level0/index.ts`) — Terminal, kabuk ve Linux temelleri; KLU çalışma mantığı ve ipuçları.
2. **Seviye 1 (`level-1`):** "Başlangıç" (7 Ders — `src/lessons/content/level1/index.ts`) — Terminalde gezinme, dosya ve dizin işlemleri (`ls`, `cd`, `mkdir`, `touch`, `cat`, `cp`, `mv`, `rm`).
3. **Seviye 2 (`level-2`):** "Orta" (7 Ders — `src/lessons/content/level2/index.ts`) — Yönlendirme (`>`, `>>`), boru hattı (`|`), metin inceleme (`head`, `tail`, `wc`), filtreleme (`grep`), sıralama/tekilleştirme (`sort`, `uniq`) ve dosya sisteminde arama (`find`).
4. **Seviye 3 (`level-3`):** "İleri" (9 Ders — `src/lessons/content/level3/index.ts`) — Sistem/kullanıcı bilgisi (`whoami`, `uname`, `date`), ortam değişkenleri (`env`, `export`, `$VAR`), komut arama yolu (`which`, `$PATH`), dosya izinleri (`chmod 755/644`, `chmod +x`), çalıştırılabilir betikler (`./`), süreç yönetimi (`ps`, `ps aux`, `kill`), mantıksal operatörler (`&&`, `||`) ve yol/dosya analizi (`stat`, `realpath`, `basename`).

---

## 6. State Yönetimi (State Management)

KLU, istemci tarafında kalıcı verileri tarayıcının `localStorage` API'si üzerinden saklar.

### `localStorage` Anahtarları
| Anahtar | Sorumlu Modül | Saklanan Değer |
|---|---|---|
| `klu.progress.v1` | `src/state/useProgress.ts` | Tamamlanan dersler, görevler, hata deneme sayıları, açılan çözümler ve geçmiş. |
| `klu_theme` | `src/themes/themeManager.ts` | Seçili tema kimliği (`'dark'`, `'light'`, `'dracula'`, `'solarized'`, `'retro'`). |
| `klu_accent_<themeId>` | `src/themes/themeManager.ts` | Temaya özel kullanıcı tanımlı hex vurgu rengi (örn: `#7ee787`). |
| `klu_dismiss_level0_banner` | `src/App.tsx` | Seviye 0 başlangıç bilgi şeridinin kapatılma bayrağı (`'1'`). |

### İlerleme Durumu Yapısı
// Kaynak dosya: src/state/useProgress.ts
```typescript
export interface ProgressState {
  version: 1;
  currentLessonId: string;
  /** lessonId -> completed task ids */
  completed: Record<string, string[]>;
  /** "lessonId/taskId" -> wrong attempt count */
  attempts: Record<string, number>;
  /** "lessonId/taskId" -> solution revealed */
  revealed: Record<string, boolean>;
  /** Saved shell history (for ↑ across reloads) */
  history: string[];
}
```

### Sıfırlama Mekanizması
- **Ders Sıfırlama (`startLessonSession` - `src/App.tsx`):** Yalnızca o anki dersin sanal dosya sistemini `createLessonFS(lesson)` (`src/lessons/session.ts`) ile baştan tohumlar.
- **Serbest Mod Sıfırlama (`resetSandboxFS` - `src/App.tsx`):** Serbest mod sanal dosya sistemini `createDefaultFS()` (`src/core/fs/defaultTree.ts`) ile varsayılan Linux başlangıç ağacına döndürür.
- **Tüm İlerlemeyi Sıfırlama (`src/components/LessonDrawer.tsx` -> `actions.resetAll`):** `localStorage` üzerindeki `klu.progress.v1` anahtarını temizler ve tüm görev başarılarını sıfırlar.

---

## 7. Tema Sistemi (Themes System)

KLU, 5 kapsamlı tema ve kullanıcıya özel vurgu (accent) rengi seçimi sunar.

### Tanımlı Temalar (`src/themes/themes.ts`)
// Kaynak dosya: src/themes/themes.ts
```typescript
export type ThemeId = 'dark' | 'light' | 'dracula' | 'solarized' | 'retro';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  isDark: boolean;
  defaultAccent: string;
  defaultAccentContrast: string;
  cssVars: Record<string, string>;
  terminalTheme: ITheme;
}
```

1. **Koyu (`dark`):** KLU'nun klasik koyu teması, zümrüt yeşili varsayılan vurgu rengi.
2. **Açık (`light`):** Temiz, yüksek kontrastlı açık tema.
3. **Dracula (`dracula`):** Mor/pembe tabanlı vampir teması.
4. **Solarized Dark (`solarized`):** Ethan Schoonover klasiği sıcak lacivert/cyan teması.
5. **Retro Yeşil (`retro`):** CRT monitör hissi veren monokrom fosforlu yeşil tema.

### Canlı Eşzamanlama (Dynamic Reskinning)
Arayüz renkleri `applyThemeToDocument()` (`src/themes/themeManager.ts`) fonksiyonuyla `:root` üzerindeki CSS değişkenlerine (`--bg`, `--panel`, `--text`, `--accent`, `--border` vb.) ve `document.documentElement.dataset.theme` değerine anında yazılır.

**Terminal Renklerinin Yeniden Başlatılmadan Güncellenmesi:**
// Kaynak dosya: src/terminal/TerminalView.tsx
```typescript
  useEffect(() => {
    if (termRef.current && terminalTheme) {
      termRef.current.options.theme = terminalTheme;
    }
  }, [terminalTheme]);
```

Kullanıcı tema veya vurgu rengi değiştirdiği anda `terminal.options.theme` anında güncellenir ve terminal yazıları korunur.

---

## 8. Diğer Bölümler ve Modüller

### Hile Kağıdı (`src/cheatsheet/`)
- **Görünüm:** `src/cheatsheet/CheatSheetView.tsx`
- **Veri Kaynağı:** `src/cheatsheet/data.ts`
- **İçerik:** Sistemde mevcut olan 33 komutun kategorize edilmiş listesi (13 kategori: Gezinme, Listeleme, Oluşturma/Yazma, Okuma/İnceleme, Arama, Sıralama, İzinler, Sistem Bilgisi, Ortam/Değişkenler, Süreçler, Kopyalama/Taşıma, Silme, Yardım ve Oturum).
- **Etkileşim:** Bir komuta tıklandığında uygulama otomatik olarak **Serbest Mod**'a geçer, dosya ağacını açar ve tıklanan komutu Enter'a basmadan terminal girdi satırına yazar.

### Meraklısına (`src/explore/`)
- **Görünüm:** `src/explore/ExploreView.tsx`
- **Veri Kaynağı:** `src/explore/data.ts`
- **İçerik:** Gerçek Linux ortamında yaygın olarak kullanılan modern CLI araçlarını tanıtan 15 adet kart (`yt-dlp`, `wttr.in`, `fastfetch`, `btop`, `ncdu`, `ripgrep`, `fd`, `bat`, `eza`, `fzf`, `tldr`, `tmux`, `cmatrix`, `cowsay-figlet-lolcat`, `sl`).
- **Kategoriler:** 5 kategori filtresi (`media`, `system`, `files`, `productivity`, `fun`).
- **Özellikler:** Dağıtıma özel kurulum sekmeleri (`debian`, `fedora`, `arch`), kullanım ipuçları (`tips`), ASCII tren sanatı (`sl`), `fastfetch` sistem çıktısı ve tek tıkla kopyalama desteği.
- **Önemli Ayrım:** Bu araçlar KLU'nun simüle terminalinde çalışmaz; sayfanın başında bu durum kullanıcıya açıkça bildirilir.

### Git Giriş Sayfası (`src/git/`)
- **Görünüm:** `src/git/GitIntroView.tsx`
- **Veri Kaynağı:** `src/git/intro.ts`
- **İçerik:** Git sürüm kontrolünün temelleri, Linus Torvalds ve Linux çekirdeği ile olan tarihsel bağı, Git ve GitHub farkı, 3 Alan Modeli (Çalışma Alanı -> Staging -> Yerel Depo) ve 4 aşamalı etkileşimli Git yol haritası.

---

## 9. Test ve Derleme (Testing & Build)

KLU projesi katı tip denetimi ve otomatik birim testleriyle korunmaktadır.

### Komutlar
```bash
# Birim ve entegrasyon testlerini çalıştırır (259 test, 13 test dosyası)
npm test

# İzleme (watch) modunda testleri sürekli çalıştırmak için:
npm run test:watch

# TypeScript tip denetimi (sıfır hata hedeflenir)
npx tsc --noEmit

# Üretim paketi derleme (dist/ dizinine çıktı üretir)
npm run build
```

### Test Dosyaları ve Kapsam
Test dosyaları doğrudan test ettikleri kaynak kodların yanında (`src/`) konumlandırılmıştır:
1. `src/core/commands/commands.test.ts` (81 test): 33 çekirdek komutun bayrakları, argümanları, boru hatları, mantıksal zincirler (`&&`, `||`) ve çalıştırılabilir betiklerin uç durumları.
2. `src/core/fs/VirtualFS.test.ts` (21 test): Dizin oluşturma, okuma, yazma, silme, kopyalama, taşıma, chmod izin değişiklikleri, hata kodları ve prototip kirlenmesi koruması.
3. `src/core/fs/treeListener.test.ts` (3 test): `VirtualFS.subscribe` olay mekanizması ve dosya ağacı tetikleyicileri.
4. `src/core/shell/parser.test.ts` (14 test): Tırnaklar, boru hattı (`|`), yönlendirmeler (`>`, `>>`), mantıksal operatörler (`&&`, `||`), sözdizimi hataları, tilde (`~`) ve `$VAR` açılımı.
5. `src/core/shell/completion.test.ts` (5 test): Tab ile komut ve dosya/dizin otomatik tamamlama.
6. `src/lessons/validator.test.ts` (32 test): Görev doğrulama kuralları, keşif/nötr komutlar, 4 seviyedeki 28 dersin yayınlanan çözümüyle başarıyla tamamlandığının testi.
7. `src/explore/data.test.ts` (5 test): 15 araç kartının şema doğrulaması ve kategori bütünlüğü.
8. `src/themes/themes.test.ts` (9 test): 5 tema tanımı, hex renk doğrulama regex'i ve CSS değişkenleri.
9. `src/state/progress.test.ts` (7 test): İlerleme durumu, localStorage senkronizasyonu ve geçmiş yönetimi.

### Test Yardımcıları (`src/core/test/helpers.ts`)
- **`createTestShell(options)`:** Testler için izole bir sanal dosya sistemi ve kabuk ortamı üretir.
- **`stripAnsi(text)`:** Terminal çıktılarındaki ANSI renk kaçış kodlarını temizleyerek saf metin doğrulaması sağlar.
- **`FIXED_NOW`:** Dosya oluşturma ve düzenleme zaman damgalarının testlerde tutarlı kalması için sabit zaman fonksiyonu sağlar (`2024-01-01T00:00:00.000Z`).

---

## 10. Konvansiyonlar (Conventions)

- **Kullanıcı Arayüzü ve Metinler:** Kullanıcıya dönük tüm arayüz metinleri, ders anlatımları, görevler, ipuçları ve yardım dokümanları **Türkçe** yazılır.
- **Kod Tabanı:** Fonksiyon isimleri, değişkenler, tip arayüzleri, CSS sınıfları ve Git commit mesajları **İngilizce** yazılır.
- **Hata Mesajları:** Terminal komutlarının standart hata çıktıları (stderr), gerçek Linux ve POSIX standartlarına sadık kalmak amacıyla **İngilizce** üretilir (örn. `ls: cannot access 'dosya': No such file or directory`, `rm: missing operand`).

---

## 11. Bilinen Eksikler ve Sınırlar (Limitations)

1. **Dosya İzinleri Denetimi (`mode`):**
   `BaseNode` nesnesinde `mode` (örn: `0o755`), `owner` ve `group` alanları tanımlıdır ve `chmod` için ayrılmıştır. Ancak mevcut aşamada `VirtualFS` üzerindeki okuma, yazma ve silme işlemlerinde yetki denetimi henüz işletilmemektedir (Örn: Standart kullanıcı hesabı olan `kullanici`, `/root` dizini altındaki dosyaları okuyabilmektedir).
2. **Serbest Mod ve FS Kalıcılığı:**
   Sanal dosya sistemi tamamen RAM üzerinde yaşar. Sayfa yenilendiğinde (F5 / browser refresh) Serbest Mod'da oluşturulan dosyalar sıfırlanır ve varsayılan tohum ağacına döner (Kullanıcı ilerlemesi `localStorage` üzerinde saklanırken sanal FS saklanmaz).
3. **Etkileşimli Git Motoru:** Git sekmesi Git 1–4 içeriklerini ve etkileşimli ders akışlarını çalıştırır. `GitRepo`, sanal `.git/` JSON verisini; Git komutları temel commit akışını, diff/restore işlemlerini, dallanma/birleştirmeyi ve Git 4 uzak depo işlemlerini yönetir. Uzak işlemler VirtualFS içindeki `/var/klu-remotes` simülasyonunu kullanır.
4. **Mobil Klavye Kısayolları:**
   Mobil cihazlar için ekranda temel gezinme tuşlarını içeren bir çubuk (`.key-bar` — Tab, ↑, ↓, ←, →, ~, /, -, Ctrl+C) bulunmaktadır; ancak boru hattı (`|`), yönlendirme (`>`, `<`) ve kesme tuşları gibi gelişmiş terminal operatörleri için zengin bir sanal tuş takımı henüz geliştirilmemiştir.
5. **Dosya İsimlerinde ANSI Kaçış Filtreleme:**
   `ls` komutu ve `LineEditor`, kullanıcı tarafından oluşturulmuş dosya adlarındaki raw ANSI kaçış karakterlerini henüz filtrelememektedir (düşük öncelikli görsel risk).

---

## 12. Planlanan Geliştirmeler ve Yol Haritası (Roadmap)

### Seviye 2: Orta Seviye (Ön Koşul: Yönlendirme Dersi)
- Seviye 2'ye geçilmeden önce dosya yönlendirmeleri (`>`, `>>`) ve dosya yazma temelleri ders olarak pekiştirilmelidir.
- Boru hattı mantığı (`|`) ve G/Ç yönlendirmelerinin (`>`, `>>`, `<`) uygulamalı anlatımı.
- `grep` (metin içi arama ve filtreleme) komutunun çekirdeğe eklenmesi.
- `find` (dosya sisteminde arama) komutunun çekirdeğe eklenmesi.
- `chmod` ve `chown` komutlarıyla gerçek dosya izin sisteminin aktif hale getirilmesi.

### Seviye 3: İleri Düzey Linux ve Betikleme
- Temel süreç yönetimi simülasyonu (`ps`, `kill`).
- Basit kabuk betikleri çalıştırma (değişkenler, döngüler, `if-else`).
- Paket yöneticisi simülasyonu (`apt install` simülasyonu).
- Ağ araçları (`curl`, `ping` simülasyonları).

### Etkileşimli Git Motoru (Tamamlandı)
- Git sekmesi Linux seviyelerinden ayrı eğitim alanı ve etkileşimli ders akışı sunar.
- Repo durumu `VirtualFS` içindeki `.git/` klasöründe JSON olarak saklanır; gerçek Git binary/packfile formatı kullanılmaz.
- Terminal Git komutları ile çalışma alanı, hazırlık alanı, yerel depo ve commit grafiği sunulur.
- Git 1–4 motoru tamamlanmıştır; uzak depo işlemleri `/var/klu-remotes` altında sanal olarak yürütülür.
  - **Git 1 (Temel Akış):** `git init`, `git config`, `git status`, `git add`, `git commit`, `git log`.
  - **Git 2 (İnce Ayar & Düzeltmeler):** `git diff`, `git restore`, `.gitignore` desteği, `git commit --amend`.
  - **Git 3 (Dallanma & Birleştirme):** `git branch`, `git switch` / `git checkout`, `git merge`.
  - **Git 4 (İşbirliği & Uzak Depo):** `git remote`, `git clone`, `git push`, `git pull` ve tarayıcı içi simüle uzak depo (fake remote).

---

## 13. Güvenlik Notları (Security Notes)

KLU, arka uç sunucusu ve harici ağ isteği bulunmayan, tamamen tarayıcı içinde çalışan statik bir web uygulamasıdır. Kod tabanında uygulanan güvenlik mekanizmaları ve dikkat edilmesi gereken noktalar şunlardır:

### 1. Markdown İşleme ve XSS (`src/components/LessonPanel.tsx`)
- Ders metinleri (`lesson.content`), görev açıklamaları (`task.description`), ipuçları (`hint`) ve çözümler (`task.solution`), `marked.parse` ve `marked.parseInline` fonksiyonlarıyla HTML'e dönüştürülmekte ve `dangerouslySetInnerHTML` ile DOM'a aktarılmaktadır.
- `marked` çıktısı `DOMPurify.sanitize()` ile temizlenir; güvenli dış bağlantılarda `target` ve `rel` öznitelikleri korunur.
- Mevcut mimaride tüm dersler `src/lessons/content/` dizinindeki statik TypeScript dosyalarından derleme zamanında (build-time) yüklendiği için içerikler güvenilir kabul edilir.
- Ders içeriği, görev açıklamaları ve ipuçlarının tamamı DOM’a aktarılmadan önce temizlenir.

### 2. İçerik Güvenliği Politikası (Content-Security-Policy - `vite.config.ts`)
- CSP meta etiketi `index.html` dosyasına statik olarak eklenmemiştir.
- Geliştirme ortamını (`npm run dev`) ve Vite'ın yerel HMR (Hot Module Replacement) sunucusunu kısıtlamamak için `vite.config.ts` içinde `apply: 'build'` kuralı tanımlanmış özel bir eklenti (`cspPlugin`) kullanılmıştır.
- Bu sayede CSP meta etiketi yalnızca üretim derlemesi (`npm run build` sonucu üretilen `dist/index.html`) başlığına (`<head>`) eklenir:
  `public/_headers`: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`. `vite.config.ts` meta CSP’si aynı direktifleri kullanır; `frame-ancestors` meta etikette desteklenmediği için yalnızca başlıkta tanımlıdır.
- Geliştirme sunucusunda (`vite dev`) bu CSP meta etiketi bulunmaz.

### 3. Prototip Kirlenmesi Koruması (Prototype Pollution - `src/core/fs/VirtualFS.ts`)
- Dizin düğümlerindeki `children` nesnesi (`Record<string, FsNode>`), JavaScript standart nesnelerinin prototipinde bulunan `__proto__`, `constructor`, `toString`, `valueOf` gibi yerleşik özellikleri miras almaması için `Object.create(null)` ile üretilir (`makeDir` ve `cloneNode`).
- Bu sayede temiz bir dosya sisteminde `fs.exists('/toString')` sorgusu `false` döner; `Object.prototype` fonksiyonları yanlışlıkla var olan bir dosya veya dizin olarak algılanmaz.
- `__proto__`, `constructor` ve `toString` adlarına sahip dosya ve dizinler standart dosyalar gibi sorunsuzca oluşturulabilir (`touch`, `mkdir`), okunabilir (`cat`), listelenebilir (`ls`) ve silinebilir (`rm`, `rm -rf`).
- Bu davranış `src/core/fs/VirtualFS.test.ts` ve `src/core/commands/commands.test.ts` altındaki birim testlerle doğrulanmıştır.

### 4. Özel Vurgu Rengi Doğrulaması (`src/themes/themeManager.ts`)
- Kullanıcının belirlediği tema vurgu renkleri (`customAccent`), `HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/` düzenli ifadesiyle katı biçimde doğrulanır.
- `saveCustomAccent`: Girilen renk 6 haneli geçerli bir hex renk kodu değilse (örn. `'red'`, `'#123'`, `'url(...)'`), işlem iptal edilir ve `localStorage`'a yazılmaz.
- `getCustomAccent`: `localStorage` üzerinde depolanmış olan değer okunurken regex kontrolünden geçirilir; format geçersizse `null` döner ve sistem ilgili temanın varsayılan vurgu rengine geri döner.
- Bu doğrulama mekanizması `src/themes/themes.test.ts` dosyasındaki birim testlerle doğrulanmıştır.

### 5. Kabuk Glob ReDoS Koruması (`src/core/shell/glob.ts`)
- `globToRegExp` fonksiyonu, kabuk glob desenindeki ardışık `*` karakterlerini `pattern.replace(/\*+/g, '*')` ile tek bir yıldıza indirger.
- Böylece `ls *************************x` gibi girdi durumlarında üstel geri izleme (catastrophic backtracking) ve tarayıcı sekmesinin kilitlenmesi engellenmiştir.

### 6. Dosya Ağacı Metakarakter Kaçışlaması (`src/App.tsx`)
- Canlı dosya ağacındaki öğelere tıklandığında oluşturulan `cd` veya `cat` komutlarında, yol `quotePath(path)` fonksiyonundan geçirilir.
- Yol yalnızca güvenli karakterler (`/[^A-Za-z0-9_./~-]/`) içermiyorsa çift tırnak içine alınır ve içerisindeki `"` ile `\` karakterleri kaçışlanır; böylece dosya adlarına gizlenmiş komut enjeksiyonları önlenir.

### 7. Bağımlılık Güvenliği (Dependency Security)
- Geliştirme bağımlılıkları Vite 7 (`^7.3.8`) ve Vitest 5 (`^5.1.1`) sürümlerine yükseltilmiş, Node.js `>=22.12.0` kuralı getirilmiştir. `npm audit` çıktısı 0 güvenlik açığı (zero vulnerabilities) raporlamaktadır.

---

## 14. Mevcut Durum ve Sonraki Adımlar

### Mevcut Durum Özeti (Kod Tabanında Tam Olarak Var Olanlar)
1. **Çekirdek Komut Seti (33 Komut):** `pwd`, `ls`, `cd`, `mkdir`, `touch`, `cat`, `echo`, `cp`, `mv`, `rm`, `clear`, `help`, `man`, `history`, `head`, `tail`, `wc`, `grep`, `sort`, `uniq`, `find`, `chmod`, `whoami`, `uname`, `date`, `env`, `export`, `which`, `ps`, `kill`, `stat`, `realpath`, `basename` tamamen işlevseldir.
2. **Sanal Dosya Sistemi (VirtualFS):** Bellek içi (in-memory) ağaç yapısı, CRUD operasyonları, POSIX hata kodları, `chmod` ile izin bitleri yönetimi, `subscribe` olay dinleme mekanizması ve `Object.create(null)` tabanlı prototip kirlenmesi koruması çalışır durumdadır.
3. **Kabuk Motoru (Shell):** Boru hatları (`|`), G/Ç yönlendirmeleri (`>`, `>>`, `<`), mantıksal operatörler (`&&`, `||`, `;`), tırnak ayrıştırma, `$VAR` ve `~` genişletmesi, ReDoS korumalı glob (`*.txt`), çalıştırılabilir betik koşturma (`./betik.sh` yetki denetimli) ve `Tab` otomatik tamamlama mevcuttur.
4. **Ders İçeriği (28 Ders):**
   - **Seviye 0 ("Başlamadan Önce"):** 5 ders (`01-intro`, `02-how-klu-works`, `03-modes-and-tools`, `04-habits`, `05-real-linux`).
   - **Seviye 1 ("Başlangıç"):** 7 ders (`01-welcome`, `02-listing`, `03-navigation`, `04-creating`, `05-reading`, `06-copy-move`, `07-removing`).
   - **Seviye 2 ("Orta"):** 7 ders (`01-redirection`, `02-pipes`, `03-head-tail`, `04-wc`, `05-grep`, `06-sort-uniq`, `07-find`).
   - **Seviye 3 ("İleri"):** 9 ders (`01-system-info`, `02-environment`, `03-which-path`, `04-chmod-numeric`, `05-chmod-symbolic`, `06-processes-ps`, `07-kill-process`, `08-logic-operators`, `09-path-and-stat`).
5. **Serbest Mod (Sandbox) & Canlı Dosya Ağacı:** Tam ekran terminal, gerçek zamanlı reaktif dosya ağacı, animasyonlu yeni dosya vurgusu, `quotePath` kaçışlamalı tıklama desteği ve bağımsız sanal FS sıfırlama.
6. **Hile Kağıdı (Cheat Sheet):** 13 kategoride 33 komutun hızlı başvuru tablosu ve Serbest Mod terminaline aktarım desteği.
7. **Meraklısına (Explore):** 15 modern CLI aracı, 5 kategori filtresi (`media`, `system`, `files`, `productivity`, `fun`), dağıtım sekmeleri (Debian, Fedora, Arch), ipuçları ve tek tıkla kopyalama.
8. **Tema Motoru:** 5 renk teması, terminal renklerinin canlı eşzamanlanması, hex doğrulayıcılı özel vurgu rengi seçici.
9. **Kalite & Test Güvencesi:** 259 testi (13 test dosyasında), sıfır TypeScript hatası, `dist/index.html` içinde üretim CSP'si, 0 `npm audit` açığı.

### Gelecek Geliştirmeler
1. **Terminal ANSI Filtreleme:**
   - `ls` komutu ve satır düzenleyicide dosya isimlerindeki ham ANSI kaçış karakterlerinin temizlenmesi tamamlanacaktır.

