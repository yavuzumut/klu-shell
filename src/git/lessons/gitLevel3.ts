import type { Level } from '../../lessons/types';

export const gitLevel3: Level = {
  id: 'git-level-3',
  number: 3,
  title: 'Git 3 — Dallar ve Birleştirme',
  description: 'Paralel dallar (branch) oluşturma, dallar arasında geçiş (switch) ve birleştirme (merge).',
  lessons: [
    {
      id: 'git-3-branch',
      title: 'Dallar Arasında Gezinme',
      summary: 'git branch ile listele, git switch -c ile yeni dal aç ve geç.',
      content: `
Bir ağacı düşün: Gövde sağlam ve kalındır, meyveler ise yan dallarda yetişir.

Git'teki **dal (branch)** mekanizması da böyledir:
- **\`main\` Dalı:** Çalışan, test edilmiş ve sağlam ana ürün kodudur.
- **Özellik Dalları:** Yeni bir deneme veya özellik geliştirmek istediğinde ana kodu riske atmamak için ayrı bir dal açarsın. Bir şeyler ters giderse dalı kolayca silebilirsin!

### Temel Komutlar

1. **\`git branch\`**: Depodaki tüm dalları listeler. Başında \`*\` olan dal, şu anda içinde bulunduğun daldır.
2. **\`git switch -c <dal-adı>\`**: Hem yeni bir dal oluşturur hem de doğrudan o dala geçer (\`-c\` = create).
3. **\`git switch <dal-adı>\`**: Var olan başka bir dala geçiş yapar.
`,
      examples: ['git branch', 'git switch -c ozellik', 'git switch main'],
      setup: {
        files: {
          '~/index.html': '<h1>Merhaba KLU</h1>\n',
        },
        setupCommands: [
          'git init',
          'git add .',
          'git commit -m "Ana kod tabanı"',
        ],
      },
      tasks: [
        {
          id: 'git-branch-list',
          description: 'Mevcut dalları listelemek için `git branch` komutunu çalıştır.',
          hints: ['`git branch` komutunu yazıp Enter\'a bas. Sadece `main` dalını göreceksin.'],
          solution: 'git branch',
          check: { type: 'commandUsed', command: 'git', args: ['branch'] },
        },
        {
          id: 'git-switch-create',
          description: '`git switch -c ozellik` komutuyla `ozellik` adında yeni bir dal oluşturup o dala geç.',
          hints: [
            '`git switch -c ozellik` komutunu çalıştır.',
            'Artık `ozellik` dalında bağımsızca çalışabilirsin.',
          ],
          solution: 'git switch -c ozellik',
          check: {
            type: 'all',
            checks: [
              { type: 'commandUsed', command: 'git', args: ['switch', 'ozellik'] },
              { type: 'commandUsed', command: 'git', flags: ['c'] },
            ],
          },
        },
        {
          id: 'git-switch-back',
          description: '`git switch main` komutunu çalıştırarak tekrar ana dala geri dön.',
          hints: ['`git switch main` yazarak ana dala güvenle geri dön.'],
          solution: 'git switch main',
          check: { type: 'commandUsed', command: 'git', args: ['switch', 'main'] },
        },
      ],
    },
    {
      id: 'git-3-merge',
      title: 'Birleştirme (Merge)',
      summary: 'git merge ile yan daldaki yenilikleri ana dala kat.',
      content: `
Yan dalda geliştirdiğin yeni özellik tamamlandı ve sorunsuz çalışıyor. Şimdi sıra onu ana ürünün (\`main\`) bir parçası haline getirmeye geldi. Bu işleme **merge (birleştirme)** denir.

### Birleştirmenin Altın Kuralı

> 🎯 **Önemli:** Değişiklikleri nereye katmak istiyorsan, **önce o dala geçmelisin!**
> Yan daldaki kodu \`main\`e katacaksan, önce \`git switch main\` yapıp ardından \`git merge <yan-dal>\` komutu verilir.

- **Fast-forward:** Eğer sen yan dalda çalışırken \`main\` dalına başka kimse yeni bir commit atmadıysa, Git \`main\` dalını doğrudan yan dalın son commit'ine ileri sarar.
`,
      examples: ['git branch', 'git merge yeni-ozellik', 'git log --oneline'],
      setup: {
        files: {
          '~/proje.txt': 'Ana proje dosyası\n',
        },
        setupCommands: [
          'git init',
          'git add .',
          'git commit -m "Temel proje"',
          'git switch -c yeni-ozellik',
          'echo "console.log(\'yeni buton\');" > buton.js',
          'git add buton.js',
          'git commit -m "Yeni buton eklendi"',
          'git switch main',
        ],
      },
      tasks: [
        {
          id: 'git-branch-check',
          description: 'Dalları listelemek ve şu an `main` dalında olduğunu doğrulamak için `git branch` komutunu çalıştır.',
          hints: ['`git branch` komutuyla `main` ve `yeni-ozellik` dallarını incele.'],
          solution: 'git branch',
          check: { type: 'commandUsed', command: 'git', args: ['branch'] },
        },
        {
          id: 'git-merge-feature',
          description: '`git merge yeni-ozellik` komutunu çalıştırarak yan daldaki değişiklikleri `main` dalına birleştir.',
          hints: [
            '`git merge yeni-ozellik` yazıp Enter\'a bas.',
            'Fast-forward birleştirmesi tamamlanacak ve buton.js ana dala dahil olacaktır.',
          ],
          solution: 'git merge yeni-ozellik',
          check: { type: 'commandUsed', command: 'git', args: ['merge', 'yeni-ozellik'] },
        },
        {
          id: 'git-log-verify',
          description: '`git log --oneline` komutunu çalıştırarak birleşen commit\'in artık `main` dalı geçmişinde olduğunu gör.',
          hints: ['`git log --oneline` komutunu çalıştırarak "Yeni buton eklendi" commit\'ini gör.'],
          solution: 'git log --oneline',
          check: {
            type: 'all',
            checks: [
              { type: 'commandUsed', command: 'git', args: ['log'] },
              { type: 'commandUsed', command: 'git', flags: ['oneline'] },
            ],
          },
        },
      ],
    },
  ],
};
