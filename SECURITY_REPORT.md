# KLU Projesi — Güvenlik Analiz Raporu (SECURITY_REPORT.md)

**Tarih:** 24 Kasım 2026  
**Uygulama:** KLU (Web Tabanlı Linux & Terminal Simülatörü)  
**Kapsam:** İstemci tarafı kod tabanı (`src/`), yapılandırma dosyaları, bağımlılıklar ve Git geçmişi.  

---

## Yönetici Özeti ve Mimari Bağlam

KLU; sunucusu (backend), veritabanı, kullanıcı hesap sistemi veya uzaktan API/ağ çağrısı olmayan, **tamamen tarayıcı üzerinde çalışan statik bir tek sayfa uygulamasıdır (SPA)**. Tüm dosya sistemi operasyonları, kabuk komutları ve durum yönetimi istemci belleğinde (`in-memory`) ve `localStorage` üzerinde yürütülür.

Bu mimari bağlam nedeniyle, klasik web uygulamalarında görülen SQL Enjeksiyonu, Yetki Aşımı (Privilege Escalation), Sunucu Taraflı İstek Sahteciliği (SSRF) veya Kimlik Doğrulama Zafiyetleri bu projede geçerli değildir. Bu raporda önem dereceleri, uygulamanın statik ve sunucusuz yapısı göz önünde bulundurularak gerçekçi bir yaklaşımla derecelendirilmiştir.

---

## Bulgu Listesi ve Detaylı Analiz

### 1. Kabuk Glob Motorunda ReDoS ile Tarayıcı Sekmesini Kilitleme (DoS)
- **Önem:** Orta (İstemci Taraflı Servis Dışı Bırakma)
- **Durum:** **DOĞRULANDI**
- **Dosya:Satır:** `src/core/shell/glob.ts:8` (`globToRegExp` fonksiyonu)
- **Kısa Açıklama:** `globToRegExp` fonksiyonu, kabuk glob desenindeki her `*` karakterini doğrudan regex `.*` dizgisine dönüştürmektedir. Yan yana birden fazla yıldız karakteri (örn. `********************`) girildiğinde, üretilen düzenli ifade `^.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*$` şeklini almakta ve eşleşmeyen bir hedef metin üzerinde üstel geri izleme (catastrophic backtracking / ReDoS) meydana gelerek ana JavaScript iş parçacığını (UI thread) %100 CPU tüketimiyle kilitlemektedir.
- **Gerçekçi Saldırı Senaryosu:** Kullanıcı veya bir eğitim kopyala-yapıştır metni terminale `ls *************************x` veya `echo *************************x` yazdığında tarayıcı sekmesi tamamen donar, yanıt vermez hale gelir ve kullanıcı sekmeyi zorla kapatmak (force kill) zorunda kalır.
- **Yeniden Üretim Adımları:**
  1. KLU terminaline `ls *************************x` yazıp Enter'a basın.
  2. Tarayıcı sekmesinin olay döngüsü kilitlenecek ve tarayıcı "Sayfa yanıt vermiyor" uyarısı gösterecektir.
- **Önerilen Çözüm:** `globToRegExp` içinde desendeki ardışık yıldızlar tek yıldıza indirgenmelidir: `pattern = pattern.replace(/\*+/g, '*');`.

---

### 2. VirtualFS `children` Nesnesinde Prototype Pollution ve Hayalet Dosyalar
- **Önem:** Düşük
- **Durum:** **DOĞRULANDI**
- **Dosya:Satır:** `src/core/fs/VirtualFS.ts:57-58`, `src/core/fs/VirtualFS.ts:158`, `src/core/fs/VirtualFS.ts:222`, `src/core/fs/VirtualFS.ts:376`
- **Kısa Açıklama:** `DirNode` içindeki dizin çocukları (`children`), prototipi olmayan bir sözlük (`Object.create(null)`) veya `Map<string, FsNode>` yerine düz bir JavaScript nesnesi (`Record<string, FsNode> = {}`) olarak saklanmaktadır.
  1. `Object.prototype` üzerindeki yerleşik metot isimleri (`toString`, `valueOf`, `constructor`, `hasOwnProperty`) dizinde var gibi davranır: `fs.exists('/toString')` çağrısı `true` döner ve `fs.lookup('/toString')` yerel JavaScript fonksiyonunu bir düğüm gibi döndürür.
  2. Kullanıcı `touch __proto__` veya `echo evil > __proto__` çalıştırdığında `parent.children['__proto__'] = node` ataması yapılır. Bu atama o dizinin `children` nesnesinin prototipini `FileNode` olarak değiştirir. Bunun sonucunda `FileNode`'un alanları (`content`, `mtime`, `mode`, `owner`) o dizin altında otomatik olarak hayalet dosya gibi görünür (`fs.lookup('/content')` string değeri döner ve sonraki işlemlerde çökmeye sebep olur).
- **Gerçekçi Saldırı Senaryosu:** Terminalde bir komut çıktısını veya dosya adını `__proto__` olarak oluşturan bir kullanıcı, sanal dosya sisteminin lookup mekanizmasını bozar ve terminalin `cat`, `ls` veya `cd` komutlarında beklenmeyen TypeError hataları almasına neden olur.
- **Yeniden Üretim Adımları:**
  1. Terminalde `echo bozuk > /__proto__` çalıştırın.
  2. Ardından `cat /content` veya `cd /content` komutunu deneyin.
  3. `lookup('/content')` string nesnesi döndürdüğü için sistem çöker veya tutarsız davranır.
- **Önerilen Çözüm:** `VirtualFS` içinde dizin düğümleri oluşturulurken `children: Object.create(null)` kullanılmalı veya `children` yapısı `Map<string, FsNode>` tipine geçirilmelidir.

---

### 3. Özel Vurgu Renginde (customAccent) Format Doğrulaması Eksikliği ve CSS Enjeksiyonu Riski
- **Önem:** Düşük
- **Durum:** **DOĞRULANDI**
- **Dosya:Satır:** `src/themes/themeManager.ts:54-75`, `src/themes/themeManager.ts:136`
- **Kısa Açıklama:** `localStorage` üzerinde saklanan `klu_accent_<themeId>` değeri okunurken veya `setAccent` fonksiyonuna aktarılırken geçerli bir hex renk formatında (`/^#[0-9a-fA-F]{6}$/`) olup olmadığı denetlenmemektedir. Bu değer doğrudan `document.documentElement.style.setProperty('--accent', customAccent)` ile CSS değişkenine yazılmaktadır.
- **Gerçekçi Saldırı Senaryosu:** `customAccent` değeri modern CSS değişkeni olarak `color: var(--accent)` ve `background: var(--accent)` içinde kullanılır. Kötü niyetli bir bağlantı veya yerel veri manipülasyonu ile bu alana `url('https://saldırgan.com/log')` gibi bir değer yazılırsa, CSS arka plan yüklemesi tetiklenerek tarayıcının harici bir sunucuya GET isteği yapması (veri sızıntısı veya takip) teorik olarak tetiklenebilir.
- **Yeniden Üretim Adımları:**
  1. Tarayıcı konsolunda `localStorage.setItem('klu_accent_dark', 'red')` veya geçersiz bir metin yazıp sayfayı yenileyin.
  2. Herhangi bir hata veya doğrulama olmaksızın `--accent` değişkenine yazıldığı görülür.
- **Önerilen Çözüm:** `getCustomAccent` ve `saveCustomAccent` metotlarında katı bir regex kontrolü eklenmelidir: `const isValidHex = /^#[0-9a-fA-F]{6}$/.test(color);`. Geçersiz değerler `null` döndürülerek reddedilmelidir.

---

### 4. `dangerouslySetInnerHTML` ve `marked` Kullanımı (XSS Değerlendirmesi)
- **Önem:** Bilgi / Çok Düşük (Mevcut Durumda Güvenli, Gelecek İçin Tedbir Gerekir)
- **Durum:** **TEORİK**
- **Dosya:Satır:** `src/components/LessonPanel.tsx:44`, `src/components/LessonPanel.tsx:82`, `src/components/LessonPanel.tsx:93`
- **Kısa Açıklama:** `LessonPanel.tsx` içerisinde ders içeriği (`lesson.content`), görev açıklamaları (`task.description`) ve ipuçları (`task.hints`), `marked.parse()` ile HTML'e dönüştürülüp `dangerouslySetInnerHTML` ile DOM'a basılmaktadır. Kod tabanında herhangi bir HTML sanitizer (örn. DOMPurify) bulunmamaktadır.
- **Veri Kaynağı Analizi:** Yapılan incelemede, bu alanlara giren tüm metinlerin (`src/lessons/content/level0/*.ts` ve `level1/*.ts`) derleme zamanında (build time) statik olarak paketlendiği, URL parametrelerinden, sorgu dizgilerinden (query string), hash'ten veya kullanıcı girdilerinden hiçbir harici içeriğin buraya aktarılmadığı doğrulanmıştır. Dolayısıyla mevcut kod tabanında dışarıdan tetiklenebilir aktif bir XSS açığı **yoktur**.
- **Gerçekçi Saldırı Senaryosu:** İleride kullanıcıların kendi derslerini JSON/Markdown olarak içeri aktarmasına (import) veya URL üzerinden dinamik ders yüklenmesine izin verilirse, bu yol doğrudan XSS (Cross-Site Scripting) vektörüne dönüşecektir.
- **Önerilen Çözüm:** Savunma derinliği (defense-in-depth) prensibi gereği `marked.parse` çıktısı `DOMPurify.sanitize()` süzgecinden geçirilmeli veya `rehype-sanitize` gibi bir kütüphane eklenmelidir.

---

### 5. `index.html` İçerisinde Content Security Policy (CSP) Eksikliği
- **Önem:** Düşük
- **Durum:** **DOĞRULANDI**
- **Dosya:Satır:** `index.html:1-16`
- **Kısa Açıklama:** `index.html` dosyasında `Content-Security-Policy` meta etiketi tanımlanmamıştır. KLU tamamen çevrimdışı/istemci taraflı çalışan bir araç olduğundan, dış ağlara hiçbir istek yapmasına gerek yoktur. CSP bulunmaması, olası bir XSS veya stil enjeksiyonu durumunda dış sunuculara veri kaçırılmasını engelleyen güvenlik katmanını devre dışı bırakmaktadır.
- **Önerilen Çözüm:** `index.html` `<head>` bloğuna Vite'ın derlenmiş varlıkları ve inline tema stilleriyle uyumlu, dış ağ bağlantılarını tamamen kapatan şu CSP meta etiketi önerilir:
  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self';" />
  ```
  *(Not: `connect-src 'none';` kuralı uygulamanın sıfır-ağ mimarisini tarayıcı düzeyinde garanti altına alır.)*

---

### 6. `.gitignore` Dosyasında Çevre Değişkenleri (`.env`) ve Yerel Dosya Eksikliği
- **Önem:** Bilgi / Düşük
- **Durum:** **DOĞRULANDI**
- **Dosya:Satır:** `.gitignore:1-6`
- **Kısa Açıklama:** `.gitignore` dosyası yalnızca `node_modules`, `dist`, `*.log`, `.DS_Store` ve `*.tsbuildinfo` girdilerini içermektedir. `.env`, `.env.*` veya `*.local` gibi geliştirici ortam dosyaları `.gitignore` kapsamında değildir.
- **Mevcut Durum:** Git geçmişinde yapılan aramada herhangi bir `.env` dosyasının depoya girmemiş olduğu teyit edilmiştir. Ancak ileride bir geliştiricinin yanlışlıkla API anahtarı veya yerel yapılandırma yüklemesini önleyecek kural eksiktir.
- **Önerilen Çözüm:** `.gitignore` dosyasına `.env`, `.env.*`, `*.local` kuralları eklenmelidir.

---

### 7. Dosya Ağacından Tıklanan Dosya Adlarında Kabuk Metakarakteri Kaçışlama Eksikliği
- **Önem:** Düşük
- **Durum:** **DOĞRULANDI**
- **Dosya:Satır:** `src/App.tsx:219-228` (`handleTreeSelectPath`)
- **Kısa Açıklama:** Canlı dosya ağacında bir öğeye tıklandığında terminal satırına komut yazılmaktadır:
  ```typescript
  const pretty = activeShell.fs.prettyPath(path);
  const target = pretty.includes(' ') ? `"${pretty}"` : pretty;
  const cmd = node.type === 'dir' ? `cd ${target}` : `cat ${target}`;
  ```
  Eğer dosya adında boşluk yoksa fakat noktalı virgül (`;`), boru (`|`), mantıksal operatör (`&&`) veya çift tırnak (`"`) gibi kabuk kontrol karakterleri varsa (örn. kullanıcı terminalde `touch "dosya;rm -rf /"` oluşturduysa), hedef tırnak içine alınmaz ve komut `cat dosya;rm -rf /` şeklinde terminale yazılır.
- **Gerçekçi Saldırı Senaryosu:** Kullanıcı dosya ağacından zararsız görünen bir düğmeye tıklayıp Enter'a bastığında, dosya adının arkasına gizlenmiş ikinci bir komut yürütülür.
- **Yeniden Üretim Adımları:**
  1. Serbest Mod'da `touch "rapor;ls"` komutunu çalıştırın.
  2. Dosya ağacında oluşan `rapor;ls` dosyasına tıklayın.
  3. Terminal satırına `cat rapor;ls` yazıldığını gözlemleyin.
- **Önerilen Çözüm:** Yalnızca boşluk karakteri değil, kabuk özel karakterleri (`"`, `'`, `;`, `&`, `|`, `$`, `` ` ``, `\`, `\n`) taranmalı veya standart POSIX argüman kaçışlama fonksiyonu (`quoteShellArg`) kullanılmalıdır.

---

### 8. Dosya İsimlerinde ANSI Kaçış Dizilerinin Filtrelenmemesi (Terminal UI Spoofing)
- **Önem:** Düşük
- **Durum:** **DOĞRULANDI**
- **Dosya:Satır:** `src/core/commands/ls.ts:29-31`, `src/terminal/LineEditor.ts:69`
- **Kısa Açıklama:** `ls` komutu çıktı verirken dosya adlarındaki ANSI kaçış dizilerini (escape sequences) temizlememekte veya kaçışlamamaktadır. Dosya adında `\x1b[2J` (ekranı temizle) veya `\x1b[31m` (kırmızı renk) gibi diziler bulunması halinde xterm.js ekranı beklenmeyen görsel durumlara girebilmektedir.
- **Gerçekçi Saldırı Senaryosu:** Kötü niyetli hazırlanmış bir zip/seed veya dosya yapısında ANSI kontrol karakterleri içeren bir dosya adı listelendiğinde, terminal çıktısı tahrif edilebilir (ekran temizlenebilir veya metinler gizlenebilir).
- **Önerilen Çözüm:** GNU `ls` standardında olduğu gibi, TTY çıktılarında yazdırılamayan kontrol karakterleri `?` ile maskelenmelidir veya filtrelenmelidir.

---

### 9. Bağımlılık Güvenlik Analizi (`npm audit` & `npm outdated`)
- **Önem:** Bilgi
- **Durum:** **DOĞRULANDI**
- **Analiz Sonuçları:**
  - `npm audit` çıktısı: Toplam 6 zafiyet (3 Orta, 1 Yüksek, 2 Kritik).
    - `tinypool <=2.1.1` (Kritik - GHSA-5gmw-xhrv-c9v3 & GHSA-85c8-ppgw-ccpr: Prototype Pollution to RCE).
    - `esbuild <=0.24.2` (Orta - GHSA-67mh-4wv8-2f99: dev server cross-origin isteği).
    - `@vitest/mocker <=4.1.11` (Orta - GHSA-82fw-gwwq-j7x9 & GHSA-qxg6-89mg-rqv8).
  - **Risk Değerlendirmesi:** Bu açıkların tamamı **geliştirme ve test bağımlılıklarında (`devDependencies`: `vite`, `vitest`)** bulunmaktadır. KLU'nun üretim derlemesi (`npm run build` ile üretilen `dist/` klasörü) bu paketleri barındırmaz. Son kullanıcı tarayıcısında çalışan kodda bu açıklar bulunmamaktadır.
  - **Paket Aralıkları:** `package.json` içindeki bağımlılıklar şapka (`^`) ile tanımlıdır. `package-lock.json` dosyası mevcut ve tam kilitlidir.
- **Önerilen Çözüm:** Geliştirme ortamı güvenliği için uygun bir zamanda `vite` ve `vitest` sürümleri güncellenmelidir.

---

### 10. Gizlilik, İzleme ve Gizli Veri Denetimi
- **Önem:** Bilgi
- **Durum:** **DOĞRULANDI**
- **Analiz:**
  - **İzleme ve Analitik:** Projede Google Analytics, Sentry, Mixpanel, telemetri veya harici izleme script'i bulunmamaktadır. Hiçbir kullanıcı verisi dışarı iletilmemektedir.
  - **Git Geçmişinde Gizli Bilgi:** `git log -p` üzerinde yapılan taramada API anahtarı, parola, özel anahtar veya gizli token kalıntısına rastlanmamıştır.
  - **Commit Yazarı:** Commit geçmişinde tek yazar e-postası `umut yavuz <0434umutyavuz@gmail.com>` olarak tespit edilmiştir.

---

## Güvenlik Denetiminde Kapsam Dışı Bırakılan / İncelenmeyen Alanlar

1. **Tarayıcı Düzeyi XSS / Tarayıcı Eklentileri:** Kullanıcının kendi tarayıcısına yüklediği zararlı eklentilerin `localStorage`'a erişimi KLU kapsamında kontrol edilemez.
2. **Kişisel Veri Saklama (GDPR/KVKK Uyumu):** Uygulamada kullanıcı hesabı veya sunucu kaydı olmadığı için resmi bir veri saklama politikası testi yapılmamıştır.
3. **Üçüncü Parti xterm.js Dahili Açıkları:** `@xterm/xterm` kütüphanesinin kendi iç C/Wasm veya parser motoru derinlemesine kaynak kod seviyesinde incelenmemiş, yalnızca kamuya açık CVE'ler kontrol edilmiştir.
