import { useMemo } from 'react';
import { GIT_INTRO_DATA } from './intro';
import { useI18n } from '../i18n/I18nProvider';
import { localizeGitIntro } from '../i18n/localize';

interface GitIntroViewProps {
  onStartLesson?: (lessonId: string) => void;
}

export function GitIntroView({ onStartLesson }: GitIntroViewProps) {
  const { lang, t } = useI18n();
  const data = useMemo(() => localizeGitIntro(GIT_INTRO_DATA, lang), [lang]);

  return (
    <div className="git-page">
      <header className="git-header">
        <span className="git-badge">{data.header.badge}</span>
        <h1>{data.header.title}</h1>
        <p className="git-subtitle">{data.header.subtitle}</p>
        <div className="git-notice">
          {t('gitIntro.notice')}
        </div>
      </header>

      {/* 1. Git Nedir? */}
      <section className="git-section">
        <h2>{data.whatIsGit.title}</h2>
        <p>{data.whatIsGit.summary}</p>

        <div className="git-example-box">
          <div className="git-example-icon">📁</div>
          <div className="git-example-content">
            <span className="git-example-label">{t('gitIntro.familiarScenario')}</span>
            <code className="git-bad-example">{data.whatIsGit.exampleFilename}</code>
            <p className="git-example-desc">{data.whatIsGit.description}</p>
          </div>
        </div>
      </section>

      {/* 2. Nereden Çıktı? */}
      <section className="git-section">
        <h2>{data.origin.title}</h2>
        <div className="git-origin-card">
          <div className="git-origin-meta">
            <span className="git-origin-year">📅 {data.origin.year}</span>
            <span className="git-origin-author">👤 {data.origin.creator}</span>
          </div>
          <p>{data.origin.body}</p>
        </div>
      </section>

      {/* 3. Git vs GitHub */}
      <section className="git-section">
        <h2>{data.gitVsGithub.title}</h2>
        <div className="git-compare-grid">
          <article className="git-compare-card">
            <div className="git-compare-head">
              <span className="git-compare-icon">💻</span>
              <h3>{data.gitVsGithub.git.name}</h3>
            </div>
            <p>{data.gitVsGithub.git.desc}</p>
          </article>

          <article className="git-compare-card">
            <div className="git-compare-head">
              <span className="git-compare-icon">☁️</span>
              <h3>{data.gitVsGithub.github.name}</h3>
            </div>
            <p>{data.gitVsGithub.github.desc}</p>
          </article>
        </div>
      </section>

      {/* 4. Üç Temel Alan (CSS Görseli) */}
      <section className="git-section">
        <h2>{data.threeAreas.title}</h2>
        <p className="git-section-sub">{data.threeAreas.subtitle}</p>

        <div className="git-pipeline-diagram" aria-label={t('gitIntro.threeAreasAria')}>
          {data.threeAreas.areas.map((area, index) => (
            <div key={area.id} className="git-pipeline-step">
              <div className="git-stage-card">
                <span className="git-stage-step-num">{index + 1}</span>
                <h3 className="git-stage-name">{area.name}</h3>
                <span className="git-stage-badge">{area.badge}</span>
                <p className="git-stage-desc">{area.desc}</p>
              </div>
              {index < data.threeAreas.areas.length - 1 && (
                <div className="git-pipeline-arrow" aria-hidden="true">
                  <span className="arrow-cmd">{index === 0 ? 'git add' : 'git commit'}</span>
                  <span className="arrow-sym">➔</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Başlamadan Önce */}
      <section className="git-section">
        <h2>{data.prerequisites.title}</h2>
        <div className="git-prereq-card">
          <p>{data.prerequisites.body}</p>
          <div className="git-prereq-tip">
            💡 <strong>{t('gitIntro.tipLabel')}</strong> {data.prerequisites.tip}
          </div>
        </div>
      </section>

      {/* 6. KLU'da Neler Öğreneceksin? */}
      <section className="git-section">
        <h2>{data.curriculum.title}</h2>
        <p className="git-section-sub">{data.curriculum.subtitle}</p>

        <div className="git-curriculum-grid">
          {data.curriculum.topics.map((topic) => (
            <article key={topic.id} className="git-curriculum-card">
              <div className="git-curriculum-head">
                <div className="git-curriculum-title-wrap">
                  <span className="git-curriculum-level">{topic.level}</span>
                  <h3>{topic.title}</h3>
                </div>
                {(topic.status === 'Hazır' || (topic.status as string) === 'Ready') && topic.firstLessonId ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-small git-start-btn"
                    onClick={() => topic.firstLessonId && onStartLesson?.(topic.firstLessonId)}
                  >
                    {t('gitIntro.startLessonBtn')}
                  </button>
                ) : (
                  <span className="git-status-badge">{topic.status}</span>
                )}
              </div>

              <div className="git-curriculum-cmds">
                {topic.commands.map((cmd) => (
                  <span key={cmd} className="git-cmd-chip">
                    {cmd}
                  </span>
                ))}
              </div>

              <p className="git-curriculum-desc">{topic.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
