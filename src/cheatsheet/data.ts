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
        description: 'Bulunduğun çalışma dizininin tam (mutlak) yolunu gösterir.',
        example: 'pwd',
      },
      {
        command: 'cd',
        description: 'Dizinler arasında geçiş yapar (.. üst dizin, ~ ev dizini, - önceki dizin).',
        example: 'cd Belgeler',
      },
    ],
  },
  {
    title: 'Dosya ve Dizin Listeleme',
    items: [
      {
        command: 'ls',
        description: 'Dizin içeriğini listeler (-l ayrıntılı liste, -a gizli dosyalar).',
        example: 'ls -la',
      },
    ],
  },
  {
    title: 'Oluşturma ve Yazma',
    items: [
      {
        command: 'mkdir',
        description: 'Yeni dizin (klasör) oluşturur (-p iç içe dizinler açar).',
        example: 'mkdir -p projeler/2026',
      },
      {
        command: 'touch',
        description: 'Boş dosya oluşturur veya dosya zaman damgasını günceller.',
        example: 'touch notlar.txt',
      },
      {
        command: 'echo',
        description: 'Verilen metni ekrana (veya yönlendirmeyle dosyaya) yazar.',
        example: 'echo "Merhaba Linux"',
      },
    ],
  },
  {
    title: 'Dosya Okuma ve İnceleme',
    items: [
      {
        command: 'cat',
        description: 'Dosya içeriğini ekrana yazdırır veya dosyaları birleştirir (-n satır numaralı).',
        example: 'cat -n merhaba.txt',
      },
      {
        command: 'head',
        description: 'Dosyanın ilk satırlarını gösterir (-n satır sayısı).',
        example: 'head -n 5 /etc/passwd',
      },
      {
        command: 'tail',
        description: 'Dosyanın son satırlarını gösterir (-n satır sayısı, -n +N).',
        example: 'tail -n 3 /var/log/syslog',
      },
      {
        command: 'wc',
        description: 'Satır, kelime ve bayt sayısını hesaplar (-l satır, -w kelime).',
        example: 'wc -l Belgeler/alisveris.txt',
      },
    ],
  },
  {
    title: 'Metin ve Dosya Arama',
    items: [
      {
        command: 'grep',
        description: 'Metin içinde desen arar (-i harf duyarsız, -n satır no, -r alt dizinler).',
        example: 'grep -i "error" /var/log/syslog',
      },
      {
        command: 'find',
        description: 'Dizin hiyerarşisinde dosya veya klasör arar (-name ad, -type f/d).',
        example: 'find . -name "*.txt"',
      },
    ],
  },
  {
    title: 'Sıralama ve Düzenleme',
    items: [
      {
        command: 'sort',
        description: 'Satırları alfabetik veya sayısal sıralar (-r ters, -n sayısal, -u tekil).',
        example: 'sort -n puanlar.txt',
      },
      {
        command: 'uniq',
        description: 'Ardışık tekrar eden satırları ayıklar (-c sayımlı, -d tekrarlananlar).',
        example: 'sort liste.txt | uniq -c',
      },
    ],
  },
  {
    title: 'Kopyalama ve Taşıma',
    items: [
      {
        command: 'cp',
        description: 'Dosya ve dizinleri kopyalar (-r dizin kopyalamak için zorunludur).',
        example: 'cp -r Belgeler Belgeler_yedek',
      },
      {
        command: 'mv',
        description: 'Dosya veya dizinleri taşır ya da yeniden adlandırır.',
        example: 'mv taslak.txt son.txt',
      },
    ],
  },
  {
    title: 'Silme İşlemleri',
    items: [
      {
        command: 'rm',
        description: 'Dosya ve dizinleri siler (-r dizin içeriğiyle siler, -f sormadan siler).',
        example: 'rm -rf cop_dizini',
      },
    ],
  },
  {
    title: 'Yardım ve Oturum Yönetimi',
    items: [
      {
        command: 'help',
        description: 'Kullanılabilir kabuk komutlarının kısa özetini gösterir.',
        example: 'help',
      },
      {
        command: 'man',
        description: 'Bir komutun ayrıntılı kılavuz (manual) sayfasını açar.',
        example: 'man ls',
      },
      {
        command: 'clear',
        description: 'Terminal ekranını temizler (kısayol: Ctrl+L).',
        example: 'clear',
      },
      {
        command: 'history',
        description: 'Daha önce çalıştırılan komutların listesini döker.',
        example: 'history',
      },
    ],
  },
];
