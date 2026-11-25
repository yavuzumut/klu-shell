import type { Lesson } from '../../types';

export const processesPs: Lesson = {
  id: 'l3-processes-ps',
  title: 'Çalışan Süreçleri İzleme: ps',
  summary: 'Arka planda ne çalışıyor? İşlem tablosu, PID ve ps aux kullanımı',
  setup: {
    processes: [
      {
        pid: 1420,
        command: 'python3 worker.py',
        cpu: '2.5',
        mem: '1.2',
        user: 'kullanici',
        vsz: 45000,
        rss: 12500,
        tty: 'pts/0',
        stat: 'S',
        start: '00:01',
        time: '0:02',
      },
    ],
  },
  content: `
### Arka Planda Neler Dönüyor?

Bilgisayarında bir komut, uygulama veya betik çalışmaya başladığı anda bir **süreç** (*process*) haline gelir.

Tıpkı her vatandaşın benzersiz bir kimlik numarası olduğu gibi, Linux'ta da her sürecin bir kimlik numarası vardır: **PID** (*Process ID*).

### Görev Yöneticisi Benzetmesi
Windows'taki Görev Yöneticisi veya telefondaki açık uygulamalar listesi neyse, Linux terminalindeki **\`ps\`** (*Process Status*) komutu da odur:

- **\`ps\`** — Yalnızca senin bu terminal penceresinde başlattığın süreçleri listeler.
- **\`ps aux\`** — Sistemde arka planda çalışan istisnasız bütün süreçleri (sistem servisleri, diğer kullanıcılar vb.) ayrıntılarıyla döker.

### Süreç Aramak
Sistemde yüzlerce süreç çalışabilir. Aradığın belirli bir programı bulmak için boru hattı ile \`grep\` kullanırsın:

\`\`\`bash
ps aux | grep worker
\`\`\`
Bu komut sana \`worker\` adını içeren sürecin satırını ve en önemlisi **PID numarasını** gösterir.
`,
  examples: [
    'ps',
    'ps aux',
    'ps aux | grep worker',
    'ps aux | grep bash',
  ],
  tasks: [
    {
      id: 'ps-simple-task',
      description: '`ps` komutuyla terminalinde çalışan temel süreçleri listele.',
      hints: [
        'Komutu doğrudan yaz:',
        '`ps`',
      ],
      solution: 'ps',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'ps' },
          { type: 'outputContains', text: 'bash' },
        ],
      },
    },
    {
      id: 'ps-aux-task',
      description: '`ps aux` komutuyla sistemdeki tüm süreçleri ayrıntılı olarak görüntüle.',
      hints: [
        'Tüm süreçleri listelemek için:',
        '`ps aux`',
      ],
      solution: 'ps aux',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'ps', args: ['aux'] },
          { type: 'outputContains', text: 'worker.py' },
        ],
      },
    },
    {
      id: 'ps-grep-task',
      description: '`ps aux | grep worker` komutuyla arka planda çalışan işçi sürecini filtrele.',
      hints: [
        'Boru hattı kullanarak filtrele:',
        '`ps aux | grep worker`',
      ],
      solution: 'ps aux | grep worker',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'ps' },
          { type: 'commandUsed', command: 'grep' },
          { type: 'outputContains', text: 'worker.py' },
        ],
      },
    },
  ],
};
