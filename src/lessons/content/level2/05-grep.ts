import type { Lesson } from '../../types';

export const grepLesson: Lesson = {
  id: 'l2-grep',
  title: 'Metin İçinde Arama: grep',
  summary: 'Desen arama, -i, -n, -v ve filtreleme',
  setup: {
    files: {
      '~/uygulama.log':
        'INFO: Sistem baslatildi\nDEBUG: Port 8080 acik\nERROR: Veritabani baglantisi koptu\nWARN: Bellek kullanimi yuksek\nERROR: Istek zaman asimina ugradi\n',
    },
  },
  content: `
### grep — arama yapma

**\`grep\`**, bir dosyanın ya da bir komutun çıktısının içinde istediğin kelimeyi arayıp sadece o kelimenin geçtiği satırları önüne getirir. Kısacası terminalin \`Ctrl + F\`'idir.

\`\`\`bash
$ grep DESEN DOSYA
$ grep ERROR uygulama.log
\`\`\`

### Güçlü Seçenekler

- \`-i\` (*ignore case*) — Büyük/küçük harf ayrımını kaldırır (\`error\`, \`ERROR\` ve \`Error\` hepsini bulur).
- \`-n\` (*line number*) — Eşleşmenin hangi satırda olduğunu gösterir.
- \`-v\` (*invert match*) — Eşleş **me** yen satırları gösterir (filtreleme/ayıklama).
- \`-c\` (*count*) — Eşleşen satırların adedini verir.
- \`-r\` (*recursive*) — Bir klasörün ve içindeki tüm alt klasörlerin dosyalarında arama yapar.

\`\`\`bash
$ grep -in "hata" /var/log/syslog
$ cat /etc/passwd | grep bash
\`\`\`
`,
  examples: [
    'grep ERROR uygulama.log',
    'grep -i bellek uygulama.log',
    'grep -n ERROR uygulama.log',
    'grep -c ERROR uygulama.log',
  ],
  tasks: [
    {
      id: 'grep-find',
      description: '`uygulama.log` dosyası içinde `ERROR` geçen satırları `grep` ile bul ve ekrana yazdır.',
      hints: [
        '`grep DESEN DOSYA` şeklinde yazılır.',
        '`grep ERROR uygulama.log`',
      ],
      solution: 'grep ERROR ~/uygulama.log',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'grep' },
          { type: 'outputContains', text: 'Veritabani baglantisi koptu' },
          { type: 'outputContains', text: 'Istek zaman asimina ugradi' },
          { type: 'not', check: { type: 'outputContains', text: 'DEBUG' } },
        ],
      },
    },
    {
      id: 'grep-case-lines',
      description: '`uygulama.log` dosyasında büyük/küçük harf duyarsız olarak (`-i`) ve satır numaralarıyla (`-n`) `bellek` kelimesini ara.',
      hints: [
        '`-i` ve `-n` bayraklarını birleştir: `grep -in bellek uygulama.log`',
      ],
      solution: 'grep -in bellek ~/uygulama.log',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'grep', flags: ['i', 'n'] },
          { type: 'outputContains', text: 'WARN: Bellek kullanimi yuksek' },
        ],
      },
    },
    {
      id: 'grep-count',
      description: '`uygulama.log` dosyasında kaç tane `ERROR` satırı olduğunu `-c` seçeneğiyle ekrana yazdır.',
      hints: [
        'Eşleşen satır sayısını görmek için `-c` kullanılır.',
        '`grep -c ERROR uygulama.log`',
      ],
      solution: 'grep -c ERROR ~/uygulama.log',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'grep', flags: ['c'] },
          { type: 'outputContains', text: '2' },
        ],
      },
    },
  ],
};
