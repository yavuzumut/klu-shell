import type { Lesson } from '../../types';

export const pathAndStat: Lesson = {
  id: 'l3-path-and-stat',
  title: 'Dosya İnceleme ve Yol Araçları: stat, realpath, basename',
  summary: 'Ayrıntılı dosya kimliği (stat), mutlak yol (realpath) ve dosya adı ayıklama (basename)',
  setup: {
    files: {
      '~/belgeler/rapor.pdf': 'PDF Belgesi\n',
    },
  },
  content: `
### Dosyaların Kimlik Kartı ve Yol Temizleme

Terminalde dosyalarla çalışırken bazen bir dosyanın derin ayrıntılarına bakmak veya karmaşık bir dosya yolunu sadeleştirmek gerekir.

İşte bu işler için üç pratik araç:

### 1. \`stat\` — Dosyanın Röntgenini Çek
\`ls -l\` temel bilgileri verir; **\`stat\`** ise dosyanın tüm kimlik kartını döker:
- Tam bayt boyutu ve disk blokları
- Sayısal ve harfsel izinleri (\`0644/-rw-r--r--\`)
- Sahibi, grubu ve son değiştirilme zamanı

\`\`\`bash
stat belgeler/rapor.pdf
\`\`\`

### 2. \`realpath\` — Navigasyonun Açık Adresi
Göreceli yollardaki \`.\` (burası), \`..\` (üst klasör) ve \`~\` (ev dizini) gibi kısaltmaları çözümleyip kökten (\`/\`) başlayan **tam ve net mutlak adresi** verir:

\`\`\`bash
realpath ..                # /home
realpath ~/belgeler/..     # /home/kullanici
\`\`\`

### 3. \`basename\` — Yolun Sonundaki Tabela
Uzun bir dosya yolunun başındaki klasörleri atıp sadece dosyanın kendi adını ayıklar. İkinci bir argüman verirsen dosya uzantısını da temizler:

\`\`\`bash
basename /usr/local/bin/python   # python
basename belgeler/rapor.pdf .pdf # rapor
\`\`\`
`,
  examples: [
    'stat belgeler/rapor.pdf',
    'realpath .',
    'realpath ..',
    'basename /var/log/syslog',
    'basename belgeler/rapor.pdf .pdf',
  ],
  tasks: [
    {
      id: 'stat-file-task',
      description: '`stat belgeler/rapor.pdf` komutuyla dosyanın ayrıntılı meta verilerini incele.',
      hints: [
        '`stat` komutuna dosya yolunu ver:',
        '`stat belgeler/rapor.pdf`',
      ],
      solution: 'stat belgeler/rapor.pdf',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'stat' },
          { type: 'outputContains', text: 'rapor.pdf' },
          { type: 'outputContains', text: 'regular file' },
        ],
      },
    },
    {
      id: 'realpath-task',
      description: '`realpath ..` komutunu çalıştırarak bir üst dizinin tam (mutlak) yolunu gör.',
      hints: [
        'Bir üst dizini çözümle:',
        '`realpath ..`',
      ],
      solution: 'realpath ..',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'realpath' },
          { type: 'outputContains', text: '/home' },
        ],
      },
    },
    {
      id: 'basename-task',
      description: '`basename belgeler/rapor.pdf .pdf` komutuyla yolun sonundaki dosya adını uzantısız olarak ayıkla.',
      hints: [
        'İkinci argüman olarak `.pdf` son ekini ver:',
        '`basename belgeler/rapor.pdf .pdf`',
      ],
      solution: 'basename belgeler/rapor.pdf .pdf',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'basename' },
          { type: 'outputContains', text: 'rapor' },
        ],
      },
    },
  ],
};
