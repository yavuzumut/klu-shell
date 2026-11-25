import type { Lesson } from '../../types';

export const chmodNumeric: Lesson = {
  id: 'l3-chmod-numeric',
  title: 'Dosya İzinleri ve chmod (Sayısal: 755, 644)',
  summary: 'Okuma (4), yazma (2) ve çalıştırma (1) yetkilerini sayılarla yönetme',
  setup: {
    files: {
      '~/rapor.txt': 'Aylik Sistem Raporu\n',
      '~/yedek.sh': 'echo "Yedek aliniyor..."\n',
    },
  },
  content: `
### Kimin Neye Hakkı Var?

Linux çok kullanıcılı bir işletim sistemidir. Her dosyanın bir sahibi vardır ve o dosyayla kimin ne yapabileceği 3 temel hakla belirlenir:
- **Okuma (r - read)**: Dosyanın içeriğine bakabilmek
- **Yazma (w - write)**: Dosyayı değiştirebilmek veya silebilmek
- **Çalıştırma (x - execute)**: Dosyayı bir program gibi koşturabilmek

### İzinlerin Sayısal Mantığı (Toplama Sistemi)
Linux'ta izinler sayılarla ifade edildiğinde çok pratik bir toplama kuralı işler:

- **Okuma (r) = 4**
- **Yazma (w) = 2**
- **Çalıştırma (x) = 1**

Bu sayıları toplayarak yetkiyi belirlersin:
- **7** (4 + 2 + 1) = Okuma + Yazma + Çalıştırma (Tam yetki)
- **6** (4 + 2) = Okuma + Yazma (Standart belge izni)
- **5** (4 + 1) = Okuma + Çalıştırma (Program çalıştırma)
- **0** = Hiçbir yetki yok

### Üç Haneli Şifre: \`chmod 755\`
Bir dosyada 3 grup insan vardır: **Sahip**, **Grup** ve **Diğer Herkes**.
- **\`chmod 755 betik.sh\`**
  - Sahip: **7** (rwx - her şeyi yapabilir)
  - Grup: **5** (r-x - okur ve çalıştırır)
  - Diğerleri: **5** (r-x - okur ve çalıştırır)

- **\`chmod 644 rapor.txt\`**
  - Sahip: **6** (rw- okur ve yazar)
  - Grup: **4** (r-- sadece okur)
  - Diğerleri: **4** (r-- sadece okur)
`,
  examples: [
    'ls -l',
    'chmod 644 rapor.txt',
    'chmod 755 yedek.sh',
    'chmod 700 gizli.txt',
  ],
  tasks: [
    {
      id: 'chmod-644-task',
      description: '`chmod 644 rapor.txt` komutuyla rapor dosyasına sahibine okuma-yazma (6), diğer herkese sadece okuma (4) yetkisi ver.',
      hints: [
        'Belirtilen sayısal kipi uygula:',
        '`chmod 644 rapor.txt`',
      ],
      solution: 'chmod 644 rapor.txt',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'chmod' },
          { type: 'fileMode', path: '~/rapor.txt', mode: 0o644 },
        ],
      },
    },
    {
      id: 'chmod-755-task',
      description: '`chmod 755 yedek.sh` komutuyla betik dosyasına çalıştırma yetkisi ekle.',
      hints: [
        'Betikler için yaygın izin 755\'tir:',
        '`chmod 755 yedek.sh`',
      ],
      solution: 'chmod 755 yedek.sh',
      check: {
        type: 'all',
        checks: [
          { type: 'commandUsed', command: 'chmod' },
          { type: 'fileMode', path: '~/yedek.sh', mode: 0o755 },
        ],
      },
    },
  ],
};
