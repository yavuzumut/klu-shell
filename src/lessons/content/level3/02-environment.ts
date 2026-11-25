import type { Lesson } from '../../types';

export const environment: Lesson = {
  id: 'l3-environment',
  title: 'Ortam Değişkenleri: env, $DEĞİŞKEN ve export',
  summary: 'Terminalin hafızası: Değişkenleri okuma ve export ile yenilerini tanımlama',
  content: `
### Terminalin Küçük Hafıza Kutuları

Terminal sadece komutları çalıştırmaz; arkada pek çok sistem ayarını ve bilgisini küçük hafıza kutularında tutar. Bu kutulara **ortam değişkenleri** (*environment variables*) diyoruz.

Tıpkı akıllı telefonundaki rehber veya ayarlar gibi:
- **\`USER\`** — Adının yazılı olduğu kutu
- **\`HOME\`** — Ev dizininin yolunu tutan kutu
- **\`SHELL\`** — Hangi kabuğu kullandığını tutan kutu

### Değişkenin Değerini Okumak: \`$KUTU_ADI\`
Bir kutunun içindeki değeri okumak için adının başına **\`$\`** işareti koyarsın:

\`\`\`bash
echo $USER   # ekrana kullanıcı adını yazar
echo $HOME   # /home/kullanici yazar
\`\`\`

### Bütün Kutuları Görmek: \`env\`
Sistemdeki tüm kayıtlı ortam değişkenlerini listelemek için **\`env\`** komutunu kullanırız. Çok fazla değişken listelendiğinde \`grep\` ile filtrelemek harika bir çözümdür:

\`\`\`bash
env | grep USER
\`\`\`

### Yeni Değişken Tanımlamak: \`export\`
Kendin de yeni bir değişken yaratabilirsin:

\`\`\`bash
export SEHIR="Kirklareli"
echo $SEHIR    # ekrana Kirklareli yazar
\`\`\`
`,
  examples: [
    'env',
    'echo $USER',
    'echo $HOME',
    'env | grep USER',
    'export DIL="Turkce"',
    'echo $DIL',
  ],
  tasks: [
    {
      id: 'env-grep-task',
      description: '`env` komutunun çıktısını `grep` ile filtreleyerek `USER` değişkeninin değerini bul.',
      hints: [
        '`|` (pipe) boru hattı ile filtrele:',
        '`env | grep USER`',
      ],
      solution: 'env | grep USER',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'env' },
          { type: 'commandUsed', command: 'grep' },
          { type: 'outputContains', text: 'USER=' },
        ],
      },
    },
    {
      id: 'export-var-task',
      description: '`export SEHIR="Kirklareli"` komutuyla yeni bir ortam değişkeni tanımla.',
      hints: [
        'Değişkeni `export` ile kabuğa tanıt:',
        '`export SEHIR="Kirklareli"`',
      ],
      solution: 'export SEHIR="Kirklareli"',
      check: {
        type: 'custom',
        fn: (state) => state.env?.SEHIR === 'Kirklareli',
      },
    },
    {
      id: 'echo-var-task',
      description: 'Tanımladığın değişkeni `echo $SEHIR` komutuyla ekrana yazdır.',
      hints: [
        'Değişkeni yazdırmak için başına `$` koy:',
        '`echo $SEHIR`',
      ],
      solution: 'echo $SEHIR',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'echo' },
          { type: 'outputContains', text: 'Kirklareli' },
        ],
      },
    },
  ],
};
