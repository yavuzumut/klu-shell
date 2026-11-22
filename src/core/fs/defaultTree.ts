import { VirtualFS, type FsSeed } from './VirtualFS';

/** The standard directory layout every session starts with. */
export const DEFAULT_SEED: FsSeed = {
  dirs: [
    '/bin',
    '/etc',
    '/home/kullanici/Belgeler',
    '/home/kullanici/Resimler',
    '/home/kullanici/Muzik',
    '/home/kullanici/Indirilenler',
    '/root',
    '/tmp',
    '/usr/bin',
    '/usr/share/doc',
    '/var/log',
    '/var/www',
  ],
  files: {
    '/etc/hostname': 'klu\n',
    '/etc/hosts': '127.0.0.1\tlocalhost\n127.0.1.1\tklu\n',
    '/etc/os-release':
      'NAME="KLU Linux"\nVERSION="1.0 (Penguen)"\nID=klu\nPRETTY_NAME="KLU Linux 1.0"\n',
    '/etc/passwd':
      'root:x:0:0:root:/root:/bin/bash\nkullanici:x:1000:1000:Kullanici:/home/kullanici:/bin/bash\n',
    '/var/log/syslog':
      'Nov 19 08:00:01 klu systemd[1]: Started KLU eğitim ortamı.\nNov 19 08:00:02 klu kernel: Penguen uyandı.\n',
    '/var/www/index.html': '<h1>Merhaba KLU!</h1>\n',
    '/root/.bashrc': '# root kullanıcısının ayarları\n',
    '/home/kullanici/merhaba.txt': "Merhaba! KLU'ya hoş geldin.\nBu dosyayı cat komutuyla okudun.\n",
    '/home/kullanici/.bashrc': '# Kabuk ayarlari\nexport PS1="\\u@\\h:\\w\\$ "\nalias ll="ls -l"\n',
    '/home/kullanici/.gizli_not': 'Tebrikler, gizli dosyayı buldun!\nGizli kelime: penguen\n',
    '/home/kullanici/Belgeler/rapor.txt':
      'Aylık Rapor\n===========\nBu ay 12 yeni Linux komutu öğrenildi.\n',
    '/home/kullanici/Belgeler/alisveris.txt': 'ekmek\nsüt\npeynir\nzeytin\n',
    '/home/kullanici/Resimler/tatil.jpg': '[ikili resim verisi]\n',
    '/home/kullanici/Muzik/sarki.mp3': '[ikili ses verisi]\n',
  },
};

/** Build a fresh file system, optionally applying an extra seed on top. */
export function createDefaultFS(extra?: FsSeed, now?: () => number): VirtualFS {
  const fs = new VirtualFS({ now });
  fs.seed(DEFAULT_SEED);
  // Everything outside the home directory belongs to root.
  for (const dir of ['/bin', '/etc', '/root', '/tmp', '/usr', '/var']) {
    fs.chown(dir, 'root', { recursive: true });
  }
  fs.chown('/', 'root');
  fs.chown('/home', 'root');
  fs.chown('/root', 'root', { mode: 0o700 });
  fs.chown('/tmp', 'root', { mode: 0o777 });
  if (extra) fs.seed(extra);
  return fs;
}
