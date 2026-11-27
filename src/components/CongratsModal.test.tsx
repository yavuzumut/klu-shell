import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { CongratsModal } from './CongratsModal';
import { LanguageProvider, useI18n } from '../i18n/I18nProvider';
import { translate } from '../i18n/translate';

function ModalTestHarness() {
  const { lang, setLang } = useI18n();
  return (
    <>
      <button onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}>switch</button>
      <CongratsModal open onClose={() => {}} onGoToSandbox={() => {}} onGoToGit={() => {}} />
    </>
  );
}

describe('CongratsModal localization', () => {
  let container: HTMLDivElement | undefined;
  let root: Root | undefined;

  afterEach(() => {
    if (root) act(() => root?.unmount());
    container?.remove();
    root = undefined;
    container = undefined;
    localStorage.clear();
  });

  it('renders every completion message in the selected language and updates live', async () => {
    localStorage.setItem('klu_lang', 'tr');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => root?.render(<LanguageProvider><ModalTestHarness /></LanguageProvider>));
    const text = () => container?.textContent ?? '';

    expect(text()).toContain('Tebrikler! Terminal Yolculuğunu Tamamladın');
    expect(text()).toContain('Terminal Yolculuğunu');
    expect(text()).toContain("Serbest Mod'da Takıl");
    expect(text()).toContain("Git'e Göz At");
    expect(text()).toContain('Kapat');
    expect(container?.querySelector('[aria-label="Kapat"]')).toBeTruthy();
    expect(container?.querySelector('.congrats-quote-author')?.textContent).toContain('Linus Torvalds');

    await act(async () => container?.querySelector('button')?.click());
    expect(text()).toContain('Congratulations! You Completed the Terminal Journey');
    expect(text()).toContain('Explore Sandbox');
    expect(text()).toContain('Check out Git');
    expect(text()).toContain('Close');
    expect(container?.querySelector('[aria-label="Close"]')).toBeTruthy();
    expect(text()).not.toContain('Tebrikler');

    await act(async () => container?.querySelector('button')?.click());
    expect(text()).toContain('Tebrikler! Terminal Yolculuğunu Tamamladın');
  });

  it('uses localized shared completion copy for Linux and Git lesson endings', () => {
    expect(translate('tr', 'terminal.lessonCompleted')).toBe('🎉 Ders tamamlandı! Sol paneldeki "Sonraki →" ile devam et.');
    expect(translate('en', 'terminal.lessonCompleted')).toBe('🎉 Lesson completed! Continue with "Next →" in the left panel.');
  });
});
