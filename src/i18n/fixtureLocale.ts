import type { Lang } from './types';
import type { TaskCheck } from '../lessons/types';

const FIXTURE_NAME_PAIRS = [
  ['kod.py', 'code.py'],
  ['kullanici', 'user'],
  ['Belgeler', 'Documents'],
  ['belgeler', 'documents'],
  ['Indirilenler', 'Downloads'],
  ['Resimler', 'Pictures'],
  ['Muzik', 'Music'],
  ['notlar_yedek.txt', 'notes_backup.txt'],
  ['notlar', 'notes'],
  ['merhaba_yedek.txt', 'hello_backup.txt'],
  ['ilk_ikisi.txt', 'first_two.txt'],
  ['alisveris.txt', 'shopping.txt'],
  ['gorevler.txt', 'tasks.txt'],
  ['sunucu.log', 'server.log'],
  ['uygulama.log', 'application.log'],
  ['sehirler.txt', 'cities.txt'],
  ['merhaba.txt', 'hello.txt'],
  ['metin.txt', 'text.txt'],
  ['notlar.txt', 'notes.txt'],
  ['not.txt', 'note.txt'],
  ['liste.txt', 'list.txt'],
  ['siir.txt', 'poem.txt'],
  ['rapor.pdf', 'report.pdf'],
  ['rapor.txt', 'report.txt'],
  ['rapor', 'report'],
  ['tatil.jpg', 'vacation.jpg'],
  ['sarki.mp3', 'song.mp3'],
  ['gizli_not', 'hidden_note'],
  ['.gizli_not', '.hidden_note'],
  ['gizli.txt', 'hidden.txt'],
  ['eski1.txt', 'old1.txt'],
  ['eski2.txt', 'old2.txt'],
  ['taslak.txt', 'draft.txt'],
  ['son.txt', 'final.txt'],
  ['yedek.sh', 'backup.sh'],
  ['selam.sh', 'greet.sh'],
  ['eski_proje', 'old_project'],
  ['ekip-projesi', 'team-project'],
  ['yeni-ozellik', 'new-feature'],
  ['ozellik', 'feature'],
  ['buton.js', 'button.js'],
  ['calisma', 'work'],
  ['projeler', 'projects'],
  ['proje', 'project'],
  ['yedek', 'backup'],
  ['eski', 'old'],
  ['yeni', 'new'],
  ['puan.txt', 'score.txt'],
  ['betik.sh', 'script.sh'],
  ['cop', 'trash'],
  ['hata', 'error'],
  ['ilk', 'first'],
  ['Belgeler_yedek', 'Documents_backup'],
  ['merhaba_kopya.txt', 'hello_copy.txt'],
  ['okul', 'school'],
  ['matematik', 'math'],
  ['arsiv', 'archive'],
  ['gorev', 'task'],
] as const;

const TEXT_PAIRS = [
  ['İlk notlar eklendi', 'Added first notes'],
  ['İlk notlar dosyasi eklendi', 'Added first notes file'],
  ['Yeni buton eklendi', 'Added a new button'],
  ['yeni buton', 'new button'],
  ['Ana kod tabanı', 'Main codebase'],
  ['Temel proje', 'Base project'],
  ['Temiz başlangıç', 'Clean start'],
  ['İlk sürüm', 'First version'],
  ['Proje baslangici', 'Project start'],
  ['İlk commit', 'First commit'],
  ['Ilk commit', 'First commit'],
  ['kullanici:x:1000:1000:Kullanici:/home/kullanici:/bin/bash', 'user:x:1000:1000:User:/home/user:/bin/bash'],
  ['tr_TR.UTF-8', 'en_US.UTF-8'],
  ['KLU Linux dunyasina hos geldin!', 'Welcome to the KLU Linux world!'],
  ['Yedek aliniyor...', 'Creating a backup...'],
  ["KLU'ya hoş geldin", 'Welcome to KLU'],
  ['Tebrikler, gizli dosyayı buldun!', 'Congratulations, you found the hidden file!'],
  ['Gizli kelime: penguen', 'Hidden word: penguin'],
  ['Bu dosyayı cat komutuyla okudun.', 'You read this file with the cat command.'],
  ['Bu ay 12 yeni Linux komutu öğrenildi.', '12 new Linux commands were learned this month.'],
  ['Aylık Rapor', 'Monthly Report'],
  ['Yeni Başlangıç', 'New Beginning'],
  ['İkinci Satır', 'Second Line'],
  ['Merhaba Linux', 'Hello Linux'],
  ['Merhaba', 'Hello'],
  ['Merhaba Dünya', 'Hello World'],
  ['Merhaba Dunya', 'Hello World'],
  ['Dosya yok', 'No such file'],
  ['Istek zaman asimina ugradi', 'Request timed out'],
  ['Veritabani baglantisi koptu', 'Database connection lost'],
  ['Sunucu durduruldu', 'Server stopped'],
  ['Istek alindi', 'Request received'],
  ['WARN: Bellek kullanimi yuksek', 'WARN: Memory usage is high'],
  ['Bellek', 'Memory'],
  ['bellek', 'memory'],
  ['penguen', 'penguin'],
  ['ekmek', 'bread'],
  ['süt', 'milk'],
  ['peynir', 'cheese'],
  ['zeytin', 'olives'],
  ['Kullanici', 'User'],
] as const;

const LOCALIZED_FIXTURE_SCRIPTS = new Map([
  ['echo "KLU Linux dunyasina hos geldin!"', 'echo "Welcome to the KLU Linux world!"'],
  ['echo "Yedek aliniyor..."', 'echo "Creating a backup..."'],
]);

/** Localize known lesson fixture commands while keeping shell logic free of lesson content. */
export function localizeScriptCommand(command: string, lang: Lang): string {
  return lang === 'en' ? (LOCALIZED_FIXTURE_SCRIPTS.get(command) ?? command) : command;
}

const TR_ERROR_PAIRS = [
  ['syntax error near unexpected token', 'beklenmeyen belirteç yakınında sözdizimi hatası'],
  ['bad substitution', 'geçersiz değişken genişletme'],
  ['No such file or directory', 'Böyle bir dosya veya dizin yok'],
  ['No space left on device', 'Cihazda yer kalmadı'],
  ['Directory not empty', 'Dizin boş değil'],
  ['Permission denied', 'İzin reddedildi'],
  ['No manual entry for', 'Kılavuz girdisi yok:'],
  ['No manual entry', 'Kılavuz girdisi yok'],
  ['No help topics match', 'Eşleşen yardım konusu yok'],
  ['No such process', 'Böyle bir süreç yok'],
  ['Operation not permitted', 'İşleme izin verilmedi'],
  ['File too large', 'Dosya çok büyük'],
  ['Invalid argument', 'Geçersiz argüman'],
  ['Is a directory', 'Bir dizin'],
  ['Not a directory', 'Dizin değil'],
  ['File exists', 'Dosya zaten var'],
  ['command not found', 'komut bulunamadı'],
  ['missing destination file operand after', 'hedef dosya argümanı eksik:'],
  ['missing operand after', 'hedef argüman eksik:'],
  ['missing file operand', 'dosya argümanı eksik'],
  ['missing operand', 'argüman eksik'],
  ['unrecognized option', 'tanınmayan seçenek'],
  ['unknown option', 'bilinmeyen seçenek'],
  ['invalid option', 'geçersiz seçenek'],
  ['invalid mode', 'geçersiz izin kipi'],
  ['extra operand', 'fazladan argüman'],
  ['requires an argument', 'argüman gerektirir'],
  ['cannot create directory', 'dizin oluşturulamıyor'],
  ['cannot access', 'erişilemiyor'],
  ['cannot touch', 'oluşturulamıyor'],
  ['cannot stat', 'durum bilgisi alınamıyor'],
  ['cannot remove', 'silinemiyor'],
  ['cannot copy', 'kopyalanamıyor'],
  ['cannot copy a directory', 'dizin kopyalanamıyor'],
  ['cannot move', 'taşınamıyor'],
  ['is not a directory', 'dizin değil'],
  ['-r not specified; omitting directory', '-r belirtilmedi; dizin atlanıyor'],
  ['are the same file', 'aynı dosya'],
  ['it is dangerous to operate recursively on', 'üzerinde yinelemeli işlem yapmak tehlikelidir:'],
  ["refusing to remove '.' or '..' directory: skipping", "'.' veya '..' dizini silinmiyor; atlanıyor:"],
  ['unknown predicate', 'bilinmeyen koşul'],
  ['invalid pattern', 'geçersiz desen'],
  ['missing argument to', 'argüman eksik:'],
  ['too many arguments', 'çok fazla argüman'],
  ['OLDPWD not set', 'OLDPWD ayarlanmamış'],
  ['option requires an argument', 'seçenek için argüman gerekli'],
  ['not a valid identifier', 'geçerli bir tanımlayıcı değil'],
  ["Try '", "Şunu deneyin: '"],
  [' for more information.', ' hakkında daha fazla bilgi için.'],
] as const;

type PairList = readonly (readonly [string, string])[];
type CompiledPairs = { translations: Map<string, string>; pattern: RegExp };

function compilePairs(pairs: PairList): CompiledPairs {
  const sortedPairs = [...pairs].sort(([a], [b]) => b.length - a.length);
  const translations = new Map(sortedPairs);
  const pattern = new RegExp(sortedPairs.map(([from]) => from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  return { translations, pattern };
}

const REPLACEMENTS = new Map<PairList, CompiledPairs>([
  [FIXTURE_NAME_PAIRS, compilePairs(FIXTURE_NAME_PAIRS)],
  [TEXT_PAIRS, compilePairs(TEXT_PAIRS)],
  [TR_ERROR_PAIRS, compilePairs(TR_ERROR_PAIRS)],
]);

function replacePairs(value: string, pairs: PairList): string {
  const { translations, pattern } = REPLACEMENTS.get(pairs)!;
  return value.replace(pattern, (match, offset: number, source: string) => {
    if (pairs === FIXTURE_NAME_PAIRS) {
      const before = source[offset - 1] ?? '';
      const after = source[offset + match.length] ?? '';
      if (/[\w-]/.test(before) || /[\w-]/.test(after)) return match;
    }
    return translations.get(match) ?? match;
  });
}

const EN_TO_TR_NAME: Map<string, string> = new Map(FIXTURE_NAME_PAIRS.map(([tr, en]) => [en, tr]));
const TR_TO_EN_NAME: Map<string, string> = new Map(FIXTURE_NAME_PAIRS);

export function localizeFixtureText(value: string, lang: Lang): string {
  if (lang !== 'en') return value;
  const urls: string[] = [];
  const protectedUrls = value.replace(/https?:\/\/[^\s`"'<>]+/g, (url) => {
    urls.push(url);
    return `\u0000URL${urls.length - 1}\u0000`;
  });
  const withEnglishPhrases = replacePairs(protectedUrls, TEXT_PAIRS);
  const withEnglishNames = replacePairs(withEnglishPhrases, FIXTURE_NAME_PAIRS);
  return withEnglishNames.replace(/\u0000URL(\d+)\u0000/g, (_marker, index: string) => urls[Number(index)]);
}

export function localizeCommandError(value: string, lang: Lang): string {
  return lang === 'tr' ? replacePairs(value, TR_ERROR_PAIRS) : value;
}

export function localizeFixtureName(name: string, lang: Lang): string {
  return lang === 'en' ? (TR_TO_EN_NAME.get(name) ?? name) : name;
}

export function localizeFixturePath(path: string, lang: Lang): string {
  if (lang === 'tr') return path;
  return path.split('/').map((part) => localizeFixtureName(part, lang)).join('/');
}

/** Convert displayed English fixture paths back to their canonical VFS paths. */
export function resolveFixturePath(path: string, lang: Lang): string {
  if (lang === 'tr') return path;
  return path.split('/').map((part) => EN_TO_TR_NAME.get(part) ?? part).join('/');
}

export function localizeTaskCheck(check: TaskCheck, lang: Lang): TaskCheck {
  if (lang === 'tr') return check;
  switch (check.type) {
    case 'commandUsed':
      return {
        ...check,
        command: localizeFixtureText(check.command, lang),
        args: check.args?.map((arg) => localizeFixtureText(arg, lang)),
      };
    case 'outputContains':
      return { ...check, text: localizeFixtureText(check.text, lang) };
    case 'fileContains':
      return { ...check, text: localizeFixtureText(check.text, lang) };
    case 'all':
    case 'any':
      return { ...check, checks: check.checks.map((item) => localizeTaskCheck(item, lang)) };
    case 'not':
      return { ...check, check: localizeTaskCheck(check.check, lang) };
    case 'pathExists':
    case 'pathNotExists':
    case 'cwdIs':
    case 'fileMode':
    case 'custom':
      return check;
  }
}
