export interface ExploreTool {
  id: string;
  name: string;
  summary: string;
  description: string;
  installCommand: string;
  exampleCommand: string;
  exampleOutput: string;
  warning?: string;
}

export const EXPLORE_TOOLS: ExploreTool[] = [
  {
    id: 'yt-dlp',
    name: 'yt-dlp',
    summary: 'Gelişmiş komut satırı video ve ses indiricisi (youtube-dl çatallaması)',
    description:
      'YouTube ve yüzlerce farklı video platformundan video veya yalnızca ses akışlarını en yüksek kalitede indirmenizi, format dönüştürmenizi sağlayan popüler bir CLI aracıdır.',
    installCommand: 'sudo apt install yt-dlp   # veya: pip install yt-dlp',
    exampleCommand: 'yt-dlp -f "bestvideo+bestaudio" "https://www.youtube.com/watch?v=kendi_videonuz"',
    exampleOutput: `[youtube] Extracting URL: https://www.youtube.com/watch?v=kendi_videonuz
[youtube] kendi_videonuz: Downloading webpage
[youtube] kendi_videonuz: Downloading ios player API JSON
[info] kendi_videonuz: Downloading 1 format(s): 137+140
[download] Destination: Videom [kendi_videonuz].f137.mp4
[download] 100% of   45.20MiB in 00:00:03 at 14.82MiB/s
[download] Destination: Videom [kendi_videonuz].f140.m4a
[download] 100% of    4.10MiB in 00:00:00 at 8.90MiB/s
[Merger] Merging formats into "Videom [kendi_videonuz].mp4"
Deleting original file Videom [kendi_videonuz].f137.mp4 (pass -k to keep)`,
    warning:
      'Önemli Uyarı: Telif hakkı ile korunan içerikleri izinsiz indirmek ilgili platformun hizmet şartlarına ve yerel yasalara aykırı olabilir. Komutu test ederken yalnızca kendi oluşturduğunuz videoları veya kamu malı / Creative Commons lisanslı serbest içerikleri kullanınız.',
  },
  {
    id: 'fastfetch',
    name: 'fastfetch',
    summary: 'C ile yazılmış, son derece hızlı ve modern sistem bilgi aracı',
    description:
      'Neofetch gibi sistem donanımı, dağıtımı, çekirdek sürümü ve bellek kullanımını şık bir ASCII logosuyla birlikte terminalde gösteren ultra hızlı bir araçtır.',
    installCommand: 'sudo apt install fastfetch',
    exampleCommand: 'fastfetch',
    exampleOutput: `       _,met$$$$$gg.          kullanici@klu
    ,g$$$$$$$$$$$$$$$P.       ---------------
  ,g$$P"     """Y$$.".        OS: Debian GNU/Linux 12 (bookworm) x86_64
 ,$$P'              \`$$$.     Host: KVM/QEMU (Standard PC)
',$$P       ,ggs.     \`$$b:   Kernel: 6.1.0-20-amd64
\`d$$'     ,$P"'   .    $$$    Uptime: 2 days, 4 hours, 12 mins
 $$P      d$'     ,    $$P    Packages: 1420 (dpkg)
 $$:      $$.   -    ,d$$'    Shell: bash 5.2.15
 $$;      Y$b._   _,d$P'      Terminal: xterm-256color
 Y$$.    \`."Y$$$$P"'          CPU: AMD EPYC 7763 (4) @ 2.445GHz
 \`$$b      "-.__              GPU: Red Hat, Inc. Virtio GPU
  \`Y$$                        Memory: 1.45 GiB / 7.76 GiB (18%)
   \`$$b.                      Disk (/): 18.2 GiB / 48.0 GiB (38%)
     \`Y$$b.                   Locale: tr_TR.UTF-8
        \`"Y$b._
            \`"""`,
  },
  {
    id: 'tldr',
    name: 'tldr',
    summary: 'Uzun man sayfalarına pratik, topluluk odaklı komut örnekleri',
    description:
      'Karmaşık ve yüzlerce sayfalık Linux man sayfalarını okumak yerine, bir komutun günlük hayatta en çok kullanılan 4-5 pratik kullanım senaryosunu hızlıca sunar.',
    installCommand: 'sudo apt install tldr   # veya: npm install -g tldr',
    exampleCommand: 'tldr tar',
    exampleOutput: `tar

Arşivleme yardımcı programı.
Çoğunlukla gzip veya bzip2 gibi bir sıkıştırma yöntemiyle birlikte kullanılır.
Daha fazla bilgi için: https://www.gnu.org/software/tar/manual.

- Bir arşiv oluştur ve bunu bir dosyaya yaz:
  tar cf hedef.tar yol/dosya1 yol/dosya2 ...

- Gzip ile sıkıştırılmış bir arşiv oluştur:
  tar czf hedef.tar.gz yol/dosya1 yol/dosya2 ...

- Bir arşivin içeriğini geçerli dizine çıkart:
  tar xf kaynak.tar[.gz|.bz2|.xz]

- Arşivin içeriğini ayrıntılı şekilde listele:
  tar tvf kaynak.tar`,
  },
];
