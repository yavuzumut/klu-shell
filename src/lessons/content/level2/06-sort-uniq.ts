import type { Lesson } from '../../types';

export const sortUniq: Lesson = {
  id: 'l2-sort-uniq',
  title: 'Sıralama ve Tekilleştirme: sort ve uniq',
  summary: 'sort, sort -n, uniq ve ardışık tekrar temizleme',
  setup: {
    files: {
      '~/sehirler.txt': 'Ankara\nIstanbul\nIzmir\nAnkara\nBursa\nIstanbul\n',
    },
  },
  content: `
### sort — satırları sıralama

\`sort\` komutu, bir dosyanın veya standart girdinin satırlarını alfabetik ya da sayısal sıraya dizer:

\`\`\`bash
$ sort sehirler.txt
Ankara
Ankara
Bursa
Istanbul
Istanbul
Izmir
\`\`\`

- \`sort -r\` (*reverse*) — Tersten sıralar (Z'den A'ya).
- \`sort -n\` (*numeric*) — Sayısal sıralar (2 sayısı 10'dan önce gelir; normal sıralama harf sırasına göre 10'u 2'nin önüne alırdı).
- \`sort -u\` (*unique*) — Sıralarken yinelenen satırları ayıklar.

### uniq — ardışık tekrarları ayıklama

\`uniq\` komutu yan yana duran (ardışık) aynı satırları teke indirir.
> ⚠️ **Kritik Kural:** \`uniq\` dosyayı otomatik sıralamaz; yalnızca **birbirini takip eden** kopyaları görür. Bu yüzden dosyadaki tüm tekrarları temizlemek için neredeyse her zaman önce \`sort\` edilir:

\`\`\`bash
$ sort sehirler.txt | uniq
Ankara
Bursa
Istanbul
Izmir
\`\`\`

- \`uniq -c\` (*count*) — Her satırın kaç defa tekrarlandığını satırın başına yazar.
- \`sort sehirler.txt | uniq -c | sort -rn\` — En sık tekrarlananları en başta gösteren klasik bir Linux veri analiz zinciridir!
`,
  examples: [
    'sort sehirler.txt',
    'sort -r sehirler.txt',
    'sort sehirler.txt | uniq',
    'sort sehirler.txt | uniq -c',
  ],
  tasks: [
    {
      id: 'sort-basic',
      description: '`sehirler.txt` dosyasını `sort` komutu ile alfabetik olarak sırala ve ekrana yazdır.',
      hints: [
        'Sıralama için `sort DOSYA` kullanılır.',
        '`sort sehirler.txt`',
      ],
      solution: 'sort ~/sehirler.txt',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'sort' },
          { type: 'outputContains', text: 'Ankara\nAnkara\nBursa' },
        ],
      },
    },
    {
      id: 'sort-uniq-pipe',
      description: '`sehirler.txt` dosyasındaki tekrarları temizleyip tekil ve sıralı bir liste elde etmek için `sort` ve `uniq` komutlarını pipe (`|`) ile birleştir.',
      hints: [
        '`uniq` yalnızca ardışık tekrarları siler, bu yüzden önce `sort` kullanılır.',
        '`sort sehirler.txt | uniq`',
      ],
      solution: 'sort ~/sehirler.txt | uniq',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'sort' },
          { type: 'commandUsed', command: 'uniq' },
          { type: 'outputContains', text: 'Ankara\nBursa\nIstanbul\nIzmir' },
        ],
      },
    },
  ],
};
