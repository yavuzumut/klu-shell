import type { Lesson } from '../../types';

export const modesAndToolsLesson: Lesson = {
  id: 'l0-modes-tools',
  title: 'Modlar ve Araçlar',
  summary: 'Dersler, Serbest Mod, Dosya Ağacı, Hile Kağıdı, Meraklısına ve tema ayarları.',
  content: `
Termi, öğrenmeyi kolaylaştırmak için farklı çalışma alanları ve yardımcı araçlar sunar:

### Üst Gezinme Sekmeleri
- **📖 Dersler:** Adım adım görevlerle ilerlediğin rehberli mod.
- **💻 Serbest Mod (Sandbox):** Görev sınırlaması olmadan terminali özgürce kullanabileceğin mod.
- **📑 Hile Kağıdı (Cheat Sheet):** Desteklenen 14 komutun kısa Türkçe açıklamaları ve örnekleri. Bir komuta tıkladığında doğrudan Serbest Mod terminaline yazılır.
- **🚀 Meraklısına:** Gerçek Linux'ta kullanılan güçlü harici araçlar (\`yt-dlp\`, \`fastfetch\`, \`tldr\`) hakkında tanıtım kartları ve kopyalanabilir kodlar.

### Yardımcı Paneller ve Ayarlar
- **🗂️ Dosya Ağacı:** Sanal dosya sistemini canlı görselleştirir. Bir klasöre tıklarsan \`cd <yol>\`, bir dosyaya tıklarsan \`cat <yol>\` komutu terminale yazılır.
- **🎨 Tema ve Vurgu Rengi:** Sağ üstteki palet düğmesiyle 5 tema (Koyu, Açık, Dracula, Solarized Dark, Retro Yeşil) arasından seçim yapabilir ve vurgu rengini değiştirebilirsin.
`,
  examples: ['history', 'help'],
  tasks: [
    {
      id: 'l0-history',
      description: 'Termi\'de çalıştırdığın komutların dökümünü görmek için `history` komutunu çalıştır.',
      hints: ['`history` yazıp Enter tuşuna bas.'],
      solution: 'history',
      check: { type: 'commandUsed', command: 'history' },
    },
  ],
};
