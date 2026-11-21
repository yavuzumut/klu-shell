import type { Lesson } from '../../types';

export const howTermiWorksLesson: Lesson = {
  id: 'l0-termi-works',
  title: 'Termi Nasıl Çalışır?',
  summary: 'Tarayıcı içi simülasyon, güvenli ortam, ders paneli, ipuçları ve çözüm akışı.',
  content: `
### Tarayıcıda Güvenli Bir Laboratuvar
Termi; harici bir sunucuya veya kuruluma gerek kalmadan, tamamen tarayıcının belleğinde çalışan **sanal bir dosya sistemi ve komut kabuğudur**.
- Gerçek bilgisayarına herhangi bir dosya yazılmaz.
- Dosya silmekten veya yanlış komut çalıştırmaktan korkmana gerek yoktur; her şey güvenli ve izoledir.
- İlerlemen tarayıcının yerel hafızasında (\`localStorage\`) saklanır.

### Ders Paneli ve Görevler
- **Sol Panel:** Konu anlatımı, örnek komutlar ve tamamlaman gereken görevleri gösterir.
- **Örnek Komutlar:** Anlatım altındaki komut düğmelerine tıklayarak doğrudan terminale aktarabilirsin.
- **İpuçları:** Bir görevde yanlış bir komut denediğinde kademeli ipuçları açılır. 3 başarısız denemeden sonra **Çözümü göster** düğmesi belirir.
- **Yeniden Başlatma:** Sol panelin altındaki butonlarla dosya sistemini dersin başlangıç durumuna döndürebilirsin.
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
