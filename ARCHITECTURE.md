# KLU — Mimari Dokümantasyonu (ARCHITECTURE.md)

Bu belge, **KLU** (Linux ve Kabuk Eğitimi Simülatörü) projesinin mimari tasarımını, temel modüllerini, veri yapılarını, bileşen etkileşimlerini ve geliştirme yönergelerini ayrıntılı olarak açıklamaktadır. Belgede yer alan tüm teknik detaylar doğrudan kaynak kodlar üzerinden doğrulanmıştır.

---

## 1. Proje Özeti ve Teknoloji Yığını

KLU, modern web tarayıcıları üzerinde çalışan, tamamen istemci taraflı (zero-backend, client-side only) etkileşimli bir Linux kabuk ve terminal simülasyonudur.

Herhangi bir uzak sunucuya, Docker konteynerine, WebSocket bağlantısına veya sanal makineye (VM) ihtiyaç duymaz. Bütün kabuk ayrıştırma (parsing), boru hatları (pipeline), dosya sistemi (VirtualFS), komut yürütme ve durum yönetimi doğrudan kullanıcının tarayıcısında (in-memory) gerçekleşir.

### Teknoloji Bileşenleri
- **Arayüz Kütüphanesi:** React 19 (`react`, `react-dom` ^19.0.0)
- **Derleme ve Geliştirme Aracı:** Vite (^5.4.1)
- **Programlama Dili:** TypeScript (~5.5.3, katı tip denetimi `strict: true`)
- **Terminal Motoru:** `@xterm/xterm` (^5.5.0) ve `@xterm/addon-fit` (^0.10.0)
- **Birim ve Entegrasyon Testleri:** Vitest (^2.1.4)
- **İkon Seti:** Lucide React (^0.454.0)
- **Markdown Dönüştürücü:** Marked (^15.0.3)

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

### `CommandContext` Arayüzü (`src/core/shell/types.ts`)
Bir komut çalıştırıldığında ihtiyaç duyduğu tüm çevresel kaynaklar `CommandContext` üzerinden sunulur:

```typescript
export interface CommandContext {
  args: string[];                      // Komuta aktarılan bayraklar ve parametreler
  stdin: string;                       // Standart girdi (pipeline veya girdi yönlendirmesinden gelen metin)
  stdout: (text: string) => void;      // Standart çıktı yazma fonksiyonu
  stderr: (text: string) => void;      // Standart hata yazma fonksiyonu
  fs: VirtualFS;                       // Sanal dosya sistemi örneği
  cwd: string;                         // Geçerli çalışma dizini (mutlak yol)
  setCwd: (path: string) => void;      // Çalışma dizinini güncelleme metodu
  env: Record<string, string>;         // Ortam değişkenleri tablosu
  setEnv: (key: string, value: string) => void;
  commands: CommandRegistry;           // Diğer komutlara ve yardım içeriklerine erişim
  history: string[];                   // Komut geçmişi listesi
}
```

### `CommandDefinition` Arayüzü
```typescript
export interface CommandDefinition {
  name: string;                        // Komut adı (örn. 'pwd')
  description: string;                 // help komutunda gösterilecek tek satırlık özet
  usage: string;                       // Kullanım şablonu (örn. 'pwd [-L | -P]')
  category: 'navigation' | 'file-ops' | 'reading' | 'system' | 'help';
  execute(ctx: CommandContext): Promise<number> | number; // Çıkış kodu (0: başarı, >0: hata)
  man?: {
    synopsis: string;
    description: string;
    options?: { flag: string; desc: string }[];
    examples?: { cmd: string; desc: string }[];
    seeAlso?: string[];
  };
}
```

### Örnek Komut İncelemesi: `pwd` (`src/core/commands/pwd.ts`)
```typescript
import type { CommandDefinition } from '../shell/types';

export const pwd: CommandDefinition = {
  name: 'pwd',
  description: 'Mevcut çalışma dizinini yazdırır',
  usage: 'pwd',
  category: 'navigation',
  execute(ctx) {
    for (const a of ctx.args) {
      if (a === '-L' || a === '-P') continue;
      if (a.startsWith('-')) {
        ctx.stderr(`pwd: ${a}: invalid option\n`);
        return 2;
      }
    }
    ctx.stdout(`${ctx.cwd}\n`);
    return 0;
  },
  man: {
    synopsis: 'pwd [SEÇENEK]...',
    description: 'Geçerli çalışma dizininin tam dosya adı yolunu yazdırır.',
    examples: [{ cmd: 'pwd', desc: 'Bulunduğun dizini gösterir' }],
    seeAlso: ['cd', 'ls'],
  },
};
```

### Registry Kaydı (`src/core/commands/index.ts`)
Tüm komutlar bir dizide toplanır ve `createRegistry` fonksiyonu ile bir haritaya (`Map<string, CommandDefinition>`) dönüştürülür:

```typescript
export const ALL_COMMANDS: CommandDefinition[] = [
  pwd, ls, cd, mkdir, touch, cat, echo, cp, mv, rm, clear, help, man, history,
];

export function createRegistry(commands = ALL_COMMANDS): CommandRegistry {
  const map = new Map<string, CommandDefinition>();
  for (const cmd of commands) map.set(cmd.name, cmd);
  return map;
}
```

### Shell'in Komut Satırını İşleme Aşamaları (`src/core/shell/Shell.ts`)
Kullanıcı Enter tuşuna bastığında komut dizisi şu adımlarla çalıştırılır:
1. **Ayrıştırma (`parseCommandLine` - `src/core/shell/parser.ts`):** Komut satırı mantıksal zincirlere (`&&`, `||`) ve boru hatlarına (`|`) bölünür. Tırnak işaretleri (`"..."`, `'...'`), kaçış dizileri (`\`) ve I/O yönlendirmeleri (`<`, `>`, `>>`, `2>`, `2>>`) ayıklanır.
2. **Genişletme (`expandWords` - `src/core/shell/Shell.ts`):** 
   - Değişken açılımı: `$VAR` veya `${VAR}` ifadeleri `this.env` üzerinden çözülür.
   - Tilde açılımı: `~` veya `~/...` öneki `$HOME` dizinine çevrilir.
   - Glob açılımı: `*` ve `?` joker karakterleri `expandGlobs()` (`src/core/shell/glob.ts`) aracılığıyla sanal dosya sistemindeki gerçek dosya/dizin adlarıyla eşleştirilir.
3. **Boru Hattı Yürütme (`runPipeline` - `src/core/shell/Shell.ts`):**
   - Zincirdeki komutlar sırayla koşturulur.
   - Giriş yönlendirmesi (`< file`): `fs.readFile()` ile okunup ilk komutun `stdin` akışına verilir.
   - Pipeline (`cmd1 | cmd2`): `cmd1` komutunun `stdout` çıktısı yakalanarak `cmd2` komutunun `ctx.stdin` verisi haline getirilir.
   - Çıkış yönlendirmeleri (`>`, `>>`, `2>`, `2>>`): Standart çıktı ve hata akışları `fs.writeFile()` ile hedef dosyalara yazılır veya eklenir (`append: true`).
4. **Geçmişe Ekleme:** Başarılı/başarısız tüm komut satırları kabuk geçmişine (`this.history`) eklenir.

---

## 4. VirtualFS (Sanal Dosya Sistemi)

`VirtualFS` (`src/core/fs/VirtualFS.ts`), Linux dosya hiyerarşisini bellekte bir nesne ağacı olarak simüle eden çekirdek sınıftır.

### Düğüm Yapısı
Her dosya ve dizin bir düğümdür (Node):
- **`BaseNode`:** `id`, `name`, `type: 'file' | 'dir'`, `mode: number` (POSIX izinleri, örn: `0o755`), `owner: string`, `group: string`, `ctime: number`, `mtime: number`.
- **`FileNode`:** `BaseNode` + `content: string`.
- **`DirNode`:** `BaseNode` + `children: Map<string, FsNode>`.

### Temel API Metotları
| Metot | Açıklama |
|---|---|
| `resolve(path, baseCwd?)` | Bağıl yolları (`..`, `.`, `~`) normalize edilmiş mutlak yola çevirir. |
| `lookup(path)` | Verilen mutlak yoldaki düğümü (`FsNode`) bulur; bulamazsa `ENOENT` hatası fırlatır. |
| `readdir(path)` | Dizindeki çocuk düğümlerin isimlerini sıralı liste olarak döner. |
| `readFile(path)` | Dosyanın metin içeriğini döner (`EISDIR` ve `ENOENT` denetimli). |
| `writeFile(path, content, opts)` | Dosyayı oluşturur/üzerine yazar veya `append: true` ise sonuna ekler. |
| `touch(path)` | Dosya varsa erişim/değişiklik zamanını günceller, yoksa boş dosya açar. |
| `mkdir(path, opts)` | Yeni dizin oluşturur (`recursive: true` seçeneği `-p` bayrağını destekler). |
| `remove(path, opts)` | Dosya veya dizini siler (`recursive: true` seçeneği `-r` bayrağını destekler). |
| `copy(src, dst, opts)` | Dosya/dizin kopyalar (`recursive: true` seçeneği `-r` bayrağını destekler). |
| `move(src, dst)` | Dosya veya dizini taşır / yeniden adlandırır. |

### Hata Kodları (`FsErrorCode` ve `FsError`)
Gerçek Linux POSIX hata kodları aynen kullanılır:
- `ENOENT`: "No such file or directory"
- `EEXIST`: "File exists"
- `ENOTDIR`: "Not a directory"
- `EISDIR`: "Is a directory"
- `ENOTEMPTY`: "Directory not empty"
- `EINVAL`: "Invalid argument"

### Olay Dinleyici / Abonelik Mekanizması (`subscribe`)
VirtualFS üzerinde gerçekleşen her mutasyon (dosya/dizin oluşturma, düzenleme, silme, taşıma) kayıtlı dinleyicilere bir `FsChangeEvent` yayınlar:

```typescript
export interface FsChangeEvent {
  type: 'create' | 'modify' | 'delete' | 'move';
  path: string;
  targetPath?: string;
  nodeType?: 'file' | 'dir';
}

// Abonelik:
const unsubscribe = fs.subscribe((event) => {
  // Olay tetiklendiğinde arayüzü güncelle
});
```

### Canlı Dosya Ağacı Entegrasyonu (`src/components/FileTree.tsx`)
`FileTree` bileşeni `VirtualFS` abonelik mekanizmasını doğrudan kullanır:
1. `useEffect` içerisinde `fs.subscribe` çağrılır ve `setVersion((v) => v + 1)` ile ağacın React render döngüsü tetiklenir.
2. Bir dosya veya klasör oluşturulduğunda (`type === 'create'` veya `'move'`), etkilenen öğenin tüm üst dizinleri `openDirs` kümesine otomatik olarak eklenir; böylece kullanıcı terminalde bir dosya oluşturduğu an ağaçta ilgili klasör otomatik açılır.
3. Yeni düğüm `highlightedNode` olarak işaretlenir ve CSS animasyonu (`--tree-flash-start` / `--tree-flash-glow`) ile parlama efekti verilir.

---

## 5. Ders Sistemi (Lessons System)

KLU'nun eğitim yapısı `src/lessons/` altında kurgulanmıştır.

### Veri Tipleri (`src/lessons/types.ts`)
- **`Lesson`:** `id`, `title`, `description` (Markdown), `tasks: Task[]`, `setup?: FsSeed & { cwd?: string }`.
- **`Task`:** `id`, `description`, `check: TaskCheck`, `hints: string[]`, `solution?: string`.
- **`Level`:** `id`, `title`, `description`, `badge`, `lessons: Lesson[]`, `comingSoon?: boolean`.

### Görev Kontrol Türleri (`TaskCheck`)
`TaskCheck` bir union tipidir ve şu denetim çeşitlerini sunar:
1. `command-match`: Regex deseniyle komut kontrolü (`commandRegex: string | RegExp`).
2. `command-exact`: Birebir komut eşleme (`command: string`).
3. `file-exists`: Belirtilen yolda dosya oluştu mu (`path: string`).
4. `dir-exists`: Belirtilen yolda dizin oluştu mu (`path: string`).
5. `file-contains`: Dosya içeriğinde belirli bir metin var mı (`path: string`, `contains: string`).
6. `cwd-match`: Kullanıcı hedef dizine geçti mi (`path: string`).
7. `custom`: Özel durumlar için fonksiyon kontrolü (`fn(fs, cwd, lastCommand): boolean`).

### Doğrulama Mekanizması (`src/lessons/validator.ts`)
Kullanıcı her komut çalıştırdığında `evaluateCommand()` çağrılır:
1. O anki aktif görev belirlenir.
2. Görevin `TaskCheck` kuralı `evaluateCheck(task.check, state)` fonksiyonuyla değerlendirilir.
3. Kural sağlanmışsa `completedTaskId` döndürülür ve görev tamamlanır.
4. Kural sağlanmamışsa, kullanıcının komutu `isWrongAttempt()` süzgecinden geçirilir.
   - **Önemli Kural:** `EXPLORATION_COMMANDS` listesindeki keşif komutları (`ls`, `pwd`, `cat`, `help`, `man`, `clear`, `history`, `echo`) **asla yanlış deneme olarak sayılmaz**. Kullanıcı dizini veya dosyaları incelerken hata sayacı artmaz.
   - Keşif komutu olmayan alakasız veya hatalı bir komut çalıştırıldığında hata sayacı artırılır ve sıradaki `hint` (ipucu) terminalde sarı renkli olarak gösterilir.

### Çözümü Göster Eşiği
`src/components/LessonPanel.tsx` içerisinde çözüm görüntüleme eşiği tanımlıdır:
```typescript
const SOLUTION_THRESHOLD = 3;
```
Kullanıcı bir görevde 3 kez hatalı deneme yaptığında panelde "Çözümü Göster" düğmesi aktifleşir. Çözüm tıklandığında komut gösterilir ve "Dene" butonuyla terminal satırına kopyalanabilir.

### Seviye Kataloğu (`src/lessons/content/index.ts`)
Katalog `LEVELS` dizisi olarak tanımlanmıştır:
1. **Seviye 0 (`level-0`):** "Başlamadan Önce" (5 Ders — `src/lessons/content/level0/index.ts`) — Terminale giriş, KLU mimarisi, araçlar, terminal alışkanlıkları ve gerçek Linux farkları.
2. **Seviye 1 (`level-1`):** "Temel Komutlar" (7 Ders — `src/lessons/content/level1/index.ts`) — Karşılama, listeleme (`ls`), gezinme (`cd`), oluşturma (`mkdir`, `touch`), okuma (`cat`), kopyalama/taşıma (`cp`, `mv`), silme (`rm`).
3. **Seviye 2 (`level-2`):** "Boru Hatları ve Arama" (`comingSoon: true`).
4. **Seviye 3 (`level-3`):** "İzinler ve İleri Düzey" (`comingSoon: true`).

### Yeni Bir Ders Ekleme Adımları
1. İlgili seviye dizini altında (örn: `src/lessons/content/level1/`) yeni bir TypeScript ders dosyası oluşturun ve `Lesson` tipinde dışa aktarın.
2. Dersi ilgili seviyenin indeks dosyasına (`src/lessons/content/level1/index.ts`) ekleyin.
3. Görevleri ve `TaskCheck` kurallarını tanımlayın.
4. Gerekiyorsa `setup` alanında dersin başlayacağı sanal dosya ve dizin tohumunu (`dirs`, `files`, `cwd`) belirtin.
5. `npm test` ile doğrulayıcının çalıştığını test edin.

### Yeni Bir Seviye Ekleme Adımları
1. `src/lessons/content/` altında yeni seviye dizinini ve indeks dosyasını oluşturun.
2. `src/lessons/content/index.ts` dosyası içindeki `LEVELS` dizisine yeni `Level` nesnesini ekleyin.
3. Eğer seviye henüz hazır değilse `comingSoon: true` bayrağı ile listeleyin.

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

### İlerleme Durumu Yapısı (`ProgressState`)
```typescript
export interface ProgressState {
  currentLessonId: string;
  completed: Record<string, string[]>; // { [lessonId]: [taskId1, taskId2] }
  attempts: Record<string, number>;    // { [`${lessonId}:${taskId}`]: count }
  revealed: Record<string, boolean>;   // { [`${lessonId}:${taskId}`]: true }
  history: string[];                   // Terminal komut geçmişi
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
1. **Koyu (`dark`):** KLU'nun klasik koyu teması, zümrüt yeşili varsayılan vurgu rengi.
2. **Açık (`light`):** Temiz, yüksek kontrastlı açık tema.
3. **Dracula (`dracula`):** Mor/pembe tabanlı vampir teması.
4. **Solarized Dark (`solarized`):** Ethan Schoonover klasiği sıcak lacivert/cyan teması.
5. **Retro Yeşil (`retro`):** CRT monitör hissi veren monokrom fosforlu yeşil tema.

### Canlı Eşzamanlama (Dynamic Reskinning)
Arayüz renkleri `applyThemeToDocument()` (`src/themes/themeManager.ts`) fonksiyonuyla `:root` üzerindeki CSS değişkenlerine (`--bg`, `--panel`, `--text`, `--accent`, `--border` vb.) ve `document.documentElement.dataset.theme` değerine anında yazılır.

**Terminal Renklerinin Yeniden Başlatılmadan Güncellenmesi:**
Terminalin xterm.js motorundaki renkleri, terminal oturumunu ve mevcut çıktıları kaybetmeden güncellemek için `src/terminal/TerminalView.tsx` bileşeni `terminalTheme` prop'unu dinler:

```typescript
// src/terminal/TerminalView.tsx
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
- **İçerik:** Sistemde mevcut olan 14 komutun kategorize edilmiş listesi (Gezinme, Dosya İşlemleri, Dosya Okuma, Sistem ve Temizlik, Yardım).
- **Etkileşim:** Bir komuta tıklandığında uygulama otomatik olarak **Serbest Mod**'a geçer, dosya ağacını açar ve tıklanan komutu Enter'a basmadan terminal girdi satırına yazar.

### Meraklısına (`src/explore/`)
- **Görünüm:** `src/explore/ExploreView.tsx`
- **Veri Kaynağı:** `src/explore/data.ts`
- **İçerik:** Gerçek Linux ortamında yaygın olarak kullanılan modern CLI araçlarını tanıtan kartlar (`yt-dlp`, `fastfetch`, `tldr`).
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
# Birim ve entegrasyon testlerini çalıştırır (106 test)
npm test

# TypeScript tip denetimi (sıfır hata hedeflenir)
npx tsc --noEmit

# Üretim paketi derleme (dist/ dizinine çıktı üretir)
npm run build
```

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
3. **Seviye 2, 3 ve Etkileşimli Git Simülasyonu:**
   Mevcut durumda Seviye 0 ve Seviye 1 tam fonksiyoneldir; Seviye 2 ve Seviye 3 ise katalogda `comingSoon: true` olarak işaretlenmiştir. Git sekmesi şu an bilgilendirme modundadır; sanal `.git` motoru veya `git` komut seti henüz terminale entegre edilmemiştir.
4. **Mobil Klavye Kısayolları:**
   Mobil cihazlar için ekranda temel gezinme tuşlarını içeren bir çubuk (`.key-bar` — Tab, ↑, ↓, ←, →, ~, /, -, Ctrl+C) bulunmaktadır; ancak boru hattı (`|`), yönlendirme (`>`, `<`) ve kesme tuşları gibi gelişmiş terminal operatörleri için zengin bir sanal tuş takımı henüz geliştirilmemiştir.

---

## 12. Planlanan Geliştirmeler ve Yol Haritası (Roadmap)

### Seviye 2: Boru Hatları ve Arama
- Boru hattı mantığı (`|`) ve G/Ç yönlendirmelerinin (`>`, `>>`, `<`) ders formatında anlatımı.
- `grep` (metin içi arama ve filtreleme) komutunun çekirdeğe eklenmesi.
- `find` (dosya sisteminde arama) komutunun çekirdeğe eklenmesi.
- `chmod` ve `chown` komutlarıyla gerçek dosya izin sisteminin aktif hale getirilmesi.

### Seviye 3: İleri Düzey Linux ve Betikleme
- Temel süreç yönetimi simülasyonu (`ps`, `kill`).
- Basit kabuk betikleri çalıştırma (değişkenler, döngüler, `if-else`).
- Paket yöneticisi simülasyonu (`apt install` simülasyonu).
- Ağ araçları (`curl`, `ping` simülasyonları).

### Etkileşimli Git Motoru
- `VirtualFS` içinde sanal `.git` dizin yapısı (objects, refs, HEAD, index).
- `git init`, `git add`, `git commit`, `git status`, `git log`, `git branch`, `git checkout` komutlarının `CommandRegistry`ye eklenmesi.
- Çalışma Alanı, Staging Alanı ve Depo Alanını gerçek zamanlı görselleştiren etkileşimli Git paneli.
