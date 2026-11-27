import { GitRepo } from '../../core/git/GitRepo';
import type { Level } from '../../lessons/types';

export const gitLevel4: Level = {
  id: 'git-level-4',
  number: 4,
  title: 'Git 4 — Uzak Depolar ve İş Birliği',
  description: 'Uzak sunuculara bağlanma (remote), değişiklikleri gönderme (push), çekme (pull) ve klonlama (clone).',
  lessons: [
    {
      id: 'git-4-push',
      title: 'Uzak Depoya Bağlan ve Gönder',
      summary: 'git remote add ile uzak depo bağla, git remote -v ile kontrol et ve git push -u ile gönder.',
      content: `
Şimdiye kadar tüm commit'lerini sadece kendi bilgisayarında tuttun. Projelerini internette (örneğin GitHub'da) saklamak ve başkalarıyla paylaşmak için bir **uzak depoya (remote)** ihtiyacın olur.

### Temel Komutlar

1. **\`git remote add <ad> <url>\`:** Yerel depoya uzak bir sunucu adresi bağlar. Standart olarak ilk uzak depoya **\`origin\`** adı verilir.
2. **\`git remote -v\`:** Hangi uzak depolara bağlı olduğunu ve adreslerini (\`fetch\` ve \`push\` için) listeler.
3. **\`git push -u <uzak> <dal>\`:** Yereldeki commit'lerini uzak depoya gönderir. **\`-u\`** (\`--set-upstream\`) bayrağı bu dalı uzak dalla eşler; böylece bundan sonraki gönderimlerde sadece **\`git push\`** yazman yeterli olur.

> **KLU simülasyonu:** KLU, GitHub'a veya genel internete bağlanmaz. Bu dersteki uzak depo adresleri sanal dosya sistemindeki yerel depolara karşılık gelir; push ve pull işlemleri yalnızca bu simülasyonda çalışır.
`,
      examples: [
        'git remote add origin https://github.com/klu/notlar.git',
        'git remote -v',
        'git push -u origin main',
      ],
      setup: {
        files: {
          '~/README.md': '# Notlar\nKLU Git notlarım.\n',
        },
        setupCommands: [
          'git init --bare /var/klu-remotes/klu-notlar',
          'git init',
          'git add README.md',
          'git commit -m "İlk notlar eklendi"',
        ],
      },
      tasks: [
        {
          id: 'git-remote-add',
          description: '`git remote add origin https://github.com/klu/notlar.git` komutunu çalıştırarak uzak depoyu bağla.',
          hints: [
            'Komutu aynen yaz: git remote add origin https://github.com/klu/notlar.git',
            'Bu işlem .git/config.json içine origin adında bir uzak depo bağlantısı kaydeder.',
          ],
          solution: 'git remote add origin https://github.com/klu/notlar.git',
          check: {
            type: 'custom',
            fn: (state) => {
              const repo = GitRepo.find(state.fs, state.cwd);
              if (!repo) return false;
              const remotes = repo.getRemotes();
              return remotes.some((r) => r.name === 'origin' && r.url === 'https://github.com/klu/notlar.git');
            },
          },
        },
        {
          id: 'git-remote-verify',
          description: '`git remote -v` komutunu çalıştırarak bağlı uzak deponun adresini ve yönlerini incele.',
          hints: [
            '`git remote -v` yazıp Enter tuşuna bas.',
            'origin için fetch ve push adreslerini göreceksin.',
          ],
          solution: 'git remote -v',
          check: {
            type: 'all',
            checks: [
              { type: 'commandUsed', command: 'git', args: ['remote'] },
              { type: 'commandUsed', command: 'git', flags: ['v'] },
            ],
          },
        },
        {
          id: 'git-push-main',
          description: '`git push -u origin main` komutunu çalıştırarak commit\'lerini uzak depoya gönder.',
          hints: [
            '`git push -u origin main` yazıp Enter tuşuna bas.',
            '-u bayrağı sayesinde artık sonraki adımlarda yalnızca git push yazman yetecek.',
          ],
          solution: 'git push -u origin main',
          check: {
            type: 'custom',
            fn: (state) => {
              const remoteRepo = GitRepo.open(state.fs, '/var/klu-remotes/klu-notlar');
              if (!remoteRepo) return false;
              return remoteRepo.getBranchCommitHash('main') !== null;
            },
          },
        },
      ],
    },
    {
      id: 'git-4-clone-pull',
      title: 'Projeyi Klonla ve Güncelle',
      summary: 'git clone ile uzak projeyi indir, git pull ile yeni değişiklikleri çek ve geçmişi gör.',
      content: `
Başkalarının paylaştığı bir projeyi kendi bilgisayarına almak veya ekip arkadaşının gönderdiği yeni kodları çalıştığın projeye eklemek en yaygın iki Git işlemidir.

### Temel Komutlar

1. **\`git clone <url>\`:** Uzaktaki bir depoyu tüm commit geçmişi, dalları ve dosyalarıyla birlikte bilgisayarına indirir. Ayrıca uzak bağlantıyı otomatik olarak **\`origin\`** olarak kaydeder.
2. **\`git pull\`:** Uzak depodaki yeni commit'leri çeker ve üzerinde çalıştığın mevcut dala birleştirir.
3. **\`git log --oneline\`:** Çekilen yeni commit'lerin geçmişe eklendiğini doğrular.

> **KLU simülasyonu:** Klonlama ve güncelleme, sanal dosya sistemi altındaki yerel uzak depo örneklerini kullanır; gerçek bir sunucuya bağlanmaz.
`,
      examples: [
        'git clone https://github.com/klu/notlar.git',
        'cd ekip-projesi',
        'git pull',
        'git log --oneline',
      ],
      setup: {
        setupCommands: [
          // 1. klu-notlar uzak deposu
          'git init --bare /var/klu-remotes/klu-notlar',
          'mkdir -p /tmp/seed-notlar',
          'cd /tmp/seed-notlar',
          'git init',
          'echo "# KLU Notlari" > notlar.txt',
          'git add notlar.txt',
          'git commit -m "Ilk not eklendi"',
          'git remote add origin https://github.com/klu/notlar.git',
          'git push -u origin main',
          'cd ~',
          'rm -rf /tmp/seed-notlar',

          // 2. klu-ekip-projesi uzak deposu
          'git init --bare /var/klu-remotes/klu-ekip-projesi',
          'mkdir -p /tmp/seed-ekip',
          'cd /tmp/seed-ekip',
          'git init',
          'echo "Ekip Projesi v1" > proje.txt',
          'git add proje.txt',
          'git commit -m "Proje baslangici"',
          'git remote add origin https://github.com/klu/ekip-projesi.git',
          'git push -u origin main',

          // 3. ~/ekip-projesi klonu
          'cd ~',
          'git clone https://github.com/klu/ekip-projesi.git ekip-projesi',

          // 4. Ekip arkadasi uzak depoya 2. commit'i gonderiyor
          'cd /tmp/seed-ekip',
          'echo "Gorev 1 tamamlandi" > gorevler.txt',
          'git add gorevler.txt',
          'git commit -m "Gorevler listesi eklendi"',
          'git push origin main',
          'cd ~',
          'rm -rf /tmp/seed-ekip',
        ],
      },
      tasks: [
        {
          id: 'git-clone-notlar',
          description: '`git clone https://github.com/klu/notlar.git` komutunu çalıştırarak uzak depoyu bilgisayarına indir.',
          hints: [
            '`git clone https://github.com/klu/notlar.git` yazıp Enter\'a bas.',
            'Bulunduğun ev dizininde `notlar` klasörü açılacak ve dosyalar indirilecektir.',
          ],
          solution: 'git clone https://github.com/klu/notlar.git',
          check: { type: 'pathExists', path: '~/notlar/.git', kind: 'dir' },
        },
        {
          id: 'cd-ekip-projesi',
          description: '`cd ekip-projesi` komutuyla önceden hazırlanmış ekip projesi klasörüne gir.',
          hints: ['`cd ekip-projesi` komutunu çalıştır.'],
          solution: 'cd ekip-projesi',
          check: { type: 'cwdIs', path: '~/ekip-projesi' },
        },
        {
          id: 'git-pull-updates',
          description: '`git pull` komutunu çalıştırarak ekip arkadaşının uzak depoya gönderdiği yeni commit\'i çek.',
          hints: [
            '`git pull` yazıp Enter\'a bas.',
            'Uzak depodaki `gorevler.txt` dosyası ve yeni commit çalışma alanına gelecektir.',
          ],
          solution: 'git pull',
          check: { type: 'pathExists', path: '~/ekip-projesi/gorevler.txt', kind: 'file' },
        },
        {
          id: 'git-log-oneline',
          description: '`git log --oneline` komutunu çalıştırarak yeni commit\'in geçmişe başarıyla eklendiğini doğrula.',
          hints: ['`git log --oneline` komutunu yazıp Enter\'a bas.'],
          solution: 'git log --oneline',
          check: { type: 'commandUsed', command: 'git', args: ['log', '--oneline'] },
        },
      ],
    },
  ],
};
