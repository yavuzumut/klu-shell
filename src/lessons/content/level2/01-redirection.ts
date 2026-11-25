import type { Lesson } from '../../types';

export const redirection: Lesson = {
  id: 'l2-redirection',
  title: 'Çıktı Yönlendirme (Redirection): > ve >>',
  summary: '> ile dosyaya yazma, >> ile sonuna ekleme',
  setup: {
    files: {
      '~/notlar.txt': 'Eski notlar\n',
    },
  },
  content: `
### Çıktı Yönlendirme Nedir?

Linux'ta bir komut çalıştığında çıktısı varsayılan olarak terminal ekranına (*stdout*) yazılır.
Yönlendirme operatörleri sayesinde bu çıktıyı bir dosyaya aktarabiliriz:

- **\`>\` (Üzerine Yazma):** Hedef dosya yoksa oluşturur; varsa **içeriğini silip üzerine yazar**.
- **\`>>\` (Sona Ekleme):** Hedef dosya yoksa oluşturur; varsa mevcut içeriğin **sonuna yeni satır olarak ekler**.

\`\`\`bash
$ echo "İlk satır" > dosya.txt     # dosya oluşturulur ve içine yazılır
$ echo "İkinci satır" >> dosya.txt  # altına eklenir
$ cat dosya.txt
İlk satır
İkinci satır
\`\`\`

### Komut Çıktılarını Dosyaya Kaydetme

Sadece \`echo\` değil, çıktı üreten her komutun sonucu yönlendirilebilir:

\`\`\`bash
$ ls -la > dizin_listesi.txt
$ cat -n dosya.txt > numarali.txt
\`\`\`

> ⚠️ Tek büyüktür işareti (\`>\`) kullanırken çok dikkatli ol! Hedef dosyada önemli bilgiler varsa sormadan tamamen silip üzerine yazar.
`,
  examples: [
    'echo "Merhaba Dünya" > test.txt',
    'echo "Yeni Not" >> test.txt',
    'cat test.txt',
    'ls -l > dosyalar.txt',
  ],
  tasks: [
    {
      id: 'redir-overwrite',
      description: '`echo` komutunu kullanarak `notlar.txt` dosyasına `Yeni Başlangıç` yaz (dosyanın üzerine yaz).',
      hints: [
        'Üzerine yazmak için tek `>` operatörü kullanılır.',
        '`echo "Yeni Başlangıç" > notlar.txt` veya `echo "Yeni Başlangıç" > ~/notlar.txt`',
      ],
      solution: 'echo "Yeni Başlangıç" > ~/notlar.txt',
      check: { type: 'fileContains', path: '~/notlar.txt', text: 'Yeni Başlangıç' },
    },
    {
      id: 'redir-append',
      description: '`notlar.txt` dosyasının sonuna `İkinci Satır` ifadesini ekle (önceki içeriği silmeden).',
      hints: [
        'Dosyanın sonuna eklemek için `>>` operatörü kullanılır.',
        '`echo "İkinci Satır" >> notlar.txt`',
      ],
      solution: 'echo "İkinci Satır" >> ~/notlar.txt',
      check: {
        type: 'all',
        checks: [
          { type: 'fileContains', path: '~/notlar.txt', text: 'Yeni Başlangıç' },
          { type: 'fileContains', path: '~/notlar.txt', text: 'İkinci Satır' },
        ],
      },
    },
    {
      id: 'redir-command',
      description: 'Ev dizinindeki dosya ve dizinlerin listesini (`ls`) `liste.txt` adlı yeni bir dosyaya yönlendir.',
      hints: [
        '`ls` komutunun çıktısını `>` ile `liste.txt` dosyasına gönder.',
        '`ls > liste.txt`',
      ],
      solution: 'ls > ~/liste.txt',
      check: { type: 'fileContains', path: '~/liste.txt', text: 'Belgeler' },
    },
  ],
};
