export interface GitStageArea {
  id: string;
  name: string;
  badge: string;
  desc: string;
}

export interface GitCurriculumTopic {
  id: string;
  level: string;
  title: string;
  commands: string[];
  description: string;
  status: 'Yakında' | 'Hazır';
  firstLessonId?: string;
}

export interface GitIntroData {
  header: {
    badge: string;
    title: string;
    subtitle: string;
  };
  whatIsGit: {
    title: string;
    summary: string;
    exampleFilename: string;
    description: string;
  };
  origin: {
    title: string;
    year: string;
    creator: string;
    body: string;
  };
  gitVsGithub: {
    title: string;
    git: {
      name: string;
      desc: string;
    };
    github: {
      name: string;
      desc: string;
    };
  };
  threeAreas: {
    title: string;
    subtitle: string;
    areas: GitStageArea[];
  };
  prerequisites: {
    title: string;
    body: string;
    tip: string;
  };
  curriculum: {
    title: string;
    subtitle: string;
    topics: GitCurriculumTopic[];
  };
}

export const GIT_INTRO_DATA: GitIntroData = {
  header: {
    badge: '🌿 Sürüm Kontrolü',
    title: 'Git ile Tanış',
    subtitle:
      'Kodlarının zaman makinesi: Değişiklikleri adım adım takip et, istediğin ana dön ve projelerini güvenle yönet.',
  },
  whatIsGit: {
    title: 'Git Nedir?',
    summary:
      'Git, dosyalarındaki ve kodlarındaki tüm değişiklikleri zaman içinde adım adım kaydeden, dilediğin zaman geçmiş bir ana dönebilmeni sağlayan bir sürüm kontrol sistemidir (VCS).',
    exampleFilename: 'rapor_final_son_gercekten_son.docx',
    description:
      'Hepimizin bildiği gibi dosyaları "rapor_kopya", "rapor_son", "rapor_final_son_gercekten_son.docx" diye çoğaltmak yerine, Git tek bir klasör üzerinden tüm geçmişi tutar. Kim, ne zaman, hangi satırı değiştirdi; hepsi kayıt altındadır.',
  },
  origin: {
    title: 'Git Kısaca Nereden Çıktı?',
    year: '2005',
    creator: 'Linus Torvalds',
    body:
      'Git; 2005 yılında Linux çekirdeğini (kernel) geliştiren binlerce yazılımcının ortak kod tabanını hızla, güvenle ve dağıtık olarak yönetebilmesi için bizzat Linus Torvalds tarafından yazıldı. Bugün küçük hobilerden dünyanın en devasa sistemlerine kadar neredeyse tüm yazılım dünyası Git kullanır.',
  },
  gitVsGithub: {
    title: 'Git ile GitHub Aynı Şey Değil',
    git: {
      name: 'Git',
      desc: 'Bilgisayarında terminal üzerinden çalışan, dosyalarının tarihçesini ve sürümlerini yerel olarak tutan komut satırı aracıdır.',
    },
    github: {
      name: 'GitHub',
      desc: 'Bilgisayarındaki Git depolarını internette barındıran, başkalarıyla iş birliği yapmanı ve projelerini dünyayla paylaşmanı sağlayan web hizmetidir (GitLab ve Bitbucket gibi alternatifleri de vardır).',
    },
  },
  threeAreas: {
    title: 'Git\'in Üç Temel Alanı',
    subtitle: 'Bir dosyanın Git içindeki yolculuğu bu üç duraktan geçer:',
    areas: [
      {
        id: 'working-directory',
        name: 'Çalışma Alanı',
        badge: 'Working Directory',
        desc: 'Bilgisayarında dosyalarını doğrudan oluşturduğun, kod yazdığın ve değişiklik yaptığın klasöründür.',
      },
      {
        id: 'staging-area',
        name: 'Hazırlık Alanı',
        badge: 'Staging Area (Index)',
        desc: 'Bir sonraki kayda (commit) eklemek istediğin değişiklikleri git add ile seçip bir araya getirdiğin bekleme odasıdır.',
      },
      {
        id: 'repository',
        name: 'Depo',
        badge: 'Repository (.git)',
        desc: 'git commit ile onayladığın değişikliklerin kalıcı birer sürüm fotoğrafı olarak kaydedildiği yerel veritabanıdır.',
      },
    ],
  },
  prerequisites: {
    title: 'Başlamadan Önce Ne Bilmelisin?',
    body:
      'Git\'i rahatça kullanabilmek için KLU\'daki Seviye 1 (Başlangıç) derslerini bitirmen yeterlidir; dosyalarda gezinmeyi (cd), listelemeyi (ls) ve dosya oluşturmayı (touch, mkdir) biliyorsan hazırsın.',
    tip: 'Seviye 2\'de öğreneceğin çıktı yönlendirme (>) ve boru hattı (|) özellikleri ise ileride Git komutlarıyla pratik yaparken işini kolaylaştıracak.',
  },
  curriculum: {
    title: 'KLU\'da Neler Öğreneceksin?',
    subtitle: 'Git 1–4 uygulamalı dersleri hazır! İstediğin konudan başlayabilirsin:',
    topics: [
      {
        id: 'git-1',
        level: 'Git 1',
        title: 'Temel Kavramlar ve İlk Depo',
        commands: ['init', 'status', 'add', 'commit', 'log'],
        description: 'Yeni bir Git deposu başlatma, dosya durumunu inceleme, hazırlık alanına alma, ilk commit\'i kaydetme ve geçmişi okuma.',
        status: 'Hazır',
        firstLessonId: 'git-1-init',
      },
      {
        id: 'git-2',
        level: 'Git 2',
        title: 'Farkları Görme ve Güvenlik',
        commands: ['diff', 'restore', '.gitignore'],
        description: 'Yapılan değişiklikleri satır satır inceleme, hatalı düzenlemeleri geri alma ve depoya girmesini istemediğin dosyaları gizleme.',
        status: 'Hazır',
        firstLessonId: 'git-2-diff',
      },
      {
        id: 'git-3',
        level: 'Git 3',
        title: 'Dallar ve Birleştirme',
        commands: ['branch', 'switch', 'merge'],
        description: 'Ana kodu riske atmadan yeni özellikler denemek için bağımsız dallar (branch) açma, dallar arasında geçiş yapma ve güvenle birleştirme.',
        status: 'Hazır',
        firstLessonId: 'git-3-branch',
      },
      {
        id: 'git-4',
        level: 'Git 4',
        title: 'Uzak Depolar ve İş Birliği',
        commands: ['remote', 'push', 'pull', 'clone'],
        description: 'Yerel deponu GitHub gibi uzak bir sunucuya bağlama, değişiklikleri gönderme (push), güncellemeleri çekme (pull) ve projeleri klonlama.',
        status: 'Hazır',
        firstLessonId: 'git-4-push',
      },
    ],
  },
};
