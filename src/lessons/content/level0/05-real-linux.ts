import type { Lesson } from '../../types';

export const realLinuxLesson: Lesson = {
  id: 'l0-real-linux',
  title: "Gerçek Linux'a Geçiş ve Sırada Ne Var?",
  summary: "Termi simülasyonu ile gerçek sistem farkları ve Seviye 1'e hazırlık.",
  content: `
### Termi ile Gerçek Linux Arasındaki Farklar
- **Bellek İçi Simülasyon:** Termi'de yaptığın her değişiklik tarayıcı belleğindedir. Gerçek Linux'ta komutlar doğrudan diskteki dosyalara, ağ kartına ve donanıma etki eder.
- **Komut Yelpazesi:** Termi şu anda temel dosya ve gezinme komutlarını simüle eder. Gerçek bir Linux dağıtımında binlerce komut, paket yöneticileri (\`apt\`, \`pacman\`, \`dnf\`) ve sistem yönetim araçları (\`systemctl\`, \`journalctl\`) bulunur.
- **Mantık Birebir Aynıdır:** Termi'de öğrendiğin tüm kurallar (kök dizin \`/\`, ev dizini \`~\`, üst dizin \`..\`, boru hattı \`|\`, bayraklar) gerçek Linux'ta da harfi harfine geçerlidir.

### Sırada Ne Var?
Artık terminalin temellerini ve Termi'nin nasıl çalıştığını biliyorsun. **Seviye 1: Başlangıç** seviyesinde gerçek dosya işlemlerine başlayacaksın:
- Dizinlerde gezinme (\`cd\`)
- Dosyaları listeleme (\`ls\`, \`-la\`)
- Dosya ve klasör oluşturma (\`touch\`, \`mkdir\`)
- Dosya okuma (\`cat\`), kopyalama (\`cp\`), taşıma (\`mv\`) ve silme (\`rm\`)

Hazırsan ekranı temizleyip bir sonraki seviyeye geçebilirsin!
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
