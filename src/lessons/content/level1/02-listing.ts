import type { Lesson } from '../../types';

export const listing: Lesson = {
  id: 'l1-listing',
  title: 'Etrafa Bakmak: ls',
  summary: 'Dizin içeriğini listele, gizli dosyaları ve ayrıntıları gör',
  content: `
Linux'ta her şey **dizinler** (klasörler) ve **dosyalar** halinde bir ağaç yapısında durur. Bir dizinin içinde ne olduğunu görmek için \`ls\` (*list*) komutunu kullanırsın.

\`\`\`
$ ls
Belgeler  Indirilenler  merhaba.txt  Muzik  Resimler
\`\`\`

Mavi renkli olanlar **dizin**, diğerleri **dosyadır**.

### Seçenekler (flag'ler)

Komutların davranışını \`-\` ile başlayan **seçeneklerle** değiştirebilirsin:

- \`ls -a\` — *all*: Adı nokta (\`.\`) ile başlayan **gizli** dosyaları da gösterir. (\`.\` bulunduğun dizin, \`..\` üst dizin demektir.)
- \`ls -l\` — *long*: İzinler, sahip, boyut ve tarih bilgisiyle **uzun liste** verir.
- Seçenekler birleştirilebilir: \`ls -la\` = \`ls -l -a\`

### Başka bir dizini listelemek

\`ls\`'e bir yol verirsen o dizinin içeriğini gösterir — oraya gitmene gerek yok:

\`\`\`
$ ls /etc
hostname  hosts  os-release  passwd
\`\`\`

> 💡 \`man ls\` ile tüm seçenekleri görebilirsin.
`,
  examples: ['ls', 'ls -a', 'ls -l', 'ls -la', 'ls /etc'],
  tasks: [
    {
      id: 'ls',
      description: 'Ev dizininde neler olduğunu görmek için `ls` komutunu çalıştır.',
      hints: ['Sadece `ls` yaz.'],
      solution: 'ls',
      check: { type: 'commandUsed', command: 'ls' },
    },
    {
      id: 'ls-a',
      description: 'Ev dizinindeki **gizli dosyaları** da göster.',
      hints: ['Gizli dosyaları göstermek için `ls`\'e bir seçenek eklemelisin.', '"all" kelimesinin baş harfini düşün: `-a`'],
      solution: 'ls -a',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'ls', flags: ['a'] },
          { type: 'outputContains', text: '.gizli_not' },
        ],
      },
    },
    {
      id: 'ls-dir',
      description: '`Belgeler` dizinine **girmeden**, içeriğini uzun formatta (`-l`) listele.',
      hints: ['`ls`\'e hem `-l` seçeneğini hem de dizin adını verebilirsin.', 'Sıra şöyle: `ls -l DİZİN`'],
      solution: 'ls -l Belgeler',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'ls', flags: ['l'] },
          { type: 'outputContains', text: 'rapor.txt' },
        ],
      },
    },
  ],
};
