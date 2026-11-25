import type { Lesson } from '../../types';

export const headTail: Lesson = {
  id: 'l2-head-tail',
  title: 'Dosya Başı ve Sonu: head ve tail',
  summary: 'head, tail ve log inceleme',
  setup: {
    files: {
      '~/sunucu.log':
        'Line 1: Basladi\nLine 2: Baglanti kuruldu\nLine 3: Istek alindi\nLine 4: Veritabani sorgusu\nLine 5: Cevap gonderildi\nLine 6: Istek 2 alindi\nLine 7: Yetki denetimi\nLine 8: Islemler tamam\nLine 9: Kapanis hazirligi\nLine 10: Sunucu durduruldu\n',
    },
  },
  content: `
### head — dosyanın başını okuma

Binlerce satırlık bir dosyanın tamamını \`cat\` ile ekrana basmak terminali doldurur.
\`head\` komutu, bir dosyanın veya standart girdinin **ilk 10 satırını** gösterir:

\`\`\`bash
$ head sunucu.log
\`\`\`

İstediğin kadar satır görmek için \`-n\` seçeneğini kullanırsın:
\`\`\`bash
$ head -n 3 sunucu.log   # ilk 3 satır
$ head -5 sunucu.log     # kısa kullanım
\`\`\`

### tail — dosyanın sonunu okuma

\`tail\` komutu ise bir dosyanın **son 10 satırını** ekrana basar.
Özellikle sistem günlüklerini (*log*) ve en son gerçekleşen olayları incelemek için vazgeçilmezdir:

\`\`\`bash
$ tail sunucu.log
$ tail -n 2 sunucu.log   # son 2 satır
\`\`\`

> 💡 Gerçek Linux'ta \`tail -f dosya.log\` komutu dosyayı canlı olarak dinler; dosyaya yeni satır eklendikçe anında ekrana yansıtır.
`,
  examples: [
    'head sunucu.log',
    'head -n 3 sunucu.log',
    'tail -n 2 sunucu.log',
    'head -n 5 /var/log/syslog',
  ],
  tasks: [
    {
      id: 'head-lines',
      description: '`sunucu.log` dosyasının ilk 3 satırını `head` komutu ile ekrana yazdır.',
      hints: [
        'Satır sayısını belirtmek için `-n` kullanılır.',
        '`head -n 3 sunucu.log`',
      ],
      solution: 'head -n 3 ~/sunucu.log',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'head' },
          { type: 'outputContains', text: 'Line 3: Istek alindi' },
          { type: 'not', check: { type: 'outputContains', text: 'Line 4' } },
        ],
      },
    },
    {
      id: 'tail-lines',
      description: '`sunucu.log` dosyasının son 2 satırını `tail` komutu ile ekrana yazdır.',
      hints: [
        'Son satırlar için `tail -n 2` kullanılır.',
        '`tail -n 2 sunucu.log`',
      ],
      solution: 'tail -n 2 ~/sunucu.log',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'tail' },
          { type: 'outputContains', text: 'Line 10: Sunucu durduruldu' },
          { type: 'not', check: { type: 'outputContains', text: 'Line 8' } },
        ],
      },
    },
  ],
};
