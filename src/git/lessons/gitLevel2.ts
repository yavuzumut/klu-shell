import type { Level } from '../../lessons/types';

export const gitLevel2: Level = {
  id: 'git-level-2',
  number: 2,
  title: 'Git 2 — Farklar ve Güvenlik',
  description: 'Değişiklikleri inceleme (diff), sahneden veya çalışma alanından geri alma (restore) ve .gitignore.',
  lessons: [
    {
      id: 'git-2-diff',
      title: 'Farkları İncele',
      summary: 'git diff ile çalışma alanı, git diff --staged ile hazırlık alanı farklarını gör.',
      content: `
Kod yazarken en önemli alışkanlık şudur: Bir şeyi kaydetmeden önce mutlaka **"Ben az önce neyi değiştirdim?"** diye kontrol et!

### İki Farklı Bakış Açısı

1. **\`git diff\`**: Çalışma alanında (klasöründe) değiştirdiğin ama henüz sahneye (\`git add\`) almadığın satırları gösterir.
2. **\`git diff --staged\`**: Sahneye aldığın fakat henüz commit ile kalıcı hale getirmediğin değişiklikleri gösterir.

Renklendirme ipucu:
- Kırmızı (\`-\`): Silinen veya değiştirilen eski satırlar.
- Yeşil (\`+\`): Yeni eklenen satırlar.
`,
      examples: ['git status', 'git diff', 'git add metin.txt', 'git diff --staged'],
      setup: {
        files: {
          '~/metin.txt': 'Temel proje metni.\n',
        },
        setupCommands: [
          'git init',
          'git add metin.txt',
          'git commit -m "İlk sürüm"',
          'echo "Bu satır sonradan eklendi." >> metin.txt',
        ],
      },
      tasks: [
        {
          id: 'git-diff-working',
          description: 'Çalışma alanındaki kaydedilmemiş satır değişikliklerini görmek için `git diff` komutunu çalıştır.',
          hints: ['Sadece `git diff` yazıp Enter\'a bas. Eklenen yeni satırın yeşil (+) olduğunu göreceksin.'],
          solution: 'git diff',
          check: { type: 'commandUsed', command: 'git', args: ['diff'] },
        },
        {
          id: 'git-add-change',
          description: 'Değişikliği hazırlık alanına almak için `git add metin.txt` komutunu çalıştır.',
          hints: ['`git add metin.txt` komutunu çalıştırarak değişikliği sahneye al.'],
          solution: 'git add metin.txt',
          check: { type: 'commandUsed', command: 'git', args: ['add'] },
        },
        {
          id: 'git-diff-staged',
          description: 'Hazırlık alanındaki (staged) değişiklikleri incelemek için `git diff --staged` komutunu çalıştır.',
          hints: ['`git diff --staged` yazarak commit öncesi sahnedeki farkları incele.'],
          solution: 'git diff --staged',
          check: {
            type: 'all',
            checks: [
              { type: 'commandUsed', command: 'git', args: ['diff'] },
              { type: 'commandUsed', command: 'git', flags: ['staged'] },
            ],
          },
        },
      ],
    },
    {
      id: 'git-2-restore',
      title: 'Geri Alma ve Gizleme',
      summary: 'git restore ile değişiklikleri geri al ve .gitignore ile dosyaları gizle.',
      content: `
Hata yapmak yazılımın doğasında var. Git'in en güzel tarafı, hiçbir şeyin kaybolmaması ve kolayca geri alınabilmesidir.

### Geri Alma Komutları

1. **\`git restore --staged <dosya>\`**: Yanlışlıkla \`git add\` ile sahneye aldığın dosyayı sahneden indirir. Dosya içeriğine dokunmaz, sadece staging alanından çıkarır.
2. **\`git restore <dosya>\`**: Çalışma alanında yaptığın ve henüz commit'lemediğin değişiklikleri çöpe atar; dosyayı son commit'teki tertemiz haline döndürür.

### Dosyaları Gizleme (\`.gitignore\`)

Geçici log dosyaları, şifreler veya gereksiz derleme çıktıları depoya girmemelidir. Depo köküne açacağın bir **.gitignore** dosyasına yazacağın kurallar (örneğin \`*.log\`), Git'in bu dosyaları görmezden gelmesini sağlar.
`,
      examples: [
        'git status',
        'git restore --staged app.js',
        'git restore app.js',
        'echo "*.log" > .gitignore',
      ],
      setup: {
        files: {
          '~/app.js': 'console.log("KLU baslatildi");\n',
        },
        setupCommands: [
          'git init',
          'git add .',
          'git commit -m "Temiz başlangıç"',
          'echo "console.log(\'hatali kod\');" >> app.js',
          'git add app.js',
          'echo "Gizli hata kayıtları" > debug.log',
        ],
      },
      tasks: [
        {
          id: 'git-restore-staged',
          description: 'Hazırlık alanına alınan `app.js` dosyasını `git restore --staged app.js` komutuyla sahneden çıkar.',
          hints: [
            '`git restore --staged app.js` komutu dosyayı hazırlık alanından güvenle çıkarır.',
            'İstersen `git status` ile dosyanın artık kırmızı olduğunu görebilirsin.',
          ],
          solution: 'git restore --staged app.js',
          check: {
            type: 'all',
            checks: [
              { type: 'commandUsed', command: 'git', args: ['restore'] },
              { type: 'commandUsed', command: 'git', flags: ['staged'] },
            ],
          },
        },
        {
          id: 'git-restore-worktree',
          description: 'Çalışma alanındaki hatalı değişikliği iptal etmek için `git restore app.js` komutunu çalıştır.',
          hints: ['`git restore app.js` komutu dosyayı son commit\'teki temiz haline döndürür.'],
          solution: 'git restore app.js',
          check: {
            type: 'all',
            checks: [
              { type: 'commandUsed', command: 'git', args: ['restore'] },
              { type: 'not', check: { type: 'commandUsed', command: 'git', flags: ['staged'] } },
            ],
          },
        },
        {
          id: 'create-gitignore',
          description: '`echo "*.log" > .gitignore` komutuyla log dosyalarını gizle.',
          hints: [
            'Terminalde `echo "*.log" > .gitignore` komutunu çalıştır.',
            'Ardından `git status` yazarak `debug.log` dosyasının artık yok sayıldığını doğrula.',
          ],
          solution: 'echo "*.log" > .gitignore',
          neutralCommands: ['echo', 'cat'],
          check: {
            type: 'all',
            checks: [
              { type: 'pathExists', path: '.gitignore' },
              { type: 'fileContains', path: '.gitignore', text: '*.log' },
            ],
          },
        },
      ],
    },
  ],
};
