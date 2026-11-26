import type { Level } from '../../lessons/types';

export const gitLevel1: Level = {
  id: 'git-level-1',
  number: 1,
  title: 'Git 1 — Temel Akış',
  description: 'Git deposu başlatma, durum inceleme, hazırlık alanına alma ve ilk commit kaydı.',
  lessons: [
    {
      id: 'git-1-init',
      title: 'İlk Deponu Başlat',
      summary: 'git init ile yeni bir depo başlat ve git status ile durumunu incele.',
      content: `
Bir projeye başlarken yaptığın her değişikliğin kaydını tutmak istersin. Git bunu proje klasörünün içine gizli bir **.git** klasörü yerleştirerek yapar. Bu klasör senin projenin arşiv dolabıdır.

### İki Temel Komut

1. **\`git init\`**: Bulunduğun klasörü resmi bir Git deposuna dönüştürür.
2. **\`git status\`**: Deponun röntgenini çeker. Hangi daldasın, hangi dosyalar değişti veya henüz Git tarafından takip edilmiyor (Untracked) anında gösterir.

> 💡 **Alışkanlık:** Git kullanırken aklına geldikçe \`git status\` yazmaktan asla çekinme! Bu komut hiçbir dosyayı değiştirmez, sadece etrafa bakmanı sağlar.
`,
      examples: ['git status', 'git init', 'touch notlar.txt'],
      setup: {
        files: {},
      },
      tasks: [
        {
          id: 'git-init',
          description: 'Geçerli dizinde `git init` komutunu çalıştırarak boş bir Git deposu başlat.',
          hints: ['Sadece `git init` yazıp Enter\'a bas.', 'Bu komut gizli `.git` klasörünü oluşturur.'],
          solution: 'git init',
          check: { type: 'pathExists', path: '.git', kind: 'dir' },
        },
        {
          id: 'git-status',
          description: 'Deponun durumunu görmek için `git status` komutunu çalıştır.',
          hints: ['`git status` yazarak henüz commit olmadığını ve main dalında olduğunu gör.'],
          solution: 'git status',
          check: { type: 'commandUsed', command: 'git', args: ['status'] },
        },
        {
          id: 'create-untracked',
          description: '`touch notlar.txt` ile bir dosya oluştur ve ardından `git status` ile dosyanın *Untracked* olarak listelendiğini gör.',
          hints: [
            'Önce `touch notlar.txt` yazıp dosyayı oluştur.',
            'Ardından `git status` komutunu çalıştır.',
          ],
          solution: 'touch notlar.txt && git status',
          neutralCommands: ['touch'],
          check: {
            type: 'all',
            checks: [
              { type: 'pathExists', path: 'notlar.txt' },
              { type: 'commandUsed', command: 'git', args: ['status'] },
            ],
          },
        },
      ],
    },
    {
      id: 'git-1-commit',
      title: 'Hazırlık ve İlk Kayıt',
      summary: 'git add ile değişiklikleri sahneye al, git commit ile kaydet ve geçmişi gör.',
      content: `
Git'te dosyaları doğrudan kaydetmeyiz. İki aşamalı bir güvenlik çemberimiz vardır:

\`\`\`
Çalışma Alanı  ──( git add )──>  Hazırlık Alanı (Staging)  ──( git commit )──>  Depo (.git)
\`\`\`

1. **Hazırlık Alanı (\`staging area\`):** Bir fotoğraf çekimi düşün. Fotoğrafta yer almasını istediğin kişileri sahneye çağırırsın (\`git add notlar.txt\` veya tümü için \`git add .\`).
2. **Commit (\`git commit -m "mesaj"\`):** Deklanşöre basarsın! Sahnedeki değişiklikler kalıcı bir sürüm fotoğrafı olarak kaydedilir. Her commit'in benzersiz 7 karakterlik bir kimliği (hash) olur.
3. **Geçmişi İnceleme (\`git log --oneline\`):** Albümdeki fotoğrafları tek satırlık özetler halinde listeler.
`,
      examples: ['git status', 'git add notlar.txt', 'git commit -m "İlk commit"', 'git log --oneline'],
      setup: {
        setupCommands: ['git init'],
        files: {
          '~/notlar.txt': 'Proje fikirleri ve yapılacaklar listesi\n',
        },
      },
      tasks: [
        {
          id: 'git-add',
          description: '`notlar.txt` dosyasını `git add notlar.txt` komutuyla hazırlık alanına (staging) ekle.',
          hints: [
            '`git add notlar.txt` yazarak dosyayı sahneye alabilirsin.',
            'İstersen ardından `git status` ile yeşil renkte listelendiğini görebilirsin.',
          ],
          solution: 'git add notlar.txt',
          check: { type: 'commandUsed', command: 'git', args: ['add'] },
        },
        {
          id: 'git-commit',
          description: 'Hazırlık alanındaki dosyayı `git commit -m "İlk commit"` komutuyla depoya kaydet.',
          hints: [
            'Mesaj parametresi için `-m` bayrağını kullan: `git commit -m "İlk commit"`',
          ],
          solution: 'git commit -m "İlk commit"',
          check: { type: 'commandUsed', command: 'git', args: ['commit'] },
        },
        {
          id: 'git-log',
          description: 'Commit geçmişini özet olarak görmek için `git log --oneline` komutunu çalıştır.',
          hints: [
            '`git log --oneline` komutunu yazıp Enter\'a bas.',
            'Commit hash değerini ve commit mesajını göreceksin.',
          ],
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
