import { useState } from 'react';
import { EXPLORE_TOOLS, type ExploreCategory, type ExploreTool } from './data';

function CopySnippet({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback
    }
  };

  return (
    <button className="copy-btn" onClick={handleCopy} title="Panoya kopyala">
      {copied ? '✓ Kopyalandı' : '📋 Kopyala'}
    </button>
  );
}

const DISTROS: { id: 'debian' | 'fedora' | 'arch'; label: string }[] = [
  { id: 'debian', label: 'Ubuntu / Debian' },
  { id: 'fedora', label: 'Fedora' },
  { id: 'arch', label: 'Arch' },
];

const CATEGORIES: { id: 'all' | ExploreCategory; label: string }[] = [
  { id: 'all', label: 'Hepsi' },
  { id: 'media', label: 'Medya ve İnternet' },
  { id: 'system', label: 'Sistem' },
  { id: 'files', label: 'Dosya ve Arama' },
  { id: 'productivity', label: 'Verimlilik' },
  { id: 'fun', label: 'Eğlence' },
];

function ExploreCard({ tool }: { tool: ExploreTool }) {
  const [activeDistro, setActiveDistro] = useState<'debian' | 'fedora' | 'arch'>('debian');
  const currentInstallCmd = tool.install[activeDistro];

  return (
    <article className="explore-card">
      <div className="explore-card-head">
        <div className="explore-card-title-group">
          <h2>{tool.name}</h2>
          {tool.replaces && (
            <span className="explore-replaces">
              Alternatifi: <code>{tool.replaces}</code>
            </span>
          )}
        </div>
        {tool.sourceUrl && (
          <a
            href={tool.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="explore-source-link"
          >
            Kaynak ↗
          </a>
        )}
      </div>

      <p className="explore-desc">{tool.description}</p>

      {tool.warning && (
        <div className="explore-warning">
          <span className="warning-icon">⚖️</span>
          <span>{tool.warning}</span>
        </div>
      )}

      <div className="explore-section">
        <div className="section-head">
          <span className="section-title">Kurulum:</span>
          {currentInstallCmd && <CopySnippet text={currentInstallCmd} />}
        </div>

        <div className="distro-tabs" role="tablist" aria-label="Dağıtım seçimi">
          {DISTROS.map((d) => (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={activeDistro === d.id}
              className={`distro-tab ${activeDistro === d.id ? 'active' : ''}`}
              onClick={() => setActiveDistro(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>

        {currentInstallCmd ? (
          <pre className="code-block">
            <code>{currentInstallCmd}</code>
          </pre>
        ) : (
          <div className="distro-empty">
            Bu dağıtım için doğrulanmış komut yok; dağıtımının paket deposunda ara.
          </div>
        )}

        {tool.install.note && (
          <div className="explore-note">
            <span className="explore-note-label">💡 Not:</span> {tool.install.note}
          </div>
        )}
      </div>

      {tool.tips && tool.tips.length > 0 && (
        <div className="explore-section">
          <div className="section-head">
            <span className="section-title">İpuçları:</span>
          </div>
          <ul className="explore-tips-list">
            {tool.tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="explore-section">
        <div className="section-head">
          <span className="section-title">Örnek Kullanım:</span>
          <CopySnippet text={tool.exampleCommand} />
        </div>
        <pre className="code-block">
          <code>$ {tool.exampleCommand}</code>
        </pre>
      </div>

      <div className="explore-section">
        <div className="section-head">
          <span className="section-title">Örnek Çıktı:</span>
        </div>
        <pre className="code-block terminal-output">
          <code>{tool.exampleOutput}</code>
        </pre>
      </div>
    </article>
  );
}

export function ExploreView() {
  const [activeCategory, setActiveCategory] = useState<'all' | ExploreCategory>('all');

  const filteredTools =
    activeCategory === 'all'
      ? EXPLORE_TOOLS
      : EXPLORE_TOOLS.filter((tool) => tool.category === activeCategory);

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>🚀 Meraklısına: Güçlü Linux Araçları</h1>
        <div className="explore-notice">
          ⚠️ <strong>Önemli Bilgilendirme:</strong> Aşağıda listelenen araçlar gerçek bir Linux dağıtımında (Ubuntu, Debian, Fedora, Arch vb.) terminal üzerinden kullanabileceğin popüler harici araçlardır. <strong>Bu araçlar tarayıcıdaki simüle KLU terminalinde çalışmaz.</strong> Kendi Linux bilgisayarında veya bir sanal makinede deneyebilirsin.
        </div>
        <div className="explore-output-notice">
          ℹ️ <em>Örnek çıktılar sürüme göre farklı olabilir.</em>
        </div>
      </div>

      <div className="explore-filter-bar" role="group" aria-label="Kategori Filtresi">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`explore-filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="explore-cards">
        {filteredTools.map((tool: ExploreTool) => (
          <ExploreCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
