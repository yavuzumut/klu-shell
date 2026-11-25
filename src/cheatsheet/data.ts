export interface CheatItem {
  command: string;
  description: string;
  example: string;
}

export interface CheatCategory {
  title: string;
  items: CheatItem[];
}

export const CHEAT_SHEET_DATA: CheatCategory[] = [
  {
    title: 'Gezinme ve Konum',
    items: [
      {
        command: 'pwd',
        description: 'Bulunduğun çalışma dizininin tam yolunu gösterir.',
        example: 'pwd',
      },
      {
        command: 'cd',
        description: 'Klasörler arasında geçiş yapar (.. üst, ~ ev, - önceki).',
        example: 'cd Belgeler',
      },
      {
        command: 'realpath',
        description: 'Göreceli yolu mutlak (tam) yola çevirir.',
        example: 'realpath ..',
      },
      {
        command: 'basename',
        description: 'Yolun sonundaki dosya adını ayıklar.',
        example: 'basename /a/b.txt',
      },
    ],
  },
  {
    title: 'Dosya ve Dizin Listeleme',
    items: [
      {
        command: 'ls',
        description: 'Klasör içeriğini listeler (-l ayrıntılı, -a gizli dosyalar).',
        example: 'ls -la',
      },
    ],
  },
  {
    title: 'Oluşturma ve Yazma',
    items: [
      {
        command: 'mkdir',
        description: 'Yeni klasör oluşturur (-p iç içe klasörler açar).',
        example: 'mkdir -p proje/src',
      },
      {
        command: 'touch',
        description: 'Boş dosya açar veya dosya zaman damgasını günceller.',
        example: 'touch not.txt',
      },
      {
        command: 'echo',
        description: 'Verilen metni ekrana (veya yönlendirmeyle dosyaya) yazar.',
        example: 'echo "Merhaba"',
      },
    ],
  },
  {
    title: 'Dosya Okuma ve İnceleme',
    items: [
      {
        command: 'cat',
        description: 'Dosya içeriğini ekrana yazdırır (-n satır numaralı).',
        example: 'cat -n not.txt',
      },
      {
        command: 'head',
        description: 'Dosyanın ilk satırlarını gösterir (-n satır sayısı).',
        example: 'head -n 5 log.txt',
      },
      {
        command: 'tail',
        description: 'Dosyanın son satırlarını gösterir (-n satır sayısı).',
        example: 'tail -n 3 log.txt',
      },
      {
        command: 'wc',
        description: 'Satır, kelime ve bayt sayısını hesaplar (-l satır).',
        example: 'wc -l not.txt',
      },
      {
        command: 'stat',
        description: 'Dosyanın boyut, izin ve tarih meta verilerini gösterir.',
        example: 'stat not.txt',
      },
    ],
  },
  {
    title: 'Metin ve Dosya Arama',
    items: [
      {
        command: 'grep',
        description: 'Metin içinde kelime arar (-i büyük/küçük harf duyarsız, -n satır no).',
        example: 'grep -i "hata" log.txt',
      },
      {
        command: 'find',
        description: 'Klasörler içinde dosya veya klasör arar (-name ad, -type f/d).',
        example: 'find . -name "*.txt"',
      },
    ],
  },
  {
    title: 'Sıralama ve Düzenleme',
    items: [
      {
        command: 'sort',
        description: 'Satırları alfabetik veya sayısal sıralar (-r ters, -n sayısal).',
        example: 'sort -n puan.txt',
      },
      {
        command: 'uniq',
        description: 'Ardışık tekrar eden satırları ayıklar (-c sayımlı).',
        example: 'sort a.txt | uniq -c',
      },
    ],
  },
  {
    title: 'İzinler ve Güvenlik',
    items: [
      {
        command: 'chmod',
        description: 'Dosya ve klasör erişim izinlerini değiştirir (sayısal veya +x).',
        example: 'chmod 755 betik.sh',
      },
    ],
  },
  {
    title: 'Sistem ve Kullanıcı Bilgisi',
    items: [
      {
        command: 'whoami',
        description: 'Şu an oturum açmış aktif kullanıcının adını gösterir.',
        example: 'whoami',
      },
      {
        command: 'uname',
        description: 'İşletim sistemi ve çekirdek bilgilerini yazdırır (-a hepsi).',
        example: 'uname -a',
      },
      {
        command: 'date',
        description: 'Sistem tarih ve saatini ekrana yazdırır.',
        example: 'date',
      },
    ],
  },
  {
    title: 'Ortam ve Değişkenler',
    items: [
      {
        command: 'env',
        description: 'Kayıtlı tüm ortam değişkenlerini listeler.',
        example: 'env | grep USER',
      },
      {
        command: 'export',
        description: 'Yeni ortam değişkeni tanımlar veya dışa aktarır.',
        example: 'export AD=KLU',
      },
      {
        command: 'which',
        description: 'Bir komutun çalıştırılabilir dosya yolunu bulur.',
        example: 'which ls',
      },
    ],
  },
  {
    title: 'Süreç Yönetimi',
    items: [
      {
        command: 'ps',
        description: 'Çalışan süreçleri ve PID numaralarını listeler (aux tümü).',
        example: 'ps aux',
      },
      {
        command: 'kill',
        description: 'Belirtilen PID numaralı süreci sonlandırır (-9 zorla).',
        example: 'kill -9 1420',
      },
    ],
  },
  {
    title: 'Kopyalama ve Taşıma',
    items: [
      {
        command: 'cp',
        description: 'Dosya ve klasörleri kopyalar (-r klasör kopyalamak için zorunlu).',
        example: 'cp -r Belge yedek',
      },
      {
        command: 'mv',
        description: 'Dosya veya klasörleri taşır ya da yeniden adlandırır.',
        example: 'mv eski.txt yeni.txt',
      },
    ],
  },
  {
    title: 'Silme İşlemleri',
    items: [
      {
        command: 'rm',
        description: 'Dosya ve klasörleri siler (-r klasör içeriğiyle, -f zorla).',
        example: 'rm -rf cop',
      },
    ],
  },
  {
    title: 'Yardım ve Oturum Yönetimi',
    items: [
      {
        command: 'help',
        description: 'Kullanılabilir komutların kısa özetini gösterir.',
        example: 'help',
      },
      {
        command: 'man',
        description: 'Bir komutun ayrıntılı kılavuz sayfasını açar.',
        example: 'man ls',
      },
      {
        command: 'clear',
        description: 'Terminal ekranını temizler (kısayol: Ctrl+L).',
        example: 'clear',
      },
      {
        command: 'history',
        description: 'Daha önce çalıştırılan komutların geçmişini döker.',
        example: 'history',
      },
    ],
  },
];
