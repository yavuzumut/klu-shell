import type { Lesson } from '../../types';

export const habitsLesson: Lesson = {
  id: 'l0-habits',
  title: 'Terminal Alışkanlıkları ve Kısayollar',
  summary: 'Komut anatomisi, Tab tamamlama, geçmiş gezintisi ve yardım alma (--help, man).',
  content: `
Terminalde hızlı ve verimli çalışmak birkaç temel alışkanlığa dayanır:

### 1. Komut Anatomisi
Bir Linux komutu genellikle şu yapıyı izler:
\`\`\`
komut [seçenekler/bayraklar] [argümanlar/hedefler]
\`\`\`
Örnek: \`ls -la /home\`
- \`ls\` : komutun kendisi
- \`-la\` : komutun davranışını değiştiren kısa bayraklar (gizli dosyalar + detaylı liste)
- \`/home\` : işlemin uygulanacağı hedef yol (argüman)

### 2. Olmazsa Olmaz Kısayollar
- **Tab Tuşu:** Terminalin en büyük gücüdür. Bir komutun veya dosya adının ilk harflerini yazıp **Tab**'a bastığında otomatik tamamlanır.
- **Yukarı / Aşağı Ok Tuşları (↑ / ↓):** Daha önce çalıştırdığın komutları tekrar yazmadan geri çağırır.
- **Ctrl+C:** Satırı çalıştırmadan iptal eder ve temiz bir komut satırı açar.
- **Ctrl+L:** Ekranı temizler (\`clear\` komutu ile aynıdır).

### 3. Komutlardan Yardım Alma
- **--help bayrağı:** Komutun kullanım özetini ekrana yazar (örn: \`pwd --help\`).
- **man komutu:** Komutun detaylı kılavuz sayfasını (manual) görüntüler (örn: \`man ls\`).
`,
  examples: ['pwd --help', 'man ls', 'clear'],
  tasks: [
    {
      id: 'l0-help-flag',
      description: '`pwd` komutunun kullanım özetini incelemek için `pwd --help` komutunu çalıştır.',
      hints: ['`pwd` yazdıktan sonra bir boşluk bırakıp `--help` ekle.'],
      solution: 'pwd --help',
      check: { type: 'commandUsed', command: 'pwd', args: ['--help'] },
    },
    {
      id: 'l0-man',
      description: '`ls` komutunun kılavuz sayfasını açmak için `man ls` komutunu çalıştır.',
      hints: ['`man ls` yazıp Enter tuşuna bas.'],
      solution: 'man ls',
      check: { type: 'commandUsed', command: 'man', args: ['ls'] },
    },
  ],
};
