# KLU Çoklu Dil ve Yerelleştirme Rehberi

Bu belge KLU'da mevcut Türkçe (`tr`, varsayılan) ve İngilizce (`en`) desteğinin mimarisini ve yeni dil ekleme standardını tanımlar. Kodda olmayan bir özelliği varmış gibi varsaymaz; yeni dil çalışması bu rehberdeki adımları uygulamalı ve mimariyi gerektiğinde genişletmelidir.

## Temel ilkeler

- Türkçe ve İngilizce aynı müfredatın iki dilde sunumudur. Yeni dilde eğitim hedefleri ve öğrenme sırası korunur.
- Diller arasında ders, bölüm, görev veya örnek eksikliği bırakılmaz.
- Çeviri doğal ve doğru olmalı; cümlelerin kelime kelime eşleşmesi gerekmez.
- Eğitimsel içerikte yapılan değişiklik diğer dillerde de karşılanmalı; görev doğrulamasının öğretmek istediği davranış değişmeden kalmalıdır.
- Kullanıcıya görünen hiçbir metin farkında olmadan başka dilde kalmamalıdır. Teknik sabitler, gerçek komutlar ve kullanıcı verisi bu kuraldan ayrı değerlendirilir.

## Mevcut mimari

- `src/i18n/types.ts`, `Lang` türünü, `SUPPORTED_LANGS` listesini (`tr`, `en`) ve varsayılan dili (`tr`) tanımlar. Dil eklemek için tip ve desteklenen dil listesini güncellemek gerekir.
- `src/i18n/I18nProvider.tsx` React context üzerinden `lang`, `setLang` ve `t` sağlar. `src/i18n/translate.ts`, `src/i18n/dictionaries/tr.ts` ve `src/i18n/dictionaries/en.ts` arayüz sözlüklerini yönetir. Anahtar yolu noktalı biçimdedir; eksik İngilizce anahtar Türkçe'ye, her iki sözlükte eksik anahtar ise anahtar metnine düşer. Bu geri dönüşler çeviri tamamlanmışlığı sayılmaz.
- `src/i18n/storage.ts`, dili `klu_lang` anahtarıyla localStorage'da saklar, geçersiz/eksik değerde `tr` kullanır ve `<html lang>`, belge başlığını ve mevcut açıklama/Open Graph/Twitter meta alanlarını günceller.
- Türkçe Linux ve Git temel içerikleri `src/lessons/content/` ve `src/git/` altındadır. İngilizce karşılıklar `src/i18n/content/en/lessons.ts`, `gitLessons.ts`, `gitIntro.ts`, `cheatsheet.ts`, `explore.ts` ve `commandDocs.ts` dosyalarındaki overlay/catalog verileridir. `src/i18n/localize.ts` bu verileri temel içeriklerle birleştirir. Görev kimlikleri, görev sırası ve `check` doğrulaması temel ders verisinden gelir; lokalize görev metinleri overlay'den alınır. Görev doğrulama mantığı dile göre yeniden yazılmamalıdır.
- İngilizce içerik kapsamı tam katalog olarak test edilir; yine de `localize.ts` kimi alanlarda kaynak metin veya fixture dönüşümüne geri düşebilir. Bir katalog alanı eksikse bunu tamamlamak gerekir; fallback'i çeviri yerine kullanmayın.
- `src/i18n/fixtureLocale.ts`, sanal dosya/klasör adları, sanal fixture metinleri, yollar, Git görev kontrolleri ve bazı hata metinleri için mevcut TR/EN dönüşüm çiftlerini içerir. Komut adlarını ve sözdizimini korumaya yönelik davranışlar `src/core/shell/Shell.ts` ile birlikte çalışır.
- Shell dili `Shell.lang` üzerinden taşınır. `LANG`, `USER`, `LOGNAME`, `HOME`, `PWD` (ve mevcutsa `OLDPWD`), prompt kullanıcı adı, sanal ad/yol gösterimi ve `ls` tarih ayı görünümü dile göre güncellenir. Yerelleştirilmiş sanal yol takma adları komut girdisinde iç sanal yola çözümlenir. Komut dokümanları `getCommandDoc` ile; shell hata çıktısının bilinen parçaları `localizeCommandError` ile yerelleştirilir. Bu mekanizmalar tüm olası dış metinler için genel bir çeviri sistemi değildir.
- Git'in simüle edilmiş komut çıktıları `src/core/commands/git.ts` ve Git motorundadır. Simüle Git çıktısı ile KLU arayüzünün kendi mesajını ayırt edin: komut çıktısını ancak eğitim/çıktı beklentisiyle uyumlu ve kapsamı açıkça ele alınmışsa değiştirin; uygulama bildirimlerini UI sözlüklerinde tutun. Komut adları, seçenekler, URL'ler ve Git sözdizimi sabit kalır.
- Cheat Sheet temel verisi `src/cheatsheet/data.ts`, Explore temel verisi `src/explore/data.ts` içindedir; İngilizce katalogları ve dönüştürme `src/i18n/content/en/` ve `localize.ts` içindedir. Explore araçlarının gerçek sistem kurulum notları ve örnek çıktıları da kullanıcıya görünen içeriktir.
- Dil seçici `src/components/LanguageSwitcher.tsx` içindedir. TR/EN düğmeleri context dilini değiştirir; `LanguageProvider` tercihi saklar. Ders ve Git workspace bileşenleri içerikleri seçili dile göre yeniden yerelleştirir. Dil değişiminde dosya sistemi/progress sıfırlanmamalıdır.
- Tamamlama ve tebrik metinleri hem `dictionaries/tr.ts`/`en.ts` içindeki terminal ve ders paneli anahtarlarında hem de `src/components/CongratsModal.tsx` arayüzünde yer alır. Yeni dil bütün bu yüzeyleri kapsamalıdır.

## Ders içeriği tutarlılığı

Her Linux ve Git dersi için aşağıdakileri iki dilde karşılaştırın:

- Ders başlığı, seviye/bölüm başlığı ve alt başlıklar
- Özetler, açıklamalar, bilgi kutuları, karşılama kartları ve tablolar
- Kod bloklarının çevresindeki açıklamalar; komut, seçenek, dosya yolu ve kodun kendisi doğru ve çalışır kalmalı
- Örnek komutların sayısı ve sırası
- Görev kimlikleri, görev sayısı ve sırası
- Görev açıklamaları, ipuçları ve çözümleri
- Tamamlama bildirimi ve sonraki adıma yönlendirme

Cümleleri birebir eşitlemeyin; bilgi, kavram, zorluk ve öğrenme hedefini eşitleyin. Yapısal biçim (başlıklar, tablolar, kod blokları, callout'lar, kartlar) korunmalı. Görev kontrolü metinden bağımsız test edilmeli ve iki dilde de aynı amaca hizmet etmelidir.

## Arayüz yerelleştirmesi

Sözlük kapsamını yalnızca ana ekran metinleriyle sınırlamayın. Menü/navigasyon, butonlar, modal başlıkları ve eylemleri, bildirimler, başarı/hata metinleri, tooltip'ler, `aria-label`/erişilebilirlik adları, boş durumlar, ilerleme göstergeleri, tebrik ekranları, sayfa başlığı ve meta açıklamalarını kontrol edin. React bileşenlerinde görünen metinleri sözlük anahtarı veya içerik localization katmanından geçirin. Her dilde aynı işlev ve bağlam korunmalı.

## Terminal ve Shell

- `LANG`, `USER`, `LOGNAME`, `HOME`, `PWD`, prompt biçimi ve sanal dosya/klasör adlarının TR/EN gösterimini birlikte kontrol edin. Dil değişiminde aynı sanal dosyalar, komut geçmişi ve ilerleme kayıtları korunmalıdır.
- Hata ve başarı metinlerini kaynağına göre ayırın: Shell/uygulama mesajları, komut yardım metinleri, simüle Git çıktısı ve kullanıcı dosyasındaki içerik aynı şey değildir. `fixtureLocale.ts` içindeki dönüşüm listeleri seçici dönüşüm yapar; kullanıcı metnini gelişigüzel çevirmeyin.
- Tarih/ay adları, `ls` çıktısı ve sıralama gibi locale etkili davranışlar iki dilde kontrol edilmelidir. Yeni dil için uygun locale kodunu açıkça belirleyin.
- `ls`, `cd`, `git`, `--staged` gibi komut ve seçenekleri; komut sözdizimini; CLI/GUI gibi teknik kısaltmaları çevirmeyin. Komut çıktısında komutun kendisi ve çalıştırılabilir örnek bozulmamalıdır.
- Simüle Git çıktısında Git'in sabit/protokol benzeri satırları ile açıklayıcı doğal dil metnini ayırın. Eğitim içeriği bir çıktıyı birebir bekliyorsa, çeviri bunu farkında olmadan bozmasın; gerekirse kontrolü dile dayanıklı yapın.

## Teknik terminoloji

`src/i18n/content/` ve ders içeriklerinde aynı kavram için aynı karşılığı kullanın. Türkçe anlatımda yerleşik ve anlaşılır karşılık varsa kullanın; komut/ürün adlarını veya teknik anlamı bozacak zoraki çeviri yapmayın. İlk kullanımda gerekirse kısa açıklama ekleyin.

| Terim | KLU kullanım standardı |
|---|---|
| Terminal | Terminal; gerektiğinde “terminal penceresi” |
| Shell | Shell; ilk kullanımda komut yorumlayıcısı olarak açıklanabilir |
| Kernel | Kernel (çekirdek) |
| Command Line Interface (CLI) | Komut satırı arayüzü (CLI); sonrasında CLI |
| Graphical User Interface (GUI) | Grafik kullanıcı arayüzü (GUI); sonrasında GUI |
| Repository | Git bağlamında depo (repository); teknik cümlede repository kullanılabilir, aynı derste tutarlı olun |
| Commit | Commit; gerekirse “kaydedilmiş değişiklik anı” diye açıkla. Git komutundaki `commit` çevrilmez |
| Branch | Dal (branch); `git branch` komutu çevrilmez |
| Merge | Birleştirme (merge); komut `git merge` çevrilmez |

Yeni terim eklerken her iki dilde de karşılığı ve kullanım örneğini belirleyin; komut adıyla kavram adını birbirine karıştırmayın.

## Yeni dil ekleme kontrol listesi

Dil kodunu BCP 47 uyumlu, küçük harfli temel dil kodu olarak belirleyin (ör. `es`, `de`, `fr`); `Lang` ve `SUPPORTED_LANGS` mevcut iki değerle sınırlandığından yeni dil eklenmeden kod tarafı genişletilmelidir. Yeni dilin varsayılan yapılması ayrıca ürün kararıdır; mevcut varsayılan `tr` olarak kalır.

1. [ ] `src/i18n/` mimarisini, içerik akışını ve fallback davranışını inceleyin.
2. [ ] Yeni dilin arayüz sözlüğünü `src/i18n/dictionaries/` altında oluşturun; tür kapsamını ve `SUPPORTED_LANGS` listesini güncelleyin.
3. [ ] Menü, navigasyon, buton, modal, tooltip, erişilebilirlik ve meta arayüz metinlerini tamamlayın.
4. [ ] `src/lessons/content/` müfredatıyla eşleşen bütün Linux ders overlay'lerini ve seviyeleri tamamlayın.
5. [ ] `src/git/lessons/` ve Git giriş içeriğiyle eşleşen Git derslerini/başlıklarını tamamlayın.
6. [ ] Terminal ve Shell yerelleştirmesini tamamlayın: ortam değişkenleri, prompt, sanal ad/yollar, yardım, tarih ve hata mesajları.
7. [ ] Cheat Sheet ve Explore kategori, açıklama, ipucu, not ve örneklerini tamamlayın.
8. [ ] Modal, bildirim, ders/görev tamamlama ve tebrik mesajlarını tamamlayın.
9. [ ] Dil seçicide etiketleri ekleyin; değişimde içerik ve `<html lang>` güncellenirken dosya sistemi, geçmiş ve ilerlemenin korunduğunu doğrulayın.
10. [ ] Yeni dil için sözlük kapsamı, ders/görev kimliği-sayısı ve içerik yapısı eşitliği testleri ekleyin.
11. [ ] Tüm testleri, typecheck ve build işlemlerini çalıştırın (`npm test`, `npm run build`; build TypeScript kontrolünü de çalıştırır).
12. [ ] Arayüz ve içerik yüzeylerinde çevrilmemiş/yanlış dilde kalan metin olmadığını elle ve testlerle doğrulayın; teknik sabitleri kapsam dışı sanıp kontrolü atlamayın.

## Test standartları

Mevcut testler için temel referanslar: `src/i18n/coverage.test.ts`, `lessonStructure.test.ts`, `localize.test.ts`, `translate.test.ts`, `storage.test.ts`, `src/core/shell/i18n.test.ts`, `src/components/LanguageSwitcher.test.tsx`, `src/components/CongratsModal.test.tsx`, `src/state/congrats.test.ts`, `src/git/lessons/gitLessons.test.ts`, `src/lessons/validator.test.ts` ve `src/explore/data.test.ts`. Test kapsamı yeni dilde de şu kontrolleri içermelidir:

- [ ] Sözlük anahtarlarının aynı kapsamda olması; boş/eksik çevirinin fallback ile gizlenmemesi.
- [ ] Linux/Git ders, seviye ve görev kimliklerinin, görev sırası ve sayılarının, örnek sayılarının eşit olması.
- [ ] Ders yapısının ve öğrenme hedeflerinin karşılaştırılması; başlık, tablo, kod bloğu ve callout yapısının korunması.
- [ ] Her görev kontrolünün gerçek Shell akışında, beklenen çözüm ve geçerli varyantlarla çalışması.
- [ ] Git derslerinin komut akışı, simüle çıktı ve görev kontrollerinin iki dilde denenmesi.
- [ ] Terminal yardım, hata/başarı çıktısı, ortam değişkenleri, prompt, sanal adlar ve tarihin test edilmesi.
- [ ] Dil değişiminde sanal dosya sistemi, komut geçmişi ve Linux/Git ilerleme kayıtlarının korunması.
- [ ] Dil seçici, `<html lang>`, başlık/meta alanları ile ders tamamlanma ve tebrik ekranlarının doğrulanması.
- [ ] Cheat Sheet ve Explore içeriklerinin kayıtlı kategori/öğe kimlikleri ve kapsamıyla karşılaştırılması.

Testlerde çevirinin varlığını kontrol etmekle yetinmeyin: doğru UI yüzeyine ulaştığını, gerçek shell komutunun çalıştığını ve dil değiştirmenin kullanıcı verisini değiştirmediğini doğrulayın.

## Gelecekteki diller

İspanyolca, Almanca veya Fransızca eklemek mevcut `Lang` birliğini, sözlükleri ve İngilizce overlay düzenini ölçeklendirmeyi gerektirir. Bugünkü mimari yalnızca `tr` ve `en` desteğini tanımlar; başka dilin seçilebilir ya da tamamlanmış olduğu varsayılmaz. Yeni dil eklendiğinde her katalog, fixture ad/metin dönüşümleri, hata eşlemeleri, locale biçimlendirmesi, seçici ve test kapsamı açıkça eklenmelidir. Yerelleştirme davranışı dil sayısına bağlı sabit `if en` dallarına yayılıyorsa, genişletmeden önce eşlemeyi dile göre yapılandırılabilir hale getirin; bunu mevcut özellik gibi belgelemeyin.
