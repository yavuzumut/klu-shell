# KLU 🚀

> **Tarayıcıda çalışan, sıfırdan ileri seviyeye Linux terminali öğreten interaktif web uygulaması.**

KLU; backend veya sunucu bağımlılığı olmaksızın, tamamen istemci tarafında (tarayıcıda) çalışan sanal bir Linux dosya sistemi ve komut kabuğu (shell) simülatörüdür. Kullanıcılar xterm.js tabanlı gerçekçi bir terminal üzerinde temel Linux komutlarını interaktif görevlerle öğrenebilir, Serbest Mod'da diledikleri gibi pratik yapabilir ve canlı dosya ağacını izleyebilirler.

---

## 🌟 Özellikler

- **İstemci Taraflı Sanal Dosya Sistemi (In-Memory VirtualFS):**
  - Gerçekçi Linux dosya hiyerarşisi (`/home/kullanici`, `/etc`, `/var`, `/tmp`, vb.).
  - Dosya okuma, yazma, kopyalama, taşıma, silme ve izin mantığı.
  - Olay tabanlı dinleyici mimarisi (`subscribe`) ile UI ve dosya ağacının anında güncellenmesi.
- **Modüler Komut Yorumlayıcısı (Shell Engine):**
  - Desteklenen 30 çekirdek komut: `pwd`, `ls`, `cd`, `mkdir`, `touch`, `cat`, `echo`, `cp`, `mv`, `rm`, `clear`, `help`, `man`, `history`, `head`, `tail`, `wc`, `grep`, `sort`, `uniq`, `find`, `chmod`, `whoami`, `uname`, `date`, `env`, `export`, `which`, `ps`, `kill`.
  - Unix boru hattı (pipe: `|`), yönlendirmeler (`>`, `>>`), tırnaklar (`""`, `''`), bayrak ayrıştırma (`-la`, `-rf`) ve glob açılımı (`*.txt`).
  - Terminalde `Tab` ile otomatik tamamlama, `↑`/`↓` ile komut geçmişi gezintisi.
- **Ders Modu (Seviye 0, 1, 2 & 3: 26 İnteraktif Ders):**
  - **Seviye 0 ("Başlamadan Önce", 5 ders):** Terminale giriş, KLU'nun çalışma mantığı, modlar ve gerçek Linux terminal alışkanlıkları.
  - **Seviye 1 ("Başlangıç", 7 ders):** Çalışma dizini (`pwd`), dosya listeleme (`ls`), dizinler arası gezinme (`cd`), dosya/klasör oluşturma (`touch`, `mkdir`), okuma (`cat`), kopyalama/taşıma (`cp`, `mv`) ve silme (`rm`).
  - **Seviye 2 ("Orta", 7 ders):** Çıktı yönlendirme (`>`, `>>`), boru hattı (`|`), dosya başı ve sonu (`head`, `tail`), metin sayımı (`wc`), metin içi arama (`grep`), sıralama/tekilleştirme (`sort`, `uniq`) ve dosya sisteminde arama (`find`).
  - **Seviye 3 ("İleri", 7 ders):** Sistem ve kullanıcı bilgisi (`whoami`, `uname`, `date`), ortam değişkenleri (`env`, `export`, `$VAR`), komut arama yolu (`which`, `$PATH`), dosya izinleri (`chmod 755/644`, `chmod +x`), çalıştırılabilir betikler (`./`) ve süreç yönetimi (`ps`, `ps aux`, `kill`).
  - Adım adım Türkçe açıklamalar, örnekler ve anında doğrulanabilen interaktif görevler.
  - İpuçları (3 başarısız denemeden sonra çözüm gösterme imkânı).
  - İlerleme durumu `localStorage` üzerinde saklanır.
- **Serbest Mod (Sandbox) & Canlı Dosya Ağacı:**
  - Tam ekran terminal ve yan panelde canlı güncellenen dosya sistemi ağacı.
  - Ağaçtaki bir klasöre tıklandığında `cd <yol>`, dosyaya tıklandığında `cat <yol>` komutunu güvenli kaçışlamayla (`quotePath`) terminale otomatik yazma.
  - Çalışma dizini (`cwd`) vurgulaması ve yeni oluşturulan öğeleri animasyonlu parlama efektiyle belirtme.
  - Ders ilerlemesini sıfırlamadan serbest mod dosya sistemini tek tıkla sıfırlayabilme.
- **Hile Kağıdı (Cheat Sheet):**
  - 13 kategoriye ayrılmış 30 çekirdek komut rehberi (gezinme, dosya işlemleri, okuma, arama, sıralama, izinler, sistem bilgisi, ortam değişkenleri, süreçler, silme, yardım vb.).
  - Komutlara veya örneklere tıklayarak doğrudan Serbest Mod terminaline aktarma.
- **Meraklısına (Modern Linux CLI Araçları):**
  - Gerçek Linux dünyasında kullanılan 15 popüler harici araç için tanıtım kartları (`yt-dlp`, `wttr.in`, `fastfetch`, `btop`, `ncdu`, `ripgrep`, `fd`, `bat`, `eza`, `fzf`, `tldr`, `tmux`, `cmatrix`, `cowsay-figlet-lolcat`, `sl`).
  - 5 kategori filtresi (Medya, Sistem, Dosyalar, Verimlilik, Eğlence).
  - Dağıtıma özel (Debian/Ubuntu, Fedora, Arch) kurulum komutları, ipuçları (`tips`), ASCII tren sanatı (`sl`), `fastfetch` sistem çıktısı ve tek tıkla kopyalama desteği.
- **Git Görsel Rehberi:**
  - Git temelleri, Linus Torvalds ve Linux bağı, 3 Alan Modeli (Çalışma Alanı -> Staging -> Yerel Depo) ve 4 aşamalı yol haritası.
- **Kişiselleştirilebilir Temalar:**
  - 5 yerleşik tema (Koyu, Açık, Dracula, Solarized Dark, Retro CRT Yeşil).
  - xterm.js terminali ile anında canlı renk eşzamanlaması ve regex doğrulamalı özel hex vurgu rengi seçici.

---

## 🛠️ Teknoloji Yığını

- **Çatı & Dil:** React 18 (`^18.3.1`), TypeScript (`~5.6.2`), Vite 7 (`^7.3.8`)
- **Terminal UI:** `@xterm/xterm` (`^5.5.0`), `@xterm/addon-fit` (`^0.10.0`)
- **Birim & Entegrasyon Test:** Vitest 5 (`^5.1.1` - 162 test)
- **Markdown İşleme:** Marked (`^14.1.0`)
- **Stil:** Modern Saf CSS (5 tema, CSS değişkenleri, duyarlı mobil tuş çubuğu)

---

## 🚀 Başlangıç & Kurulum

### 1. Gereksinimler
Node.js >= 22.12.0 gereklidir. `nvm` kullanıyorsanız:

```bash
# nvm ile LTS sürümünü kurun ve etkinleştirin
nvm install --lts
nvm use --lts
```

### 2. Projeyi Klonlama ve Bağımlılıkları Yükleme

```bash
git clone https://github.com/kullanici/termi.git
cd termi
npm install
```

### 3. Geliştirme Sunucusunu Çalıştırma

```bash
npm run dev
```
Terminal çıktısında belirtilen adresi (varsayılan: `http://localhost:5173`) tarayıcınızda açın.

### 4. Testleri Çalıştırma

Vitest ile yazılmış 162 birim testini çalıştırmak için:

```bash
npm test
```

İzleme (watch) modunda testleri sürekli çalıştırmak için:
```bash
npm run test:watch
```

### 5. Üretim İçin Derleme (Build)

```bash
npm run build
```
Derleme çıktısı `dist/` klasörüne kaydedilir (üretim CSP meta etiketi otomatik enjekte edilir). Sonucu önizlemek için:
```bash
npm run preview
```

---

## 📖 Geliştirici Rehberi

### 1. Yeni Ders Ekleme

Dersler Seviye 0 ve Seviye 1 olarak `src/lessons/content/` klasörü altında modüler TypeScript dosyalarında tanımlanır:

1. İlgili seviye klasöründe (örn. `src/lessons/content/level1/`) yeni bir ders dosyası oluşturun (örn. `08-yeni-ders.ts`):

```typescript
import type { Lesson } from '../../types';

export const myNewLesson: Lesson = {
  id: 'yeni-ders-id',
  title: 'Yeni Ders Başlığı',
  summary: 'Dersin tek satırlık kısa özeti',
  content: `
### Açıklama
Bu derste yeni bir kavram öğreniyoruz.

\`\`\`bash
komut --bayrak hedef
\`\`\`
`,
  examples: ['komut ornek'],
  // İsteğe bağlı: derse özel dosya sistemi tohumu ve başlangıç dizini
  setup: {
    dirs: ['/home/kullanici/proje'],
    files: {
      '/home/kullanici/proje/not.txt': 'Merhaba KLU',
    },
    cwd: '/home/kullanici',
  },
  tasks: [
    {
      id: 'gorev-1',
      description: '`proje` dizinine git.',
      hints: [
        '`cd` komutunu kullan.',
        '`cd proje` yazabilirsin.',
      ],
      solution: 'cd proje',
      // Bildirimsel görev doğrulama kuralı
      check: { type: 'cwdIs', path: '~/proje' },
    },
  ],
};
```

2. Bu dersi `src/lessons/content/level1/index.ts` içindeki `level1.lessons` dizisine ekleyin.

---

### 2. Yeni Terminal Komutu Ekleme

Tüm komutlar `src/core/commands/` klasöründe modüler olarak yer alır.

1. `src/core/commands/` altında `mycommand.ts` dosyası oluşturun:

```typescript
import type { CommandDefinition, CommandContext } from '../shell/types';

export const mycommand: CommandDefinition = {
  name: 'mycommand',
  summary: 'Komutun tek satırlık Türkçe özeti',
  usage: 'mycommand [SEÇENEKLER] [HEDEF]...',
  completion: 'files', // 'files' | 'dirs' | 'commands' | 'none'
  manPage: `AD
    mycommand - detaylı kılavuz sayfası

KULLANIM
    mycommand [SEÇENEKLER] [HEDEF]...

AÇIKLAMA
    Komutun ne yaptığını açıklayan detaylı metin.`,
  run(args: string[], ctx: CommandContext): number {
    // ctx.fs: Sanal dosya sistemi (VirtualFS)
    // ctx.cwd: Mevcut çalışma dizini
    // ctx.stdout(text): Standart çıktı akışı
    // ctx.stderr(text): Standart hata akışı
    // ctx.stdin: Varsa boru hattından gelen veri (pipe)

    if (args.includes('--help')) {
      ctx.stdout(mycommand.summary + '\n');
      return 0;
    }

    ctx.stdout(`İşlem yapıldı: ${args.join(' ')}\n`);
    return 0; // 0: başarılı, >0: POSIX hata kodu
  },
};
```

2. `src/core/commands/index.ts` dosyasına yeni komutu import edin ve `ALL_COMMANDS` dizisine ekleyin:

```typescript
import { mycommand } from './mycommand';

export const ALL_COMMANDS: CommandDefinition[] = [
  // ... diğer komutlar
  mycommand,
];
```

3. Yeni komut için `src/core/commands/commands.test.ts` içine birim testlerini ekleyin.

---

### 3. Hile Kağıdına (Cheat Sheet) Komut Ekleme

Hile kağıdı verileri `src/cheatsheet/data.ts` dosyasında tutulur.

Yeni bir komut veya kategori eklemek için:

```typescript
export const CHEAT_SHEET_DATA: CheatCategory[] = [
  {
    title: 'Gezinme ve Yol Bilgisi',
    items: [
      {
        command: 'pwd',
        description: 'Bulunduğun çalışma dizinini ekrana yazar.',
        example: 'pwd',
      },
      // Yeni komut satırı:
      {
        command: 'yeni-komut',
        description: 'Komutun ne işe yaradığını belirten kısa Türkçe açıklama.',
        example: 'yeni-komut -parametre hedef',
      },
    ],
  },
];
```

---

### 4. Meraklısına (Explore) Yeni Araç Kartı Ekleme

Gerçek Linux araçlarının tanıtım kartları `src/explore/data.ts` dosyasında yapılandırılmıştır.

Yeni bir araç kartı eklemek için `EXPLORE_TOOLS` dizisine bir nesne ekleyin:

```typescript
export const EXPLORE_TOOLS: ExploreTool[] = [
  {
    id: 'arac-id',
    name: 'arac-adi',
    category: 'productivity', // 'media' | 'system' | 'files' | 'productivity' | 'fun'
    replaces: 'eski-arac', // opsiyonel
    description: 'Aracın ne işe yaradığına dair 1-2 cümlelik Türkçe açıklama.',
    exampleCommand: 'arac-adi --secenek dosya',
    exampleOutput: `[çıktı] Örnek terminal çıktısı metni`,
    install: {
      debian: 'sudo apt install arac-adi',
      fedora: 'sudo dnf install arac-adi',
      arch: 'sudo pacman -S arac-adi',
      note: 'Opsiyonel kuruluma özel not',
    },
    tips: ['Kullanım ipucu 1', 'Kullanım ipucu 2'], // opsiyonel
    warning: 'Opsiyonel yasal veya güvenlik uyarı metni', // opsiyonel
    sourceUrl: 'https://github.com/...', // opsiyonel
  },
];
```

Sayfa otomatik olarak kategori filtrelerini, dağıtım sekmelerini ve "📋 Kopyala" butonlarını oluşturacaktır.

---

## 🧪 Test Stratejisi & Mimarisi

KLU, 9 ayrı test dosyasında 116 birim testi ile korunmaktadır. Test dosyaları test ettikleri modüllerin hemen yanında (`src/`) yer alır:

- `src/core/commands/commands.test.ts`: 14 çekirdek komutun bayrakları, argümanları ve POSIX hata çıktıları (39 test).
- `src/core/fs/VirtualFS.test.ts`: Dizin ve dosya işlemleri, hata kodları, derin klonlama ve prototip kirlenmesi koruması (19 test).
- `src/core/fs/treeListener.test.ts`: Dosya sistemi mutasyon dinleyicileri (`subscribe`) ve dosya ağacı tetikleyicileri (3 test).
- `src/core/shell/parser.test.ts`: Kabuk girdi ayrıştırma, tırnaklar, boru hattı (`|`), yönlendirmeler (`>`, `>>`) ve değişken genişletme (13 test).
- `src/core/shell/completion.test.ts`: Tab tuşu ile komut ve dosya/dizin adı tamamlama (5 test).
- `src/lessons/validator.test.ts`: Görev doğrulama kuralları, keşif/nötr komutlar ve yanlış deneme mekanizması (16 test).
- `src/explore/data.test.ts`: 15 CLI araç kartının şema doğrulaması ve kategori bütünlüğü (5 test).
- `src/themes/themes.test.ts`: 5 tema tanımı, hex renk doğrulama regex'i ve CSS değişkenleri (9 test).
- `src/state/progress.test.ts`: İlerleme durumu, localStorage senkronizasyonu ve geçmiş yönetimi (7 test).

Testleri çalıştırmak için:
```bash
npm test
```

---

## 📄 Lisans

MIT Lisansı.
