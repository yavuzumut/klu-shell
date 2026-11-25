import type { Lesson } from '../../types';

export const systemInfo: Lesson = {
  id: 'l3-system-info',
  title: 'Sistem ve Kullanıcı Bilgisi: whoami, uname, date',
  summary: 'Kullanıcı kimliği, işletim sistemi bilgileri ve sistem saatini öğrenme',
  content: `
### Terminalin Aynası: Sen Kimsin, Neredesin?

Terminal penceresini açtığında bazen ilk sorman gereken sorular şunlardır:
*"Şu an hangi kullanıcıdayım?", "Bu bilgisayarın işletim sistemi ve çekirdeği ne?", "Sistem saati doğru mu?"*

Linux'ta bu soruların cevabı tek kelimelik pratik komutlarda saklıdır:

- **\`whoami\`** — *"Who am I?" (Ben kimim?)* sorusunun kısaltmasıdır. Şu anda terminalde oturum açmış kullanıcının adını yazar.
- **\`uname\`** — *"Unix Name"* demektir. İşletim sistemi ve çekirdek bilgilerini verir. \`-a\` (*all*) seçeneğiyle makine mimarisinden çekirdek sürümüne kadar her şeyi döker.
- **\`date\`** — Sistemin geçerli tarih ve saatini ekrana yazdırır.

\`\`\`bash
whoami      # örn: kullanici
uname -a    # örn: Linux klu 6.8.0-klu ... x86_64 GNU/Linux
date        # güncel tarih ve saat
\`\`\`

> 💡 **Küçük İpucu:** Özellikle uzak bir sunucuya bağlandığında veya yetkili işlem yaparken yanlışlıkla \`root\` (yönetici) hesabında mısın yoksa standart kullanıcıda mısın diye kontrol etmek için \`whoami\` hayat kurtarır!
`,
  examples: [
    'whoami',
    'uname',
    'uname -a',
    'uname -r',
    'date',
  ],
  tasks: [
    {
      id: 'whoami-task',
      description: '`whoami` komutunu çalıştırarak şu anda hangi kullanıcı hesabında olduğunu gör.',
      hints: [
        'Komutu doğrudan yazıp Enter tuşuna bas:',
        '`whoami`',
      ],
      solution: 'whoami',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'whoami' },
          { type: 'outputContains', text: 'kullanici' },
        ],
      },
    },
    {
      id: 'uname-task',
      description: '`uname -a` komutuyla sistemin çekirdek ve donanım mimarisi detaylarını yazdır.',
      hints: [
        'Tüm sistem bilgilerini görmek için `-a` bayrağını ekle:',
        '`uname -a`',
      ],
      solution: 'uname -a',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'uname', flags: ['a'] },
          { type: 'outputContains', text: 'Linux' },
          { type: 'outputContains', text: 'x86_64' },
        ],
      },
    },
    {
      id: 'date-task',
      description: '`date` komutuyla sistemin güncel tarih ve saatini ekrana yazdır.',
      hints: [
        'Sistem saatini öğrenmek için:',
        '`date`',
      ],
      solution: 'date',
      check: {
        type: 'commandUsed',
        command: 'date',
      },
    },
  ],
};
