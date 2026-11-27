import { useEffect, useRef, useState } from 'react';
import { THEME_LIST, type ThemeId } from '../themes/themes';
import type { UseThemeReturn } from '../themes/useTheme';

const ACCENT_PRESETS = [
  '#7ee787', // Yeşil (Terminal)
  '#79c0ff', // Mavi
  '#56d4dd', // Camgöbeği (Cyan)
  '#e3b341', // Sarı / Altın
  '#d2a8ff', // Mor / Eflatun
  '#ff7b72', // Mercan / Kırmızı
  '#ffa657', // Turuncu
  '#33ff33', // Fosfor Yeşil
];

export function ThemeSelector({
  theme,
  themeId,
  customAccent,
  selectTheme,
  setAccent,
  resetAccent,
}: UseThemeReturn) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside or Esc
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const currentAccent = customAccent ?? theme.defaultAccent;
  const isCustomized = customAccent !== null && customAccent !== theme.defaultAccent;

  return (
    <div className="theme-selector-container" ref={menuRef}>
      <button
        className={`theme-toggle-btn ${open ? 'active' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Tema ve görünüm ayarları"
        title="Tema ve Renkler"
        aria-expanded={open}
      >
        <span className="theme-color-dot" style={{ background: currentAccent }} />
        <span className="theme-btn-icon" aria-hidden="true">🎨</span>
        <span className="theme-btn-label">{theme.name}</span>
      </button>

      {open && (
        <div className="theme-dropdown" role="dialog" aria-label="Tema Seçimi">
          <div className="theme-dropdown-header">
            <h3>Görünüm & Tema</h3>
          </div>

          <div className="theme-section">
            <span className="theme-section-title">Tema Seç</span>
            <div className="theme-options-grid">
              {THEME_LIST.map((t) => {
                const isActive = t.id === themeId;
                return (
                  <button
                    key={t.id}
                    className={`theme-option-btn ${isActive ? 'selected' : ''}`}
                    onClick={() => selectTheme(t.id as ThemeId)}
                  >
                    <span
                      className="theme-preview-box"
                      style={{
                        background: t.cssVars['--bg-term'],
                        borderColor: t.cssVars['--border-strong'],
                      }}
                    >
                      <span
                        className="theme-preview-dot"
                        style={{ background: t.defaultAccent }}
                      />
                    </span>
                    <span className="theme-option-name">{t.name}</span>
                    {isActive && <span className="theme-check">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="theme-section">
            <div className="theme-accent-header">
              <span className="theme-section-title">Vurgu Rengi</span>
              {isCustomized && (
                <button
                  className="btn btn-small btn-ghost reset-accent-btn"
                  onClick={resetAccent}
                  title="Temanın orijinal rengine dön"
                >
                  ↺ Varsayılana dön
                </button>
              )}
            </div>

            <div className="accent-picker-row">
              <div className="accent-presets">
                {ACCENT_PRESETS.map((color) => (
                  <button
                    key={color}
                    className={`accent-swatch ${currentAccent.toLowerCase() === color.toLowerCase() ? 'active' : ''}`}
                    style={{ background: color }}
                    onClick={() => setAccent(color)}
                    title={color}
                    aria-label={`Vurgu rengi ${color}`}
                  />
                ))}
              </div>

              <label className="accent-custom-label" title="Özel renk seç">
                <input
                  type="color"
                  value={currentAccent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="accent-color-input"
                />
                <span className="custom-color-preview" style={{ background: currentAccent }}>
                  ⚙️
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
