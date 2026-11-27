import { useI18n } from '../i18n/I18nProvider';
import type { Lang } from '../i18n/types';

interface Props {
  className?: string;
}

export function LanguageSwitcher({ className = '' }: Props) {
  const { lang, setLang, t } = useI18n();

  const handleSelect = (nextLang: Lang) => {
    if (nextLang !== lang) {
      setLang(nextLang);
    }
  };

  return (
    <div
      className={`lang-switcher ${className}`}
      role="group"
      aria-label={t('languageSwitcher.groupAria')}
    >
      <button
        type="button"
        className={`lang-btn ${lang === 'tr' ? 'active' : ''}`}
        aria-pressed={lang === 'tr'}
        onClick={() => handleSelect('tr')}
        title={t('languageSwitcher.tr')}
      >
        TR
      </button>
      <span className="lang-divider" aria-hidden="true">|</span>
      <button
        type="button"
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        aria-pressed={lang === 'en'}
        onClick={() => handleSelect('en')}
        title={t('languageSwitcher.en')}
      >
        EN
      </button>
    </div>
  );
}
