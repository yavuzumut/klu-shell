import type { CommandDefinition } from '../shell/types';
import { runHeadTail } from './head';

export const tail: CommandDefinition = {
  name: 'tail',
  summary: 'Dosyanın son satırlarını gösterir (varsayılan 10).',
  usage: 'tail [-n SAYI] [DOSYA]...',
  completion: 'files',
  manPage: `AD
    tail - dosyaların sonunu gösterir

KULLANIM
    tail [SEÇENEK]... [DOSYA]...

AÇIKLAMA
    Her DOSYA'nın son 10 satırını yazar. Günlük (log) dosyalarındaki en
    yeni kayıtlara bakmak için çok kullanılır. Birden fazla dosya
    verilirse her birinin önüne "==> DOSYA <==" başlığı eklenir. DOSYA
    verilmezse veya DOSYA "-" ise standart girdiyi (pipe) okur.

SEÇENEKLER
    -n, --lines=SAYI   son 10 yerine son SAYI satırı göster
    -n +SAYI           SAYI'ncı satırdan başlayarak sonuna kadar göster
    -SAYI              -n SAYI ile aynı (örn. tail -3)
    -q, --quiet        dosya adı başlıklarını hiç yazma
    -v, --verbose      dosya adı başlığını her zaman yaz

NOT
    Gerçek Linux'taki -f (dosyayı canlı izleme) seçeneği KLU'da yoktur.

ÖRNEKLER
    tail /var/log/syslog
    tail -n 2 Belgeler/alisveris.txt
    tail -n +2 tablo.csv     başlık satırını atla`,
  run(args, ctx) {
    return runHeadTail(
      args,
      ctx,
      (lines, count, fromStart) => (fromStart ? lines.slice(Math.max(count - 1, 0)) : count === 0 ? [] : lines.slice(-count)),
      true,
    );
  },
};
