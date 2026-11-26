import type { Lesson } from '../../types';

export const realLinuxLesson: Lesson = {
  id: 'l0-real-linux',
  title: "Gerçek Linux'a Geçiş ve Sırada Ne Var?",
  summary: "KLU simülasyonu ile gerçek sistem farkları ve Seviye 1'e hazırlık.",
  content: `
### KLU ile Gerçek Linux Arasındaki Farklar
- **Bellek İçi Simülasyon:** KLU'da yaptığın her değişiklik tarayıcı belleğindedir. Gerçek Linux'ta komutlar doğrudan diskteki dosyalara, ağ kartına ve donanıma etki eder.
- **Komut Yelpazesi:** KLU şu anda temel dosya ve gezinme komutlarını simüle eder. Gerçek bir Linux dağıtımında binlerce komut, paket yöneticileri (\`apt\`, \`pacman\`, \`dnf\`) ve çoğu modern dağıtımda sistem yönetim araçları (\`systemctl\`, \`journalctl\`) bulunur.
- **Temel Mantık Aynıdır:** Temel mantık aynıdır (kök dizin \`/\`, ev dizini \`~\`, üst dizin \`..\`, komut seçenekleri ve bayraklar); ancak KLU gerçek bir sistemin basitleştirilmiş bir eğitim simülasyonudur (temel dosya izinleri \`chmod\` ve betik çalıştırma Seviye 3'te simüle edilir).

> ⚠️ **Önemli Hatırlatma:** Gerçek Linux'ta \`rm\` komutuyla silinen dosyalar kalıcı olarak silinir, grafik arayüzlerdeki gibi bir çöp kutusu yoktur.

### Gerçek Linux'a Nasıl Geçilir?
KLU'dan sonra kendi bilgisayarında gerçek komut satırı deneyimi yaşamak istersen:
- **Windows:** WSL (Windows Subsystem for Linux) ile tek komutla doğrudan Ubuntu kurabilir veya VirtualBox ile sanal makine açabilirsin. İstersen bilgisayarını bir USB bellekten canlı (Live USB) olarak da başlatabilirsin.
- **macOS:** Mac kullanıyorsan ayrı bir kuruluma gerek yoktur; sistemde yerleşik bir Terminal uygulaması zaten vardır (varsayılan kabuğu Zsh olsa da temel komutların çoğu aynıdır).

### Sırada Ne Var?
Artık terminalin temellerini ve KLU'nun nasıl çalıştığını biliyorsun. **Seviye 1: Başlangıç** seviyesinde dosya işlemlerine başlayacaksın:
- Dizinlerde gezinme (\`cd\`)
- Dosyaları listeleme (\`ls\`, \`-la\`)
- Dosya ve klasör oluşturma (\`touch\`, \`mkdir\`)
- Dosya okuma (\`cat\`), kopyalama (\`cp\`), taşıma (\`mv\`) ve silme (\`rm\`)

Hazırsan ekranı temizleyip bir sonraki seviyeye geçebilirsin!

### Git
Git, dosyalarındaki değişiklikleri kaydeden ve istediğin ana dönmeni sağlayan bir sürüm kontrol sistemidir. Yazılımcıların ve açık kaynak dünyasının günlük en temel çalışma aracıdır. Ayrıntıları ve uygulamalı Git derslerini üstteki Git sekmesinde bulabilirsin.
`,
  examples: ['clear', 'help'],
  tasks: [
    {
      id: 'l0-clear',
      description: 'Yeni derslere temiz bir terminalle başlamak için `clear` komutunu çalıştır.',
      hints: ['Terminal satırına `clear` yazıp Enter tuşuna bas.'],
      solution: 'clear',
      check: { type: 'commandUsed', command: 'clear' },
    },
  ],
};
