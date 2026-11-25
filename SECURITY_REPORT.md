# KLU Projesi — Güvenlik Analiz Raporu (SECURITY_REPORT.md)

**Son Güncelleme ve Doğrulama:** 26 Kasım 2026  
**Uygulama:** KLU (Web Tabanlı Linux & Terminal Simülatörü)  
**Kapsam:** İstemci tarafı kod tabanı (`src/`), yapılandırma dosyaları, bağımlılıklar (`package.json`, `package-lock.json`), CSP ve Git geçmişi.  

---

## Yönetici Özeti ve Mimari Bağlam

KLU; sunucusu (backend), veritabanı, kullanıcı hesap sistemi veya uzaktan API/ağ çağrısı olmayan, **tamamen tarayıcı üzerinde çalışan statik bir tek sayfa uygulamasıdır (SPA)**. Tüm dosya sistemi operasyonları, kabuk komutları ve durum yönetimi istemci belleğinde (`in-memory`) ve `localStorage` üzerinde yürütülür.

Bu mimari bağlam nedeniyle, klasik web uygulamalarında görülen SQL Enjeksiyonu, Yetki Aşımı (Privilege Escalation), Sunucu Taraflı İstek Sahteciliği (SSRF) veya Kimlik Doğrulama Zafiyetleri bu projede geçerli değildir.

### Güvenlik Denetim Özeti Tablosu

| # | Bulgu Başlığı | Önem | Durum | İlgili Dosya / Konum |
|---|---|---|---|---|
| 1 | Kabuk Glob Motorunda ReDoS Riski | Orta | **[ÇÖZÜLDÜ]** | `src/core/shell/glob.ts:8` |
| 2 | VirtualFS `children` Prototype Pollution | Düşük | **[ÇÖZÜLDÜ]** | `src/core/fs/VirtualFS.ts` |
| 3 | customAccent Hex Doğrulaması & CSS Enjeksiyonu | Düşük | **[ÇÖZÜLDÜ]** | `src/themes/themeManager.ts:18` |
| 4 | dangerouslySetInnerHTML & marked (XSS Değerlendirmesi) | Bilgi | **[TEORİK - ÖNLEM]** | `src/components/LessonPanel.tsx` |
| 5 | Üretim Derlemesinde CSP Eksikliği | Düşük | **[ÇÖZÜLDÜ]** | `vite.config.ts` (`cspPlugin`) |
| 6 | .gitignore İçinde .env / Yerel Dosya Eksikliği | Bilgi | **[ÇÖZÜLDÜ]** | `.gitignore` |
| 7 | Dosya Ağacından Tıklanan Dosyalarda Kabuk Kaçışlaması | Düşük | **[ÇÖZÜLDÜ]** | `src/App.tsx:33-38` (`quotePath`) |
| 8 | Dosya İsimlerinde ANSI Kaçış Filtreleme | Düşük | **[AÇIK / DÜŞÜK]** | `src/core/commands/ls.ts` |
| 9 | Bağımlılık Güvenlik Analizi (`npm audit`) | Bilgi | **[ÇÖZÜLDÜ]** | `package.json` (Vite 7, Vitest 5) |
| 10 | Gizlilik, İzleme ve Gizli Veri Denetimi | Bilgi | **[TEMİZ]** | Kod Tabanı & Git Geçmişi |

---

## Bulgu Listesi ve Detaylı Analiz

### 1. Kabuk Glob Motorunda ReDoS ile Tarayıcı Sekmesini Kilitleme (DoS)
- **Önem:** Orta (İstemci Taraflı Servis Dışı Bırakma)
- **Durum:** **[ÇÖZÜLDÜ]**
- **Dosya:Satır:** `src/core/shell/glob.ts:8` (`globToRegExp` fonksiyonu)
- **Açıklama:** `globToRegExp` fonksiyonu, ardışık `*` karakterlerini regex'e dönüştürürken yan yana `.*.*.*` yapıları oluşturabiliyor ve eşleşmeyen girdilerde üstel geri izleme (catastrophic backtracking) ile tarayıcı sekmesini kilitleyebiliyordu.
- **Uygulanan Çözüm:** `src/core/shell/glob.ts` içerisine `pattern = pattern.replace(/\*+/g, '*');` kuralı eklendi. Ardışık joker karakterler tek yıldıza indirgendiğinden ReDoS riski ortadan kaldırıldı.

---

### 2. VirtualFS `children` Nesnesinde Prototype Pollution ve Hayalet Dosyalar
- **Önem:** Düşük
- **Durum:** **[ÇÖZÜLDÜ]**
- **Dosya:Satır:** `src/core/fs/VirtualFS.ts` (`makeDir` ve `cloneNode` metotları)
- **Açıklama:** Dizin çocukları düz nesne (`{}`) olarak tanımlandığında, `Object.prototype` üzerindeki `toString`, `valueOf`, `constructor` gibi özellikler sanal dizin içinde var olan bir dosya gibi algılanabiliyordu (`fs.exists('/toString') === true`). Ayrıca `touch __proto__` ataması prototip kirlenmesine yol açabiliyordu.
- **Uygulanan Çözüm:** `VirtualFS` içinde dizin düğümleri oluşturulurken ve klonlanırken `children: Object.create(null)` kullanılarak prototipsiz sözlük yapısına geçildi. `fs.exists('/toString')` artık `false` dönmektedir ve prototip kirlenmesi engellenmiştir. `src/core/fs/VirtualFS.test.ts` testleri ile doğrulanmıştır.

---

### 3. Özel Vurgu Renginde (customAccent) Format Doğrulaması ve CSS Enjeksiyonu Riski
- **Önem:** Düşük
- **Durum:** **[ÇÖZÜLDÜ]**
- **Dosya:Satır:** `src/themes/themeManager.ts:18` (`HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/`)
- **Açıklama:** `localStorage` üzerinde saklanan `klu_accent_<themeId>` değeri katı bir regex kontrolünden geçirilmeden CSS değişkenine (`--accent`) yazılmaktaydı.
- **Uygulanan Çözüm:** `HEX_COLOR_REGEX` düzenli ifadesi eklendi. `saveCustomAccent` geçersiz formatları kaydetmeyi reddeder; `getCustomAccent` ise format geçersizse `null` döndürerek varsayılan renge güvenli dönüş yapar. `src/themes/themes.test.ts` testleri ile doğrulanmıştır.

---

### 4. `dangerouslySetInnerHTML` ve `marked` Kullanımı (XSS Değerlendirmesi)
- **Önem:** Bilgi / Çok Düşük (Mevcut Durumda Güvenli, Gelecek İçin Tedbir)
- **Durum:** **[TEORİK - GELECEK İÇİN ÖNLEM]**
- **Dosya:Satır:** `src/components/LessonPanel.tsx:44, 82, 93`
- **Açıklama:** `LessonPanel.tsx` içerisinde ders içeriği, görev açıklamaları ve ipuçları `marked.parse()` ile HTML'e dönüştürülüp `dangerouslySetInnerHTML` ile DOM'a aktarılmaktadır.
- **Mevcut Durum Güvenlik Teyidi:** Tüm ders metinleri (`src/lessons/content/level0/*.ts` ve `level1/*.ts`) derleme zamanında (build time) paketlenen statik dosyalardan gelmektedir; URL parametresinden veya kullanıcı girdisinden beslenmez. Bu nedenle mevcut sürümde dışarıdan tetiklenebilir aktif bir XSS vektörü bulunmamaktadır.
- **Gelecek İçin Not:** İleride kullanıcıların kendi derslerini JSON/Markdown olarak içeri aktarmasına veya URL üzerinden dinamik ders yüklenmesine izin verilirse, `marked` çıktısı DOM'a basılmadan önce mutlaka `DOMPurify.sanitize()` süzgecinden geçirilmelidir.

---

### 5. İçerik Güvenliği Politikası (Content-Security-Policy - CSP)
- **Önem:** Düşük
- **Durum:** **[ÇÖZÜLDÜ]**
- **Dosya:Satır:** `vite.config.ts` (`cspPlugin`)
- **Açıklama:** KLU tamamen çevrimdışı ve sıfır-ağ mimarisinde çalışan bir uygulama olduğundan, dış ağlara istek yapılmasını tarayıcı düzeyinde kısıtlayan bir CSP meta etiketi gerekiyordu.
- **Uygulanan Çözüm:** Geliştirme ortamındaki HMR (Hot Module Replacement) bağlantılarını aksatmamak için `apply: 'build'` kuralına sahip `cspPlugin` eklentisi yazıldı. `npm run build` çalıştırıldığında `dist/index.html` dosyasının `<head>` bölümüne otomatik olarak şu katı CSP meta etiketi enjekte edilir:
  `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'`

---

### 6. `.gitignore` Dosyasında Çevre Değişkenleri (`.env`) ve Yerel Dosya Koruması
- **Önem:** Bilgi / Düşük
- **Durum:** **[ÇÖZÜLDÜ]**
- **Dosya:Satır:** `.gitignore`
- **Açıklama:** `.env` ve `*.local` gibi ortam yapılandırmalarının depoya kazara eklenmesini önleyecek kurallar `.gitignore` dosyasına eklendi.

---

### 7. Dosya Ağacından Tıklanan Dosya Adlarında Kabuk Metakarakteri Kaçışlama
- **Önem:** Düşük
- **Durum:** **[ÇÖZÜLDÜ]**
- **Dosya:Satır:** `src/App.tsx:33-38` (`quotePath` fonksiyonu)
- **Açıklama:** Dosya ağacındaki öğelere tıklandığında terminal satırına `cd <yol>` veya `cat <yol>` yazılmaktadır. Dosya adında `;`, `|`, `&&`, `"`, `$` gibi kabuk kontrol karakterleri bulunması halinde komut enjeksiyonu riski oluşabilirdi.
- **Uygulanan Çözüm:** `quotePath(path)` fonksiyonu yazıldı. Yol yalnızca güvenli karakterlerden (`/[^A-Za-z0-9_./~-]/`) oluşmuyorsa çift tırnak içine alınmakta ve içerideki `"` ile `\` karakterleri ters eğik çizgi ile kaçışlanmaktadır.

---

### 8. Dosya İsimlerinde ANSI Kaçış Dizilerinin Filtrelenmemesi (Terminal UI Spoofing)
- **Önem:** Düşük
- **Durum:** **[AÇIK / DÜŞÜK ÖNEM]**
- **Dosya:Satır:** `src/core/commands/ls.ts`, `src/terminal/LineEditor.ts`
- **Açıklama:** Kullanıcı tarafından `touch "\x1b[2Jgizli"` gibi oluşturulabilecek dosya adlarında yer alan ham ANSI kaçış kodları `ls` çıktısında filtrelenmemektedir. Bu durum terminal ekranında görsel bozulmalara (ekran temizleme veya renk değişimi) yol açabilir.
- **Öneri:** GNU `ls` standardında olduğu gibi kontrol karakterleri ekrana basılırken `?` ile maskelenmelidir.

---

### 9. Bağımlılık Güvenlik Analizi (`npm audit`)
- **Önem:** Bilgi
- **Durum:** **[ÇÖZÜLDÜ]**
- **Dosya:Satır:** `package.json`, `package-lock.json`
- **Açıklama:** Eski Vite ve Vitest sürümlerindeki geliştirme bağımlılığı açıkları giderildi.
- **Uygulanan Çözüm:**
  - `vite`: `^7.3.8` sürümüne yükseltildi.
  - `vitest`: `^5.1.1` sürümüne yükseltildi.
  - `package.json` içerisine `"engines": { "node": ">=22.12.0" }` kuralı eklendi.
  - `npm audit` çıktısı: **0 zafiyet (zero vulnerabilities)** olarak doğrulandı.

---

### 10. Gizlilik, İzleme ve Gizli Veri Denetimi
- **Önem:** Bilgi
- **Durum:** **[TEMİZ]**
- **Analiz:** Kod tabanında ve Git geçmişinde hiçbir üçüncü parti izleme (telemetri, Google Analytics vb.), gizli API anahtarı veya parola kalıntısı bulunmamaktadır. Uygulama tamamen çevrimdışı ve gizlilik dostudur.

---

## Ek Mimari Güvenlik Değerlendirmeleri

### 11. VirtualFS Yetki Denetimi (Permission Mode) Sınırı
- **Açıklama:** `BaseNode` veri yapısında `mode: number` (örn. `0o755`), `owner` ve `group` alanları tanımlıdır. Ancak mevcut kodda okuma (`readFile`), yazma (`writeFile`), silme (`remove`) veya dizin oluşturma (`mkdir`) işlemlerinde kullanıcı yetki kontrolü henüz işletilmemektedir.
- **Etki:** Simülatördeki standart kullanıcı hesabı (`kullanici`), `/root` dizini altındaki dosyaları okuyabilmektedir.
- **Değerlendirme:** Bu durum bir güvenlik açığı olmayıp, `chmod` ve `chown` komutlarının henüz geliştirilme aşamasında olmasından kaynaklanan bilinçli bir simülasyon sınırıdır.

### 12. Bellek İçi Sanal FS ve LocalStorage Kota/Fallback Davranışı
- **Açıklama:** Sanal dosya sistemi tamamen RAM üzerinde yaşar (`in-memory`). Kullanıcı tarayıcı sekmesini yenilediğinde (F5) sanal dosya sistemi varsayılan tohum ağacına (`createDefaultFS()`) döner.
- **LocalStorage Güvenliği:** Kullanıcı ilerleme durumu `src/state/useProgress.ts` içinde `klu.progress.v1` anahtarıyla saklanır. Komut geçmişi `MAX_HISTORY = 200` ile sınırlandırılmıştır. Tarayıcının depolama kotası dolduğunda (`QuotaExceededError`) uygulama çökmeyip sessizce bellek içi çalışma fallback'ine geçer.

### 13. Geliştirme (Dev) ve Üretim (Build) CSP Ayrımı
- **Açıklama:** CSP meta etiketi `index.html` dosyasına statik yazılmamıştır. `vite.config.ts` içindeki `cspPlugin` yalnızca `npm run build` derlemesinde (`apply: 'build'`) devreye girer. Geliştirme sunucusunda (`npm run dev`) Vite HMR soketlerinin ve yerel kaynakların engellenmemesi için CSP uygulanmaz. Bu durum geliştirici deneyimi açısından bilinçli bir mimari tercihtir.
