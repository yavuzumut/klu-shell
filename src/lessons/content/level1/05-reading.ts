import type { Lesson } from '../../types';

export const reading: Lesson = {
  id: 'l1-reading',
  title: 'Dosya İçeriğini Okuma ve Yardım Alma',
  summary: 'cat ile dosya okuma, man ile kılavuz sayfaları',
  content: `
### cat — dosyayı ekrana yazdırma

\`cat\` (*concatenate*) bir veya daha fazla dosyanın içeriğini ekrana yazar:

\`\`\`
$ cat merhaba.txt
Merhaba! KLU'ya hoş geldin.
\`\`\`

- \`cat -n dosya\` satır numaralarıyla gösterir.
- \`cat a.txt b.txt\` iki dosyayı arka arkaya yazar (adı buradan gelir).
- Bir dizini \`cat\` ile okuyamazsın: \`cat: Belgeler: Is a directory\`

### Gizli dosyalar da dosyadır

Adı nokta ile başlayan dosyalar \`ls\`'te görünmez ama normal şekilde okunabilir: \`cat .bashrc\`

### man — kılavuz sayfaları

Her komutun bir **kılavuz** (*manual*) sayfası vardır. Bir komutun seçeneklerini unuttuğunda:

\`\`\`
$ man ls
\`\`\`

Kısa bir özet için \`KOMUT --help\` da kullanabilirsin.

> 💡 Gerçek Linux'ta \`man\` sayfasından **q** tuşuyla çıkılır. KLU'da sayfa doğrudan ekrana yazılır.
`,
  examples: ['cat merhaba.txt', 'cat -n Belgeler/alisveris.txt', 'man cat', 'ls --help'],
  tasks: [
    {
      id: 'cat',
      description: 'Ev dizinindeki `merhaba.txt` dosyasının içeriğini ekrana yazdır.',
      hints: ['Dosya içeriğini gösteren komut `cat`.', '`cat merhaba.txt`'],
      solution: 'cat ~/merhaba.txt',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'cat' },
          { type: 'outputContains', text: "KLU'ya hoş geldin" },
        ],
      },
    },
    {
      id: 'cat-hidden',
      description: 'Ev dizininde **gizli bir not** saklı. Onu bul ve oku. İçindeki gizli kelime ne?',
      hints: [
        'Önce gizli dosyaları listele: `ls -a`',
        'Adı `.gizli` ile başlayan dosyayı `cat` ile oku.',
      ],
      solution: 'cat ~/.gizli_not',
      check: { type: 'outputContains', text: 'penguen' },
    },
    {
      id: 'man',
      description: '`ls` komutunun kılavuz sayfasını aç.',
      hints: ['Kılavuz sayfaları `man` komutuyla açılır.', '`man` + komut adı'],
      solution: 'man ls',
      check: { type: 'commandUsed', command: 'man', args: ['ls'] },
    },
  ],
};
