import { describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { LanguageProvider, useI18n } from '../i18n/I18nProvider';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LANG_STORAGE_KEY } from '../i18n/storage';

function TestApp() {
  const { lang, t } = useI18n();
  return (
    <div>
      <span data-testid="current-lang">{lang}</span>
      <span data-testid="sample-text">{t('modes.lessons')}</span>
      <LanguageSwitcher />
    </div>
  );
}

describe('LanguageSwitcher Component', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'tr';
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders TR and EN options and toggles language on click', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>,
      );
    });

    const langSpan = container.querySelector('[data-testid="current-lang"]');
    const textSpan = container.querySelector('[data-testid="sample-text"]');
    expect(langSpan?.textContent).toBe('tr');
    expect(textSpan?.textContent).toBe('Dersler');
    expect(document.documentElement.lang).toBe('tr');

    // Click EN button
    const buttons = container.querySelectorAll('.lang-btn');
    expect(buttons.length).toBe(2);
    const enButton = buttons[1] as HTMLButtonElement;
    expect(enButton.textContent).toBe('EN');

    await act(async () => {
      enButton.click();
    });

    expect(langSpan?.textContent).toBe('en');
    expect(textSpan?.textContent).toBe('Lessons');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');

    // Click TR button
    const trButton = buttons[0] as HTMLButtonElement;
    await act(async () => {
      trButton.click();
    });

    expect(langSpan?.textContent).toBe('tr');
    expect(textSpan?.textContent).toBe('Dersler');
    expect(document.documentElement.lang).toBe('tr');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('tr');

    act(() => {
      root.unmount();
    });
  });
});
