import { useEffect } from 'react';

interface CongratsModalProps {
  open: boolean;
  onClose: () => void;
  onGoToSandbox: () => void;
  onGoToGit: () => void;
}

export function CongratsModal({ open, onClose, onGoToSandbox, onGoToGit }: CongratsModalProps) {
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
          aria-label="Kapat"
          title="Kapat"
        >
          ✕
        </button>

        <div className="congrats-modal-logo-wrap">
          <span className="congrats-modal-logo-frame">
            <img
              src="/klu-logo-cropped.webp"
              alt="KLU"
              className="congrats-modal-logo-img"
              height={44}
            />
          </span>
        </div>

        <h2 id="congrats-modal-title" className="congrats-modal-title">
          🎉 Tebrikler! Terminal Yolculuğunu Tamamladın
        </h2>

        <p className="congrats-modal-desc">
          Seviye 1, 2 ve 3'teki tüm dersleri başarıyla bitirdin! Artık gerçek bir Linux terminalinde komutları güvenle koşturabilir, dosya ve süreçleri yönetebilir ve üretkenliğini dilediğin gibi katlayabilirsin.
        </p>

        <blockquote className="congrats-modal-quote">
          <p className="congrats-quote-text-tr">
            &ldquo;Zekâ, iş yapmaktan kaçınıp yine de işi halletme yeteneğidir.&rdquo;
          </p>
          <p className="congrats-quote-text-en">
            (Intelligence is the ability to avoid doing work, yet getting the work done.)
          </p>
          <footer className="congrats-quote-author">
            &mdash; <strong>Linus Torvalds</strong>, Linux'un yaratıcısı
          </footer>
        </blockquote>

        <div className="congrats-modal-actions">
          <button
            type="button"
            className="btn btn-primary congrats-action-btn"
            onClick={onGoToSandbox}
          >
            💻 Serbest Mod'da Takıl
          </button>
          <button
            type="button"
            className="btn congrats-action-btn"
            onClick={onGoToGit}
          >
            🌿 Git'e Göz At
          </button>
          <button
            type="button"
            className="btn btn-ghost congrats-action-btn"
            onClick={onClose}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
