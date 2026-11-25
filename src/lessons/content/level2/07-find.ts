import type { Lesson } from '../../types';

export const findLesson: Lesson = {
  id: 'l2-find',
  title: 'Dosya Sisteminde Arama: find',
  summary: 'Dizin ağacında -name, -type ve -maxdepth ile arama',
  setup: {
    dirs: ['~/proje/src', '~/proje/docs', '~/proje/tests'],
    files: {
      '~/proje/src/app.js': 'console.log("KLU");\n',
      '~/proje/src/util.js': 'export const pi = 3.14;\n',
      '~/proje/docs/readme.txt': 'Proje dokumani\n',
      '~/proje/tests/app.test.js': 'test();\n',
    },
  },
  content: `
### \`find\` — Kayıp Dosyaları Bul

\`grep\` dosyaların **içindeki yazıları** arar. \`find\` ise doğrudan **dosyanın veya klasörün kendisini** bulur — tıpkı bilgisayardaki dosya arama çubuğu gibi.

\`find\` komutuna sadece iki şey söylersin: **Nerede arayayım?** ve **Neyi arayayım?**

\`\`\`bash
find proje -name "*.txt"    # proje klasöründeki tüm .txt dosyalarını bul
find . -type d              # bulunduğun yerdeki (.) tüm klasörleri bul
find . -maxdepth 1 -type f  # alt klasörlere inmeden sadece buradaki dosyalar
\`\`\`

*(Nerede arayacağını \`.\` olarak yazarsan bulunduğun yerden başlar ve tüm alt klasörlerin içine otomatik bakar.)*

### En Çok İşine Yarayacak Seçenekler

- \`-name "*.txt"\` — Adına göre bul (\`*\` "ne olursa olsun" demektir).
- \`-iname "*.txt"\` — Aynısı, ama büyük/küçük harf fark etmez.
- \`-type f\` — Sadece **dosyaları** getir (*f = file*).
- \`-type d\` — Sadece **klasörleri** getir (*d = directory*).
- \`-maxdepth 1\` — Çok derine inme, sadece ilk kata bak.

> 💡 **Küçük Not:** \`*\` işareti kullanırken mutlaka tırnak içine al (\`"*.js"\`). Tırnak koymazsan terminal yıldızı \`find\`'a bırakmadan kendi yorumlamaya çalışır ve arama bozulabilir.
`,
  examples: [
    'find . -name "*.js"',
    'find proje -type d',
    'find . -maxdepth 1 -type f',
    'find ~ -name "*.txt"',
  ],
  tasks: [
    {
      id: 'find-name',
      description: '`proje` dizini içinde uzantısı `.js` olan tüm dosyaları `find` komutuyla ara.',
      hints: [
        '`-name` desenini tırnak içinde belirt: `find proje -name "*.js"`',
        'Ev dizinindeki proje için: `find ~/proje -name "*.js"`',
      ],
      solution: 'find ~/proje -name "*.js"',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'find' },
          { type: 'outputContains', text: 'app.js' },
          { type: 'outputContains', text: 'util.js' },
          { type: 'outputContains', text: 'app.test.js' },
          { type: 'not', check: { type: 'outputContains', text: 'readme.txt' } },
        ],
      },
    },
    {
      id: 'find-type',
      description: '`proje` dizini altındaki tüm dizinleri (`-type d`) bul.',
      hints: [
        'Yalnızca dizinler için `-type d` kullanılır.',
        '`find ~/proje -type d`',
      ],
      solution: 'find ~/proje -type d',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'find' },
          { type: 'outputContains', text: 'proje/src' },
          { type: 'outputContains', text: 'proje/docs' },
          { type: 'not', check: { type: 'outputContains', text: 'app.js' } },
        ],
      },
    },
  ],
};
