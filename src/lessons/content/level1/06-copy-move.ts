import type { Lesson } from '../../types';

export const copyMove: Lesson = {
  id: 'l1-copy-move',
  title: 'Kopyalama, Taşıma ve Yeniden Adlandırma',
  summary: 'cp, cp -r ve mv',
  setup: {
    files: {
      '~/calisma/taslak.txt': 'Bu bir taslak metindir.\n',
      '~/calisma/fikirler.txt': '1. Terminal öğren\n2. Bash script yaz\n',
    },
  },
  content: `
### cp — kopyalama

\`\`\`
cp KAYNAK HEDEF
\`\`\`

- \`cp notlar.txt yedek.txt\` — dosyanın **kopyasını** başka adla oluşturur.
- \`cp notlar.txt Belgeler/\` — hedef bir dizinse, dosya **o dizinin içine** aynı adla kopyalanır.
- Dizinleri kopyalamak için \`-r\` (*recursive*) gerekir: \`cp -r Belgeler Belgeler_yedek\`

\`-r\` olmadan dizin kopyalamaya çalışırsan:
\`\`\`
cp: -r not specified; omitting directory 'Belgeler'
\`\`\`

### mv — taşıma ve yeniden adlandırma

\`mv\` (*move*) dosyayı yerinden alır; orijinali kalmaz. Linux'ta ayrı bir "yeniden adlandır" komutu yoktur, bunun için de \`mv\` kullanılır:

\`\`\`
$ mv taslak.txt son.txt        # yeniden adlandır
$ mv son.txt Belgeler/         # Belgeler dizinine taşı
\`\`\`

Dizinleri taşımak için \`-r\` gerekmez.

> ⚠️ \`cp\` ve \`mv\`, hedefte aynı adda bir dosya varsa **sormadan üzerine yazar**!

Bu ders için ev dizinine bir \`calisma\` dizini eklendi. \`ls calisma\` ile bakabilirsin.
`,
  examples: ['ls calisma', 'cp merhaba.txt merhaba_yedek.txt', 'mv calisma/taslak.txt calisma/son.txt', 'cp -r Belgeler Belgeler_yedek'],
  tasks: [
    {
      id: 'cp',
      description: '`merhaba.txt` dosyasının `merhaba_yedek.txt` adında bir kopyasını oluştur (ev dizininde).',
      hints: ['Kopyalama komutu `cp`; önce kaynak, sonra hedef yazılır.', '`cp merhaba.txt merhaba_yedek.txt`'],
      solution: 'cp ~/merhaba.txt ~/merhaba_yedek.txt',
      check: {
        type: 'all',
        checks: [
          { type: 'fileContains', path: '~/merhaba_yedek.txt', text: 'Merhaba' },
          { type: 'pathExists', path: '~/merhaba.txt', kind: 'file' },
        ],
      },
    },
    {
      id: 'mv-rename',
      description: '`calisma` dizinindeki `taslak.txt` dosyasının adını `son.txt` olarak değiştir.',
      hints: ['Linux\'ta yeniden adlandırma `mv` ile yapılır.', 'Her iki yolu da `calisma/` ile başlat.'],
      solution: 'mv ~/calisma/taslak.txt ~/calisma/son.txt',
      check: {
        type: 'all',
        checks: [
          { type: 'pathExists', path: '~/calisma/son.txt', kind: 'file' },
          { type: 'pathNotExists', path: '~/calisma/taslak.txt' },
        ],
      },
    },
    {
      id: 'cp-r',
      description: '`Belgeler` dizinini tüm içeriğiyle birlikte `Belgeler_yedek` adıyla kopyala.',
      hints: ['Dizin kopyalamak için `cp`\'ye bir seçenek eklemelisin.', '"recursive": `cp -r KAYNAK HEDEF`'],
      solution: 'cp -r ~/Belgeler ~/Belgeler_yedek',
      check: { type: 'pathExists', path: '~/Belgeler_yedek/rapor.txt', kind: 'file' },
    },
  ],
};
