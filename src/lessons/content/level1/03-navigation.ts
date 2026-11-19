import type { Lesson } from '../../types';

export const navigation: Lesson = {
  id: 'l1-navigation',
  title: 'Dizinler Arasında Gezinme: cd',
  summary: 'cd, mutlak ve göreli yollar, .., ~',
  content: `
\`cd\` (*change directory*) bulunduğun dizini değiştirir. Dosya yöneticisinde bir klasöre çift tıklamak gibidir.

### Dosya sistemi ağacı

\`\`\`
/                  ← kök (root) dizin
├── etc/           ← sistem ayarları
├── home/
│   └── kullanici/ ← senin ev dizinin (~)
│       ├── Belgeler/
│       └── Resimler/
├── tmp/           ← geçici dosyalar
└── var/           ← loglar vb. değişken veriler
\`\`\`

### Mutlak ve göreli yol

- **Mutlak yol** \`/\` ile başlar ve kökten itibaren tam adresi verir: \`cd /home/kullanici/Belgeler\`
- **Göreli yol** bulunduğun yerden başlar: ev dizinindeysen \`cd Belgeler\` yeterli.

### Özel yollar

| Yol | Anlamı |
|---|---|
| \`..\` | bir üst dizin |
| \`.\` | bulunduğun dizin |
| \`~\` | ev dizinin |
| \`-\` | bir önceki dizin (\`cd -\`) |

Argümansız \`cd\` seni her zaman ev dizinine götürür.

> 💡 İstemdeki yol (\`~/Belgeler\` gibi) nerede olduğunu her zaman gösterir. Emin değilsen \`pwd\` yaz!
`,
  examples: ['cd Belgeler', 'pwd', 'cd ..', 'cd /etc', 'cd ~', 'cd -'],
  tasks: [
    {
      id: 'cd-into',
      description: '`Belgeler` dizinine gir.',
      hints: ['`cd` komutundan sonra gitmek istediğin dizinin adını yaz.', 'Tab tuşu dizin adını tamamlar: `cd Bel` + Tab'],
      solution: 'cd Belgeler',
      check: { type: 'cwdIs', path: '~/Belgeler' },
    },
    {
      id: 'cd-up',
      description: '`..` kullanarak bir üst dizine (ev dizinine) geri dön.',
      hints: ['İki nokta (`..`) her zaman bir üst dizini ifade eder.'],
      solution: 'cd ..',
      check: {
        type: 'all',
        checks: [
          { type: 'cwdIs', path: '~' },
          { type: 'commandUsed', command: 'cd', args: ['..'] },
        ],
      },
    },
    {
      id: 'cd-absolute',
      description: '**Mutlak yol** kullanarak sistem ayarlarının bulunduğu `/etc` dizinine git.',
      hints: ['Mutlak yollar `/` (kök) ile başlar.', '`cd /etc`'],
      solution: 'cd /etc',
      check: { type: 'cwdIs', path: '/etc' },
    },
  ],
};
