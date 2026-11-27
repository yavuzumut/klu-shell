import { useEffect } from 'react';
import { useI18n } from '../i18n/I18nProvider';

interface CongratsModalProps {
  open: boolean;
  onClose: () => void;
  onGoToSandbox: () => void;
  onGoToGit: () => void;
}

export function CongratsModal({ open, onClose, onGoToSandbox, onGoToGit }: CongratsModalProps) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="congrats-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="congrats-modal-title"
    >
      <div
        className="congrats-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="congrats-modal-close-icon"
          onClick={onClose}
          aria-label={t('congrats.closeAria')}
          title={t('congrats.closeAria')}
        >
          ✕
        </button>

        <div className="congrats-modal-logo-wrap">
          <span className="congrats-modal-logo-frame">
            <img
              src="/klu-logo-cropped.webp"
              alt="KLU"
              className="congrats-modal-logo-img"
              height={68}
            />
          </span>
        </div>

        <h2 id="congrats-modal-title" className="congrats-modal-title">
          {t('congrats.title')}
        </h2>

        <p className="congrats-modal-desc">
          {t('congrats.desc')}
        </p>

        <blockquote className="congrats-modal-quote">
          <p className="congrats-quote-text-tr">
            &ldquo;{t('congrats.quote')}&rdquo;
          </p>
          <footer className="congrats-quote-author">
            &mdash; <strong>Linus Torvalds</strong>, {t('congrats.quoteAuthor')}
          </footer>
        </blockquote>

        <div className="congrats-modal-actions">
          <button
            type="button"
            className="btn btn-primary congrats-action-btn"
            onClick={onGoToSandbox}
          >
            {t('congrats.btnSandbox')}
          </button>
          <button
            type="button"
            className="btn congrats-action-btn"
            onClick={onGoToGit}
          >
            {t('congrats.btnGit')}
          </button>
          <button
            type="button"
            className="btn btn-ghost congrats-action-btn"
            onClick={onClose}
          >
            {t('congrats.btnClose')}
          </button>
        </div>
      </div>
    </div>
  );
}
