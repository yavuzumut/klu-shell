import type { Lesson } from '../../types';

export const wordCount: Lesson = {
  id: 'l2-wc',
  title: 'Metin Sayımı ve İstatistikler: wc',
  summary: 'Satır (-l), kelime (-w) ve bayt (-c) sayımı',
  setup: {
    files: {
      '~/siir.txt': 'Gunes dogar ufuktan\nKuslar ucar uzaklara\nBir gun daha baslar\n',
    },
  },
  content: `
### wc — Word Count (Kelime ve Satır Sayacı)

**\`wc\`**, bir dosyanın ya da bir komutun çıktısının içinde kaç satır, kaç kelime ve kaç karakter olduğunu saniyeler içinde sayar. Kısacası terminalin kelime sayacıdır:

\`\`\`bash
$ wc siir.txt
      3       9      62 siir.txt
\`\`\`

Çıktıdaki sütunlar sırasıyla:
1. **Satır sayısı** (\`\\n\` adedi)
2. **Kelime sayısı** (boşluklarla ayrılmış sözcükler)
3. **Bayt boyutu** (Türkçe karakterler UTF-8'de 2 bayt yer kaplar)

### En Çok Kullanılan Seçenekler

- \`wc -l\` (*lines*) — Yalnızca satır sayısını verir.
- \`wc -w\` (*words*) — Yalnızca kelime sayısını verir.
- \`wc -c\` (*bytes*) — Yalnızca bayt sayısını verir.
- \`wc -m\` (*chars*) — Yalnızca karakter sayısını verir.

\`\`\`bash
$ wc -l siir.txt
3 siir.txt
$ ls | wc -l         # bulunduğun dizinde kaç dosya/klasör olduğunu sayar!
\`\`\`
`,
  examples: [
    'wc siir.txt',
    'wc -l siir.txt',
    'wc -w siir.txt',
    'ls | wc -l',
  ],
  tasks: [
    {
      id: 'wc-lines',
      description: '`siir.txt` dosyasındaki satır sayısını `wc -l` komutuyla ekrana yazdır.',
      hints: [
        'Yalnızca satır sayısı için `-l` bayrağı verilir.',
        '`wc -l siir.txt`',
      ],
      solution: 'wc -l ~/siir.txt',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'wc', flags: ['l'] },
          { type: 'outputContains', text: '3' },
        ],
      },
    },
    {
      id: 'wc-words',
      description: '`siir.txt` dosyasındaki kelime sayısını `wc -w` komutuyla ekrana yazdır.',
      hints: [
        'Kelime sayısı için `-w` bayrağını kullan.',
        '`wc -w siir.txt`',
      ],
      solution: 'wc -w ~/siir.txt',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'wc', flags: ['w'] },
          { type: 'outputContains', text: '10' },
        ],
      },
    },
  ],
};
