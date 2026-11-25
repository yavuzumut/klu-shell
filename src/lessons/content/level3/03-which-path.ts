import type { Lesson } from '../../types';

export const whichPath: Lesson = {
  id: 'l3-which-path',
  title: 'Komutların Yeri ve $PATH: which',
  summary: 'Terminal yazdığın komutları nereden buluyor? PATH değişkeni ve which komutu',
  content: `
### Terminal Komutları Nereden Buluyor?

Terminalde \`ls\`, \`cat\` veya \`grep\` yazdığında bilgisayar bu programların nerede olduğunu nasıl anında buluyor? Bütün sabit diski her seferinde baştan sona taramıyor; bunun yerine **\`$PATH\`** adındaki özel arama listesine bakıyor.

### Alet Çantası Benzetmesi
Düşün ki evde bir tornavidaya ihtiyacın var. Bütün odaları, mutfak dolaplarını tek tek aramazsın; doğrudan alet çantana bakarsın.

\`$PATH\` değişkeni, terminalin alet çantalarının adres listesidir. Dizinler iki nokta (\`:\`) ile birbirinden ayrılır:
\`/usr/local/bin:/usr/bin:/bin\`

Terminal yazdığın bir komutu ilk dizinden başlayarak sırayla bu klasörlerin içinde arar ve ilk bulduğu yerde çalıştırır.

### Komutun Adresini Öğrenmek: \`which\`
Bir programın tam olarak hangi klasörde olduğunu öğrenmek için **\`which\`** komutunu kullanırız:

\`\`\`bash
echo $PATH   # arama yollarını listeler
which ls     # /bin/ls
which grep   # /usr/bin/grep
\`\`\`
`,
  examples: [
    'echo $PATH',
    'which ls',
    'which grep',
    'which bash',
    'which cat',
  ],
  tasks: [
    {
      id: 'echo-path-task',
      description: '`echo $PATH` komutuyla terminalin komut aradığı dizinleri incele.',
      hints: [
        'PATH değişkenini ekrana yazdırmak için başına `$` koy:',
        '`echo $PATH`',
      ],
      solution: 'echo $PATH',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'echo' },
          { type: 'outputContains', text: '/usr/bin' },
        ],
      },
    },
    {
      id: 'which-ls-task',
      description: '`which ls` komutunu kullanarak `ls` komutunun çalıştırılabilir dosya yolunu öğren.',
      hints: [
        '`which` komutuna hedef program adını ver:',
        '`which ls`',
      ],
      solution: 'which ls',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'which' },
          { type: 'outputContains', text: '/bin/ls' },
        ],
      },
    },
    {
      id: 'which-grep-task',
      description: '`which grep` komutuyla `grep` aracının tam dosya yolunu bul.',
      hints: [
        '`which grep` yazarak çalıştır.',
      ],
      solution: 'which grep',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'which' },
          { type: 'outputContains', text: '/usr/bin/grep' },
        ],
      },
    },
  ],
};
