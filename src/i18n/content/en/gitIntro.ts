export const EN_GIT_INTRO = {
  header: {
    badge: 'Version Control System',
    title: 'Why Git? Why Version Control?',
    subtitle:
      'The time-machine of the coding world: track changes step by step, branch fearlessly, experiment, and collaborate safely.',
  },
  whatIsGit: {
    title: 'What is Git and Why Do We Need It?',
    exampleFilename: 'report_final_final_really_final.docx',
    summary:
      'Git is an open-source distributed version control system that records changes across files over time, allowing you to recall specific versions later.',
    description:
      'Without version control, files quickly turn into chaotic copies like "final", "final_final", "real_final". Git replaces this mess with clean, structured commits that record what changed, who changed it, and why.',
  },
  origin: {
    title: 'Where did it come from?',
    year: '2005',
    creator: 'Linus Torvalds',
    body:
      'Linus Torvalds designed Git in just a few weeks to manage Linux kernel development when previous proprietary tools were revoked. Its design prioritizes speed, data integrity, and support for distributed, non-linear workflows.',
  },
  gitVsGithub: {
    title: 'Git vs GitHub: What is the Difference?',
    git: {
      name: 'Git (Command Line Tool)',
      desc: 'Runs locally on your computer. Creates snapshots, manages branches, and tracks your project history completely offline.',
    },
    github: {
      name: 'GitHub (Cloud Platform)',
      desc: 'A cloud hosting service for Git repositories. Provides pull requests, issue tracking, continuous integration, and global collaboration.',
    },
  },
  threeAreas: {
    title: 'The Three Trees of Git',
    subtitle: 'Every file in Git lives in one of three stages. Mastering this flow is the key to mastering Git.',
    areas: {
      'working-directory': {
        name: 'Working Directory',
        badge: 'Working Directory',
        desc: 'The actual files on your filesystem that you create, edit, or delete with your editor.',
      },
      'staging-area': {
        name: 'Staging Area',
        badge: 'Index / Staging Area',
        desc: 'The preparation area where you select and organize specific changes you plan to include in your next snapshot (via git add).',
      },
      'repository': {
        name: 'Git Repository',
        badge: 'Repository (.git)',
        desc: 'The permanent database where finalized snapshots are saved with unique SHA hashes and commit messages (via git commit).',
      },
    },
  },
  prerequisites: {
    title: 'Before You Begin',
    body:
      'Before jumping into Git, being comfortable with basic terminal commands (cd, ls, touch, cat) will make your learning experience smooth and intuitive.',
    tip: 'Whenever in doubt in Git, never hesitate to run "git status"! It never changes any files and always clarifies what is going on.',
  },
  curriculum: {
    title: 'What You Will Learn in KLU Git',
    subtitle: 'Hands-on practice directly in your browser with our interactive simulated Git engine.',
    topics: {
      'git-1': {
        level: 'Git 1',
        title: 'Core Workflow',
        description: 'Initialize repositories, monitor staging status, craft commits, and inspect history logs.',
        status: 'Ready',
      },
      'git-2': {
        level: 'Git 2',
        title: 'Diffs & Safeguards',
        description: 'Inspect file differences with git diff, discard mistakes with git restore, and ignore files with .gitignore.',
        status: 'Ready',
      },
      'git-3': {
        level: 'Git 3',
        title: 'Branches & Merging',
        description: 'Create independent feature branches with git switch, merge them smoothly, and resolve conflicts safely.',
        status: 'Ready',
      },
      'git-4': {
        level: 'Git 4',
        title: 'Remote Repositories',
        description: 'Clone remote repositories, manage upstream remotes, and master git push and git pull.',
        status: 'Ready',
      },
    },
  },
};
