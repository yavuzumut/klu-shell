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
### find — dosya hiyerarşisinde arama

\`grep\` dosyaların **içindeki** metinleri ararken; \`find\` dosya sisteminde dosya ve klasörlerin **kendilerini (adlarını, türlerini)** arar.

\`\`\`bash
$ find [BAŞLANGIÇ_DİZİNİ] [KRİTERLER]
\`\`\`

Dizin belirtilmezse arama bulunduğun dizinden (\`.\`) başlar ve tüm alt klasörlerin içine iner.

### Temel Kriterler

- \`-name "DESEN"\` — Dosya adına göre arama (\`*\`, \`?\` kullanılabilir).
- \`-iname "DESEN"\` — Büyük/küçük harf duyarsız ad araması.
- \`-type f\` — Yalnızca normal dosyaları bulur.
- \`-type d\` — Yalnızca dizinleri (klasörleri) bulur.
- \`-maxdepth N\` — Aramanın kaç alt dizin derine ineceğini sınırlar.

\`\`\`bash
$ find . -name "*.txt"          # tüm txt dosyalarını bul
$ find proje -type d            # proje altındaki klasörleri listele
$ find / -maxdepth 1 -type d    # kök dizindeki klasörler
\`\`\`

> 💡 **Önemli İpucu:** \`-name\` deseninde yıldız (\`*\`) kullanırken deseni her zaman tırnak içine al (\`"*.js"\`). Tırnak koymazsan kabuk yıldızı henüz \`find\` çalışmadan açmaya kalkar.
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
