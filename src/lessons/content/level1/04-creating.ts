import type { Lesson } from '../../types';

export const creating: Lesson = {
  id: 'l1-creating',
  title: 'Dizin ve Dosya Oluşturma',
  summary: 'mkdir, mkdir -p ve touch',
  content: `
### mkdir — dizin oluşturma

\`mkdir\` (*make directory*) yeni bir dizin oluşturur:

\`\`\`
$ mkdir projeler
$ mkdir a b c          # birden fazla dizin
\`\`\`

İç içe dizinleri tek seferde oluşturmak istersen \`-p\` (*parents*) seçeneğini kullan. \`-p\` olmadan, üst dizin yoksa hata alırsın:

\`\`\`
$ mkdir okul/2024
mkdir: cannot create directory 'okul/2024': No such file or directory
$ mkdir -p okul/2024   # okul yoksa onu da oluşturur
\`\`\`

### touch — boş dosya oluşturma

\`touch\` aslında bir dosyanın "son değiştirilme" tarihini günceller; ama dosya **yoksa boş bir dosya oluşturur**. Bu yüzden en çok boş dosya açmak için kullanılır:

\`\`\`
$ touch notlar.txt
$ touch projeler/plan.txt   # başka bir dizinin içinde
\`\`\`

> ⚠️ Linux'ta dosya adları **büyük/küçük harfe duyarlıdır**: \`Notlar.txt\` ile \`notlar.txt\` farklı dosyalardır. Adlarda boşluk kullanmaktan kaçın; \`_\` veya \`-\` tercih et.
`,
  examples: ['mkdir projeler', 'touch notlar.txt', 'mkdir -p okul/2024/matematik', 'ls -l'],
  tasks: [
    {
      id: 'mkdir',
      description: 'Ev dizininde `projeler` adında bir dizin oluştur.',
      hints: ['Dizin oluşturan komut "make directory"nin kısaltmasıdır.', '`mkdir projeler`'],
      solution: 'mkdir ~/projeler',
      check: { type: 'pathExists', path: '~/projeler', kind: 'dir' },
    },
    {
      id: 'touch',
      description: '`projeler` dizininin içinde `plan.txt` adında boş bir dosya oluştur.',
      hints: ['Boş dosya oluşturmak için `touch` kullan.', 'Dosyanın yolunu dizinle birlikte ver: `projeler/plan.txt`'],
      solution: 'touch ~/projeler/plan.txt',
      check: { type: 'pathExists', path: '~/projeler/plan.txt', kind: 'file' },
    },
    {
      id: 'mkdir-p',
      description: 'Tek bir komutla `okul/2024/matematik` dizin yapısını oluştur (ev dizininde).',
      hints: [
        'Üst dizinler henüz yok; `mkdir`\'e onları da oluşturmasını söyleyen bir seçenek gerekli.',
        '"parents" seçeneği: `mkdir -p ...`',
      ],
      solution: 'mkdir -p ~/okul/2024/matematik',
      check: { type: 'pathExists', path: '~/okul/2024/matematik', kind: 'dir' },
    },
  ],
};
