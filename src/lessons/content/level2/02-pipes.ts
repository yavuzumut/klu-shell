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
### Boru Hattı (|) Nedir?

Unix felsefesinin en güçlü ilkesi şudur: **"Her komut tek bir işi iyi yapsın ve komutlar birlikte çalışabilsin."**

Boru hattı (\`|\`, pipe) tam olarak bunu sağlar:
Solundaki komutun standart çıktısını (*stdout*), sağındaki komutun standart girdisine (*stdin*) bağlar.

\`\`\`bash
$ KOMUT1 | KOMUT2
\`\`\`

Örneğin, bir dosyanın içeriğini \`cat\` ile basıp kaç satır olduğunu \`wc -l\` ile sayabilirsin:

\`\`\`bash
$ cat gorevler.txt | wc -l
5
\`\`\`

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
