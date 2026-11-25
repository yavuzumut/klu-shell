import type { CommandDefinition } from '../shell/types';
import { tryParseArgs } from './_utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDate(d: Date, format: string | null, utc: boolean): string {
  const year = utc ? d.getUTCFullYear() : d.getFullYear();
  const month = (utc ? d.getUTCMonth() : d.getMonth()) + 1;
  const day = utc ? d.getUTCDate() : d.getDate();
  const hours = utc ? d.getUTCHours() : d.getHours();
  const minutes = utc ? d.getUTCMinutes() : d.getMinutes();
  const seconds = utc ? d.getUTCSeconds() : d.getSeconds();
  const dayName = DAYS[utc ? d.getUTCDay() : d.getDay()];
  const monthName = MONTHS[(utc ? d.getUTCMonth() : d.getMonth())];
  const epochSec = Math.floor(d.getTime() / 1000);

  if (!format) {
    const tz = utc ? 'UTC' : 'UTC';
    return `${dayName} ${monthName} ${String(day).padStart(2, ' ')} ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)} ${tz} ${year}`;
  }

  let out = format;
  out = out.replace(/%Y/g, String(year));
  out = out.replace(/%m/g, pad2(month));
  out = out.replace(/%d/g, pad2(day));
  out = out.replace(/%H/g, pad2(hours));
  out = out.replace(/%M/g, pad2(minutes));
  out = out.replace(/%S/g, pad2(seconds));
  out = out.replace(/%F/g, `${year}-${pad2(month)}-${pad2(day)}`);
  out = out.replace(/%T/g, `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`);
  out = out.replace(/%s/g, String(epochSec));
  out = out.replace(/%a/g, dayName);
  out = out.replace(/%b/g, monthName);
  return out;
}

export const date: CommandDefinition = {
  name: 'date',
  summary: 'Sistem tarih ve saatini yazdırır.',
  usage: 'date [-u] [+BİÇİM]',
  completion: 'none',
  manPage: `AD
    date - sistem tarih ve saatini görüntüler

KULLANIM
    date [SEÇENEK]... [+BİÇİM]

AÇIKLAMA
    Mevcut tarih ve saati belirtilen BİÇİM'de ekrana yazar.
    Biçim belirtilmezse standart tarih dizesi kullanılır.

SEÇENEKLER
    -u, --utc    Evrensel Eşgüdümlü Zamanı (UTC) kullan

BİÇİM BELİRTEÇLERİ
    %Y    Yıl (örn. 2026)
    %m    Ay (01-12)
    %d    Ayın günü (01-31)
    %H    Saat (00-23)
    %M    Dakika (00-59)
    %S    Saniye (00-59)
    %F    Tam tarih (%Y-%m-%d ile aynı)
    %T    Saat (%H:%M:%S ile aynı)

ÖRNEKLER
    date
    date -u
    date +%Y-%m-%d
    date "+%F %T"`,
  run(args, ctx) {
    const parsed = tryParseArgs(ctx, args, 'u', { utc: 'u' });
    if (!parsed) return 1;

    const { flags, operands } = parsed;
    const utc = flags.has('u');

    let format: string | null = null;
    for (const op of operands) {
      if (op.startsWith('+')) {
        format = op.slice(1);
      } else {
        ctx.stderr(`date: extra operand '${op}'\n`);
        return 1;
      }
    }

    const now = ctx.fs.now ? ctx.fs.now() : Date.now();
    const d = new Date(now);
    const result = formatDate(d, format, utc);
    ctx.stdout(`${result}\n`);
    return 0;
  },
};
