import type { Lesson } from '../../types';

export const introLesson: Lesson = {
  id: 'l0-intro',
  title: 'Terminal, Kabuk ve Linux Nedir?',
  summary: 'Komut satırı dünyasına giriş: Terminal, kabuk (shell) ve Linux kavramları.',
  content: `
### Linux Nedir?
**Linux**, sunuculardan süper bilgisayarlara, akıllı telefonlardan (Android) bulut sistemlerine kadar dünyadaki altyapının büyük kısmını çalıştıran, açık kaynaklı ve güvenilir bir işletim sistemi ailesidir.

### Terminal ve Kabuk (Shell) Nedir?
- **Terminal:** Bilgisayarla fare ile tıklamak yerine metin yazarak iletişim kurmanı sağlayan penceredir.
- **Kabuk (Shell):** Yazdığın komutları okuyan, yorumlayan ve işletim sistemine ileten programdır. En yaygın kabuk **Bash**'tir (Termi de bir Bash simülatörüdür).

Sağdaki ekranda gördüğün satıra **istem** (prompt) denir:
\`\`\`
kullanici@termi:~$
\`\`\`

| Parça | Anlamı |
|---|---|
| \`kullanici\` | Şu anki oturum açmış kullanıcı adı |
| \`termi\` | Bilgisayarın (makinenin) ağdaki adı (hostname) |
| \`~\` | Bulunduğun dizin (\`~\` tilde simgesi, ev dizinini temsil eder) |
| \`$\` | Standart kullanıcı yetkisi (\`#\` olsaydı yönetici/root yetkisi olurdu) |

Komutları yazıp **Enter** tuşuna basarak çalıştırırsın.
`,
  examples: ['help', 'echo Merhaba Linux'],
  tasks: [
    {
      id: 'l0-help',
      description: 'Desteklenen komutları listelemek için terminale `help` yaz ve Enter\'a bas.',
      hints: ['Sadece `help` yazıp Enter tuşuna bas.'],
      solution: 'help',
      check: { type: 'commandUsed', command: 'help' },
    },
    {
      id: 'l0-echo',
      description: '`echo` komutunu kullanarak ekrana **Merhaba Linux** yazdır.',
      hints: ['`echo Merhaba Linux` yazıp Enter\'a bas.'],
      solution: 'echo Merhaba Linux',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'echo' },
          { type: 'outputContains', text: 'Merhaba Linux' },
        ],
      },
    },
  ],
};
