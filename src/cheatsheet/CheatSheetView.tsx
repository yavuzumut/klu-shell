import { CHEAT_SHEET_DATA, type CheatItem } from './data';

interface Props {
  onRunInSandbox: (command: string) => void;
}

export function CheatSheetView({ onRunInSandbox }: Props) {
  return (
    <div className="cheatsheet-page">
      <div className="cheatsheet-header">
        <h1>📑 Linux Komut Hile Kağıdı</h1>
        <p className="muted">
          KLU'da desteklenen tüm temel komutların derlenmiş listesi. Bir komutun veya örneğin üzerine tıklayarak
          doğrudan <strong>Serbest Mod</strong> terminaline aktarabilirsin.
        </p>
      </div>

      <div className="cheatsheet-grid">
        {CHEAT_SHEET_DATA.map((cat) => (
          <section key={cat.title} className="cheatsheet-category">
            <h2>{cat.title}</h2>
            <div className="cheatsheet-table">
              {cat.items.map((item: CheatItem) => (
                <div key={item.command} className="cheatsheet-row">
                  <div className="cheatsheet-cmd">
                    <button
                      className="cmd-badge"
                      onClick={() => onRunInSandbox(item.command)}
                      title="Serbest Mod terminaline yaz"
                    >
                      {item.command}
                    </button>
                  </div>
                  <div className="cheatsheet-desc">{item.description}</div>
                  <div className="cheatsheet-example">
                    <button
                      className="example-badge"
                      onClick={() => onRunInSandbox(item.example)}
                      title="Serbest Mod terminaline yaz"
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
