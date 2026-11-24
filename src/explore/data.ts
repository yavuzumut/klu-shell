export type ExploreCategory = 'media' | 'system' | 'files' | 'productivity' | 'fun';

export interface DistroInstall {
  debian?: string;
  fedora?: string;
  arch?: string;
  note?: string;
}

export interface ExploreTool {
  id: string;
  name: string;
  category: ExploreCategory;
  replaces?: string;
  description: string;
  exampleCommand: string;
  exampleOutput: string;
  install: DistroInstall;
  tips?: string[];
  warning?: string;
  sourceUrl?: string;
  summary?: string;
  installCommand?: string;
}

export const EXPLORE_TOOLS: ExploreTool[] = [
  {
    id: 'yt-dlp',
    name: 'yt-dlp',
    category: 'media',
    description: 'YouTube ve birçok sitedeki videoyu veya sesi indirir.',
    exampleCommand: 'yt-dlp -x --audio-format mp3 "VIDEO_LINKI"',
    exampleOutput: `[youtube] Extracting URL: VIDEO_LINKI
[download] Destination: ses.webm
[ExtractAudio] Destination: ses.mp3`,
    install: {
      debian: 'sudo apt install yt-dlp',
      fedora: 'sudo dnf install yt-dlp',
      arch: 'sudo pacman -S yt-dlp',
      note: 'Dağıtım depolarındaki sürüm geride kalabilir. Projenin önerdiği yol çalıştırılabilir dosyayı doğrudan indirmek: sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp ve ardından sudo chmod a+rx /usr/local/bin/yt-dlp; güncelleme: sudo yt-dlp -U. Yeni Ubuntu\'da pip install "externally-managed-environment" hatası verebilir. MP3\'e dönüştürmek için ffmpeg gerekir.',
    },
    warning:
      'Telif hakkı olan içeriği indirmek hizmet şartlarına aykırı olabilir; kendi videon veya lisansı serbest içerik kullan. İnternetten indirdiğin programı sudo ile kurmadan önce kaynağın resmî olduğundan emin ol.',
    sourceUrl: 'https://github.com/yt-dlp/yt-dlp/wiki/Installation',
  },
  {
    id: 'wttr-in',
    name: 'wttr.in',
    category: 'media',
    description: 'Terminalde hava durumu, kurulum gerekmez ama curl lazım.',
    exampleCommand: 'curl wttr.in/Istanbul',
    exampleOutput: `Weather report: Istanbul
      \\   /     Clear
       .-.      +18 °C
    ― (   ) ―   ↗ 15 km/h`,
    install: {
      note: 'Kurulum gerekmez, curl yeterli.',
    },
    tips: [
      'curl wttr.in/Istanbul',
      'curl wttr.in/Istanbul?format=3',
      'curl wttr.in/Moon',
    ],
    warning:
      'Üçüncü taraf ücretsiz bir servis; konum yazmazsan IP adresine göre konum tahmin edilir; internet gerekir.',
    sourceUrl: 'https://github.com/chubin/wttr.in',
  },
  {
    id: 'fastfetch',
    name: 'fastfetch',
    category: 'system',
    replaces: 'neofetch',
    description: 'Sistem bilgisini şık biçimde gösterir.',
    exampleCommand: 'fastfetch',
    exampleOutput: `OS: Linux x86_64
Host: PC
Kernel: 6.x
Uptime: 2 hours
Memory: 1.45 GiB / 8.00 GiB`,
    install: {
      debian: 'sudo apt install fastfetch',
      fedora: 'sudo dnf install fastfetch',
      arch: 'sudo pacman -S fastfetch',
      note: 'apt ile doğrudan kurulum Debian 13 ve Ubuntu 25.04+ için geçerli; eski Ubuntu\'da önce sudo add-apt-repository ppa:zhangsongcui3371/fastfetch, sonra sudo apt update ve sudo apt install fastfetch.',
    },
    warning:
      'Neofetch Nisan 2024\'te arşivlendi, fastfetch devamı sayılır. Ekran görüntüsü paylaşırsan yerel IP adresin görünebilir.',
    sourceUrl: 'https://github.com/fastfetch-cli/fastfetch',
  },
  {
    id: 'btop',
    name: 'btop',
    category: 'system',
    description: 'İşlemci, bellek, disk, ağ ve işlemleri renkli grafiklerle gösteren sistem izleyici.',
    exampleCommand: 'btop',
    exampleOutput: `CPU 42% [||||||||        ]  Mem 3.2G/8G [||||||||||||    ]
Disks: / 24G/100G [||||        ]
Processes: 142 total, 1 running`,
    install: {
      debian: 'sudo snap install btop',
      arch: 'sudo pacman -S btop',
      note: "Bu komut Ubuntu içindir (snap gerekir); Debian'da varsayılan olarak snap gelmez.",
    },
  },
  {
    id: 'ncdu',
    name: 'ncdu',
    category: 'system',
    description: 'Hangi klasörün diskte ne kadar yer kapladığını boyuta göre sıralı gösterir (du\'nun etkileşimli hali).',
    exampleCommand: 'ncdu',
    exampleOutput: `--- /home/kullanici ---
   1.2 GiB [##########] /Downloads
 450.0 MiB [###       ] /Documents
 120.0 MiB [#         ] /Pictures`,
    install: {
      debian: 'sudo apt install ncdu',
      fedora: 'sudo dnf install ncdu',
      arch: 'sudo pacman -S ncdu',
    },
  },
  {
    id: 'ripgrep',
    name: 'ripgrep',
    category: 'files',
    replaces: 'grep',
    description: 'Çok hızlı arama, .gitignore\'u dikkate alır. Komut adı rg.',
    exampleCommand: 'rg "TODO"',
    exampleOutput: `src/index.ts:15: // TODO: refactor
src/utils.ts:42: // TODO: validation`,
    install: {
      debian: 'sudo apt install ripgrep',
      fedora: 'sudo dnf install ripgrep',
      arch: 'sudo pacman -S ripgrep',
    },
    sourceUrl: 'https://github.com/BurntSushi/ripgrep',
  },
  {
    id: 'fd',
    name: 'fd',
    category: 'files',
    replaces: 'find',
    description: 'Basit ve hızlı dosya arama.',
    exampleCommand: 'fd ".txt"',
    exampleOutput: `notlar.txt
belgeler/rehber.txt
yedek/liste.txt`,
    install: {
      debian: 'sudo apt install fd-find',
      fedora: 'sudo dnf install fd-find',
      arch: 'sudo pacman -S fd',
      note: 'Debian/Ubuntu\'da komut adı fdfind olabilir.',
    },
    sourceUrl: 'https://github.com/sharkdp/fd',
  },
  {
    id: 'bat',
    name: 'bat',
    category: 'files',
    replaces: 'cat',
    description: 'Sözdizimi renklendirmesi, satır numarası ve git işaretleri.',
    exampleCommand: 'bat dosya.py',
    exampleOutput: `───────┬────────────────────────
       │ File: dosya.py
───────┼────────────────────────
   1   │ def merhaba():
   2   │     print("merhaba")
───────┴────────────────────────`,
    install: {
      debian: 'sudo apt install bat',
      fedora: 'sudo dnf install bat',
      arch: 'sudo pacman -S bat',
      note: 'Debian/Ubuntu\'da komut adı batcat olabilir.',
    },
    sourceUrl: 'https://github.com/sharkdp/bat',
  },
  {
    id: 'eza',
    name: 'eza',
    category: 'files',
    replaces: 'ls',
    description: 'Renkler, simgeler ve git bilgisiyle ls.',
    exampleCommand: 'eza -l',
    exampleOutput: `.rw-r--r-- 1.2k kullanici 25 Nov 00:00 notlar.txt
drwxr-xr-x    - kullanici 25 Nov 00:00 projeler`,
    install: {
      debian: 'sudo apt install eza',
      fedora: 'sudo dnf install eza',
      arch: 'sudo pacman -S eza',
      note: 'Eski dağıtım sürümlerinde paket olmayabilir.',
    },
    warning: 'Eskiden önerilen exa projesinin bakımı bırakıldı, eza onun devamıdır; "exa" kurma.',
  },
  {
    id: 'fzf',
    name: 'fzf',
    category: 'files',
    description:
      'Bulanık (fuzzy) arama aracı, listeyi yazdıkça filtreler. Kabuk entegrasyonu açılırsa Ctrl+R ile komut geçmişinde de arar.',
    exampleCommand: 'fzf',
    exampleOutput: `> src/
  src/index.ts
  src/styles.css
  package.json
  3/3`,
    install: {
      debian: 'sudo apt install fzf',
      fedora: 'sudo dnf install fzf',
      arch: 'sudo pacman -S fzf',
    },
  },
  {
    id: 'tldr',
    name: 'tldr',
    category: 'productivity',
    description: 'man sayfalarının kısa, örnekli özeti.',
    exampleCommand: 'tldr tar',
    exampleOutput: `tar
Archiving utility.

- Create an archive:
  tar -cf archive.tar file1 file2

- Extract an archive:
  tar -xf archive.tar`,
    install: {
      debian: 'sudo apt install tldr',
      fedora: 'sudo dnf install tldr',
    },
  },
  {
    id: 'tmux',
    name: 'tmux',
    category: 'productivity',
    description: 'Tek terminalde birden fazla bölme ve oturum, bağlantı kopsa bile oturumu korur.',
    exampleCommand: 'tmux',
    exampleOutput: '[0] 0:bash* "kullanici@host"',
    install: {
      debian: 'sudo apt install tmux',
      fedora: 'sudo dnf install tmux',
      arch: 'sudo pacman -S tmux',
    },
    tips: [
      'Ayrılmak için Ctrl+b sonra d',
      'Geri dönmek için: tmux attach',
    ],
  },
  {
    id: 'cmatrix',
    name: 'cmatrix',
    category: 'fun',
    description: 'Matrix filmindeki yağan kod animasyonu.',
    exampleCommand: 'cmatrix',
    exampleOutput: `0  1  0  1  0
1  0  1  1  0
0  1  0  0  1`,
    install: {
      debian: 'sudo apt install cmatrix',
      fedora: 'sudo dnf install cmatrix',
      arch: 'sudo pacman -S cmatrix',
    },
    warning: 'İşlemciyi yorabilir; Ctrl+C ile çık.',
  },
  {
    id: 'cowsay-figlet-lolcat',
    name: 'cowsay + figlet + lolcat',
    category: 'fun',
    description: 'Yazıyı inek konuşturur, büyük ASCII başlık yapar, gökkuşağı renklendirir.',
    exampleCommand: 'cowsay "Merhaba"',
    exampleOutput: ` ___________
< Merhaba >
 -----------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`,
    install: {
      debian: 'sudo apt install cowsay figlet lolcat',
      fedora: 'sudo dnf install cowsay figlet lolcat',
      arch: 'sudo pacman -S cowsay figlet',
    },
    tips: [
      'cowsay "Merhaba"',
      'figlet KLU',
      'figlet KLU | lolcat',
      '| işareti ileride gelecek Seviye 2\'de anlatılacak.',
    ],
  },
  {
    id: 'sl',
    name: 'sl',
    category: 'fun',
    description: 'ls yerine yanlışlıkla sl yazarsan ekrandan bir buharlı tren geçer.',
    exampleCommand: 'sl',
    exampleOutput: `==== o O ===~
  (@@@@@@@@)`,
    install: {
      debian: 'sudo apt install sl',
      fedora: 'sudo dnf install sl',
      arch: 'sudo pacman -S sl',
    },
  },
];
