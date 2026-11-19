import type { CommandDefinition } from '../shell/types';

function interpretEscapes(s: string): string {
  return s.replace(/\\([nt\\])/g, (_m, c: string) => (c === 'n' ? '\n' : c === 't' ? '\t' : '\\'));
}

export const echo: CommandDefinition = {
  name: 'echo',
  summary: 'Verilen metni ekrana yazdırır.',
  usage: 'echo [-ne] [METİN]...',
  completion: 'files',
  manPage: `AD
    echo - bir satır metin yazdırır

KULLANIM
    echo [SEÇENEK]... [METİN]...

AÇIKLAMA
    METİN'leri aralarına birer boşluk koyarak standart çıktıya yazar ve
    sonuna yeni satır ekler. Boşluk içeren metinleri tırnak içine al.

SEÇENEKLER
    -n    sona yeni satır ekleme
    -e    \\n (yeni satır) ve \\t (sekme) kaçışlarını yorumla

DEĞİŞKENLER
    $HOME, $USER, $PWD gibi değişkenler değerleriyle değiştirilir.
    Tek tırnak ('...') içinde değişkenler yorumlanmaz.

ÖRNEKLER
    echo Merhaba Dünya
    echo "Ev dizinim: $HOME"
    echo 'Bu $HOME olduğu gibi yazılır'`,
  run(args, ctx) {
    let newline = true;
    let escapes = false;
    let i = 0;
    // echo only treats leading args made purely of n/e/E as options
    while (i < args.length && /^-[neE]+$/.test(args[i])) {
      if (args[i].includes('n')) newline = false;
      if (args[i].includes('e')) escapes = true;
      if (args[i].includes('E')) escapes = false;
      i++;
    }
    let text = args.slice(i).join(' ');
    if (escapes) text = interpretEscapes(text);
    ctx.stdout(text + (newline ? '\n' : ''));
    return 0;
  },
};
