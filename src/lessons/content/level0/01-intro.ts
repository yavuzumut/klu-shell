import type { Lesson } from '../../types';

export const introLesson: Lesson = {
  id: 'l0-intro',
  title: 'Terminal, Kabuk ve Linux Nedir?',
  summary: 'Komut satırı dünyasına giriş: Terminal, kabuk (shell) ve Linux kavramları.',
  content: `
<div class="klu-welcome-card">
  <div class="klu-mascot-frame klu-mascot-frame-welcome">
    <img src="/klu-mascot-512.png" alt="KLU Maskotu" class="klu-welcome-mascot" />
  </div>
  <div class="klu-welcome-content">
    <div class="klu-welcome-title">Merhaba, ben KLU! 👋</div>
    <p class="klu-welcome-desc">Linux ve terminal dünyasına hoş geldin! Komut satırını adım adım, güvenle birlikte keşfedeceğiz.</p>
  </div>
</div>

### Linux Nedir?
Linux aslında tek başına tam bir işletim sistemi değil, bir **çekirdektir (kernel)**; yani bilgisayarın donanımı ile çalışan programlar arasında köprü kuran temel motordur. **Ubuntu, Fedora ve Arch** gibi bildiğimiz sistemler ise bu Linux çekirdeğinin üzerine paket yöneticisi ve kullanıcı araçları eklenerek oluşturulan tam işletim sistemleridir (dağıtımlar). Bugün internetteki web sitelerinin büyük kısmı, bulut sunucuları ve milyarlarca Android telefon Linux çekirdeği üzerinde çalışır; yazılımcıların ve sistem yöneticilerinin günlük en önemli çalışma aracı ise terminaldir. KLU'da öğrendiğin komutlar tüm bu Linux sistemlerinde ortak olarak geçerlidir.

### Terminal ve Kabuk (Shell) Nedir?
- **Terminal:** Bilgisayarla fare ile tıklamak yerine metin yazarak iletişim kurmanı sağlayan penceredir.
- **Kabuk (Shell):** Yazdığın komutları okuyan, yorumlayan ve işletim sistemine ileten programdır. En yaygın kabuk **Bash**'tir (KLU de bir Bash simülatörüdür).

Sağdaki ekranda gördüğün satıra **istem** (prompt) denir:
\`\`\`
kullanici@klu:~$
\`\`\`

| Parça | Anlamı |
|---|---|
| \`kullanici\` | Şu anki oturum açmış kullanıcı adı |
| \`klu\` | Bilgisayarın (makinenin) ağdaki adı (hostname) |
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
