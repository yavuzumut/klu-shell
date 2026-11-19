import type { Lesson } from '../../types';

export const removing: Lesson = {
  id: 'l1-removing',
  title: 'Silme ve Final Görevi',
  summary: 'rm, rm -r ve öğrendiklerini birleştir',
  setup: {
    files: {
      '~/cop/eski1.txt': 'silinecek\n',
      '~/cop/eski2.txt': 'bu da silinecek\n',
      '~/eski_proje/README': 'Artık kullanılmayan proje\n',
      '~/eski_proje/src/main.c': 'int main() { return 0; }\n',
    },
  },
  content: `
### rm — silme

\`\`\`
$ rm eski.txt
$ rm a.txt b.txt
\`\`\`

> ⚠️ **Terminalde çöp kutusu yoktur!** \`rm\` ile silinen dosya geri gelmez. Komutu Enter'a basmadan önce iki kez kontrol et.

Varsayılan olarak \`rm\` dizinleri silmez:

\`\`\`
$ rm eski_proje
rm: cannot remove 'eski_proje': Is a directory
\`\`\`

Bir dizini **içindeki her şeyle birlikte** silmek için \`-r\` (*recursive*) kullanılır:

\`\`\`
$ rm -r eski_proje
\`\`\`

- \`-f\` (*force*): olmayan dosyalar için hata vermez, soru sormaz.
- \`rm -rf\` güçlü ve tehlikeli bir kombinasyondur; ne sildiğinden emin ol.

### Final görevi 🎯

Son görevde şimdiye kadar öğrendiğin komutları birleştireceksin. Birden fazla komut gerekebilir!

Bu ders için ev dizinine \`cop\` ve \`eski_proje\` dizinleri eklendi.
`,
  examples: ['ls cop', 'rm cop/eski1.txt', 'rm -r eski_proje', 'mkdir arsiv', 'mv merhaba.txt arsiv/'],
  tasks: [
    {
      id: 'rm',
      description: '`cop` dizinindeki `eski1.txt` dosyasını sil.',
      hints: ['Dosya silen komut `rm`.', 'Yolu dizinle birlikte ver: `cop/eski1.txt`'],
      solution: 'rm ~/cop/eski1.txt',
      check: {
        type: 'all',
        checks: [
          { type: 'pathNotExists', path: '~/cop/eski1.txt' },
          { type: 'pathExists', path: '~/cop/eski2.txt' },
        ],
      },
    },
    {
      id: 'rm-r',
      description: '`eski_proje` dizinini içindekilerle birlikte tamamen sil.',
      hints: ['Dizinleri silmek için `rm`\'e bir seçenek gerekir.', '`rm -r DİZİN`'],
      solution: 'rm -r ~/eski_proje',
      check: { type: 'pathNotExists', path: '~/eski_proje' },
    },
    {
      id: 'final',
      description:
        'Final: Ev dizininde `arsiv` adında bir dizin oluştur ve `merhaba.txt` dosyasını bu dizinin içine **taşı**.',
      hints: [
        'İki adım var: önce `mkdir`, sonra `mv`.',
        '`mkdir ~/arsiv` ardından `mv ~/merhaba.txt ~/arsiv/`',
      ],
      solution: 'mkdir ~/arsiv && mv ~/merhaba.txt ~/arsiv/',
      neutralCommands: ['mkdir', 'cd'],
      check: {
        type: 'all',
        checks: [
          { type: 'pathExists', path: '~/arsiv/merhaba.txt', kind: 'file' },
          { type: 'pathNotExists', path: '~/merhaba.txt' },
        ],
      },
    },
  ],
};
