import type { Lesson } from '../../types';

export const howKluWorksLesson: Lesson = {
  id: 'l0-klu-works',
  title: 'KLU Nasıl Çalışır?',
  summary: 'Tarayıcı içi simülasyon, güvenli ortam, ders paneli, ipuçları ve çözüm akışı.',
  content: `
### KLU'nun Adı Nereden Geliyor?
KLU adı, Tron filmindeki yapay zekâ programı CLU'dan esinlenildi. CLU nasıl yaratıcısı için dijital bir dünya kurup yönetiyorsa, KLU da senin için güvenli bir terminal dünyası kuruyor ve gerçek bilgisayarına hiç dokunmadan Linux öğrenmeni sağlıyor. İsimdeki K, Türkçe "komut" kelimesinden geliyor.

### Tarayıcıda Güvenli Bir Laboratuvar
KLU; harici bir sunucuya veya kuruluma gerek kalmadan, tamamen tarayıcının belleğinde çalışan **sanal bir dosya sistemi ve komut kabuğudur**.
- **Güvenli Ortam:** Dosya silmekten veya yanlış komut çalıştırmaktan korkmana gerek yoktur; her şey güvenli ve izoledir. Ancak unutma: bu güvence sadece KLU için geçerlidir, gerçek Linux'ta \`rm\` komutu kalıcıdır ve geri dönüşü (çöp kutusu) yoktur.
- **Dosyalar ve İlerleme:** Terminaldeki dosyalar gerçek bilgisayarında oluşmaz; sadece ilerleme bilgisi tarayıcında (\`localStorage\`) saklanır. Tarayıcı verilerini silersen veya başka bir cihaza geçersen ilerleme sıfırlanır. Serbest Mod'daki sanal dosya sistemi ise tamamen bellek içindedir (in-memory) ve sayfa yenilendiğinde sıfırlanarak başlangıç haline döner.

### Ders Paneli ve Görevler
- **Sol Panel:** Konu anlatımı, örnek komutlar ve tamamlaman gereken görevleri gösterir.
- **Örnek Komutlar:** Anlatım altındaki komut düğmelerine tıklayarak doğrudan terminale aktarabilirsin.
- **İpuçları:** Bir görevde yanlış bir komut denediğinde kademeli ipuçları açılır. 3 başarısız denemeden sonra **Çözümü göster** düğmesi belirir.
- **Yeniden Başlatma:** Bir şeyler karışırsa sol panelin altındaki **↺ Terminali sıfırla** düğmesiyle dosya sistemini dersin başlangıç durumuna döndürebilirsin.
`,
  examples: ['pwd', 'echo Deneme'],
  tasks: [
    {
      id: 'l0-pwd',
      description: 'Hangi dizinde olduğunu görmek için çalışma dizinini yazdıran `pwd` komutunu çalıştır.',
      hints: ['Terminal satırına `pwd` yaz ve Enter tuşuna bas.'],
      solution: 'pwd',
      check: { type: 'commandUsed', command: 'pwd' },
    },
  ],
};
