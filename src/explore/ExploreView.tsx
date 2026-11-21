import { useState } from 'react';
import { EXPLORE_TOOLS, type ExploreTool } from './data';

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

export function ExploreView() {
  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>🚀 Meraklısına: Güçlü Linux Araçları</h1>
        <div className="explore-notice">
          ⚠️ <strong>Önemli Bilgilendirme:</strong> Aşağıda listelenen araçlar gerçek bir Linux dağıtımında (Ubuntu, Debian, Fedora, Arch vb.) terminal üzerinden kullanabileceğin popüler harici araçlardır. <strong>Bu araçlar tarayıcıdaki simüle Termi terminalinde çalışmaz.</strong> Kendi Linux bilgisayarında veya bir sanal makinede deneyebilirsin.
        </div>
      </div>

      <div className="explore-cards">
        {EXPLORE_TOOLS.map((tool: ExploreTool) => (
          <article key={tool.id} className="explore-card">
            <div className="explore-card-head">
              <h2>{tool.name}</h2>
              <span className="explore-summary">{tool.summary}</span>
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
                <CopySnippet text={tool.installCommand} />
              </div>
              <pre className="code-block">
                <code>{tool.installCommand}</code>
              </pre>
            </div>

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
        ))}
      </div>
    </div>
  );
}
