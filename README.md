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
  - Desteklenen 14 çekirdek komut: `pwd`, `ls`, `cd`, `mkdir`, `touch`, `cat`, `echo`, `cp`, `mv`, `rm`, `clear`, `help`, `man`, `history`.
  - Unix boru hattı (pipe: `|`), yönlendirmeler (`>`, `>>`), tırnaklar (`""`, `''`), bayrak ayrıştırma (`-la`, `-rf`) ve glob açılımı (`*.txt`).
  - Terminalde `Tab` ile otomatik tamamlama, `↑`/`↓` ile komut geçmişi gezintisi.
- **Ders Modu (Seviye 1: Temel Komutlar):**
  - Adım adım açıklamalar, örnekler ve anında doğrulanabilen interaktif görevler.
  - İpuçları (3 başarısız denemeden sonra çözüm gösterme imkânı).
  - İlerleme durumu `localStorage` üzerinde saklanır.
- **Serbest Mod (Sandbox) & Canlı Dosya Ağacı:**
  - Tam ekran terminal ve yan panelde canlı güncellenen dosya sistemi ağacı.
  - Ağaçtaki bir klasöre tıklandığında `cd <yol>`, dosyaya tıklandığında `cat <yol>` komutunu terminale otomatik yazma.
  - Çalışma dizini (`cwd`) vurgulaması ve yeni oluşturulan öğeleri animasyonla belirtme.
  - Ders ilerlemesini sıfırlamadan serbest mod dosya sistemini tek tıkla sıfırlayabilme.
- **Hile Kağıdı (Cheat Sheet):**
  - Kategorilere ayrılmış komut rehberi (gezinme, dosya işlemleri, okuma, silme, yardım).
  - Komutlara veya örneklere tıklayarak doğrudan Serbest Mod terminaline aktarma.
- **Meraklısına (Linux Araçları):**
  - Gerçek Linux dünyasında kullanılan popüler harici araçlar (`yt-dlp`, `fastfetch`, `tldr`) için tanıtım kartları, kurulum kodları ve tek tıkla kopyalama desteği.

---

## 🛠️ Teknoloji Yığını

- **Çatı & Dil:** React 19, TypeScript, Vite
- **Terminal UI:** `@xterm/xterm`, `@xterm/addon-fit`
- **Test:** Vitest
- **Stil:** Modern Saf CSS (Dark Theme, mobil uyumlu, CSS variables)

---

## 🚀 Başlangıç & Kurulum

### 1. Gereksinimler
Node.js LTS (v20 veya v22+) sürümü önerilir. `nvm` kullanıyorsanız:

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

Vitest ile yazılmış 80+ birim testini çalıştırmak için:

```bash
npm test
```

İzleme (watch) modunda testleri sürekli çalıştırmak için:
```bash
npx vitest
```

### 5. Üretim İçin Derleme (Build)

```bash
npm run build
```
Derleme çıktısı `dist/` klasörüne kaydedilir. Sonucu önizlemek için:
```bash
npm run preview
```

---

## 📖 Geliştirici Rehberi

### 1. Yeni Ders Ekleme

Dersler `src/lessons/content/` klasörü altında tanımlanır.

1. İlgili seviye dosyasına (örn. `src/lessons/content/level1.ts`) yeni bir `Lesson` nesnesi ekleyin:

```typescript
import type { Lesson } from '../types';

export const myNewLesson: Lesson = {
  id: 'yeni-ders-id',
  levelId: 'level-1',
  title: 'Yeni Ders Başlığı',
  summary: 'Dersin kısa özeti',
  bodyMarkdown: `
### Açıklama
Bu derste yeni bir kavram öğreniyoruz.

\`\`\`bash
komut --bayrak
\`\`\`
`,
  examples: ['komut ornek'],
  // İsteğe bağlı: derse özel dosya sistemi durumu
  initialFS: (fs) => {
    fs.mkdir('/home/kullanici/proje');
    fs.writeFile('/home/kullanici/proje/not.txt', 'Merhaba');
  },
  initialCwd: '/home/kullanici',
  tasks: [
    {
      id: 'gorev-1',
      description: '`proje` dizinine git.',
      hints: [
        '`cd` komutunu kullan.',
        '`cd proje` yazabilirsin.',
      ],
      solution: 'cd proje',
      // Görev doğrulama mantığı (fs, cwd, son çalıştırılan komut kaydı)
      check: ({ cwd }) => cwd === '/home/kullanici/proje',
    },
  ],
};
```

2. Bu dersi `src/lessons/content/index.ts` içindeki ilgili seviyenin `lessons` dizisine ekleyin.

---

### 2. Yeni Terminal Komutu Ekleme

Tüm komutlar `src/core/commands/` klasöründe modüler olarak yer alır.

1. `src/core/commands/` altında `mycommand.ts` dosyası oluşturun:

```typescript
import type { CommandDefinition, CommandContext } from '../shell/types';

export const mycommand: CommandDefinition = {
  name: 'mycommand',
  summary: 'Komutun tek satırlık özeti',
  man: `İSİM
    mycommand - detaylı kılavuz sayfası

KULLANIM
    mycommand [SEÇENEKLER] [HEDEF]...`,
  async execute(ctx: CommandContext, args: string[]): Promise<number> {
    // ctx.fs: Sanal dosya sistemi
    // ctx.cwd: Mevcut çalışma dizini
    // ctx.stdout(text): Standart çıktıya satır yaz
    // ctx.stderr(text): Standart hataya satır yaz
    // ctx.stdin: Varsa boru hattından gelen veri (pipe)

    if (args.includes('--help')) {
      ctx.stdout(mycommand.summary);
      return 0;
    }

    ctx.stdout(`İşlem yapıldı: ${args.join(' ')}`);
    return 0; // 0: başarılı, >0: hata kodu
  },
};
```

2. `src/core/commands/index.ts` dosyasına komutu kaydedin:

```typescript
import { mycommand } from './mycommand';

export function createRegistry(): CommandRegistry {
  const reg = new Map<string, CommandDefinition>();
  // ...
  reg.set(mycommand.name, mycommand);
  return reg;
}
```

3. Yeni komut için `tests/core/commands.test.ts` içine birim testlerini ekleyin.

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
    summary: 'Aracın ne işe yaradığına dair 1 cümlelik özet',
    description: 'Aracın detaylı açıklaması ve kullanım alanları.',
    installCommand: 'sudo apt install arac-adi',
    exampleCommand: 'arac-adi --secenek dosya',
    exampleOutput: `[çıktı] Örnek terminal çıktısı metni`,
    warning: 'Opsiyonel yasal veya güvenlik uyarı metni', // (isteğe bağlı)
  },
];
```

Sayfa otomatik olarak kurulum ve örnek kullanım komutlarına "📋 Kopyala" butonu ekleyecek ve stilini oluşturacaktır.

---

## 🧪 Test Stratejisi & Mimarisi

- **Test Kapsamı:**
  - `path.test.ts`: Sanal dosya yollarının çözümlenmesi (`resolvePath`, `normalize`, `split`).
  - `fs.test.ts`: Dizin oluşturma, dosya okuma/yazma, silme, kopyalama, taşıma, `subscribe` dinleyicileri.
  - `parser.test.ts`: Unix kabuk girdi ayrıştırması, tırnaklar, boru hattı (`|`), yönlendirmeler (`>`, `>>`).
  - `commands.test.ts`: 14 çekirdek komutun uç durumları, argüman ayrıştırması ve hata mesajları.
  - `lessons.test.ts`: Görev değerlendiricisi (`validator`), ipucu ve çözüm akışı.

Testleri çalıştırmak için:
```bash
npm test
```

---

## 📄 Lisans

MIT Lisansı.
