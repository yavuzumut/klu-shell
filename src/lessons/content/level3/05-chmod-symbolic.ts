import type { Lesson } from '../../types';

export const chmodSymbolic: Lesson = {
  id: 'l3-chmod-symbolic',
  title: 'Harflerle İzinler ve Betik Çalıştırma: chmod +x',
  summary: 'Sembolik izinler (+x, -w) ve ./ ile çalıştırılabilir betik koşturma',
  setup: {
    files: {
      '~/selam.sh': 'echo "KLU Linux dunyasina hos geldin!"\n',
    },
  },
  content: `
### Harflerin Pratikliği: \`chmod +x\`

Sayıları hesaplamak istemediğinde ya da sadece tek bir yetkiyi hızlıca ekleyip çıkarmak istediğinde harfler imdada yetişir:

- **\`+x\`** — Çalıştırma yetkisi ekle (*eXecute*)
- **\`-w\`** — Yazma yetkisini kaldır (*Write*)
- **\`+r\`** — Okuma yetkisi ekle (*Read*)

Örneğin elinde bir kabuk betiği (*shell script*) varsa ve onu doğrudan çalıştırmak istiyorsan en sık kullanacağın komut şudur:
\`\`\`bash
chmod +x betik.sh
\`\`\`

### Kendi Yazdığın Betiği Çalıştırmak: \`./\`
Linux'ta güvenlik gereği bulunduğun dizindeki bir programı sadece adını yazarak çalıştıramazsın. Başına mutlaka **\`./\`** koyman gerekir:

\`\`\`bash
./selam.sh
\`\`\`

*(Buradaki \`.\` "şu anda bulunduğum klasör", \`/\` ise klasör ayracıdır; yani "bu klasörün içindeki selam.sh dosyasını çalıştır" demiş olursun).*

Eğer dosyaya \`chmod +x\` ile yetki vermeden \`./selam.sh\` çalıştırmayı denersen sistem seni durdurur:
\`bash: ./selam.sh: Permission denied\`
`,
  examples: [
    'chmod +x selam.sh',
    './selam.sh',
    'chmod -w selam.sh',
    'ls -l',
  ],
  tasks: [
    {
      id: 'chmod-plus-x-task',
      description: '`chmod +x selam.sh` komutuyla betiğe çalıştırma yetkisi ver.',
      hints: [
        'Sembolik olarak çalıştırma izni ekle:',
        '`chmod +x selam.sh`',
      ],
      solution: 'chmod +x selam.sh',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'chmod' },
          {
            type: 'custom',
            fn: (state) => ((state.fs.tryLookup(state.fs.resolve('~/selam.sh'))?.mode ?? 0) & 0o111) !== 0,
          },
        ],
      },
    },
    {
      id: 'run-script-task',
      description: '`./selam.sh` komutunu yazarak hazırladığın betiği çalıştır.',
      hints: [
        'Bulunduğun yerdeki betiği `./` önekiyle çağır:',
        '`./selam.sh`',
      ],
      solution: './selam.sh',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: './selam.sh' },
          { type: 'outputContains', text: 'KLU Linux dunyasina hos geldin!' },
        ],
      },
    },
  ],
};
