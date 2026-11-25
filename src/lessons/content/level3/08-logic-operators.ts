import type { Lesson } from '../../types';

export const logicOperators: Lesson = {
  id: 'l3-logic-operators',
  title: 'Mantıksal Operatörler: && (VE) ve || (VEYA)',
  summary: 'Komutları birbirine bağlama: Başarıya göre sonraki adımı yönetme',
  content: `
### Komutları Şartlara Bağlamak

Bazen birden fazla komutu art arda çalıştırmak istersin; ama ikinci komutun çalışması, ilkinin sonucuna bağlıdır.

Linux'ta bunun için iki temel mantıksal operatör kullanırız:

### 1. \`&&\` (VE / AND) — Başarılı Olursa Devam Et
*"Odanı topla VE sonra dışarı çık."*

Soldaki komut hatasız biterse (çıkış kodu \`0\` olursa), sağdaki komut çalışır. İlk komut hata verirse zincir o anda durur:

\`\`\`bash
mkdir -p proje && cd proje
\`\`\`
*(Klasör başarıyla açılırsa içine gir; açılamazsa \`cd\` komutunu boşuna çalıştırma).*

### 2. \`||\` (VEYA / OR) — Hata Verirse Yedek Plana Geç
*"Otobüse bin, VEYA taksi çağır."*

Soldaki komut başarısız olursa (hata verirse), sağdaki komut çalışır. İlk komut zaten başarılıysa ikinciye gerek kalmaz:

\`\`\`bash
cat ayarlar.txt || echo "Ayar dosyası bulunamadı!"
\`\`\`

### Birlikte Kullanım
\`\`\`bash
echo "KLU" > test.txt && cat test.txt
grep "hata" log.txt && echo "Hata var!" || echo "Sistem temiz."
\`\`\`
`,
  examples: [
    'mkdir -p proje && cd proje',
    'cat yok.txt || echo "Dosya yok"',
    'echo "Selam" > not.txt && cat not.txt',
    'grep "root" /etc/passwd && echo "Kullanıcı bulundu"',
  ],
  tasks: [
    {
      id: 'and-chain-task',
      description: '`mkdir -p calisma && cd calisma` komutuyla önce `calisma` dizinini oluştur, işlem başarılı olursa içine geç.',
      hints: [
        'İki komutu `&&` ile birbirine bağla:',
        '`mkdir -p calisma && cd calisma`',
      ],
      solution: 'mkdir -p calisma && cd calisma',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'mkdir' },
          { type: 'commandUsed', command: 'cd' },
          { type: 'cwdIs', path: '~/calisma' },
        ],
      },
    },
    {
      id: 'or-chain-task',
      description: '`cat yok.txt || echo "Dosya yok"` komutuyla bulunamayan dosyaya karşı alternatif bir mesaj yazdır.',
      hints: [
        'İlk komut hata verdiğinde çalışması için `||` kullan:',
        '`cat yok.txt || echo "Dosya yok"`',
      ],
      solution: 'cat yok.txt || echo "Dosya yok"',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'cat', allowFailure: true },
          { type: 'commandUsed', command: 'echo' },
          { type: 'outputContains', text: 'Dosya yok' },
        ],
      },
    },
  ],
};
