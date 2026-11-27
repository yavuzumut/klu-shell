import { useMemo } from 'react';
import { CHEAT_SHEET_DATA, type CheatItem } from './data';
import { useI18n } from '../i18n/I18nProvider';
import { localizeCheatSheet } from '../i18n/localize';

interface Props {
  onRunInSandbox: (command: string) => void;
}

export function CheatSheetView({ onRunInSandbox }: Props) {
  const { lang, t } = useI18n();
  const data = useMemo(() => localizeCheatSheet(CHEAT_SHEET_DATA, lang), [lang]);

  return (
    <div className="cheatsheet-page">
      <div className="cheatsheet-header">
        <h1>{t('cheatsheet.title')}</h1>
        <p className="muted">
          {t('cheatsheet.subtitle')}
        </p>
      </div>

      <div className="cheatsheet-grid">
        {data.map((cat) => (
          <section key={cat.title} className="cheatsheet-category">
            <h2>{cat.title}</h2>
            <div className="cheatsheet-table">
              {cat.items.map((item: CheatItem) => (
                <div key={item.command} className="cheatsheet-row">
                  <div className="cheatsheet-cmd">
                    <button
                      className="cmd-badge"
                      onClick={() => onRunInSandbox(item.command)}
                      title={t('cheatsheet.cmdTitle')}
                    >
                      {item.command}
                    </button>
                  </div>
                  <div className="cheatsheet-desc">{item.description}</div>
                  <div className="cheatsheet-example">
                    <button
                      className="example-badge"
                      onClick={() => onRunInSandbox(item.example)}
                      title={t('cheatsheet.cmdTitle')}
                    >
                      <code>$ {item.example}</code>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
