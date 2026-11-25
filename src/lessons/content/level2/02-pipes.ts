import type { Lesson } from '../../types';

export const pipes: Lesson = {
  id: 'l2-pipes',
  title: 'Boru Hattı (Pipes): |',
  summary: 'Komutları birbirine bağlama, veri akışı',
  setup: {
    files: {
      '~/gorevler.txt': '1. Ekmek al\n2. Dersi calis\n3. Kod yaz\n4. Evi topla\n5. Kitap oku\n',
    },
  },
  content: `
### Pipe (\`|\`) Nedir?

Normalde bir komut çalıştırdığında sonucu ekrana basar ve iş biter. Ama bazen ilk komutun sonucunu ekrana basmak yerine, doğrudan başka bir komuta işlenmesi için göndermek istersin.

\`|\` işareti tam olarak bunu yapar: **soldaki komutun ürettiği sonucu alır, sağdaki komuta malzeme olarak verir.**

Örneğin bir fabrika bandı gibi düşün:
\`cat gunluk.txt | grep "hata"\`
1. \`cat gunluk.txt\` dosyanın içini okur.
2. \`|\` bu metni ekrana basmak yerine \`grep\`'e aktarır.
3. \`grep "hata"\` sadece içinde \`"hata"\` geçen satırları süzer ve sana gösterir.

### Zincirleme Veri Akışı

Birden fazla pipe birbirine eklenebilir:
\`\`\`bash
$ KOMUT1 | KOMUT2 | KOMUT3
\`\`\`

Ayrıca boru hattının nihai çıktısı bir dosyaya yönlendirilebilir:
\`\`\`bash
$ ls | head -n 3 > ilk_uc.txt
\`\`\`
`,
  examples: [
    'cat gorevler.txt | wc -l',
    'ls | head -n 2',
    'cat /etc/passwd | wc -l',
  ],
  tasks: [
    {
      id: 'pipe-cat-wc',
      description: '`cat` ile `gorevler.txt` dosyasını oku ve pipe (`|`) aracılığıyla `wc -l` komutuna aktararak satır sayısını ekrana yazdır.',
      hints: [
        'Boru hattı için `|` sembolü kullanılır.',
        '`cat gorevler.txt | wc -l`',
      ],
      solution: 'cat ~/gorevler.txt | wc -l',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'wc', flags: ['l'] },
          { type: 'outputContains', text: '5' },
        ],
      },
    },
    {
      id: 'pipe-redirect',
      description: 'Ev dizinindeki dosya ve dizinleri `ls` ile listele, pipe ile `head -n 2` komutuna aktar ve sonucu `ilk_ikisi.txt` dosyasına yazdır.',
      hints: [
        'Önce `ls | head -n 2`, ardından `> ilk_ikisi.txt` yönlendirmesini ekle.',
        '`ls | head -n 2 > ilk_ikisi.txt`',
      ],
      solution: 'ls | head -n 2 > ~/ilk_ikisi.txt',
      check: { type: 'pathExists', path: '~/ilk_ikisi.txt', kind: 'file' },
    },
  ],
};
