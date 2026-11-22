import type { Lesson } from '../../types';

export const welcome: Lesson = {
  id: 'l1-welcome',
  title: 'Terminale Hoş Geldin',
  summary: 'Terminal nedir? İlk komutların: pwd, echo, help, clear',
  content: `
**Terminal** (komut satırı), bilgisayara fareyle tıklamak yerine **yazarak** komut verdiğin bir arayüzdür. Sunucular, yazılım geliştirme ve sistem yönetiminde en çok kullanılan araçtır.

Sağdaki ekranda şöyle bir satır görüyorsun:

\`\`\`
kullanici@klu:~$
\`\`\`

Buna **istem** (prompt) denir:

| Parça | Anlamı |
|---|---|
| \`kullanici\` | oturum açmış kullanıcı |
| \`klu\` | bilgisayarın adı |
| \`~\` | bulunduğun dizin (\`~\` = ev dizinin) |
| \`$\` | normal kullanıcı (\`#\` olsaydı yönetici/root) |

Bir komut yazıp **Enter**'a bastığında kabuk (shell) onu çalıştırır ve sonucu ekrana yazar.

### İlk komutlar

- \`pwd\` — *print working directory*: Şu an hangi dizinde olduğunu gösterir.
- \`echo\` — Kendisine verdiğin metni ekrana yazar.
- \`help\` — Kullanabileceğin komutları listeler.
- \`clear\` — Ekranı temizler (kısayol: **Ctrl+L**).

> 💡 **İpucu:** Yukarı ok tuşu (↑) ile önceki komutlarına dönebilir, **Tab** ile komut ve dosya adlarını otomatik tamamlayabilirsin.
`,
  examples: ['pwd', 'echo Merhaba', 'help', 'clear'],
  tasks: [
    {
      id: 'pwd',
      description: 'Bulunduğun dizini öğrenmek için `pwd` komutunu çalıştır.',
      hints: ['Sadece `pwd` yazıp Enter\'a bas.'],
      solution: 'pwd',
      check: { type: 'commandUsed', command: 'pwd' },
    },
    {
      id: 'echo',
      description: '`echo` ile ekrana **Merhaba Dünya** yazdır.',
      hints: [
        'Komutun adından sonra bir boşluk bırakıp yazdırmak istediğin metni ekle.',
        'Büyük/küçük harflere dikkat: `echo Merhaba Dünya`',
      ],
      solution: 'echo Merhaba Dünya',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'echo' },
          { type: 'outputContains', text: 'Merhaba Dünya' },
        ],
      },
    },
    {
      id: 'help',
      description: 'Kullanabileceğin tüm komutları görmek için `help` yaz.',
      hints: ['`help` komutunun argümana ihtiyacı yok.'],
      solution: 'help',
      check: { type: 'commandUsed', command: 'help' },
    },
  ],
};
