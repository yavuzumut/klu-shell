import type { Lesson } from '../../types';

export const killProcess: Lesson = {
  id: 'l3-kill-process',
  title: 'Süreçleri Sonlandırma: kill',
  summary: 'Takılı kalan işlemleri PID ile durdurma ve -9 sinyali',
  setup: {
    processes: [
      {
        pid: 2048,
        command: 'python3 loop.py',
        cpu: '99.0',
        mem: '3.4',
        user: 'kullanici',
        vsz: 52000,
        rss: 16000,
        tty: 'pts/0',
        stat: 'R',
        start: '00:03',
        time: '0:45',
      },
    ],
  },
  content: `
### Cevap Vermeyen Programı Durdurmak

Bazen yazdığın bir Python veya kabuk betiği sonsuz döngüye girer, yanıt vermez hale gelir ya da işlemcinin %100'ünü tüketmeye başlar.

Böyle bir durumda o süreci sonlandırmak için **\`kill\`** komutunu kullanırız.

### Adım Adım Sorun Çözme

1. **Önce Suçluyu Bul:**
   Süreçlerin listesini tarayarak sorunlu programın kimlik numarasını (PID) öğren:
   \`\`\`bash
   ps aux | grep loop
   \`\`\`
   Örneğin çıktıda PID numarasının **2048** olduğunu gördün.

2. **Nazikçe Kapat (SIGTERM):**
   \`\`\`bash
   kill 2048
   \`\`\`
   Bu komut sürece *"Lütfen işlerini toparla ve kapan"* der.

3. **Zorla Durdur (SIGKILL -9):**
   Eğer program takılı kalmışsa ve nazik isteğe cevap vermiyorsa, acımasız ve kesin çözüm:
   \`\`\`bash
   kill -9 2048
   \`\`\`
   \`-9\` sinyali sürece söz hakkı tanımaz; işletim sistemi süreci o anda bellekten tamamen siler.
`,
  examples: [
    'ps',
    'ps aux | grep loop',
    'kill 2048',
    'kill -9 2048',
  ],
  tasks: [
    {
      id: 'find-stuck-task',
      description: '`ps aux | grep loop` komutuyla takılı kalan sürecin PID numarasını bul.',
      hints: [
        'Sürecin satırını bulmak için grep kullan:',
        '`ps aux | grep loop`',
      ],
      solution: 'ps aux | grep loop',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'ps' },
          { type: 'commandUsed', command: 'grep' },
          { type: 'outputContains', text: 'loop.py' },
        ],
      },
    },
    {
      id: 'kill-stuck-task',
      description: '`kill 2048` komutunu kullanarak takılı kalan süreci durdur.',
      hints: [
        'PID numarası 2048 olan süreci kill komutuyla sonlandır:',
        '`kill 2048`',
      ],
      solution: 'kill 2048',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'kill' },
          {
            type: 'custom',
            fn: (state) => !state.shell?.processes.some((p) => p.pid === 2048),
          },
        ],
      },
    },
    {
      id: 'verify-killed-task',
      description: '`ps` komutunu çalıştırarak sürecin artık listede olmadığını doğrula.',
      hints: [
        'İşlemin kapandığını görmek için ps komutunu çalıştır:',
        '`ps`',
      ],
      solution: 'ps',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'ps' },
          {
            type: 'not',
            check: { type: 'outputContains', text: 'loop.py' },
          },
        ],
      },
    },
  ],
};
