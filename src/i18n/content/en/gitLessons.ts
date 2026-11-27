import type { LessonTranslation, LevelTranslation } from '../../types';

export const EN_GIT_LEVELS: Record<string, LevelTranslation> = {
  'git-level-1': {
    title: 'Git 1 — Core Workflow',
    description: 'Repository initialization, staging area (git add), commits, and log history.',
  },
  'git-level-2': {
    title: 'Git 2 — Diffs & Safeguards',
    description: 'Inspecting differences (git diff), unstaging/discarding (git restore), and ignoring files (.gitignore).',
  },
  'git-level-3': {
    title: 'Git 3 — Branches & Merging',
    description: 'Branch management (branch, switch), fast-forward vs 3-way merges, and conflict resolution.',
  },
  'git-level-4': {
    title: 'Git 4 — Remotes & Collaboration',
    description: 'Cloning remote repositories, origin remotes, pushing commits (push), and pulling changes (pull).',
  },
};

export const EN_GIT_LESSONS: Record<string, LessonTranslation> = {
  'git-1-init': {
    title: 'Initialize Your First Repository',
    summary: 'Initialize a new repository with git init and check working tree state with git status',
    examples: ['git status', 'git init', 'touch notlar.txt'],
    content: `
### What is a Git Repository?

A Git repository (*repo*) is simply a directory where Git tracks all file modifications.
When you run \`git init\`, Git creates a hidden directory named \`.git\` inside your current folder.
This \`.git\` folder is Git's database—it stores all your commits, branch pointers, and history.

\`\`\`
$ git init
Initialized empty Git repository in /home/kullanici/.git/
\`\`\`

---

### The Most Important Command: \`git status\`

\`git status\` tells you:
1. Which branch you are currently on (usually \`main\` or \`master\`).
2. Which files have been modified.
3. Which files are staged for the next commit.
4. Which files are **Untracked** (not yet tracked by Git).

> 💡 **Habit:** Whenever using Git, never hesitate to type \`git status\`! It never modifies any files; it only shows current status.
`,
    tasks: {
      'git-init': {
        description: 'Run `git init` in the current directory to initialize an empty Git repository.',
        hints: ['Just type `git init` and press Enter.', 'This command creates the hidden `.git` folder.'],
      },
      'git-status': {
        description: 'Run `git status` to inspect the state of the repository.',
        hints: ['Type `git status` to see that there are no commits yet and you are on the main branch.'],
      },
      'create-untracked': {
        description: 'Create a file with `touch notlar.txt`, then run `git status` to see it listed under *Untracked*.',
        hints: [
          'First type `touch notlar.txt` to create the file.',
          'Next, run the `git status` command.',
        ],
      },
    },
  },
  'git-1-commit': {
    title: 'Staging and First Commit',
    summary: 'Stage files with git add and record your first permanent snapshot with git commit',
    examples: ['git status', 'git add notlar.txt', 'git commit -m "First commit"', 'git log --oneline'],
    content: `
### Staging Area (The Index)

In Git, changes are not committed directly from the working directory. First, you choose which files belong to the upcoming snapshot and place them in the **Staging Area** (also called index) using \`git add\`.

\`\`\`
$ git add notlar.txt
$ git status
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   notlar.txt
\`\`\`

---

### Recording History: \`git commit\`

Once your files are staged, you bundle them into a permanent snapshot with \`git commit\`.
Every commit requires a clear, meaningful message describing the change:

\`\`\`
$ git commit -m "Add first notes file"
[main (root-commit) 4a8b1c2] Add first notes file
 1 file changed, 0 insertions(+), 0 deletions(-)
\`\`\`

---

### Viewing History: \`git log\`

Run \`git log\` to review your repository's commit history:

\`\`\`
$ git log --oneline
4a8b1c2 Add first notes file
\`\`\`
`,
    tasks: {
      'git-add': {
        description: 'Stage `notlar.txt` for commit using `git add notlar.txt`.',
        hints: ['Type `git add notlar.txt` and check `git status` to confirm it is staged.'],
      },
      'git-commit': {
        description: 'Commit the staged file with the message `First commit`.',
        hints: ['Run `git commit -m "First commit"`.', 'The check requires a successful commit command; the message can be written in English.'],
        solution: 'git commit -m "First commit"',
      },
      'git-log': {
        description: 'Run `git log` to see your recorded commit in the history.',
        hints: ['Type `git log` or `git log --oneline`.'],
      },
    },
  },
  'git-2-diff': {
    title: 'Inspecting Changes: git diff',
    summary: 'View modified lines before staging, and compare staged changes against HEAD',
    examples: ['git status', 'git diff', 'git add metin.txt', 'git diff --staged'],
    content: `
### Seeing Differences: \`git diff\`

When you edit files in your working directory, \`git diff\` displays exactly what was added, modified, or deleted line by line.

- Lines starting with **\`-\` (red)** were removed.
- Lines starting with **\`+\` (green)** were added.

\`\`\`
$ git diff
diff --git a/metin.txt b/metin.txt
--- a/metin.txt
+++ b/metin.txt
@@ -1,1 +1,2 @@
 Temel proje metni.
+Bu satır sonradan eklendi.
\`\`\`

---

### Working Directory vs Staging Area

- \`git diff\`: Compares **Working Directory** against **Staging Area**.
- \`git diff --staged\`: Compares **Staging Area** against the **last commit (HEAD)**.

These two comparisons answer different questions. Review the unstaged diff before adding files; after staging, review the staged diff to confirm exactly what the next commit will contain. Neither command changes the worktree or the index.
`,
    tasks: {
      'git-diff-working': {
        description: 'Run `git diff` to view the unstaged modification in the prepared `metin.txt` fixture.',
        hints: ['Type `git diff` to inspect line modifications.'],
      },
      'git-add-change': {
        description: 'Stage the prepared `metin.txt` fixture with `git add metin.txt`.',
        hints: ['Run `git add metin.txt`.'],
      },
      'git-diff-staged': {
        description: 'Inspect the staged changes using `git diff --staged`.',
        hints: ['Type `git diff --staged` or `git diff --cached`.'],
      },
    },
  },
  'git-2-restore': {
    title: 'Undoing Changes and .gitignore',
    summary: 'Unstage files, discard unstaged modifications, and ignore sensitive/temp files with .gitignore',
    examples: ['git status', 'git restore --staged app.js', 'git restore app.js', 'echo "*.log" > .gitignore'],
    content: `
### Discarding Mistakes: \`git restore\`

Made a mistake or staged something by accident? Git can help you recover, but a restore operation is not a universal undo button: restoring a file in the worktree discards its uncommitted edits.

- \`git restore --staged <file>\`: Removes file from staging area, leaving your working directory untouched.
- \`git restore <file>\`: Discards modifications in the working directory, restoring file to the last committed state.

---

### Ignoring Files: \`.gitignore\`

Files like temporary logs, compiled binaries, or sensitive environment files should not be tracked by Git.
Add file patterns to a \`.gitignore\` file in the root of your repository. Git applies these rules to untracked files; adding a pattern does not remove a file that is already tracked. Review the status after creating the file to confirm which entries it affects:

\`\`\`
*.log
node_modules/
.env
\`\`\`

Use narrow patterns when possible. A broad ignore rule can hide a file you intended to commit, so check \`git status --ignored\` if you are unsure whether a path is being ignored.
`,
    tasks: {
      'git-restore-staged': {
        description: 'Remove the staged `app.js` file from the index with `git restore --staged app.js`.',
        hints: ['Run `git restore --staged app.js`.'],
      },
      'git-restore-worktree': {
        description: 'Discard uncommitted changes in `kod.py` using `git restore kod.py`.',
        hints: ['Type `git restore kod.py` to revert it back to the last commit.'],
      },
      'create-gitignore': {
        description: 'Create a `.gitignore` file and append `*.log` into it, or verify untracked logs are ignored.',
        hints: ['Run `echo "*.log" > .gitignore` then check `git status`.'],
      },
    },
  },
  'git-3-branch': {
    title: 'Branches & Switching: branch and switch',
    summary: 'Create independent lines of development, switch branches, and delete merged branches',
    examples: ['git branch', 'git switch -c ozellik', 'git switch main'],
    content: `
### What is a Branch?

A branch in Git is simply a movable pointer to a commit. By creating a branch, you can build new features or experiment without affecting the stable \`main\` branch.

- \`git branch\`: List existing branches (* marks current branch).
- \`git branch <name>\`: Create a new branch.
- \`git switch <name>\`: Switch to an existing branch.
- \`git switch -c <name>\`: Create and switch to a new branch in one command.
- \`git branch -d <name>\`: Delete a merged branch.

Branches are lightweight names that move as new commits are made; they are not separate copies of the whole project. Switching changes which branch HEAD points to and updates the working tree to that branch's snapshot. Commit or save work before switching if you are unsure how Git will carry local edits across.
`,
    tasks: {
      'git-branch-list': {
        description: 'Run `git branch` to list existing branches.',
        hints: ['Type `git branch`.'],
      },
      'git-switch-create': {
        description: 'Create and switch to a new branch named `ozellik` using `git switch -c ozellik`.',
        hints: ['Run `git switch -c ozellik` or `git checkout -b ozellik`.'],
      },
      'git-switch-back': {
        description: 'Switch back to the `main` branch with `git switch main`.',
        hints: ['Run `git switch main`.'],
      },
    },
  },
  'git-3-merge': {
    title: 'Merging Branches: git merge',
    summary: 'Integrate feature branch changes into main using fast-forward or 3-way merge',
    examples: ['git branch', 'git merge yeni-ozellik', 'git log --oneline'],
    content: `
### Merging Branches

Once work on a branch is finished and verified, you merge it into your target branch (typically \`main\`):

\`\`\`
$ git switch main
$ git merge yeni-ozellik
Updating 4a8b1c2..8e2d3f1
Fast-forward
 buton.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
\`\`\`

- **Fast-forward:** If main hasn't diverged, Git simply moves the pointer forward.
- **3-way merge:** If both branches have new commits, Git creates a dedicated merge commit.

If both branches changed the same lines in incompatible ways, Git can pause the merge and mark a conflict for the user to resolve. Review the marked file, choose the intended content, stage the resolution, and finish the merge. This lesson's prepared history is arranged for a fast-forward, so its merge command completes without a conflict.
`,
    tasks: {
      'git-branch-check': {
        description: 'Run `git branch` to confirm the feature branch exists before merging.',
        hints: ['Type `git branch`.', 'The list should contain `yeni-ozellik`.'],
      },
      'git-merge-feature': {
        description: 'Merge `yeni-ozellik` into the current branch with `git merge yeni-ozellik`.',
        hints: ['Confirm you are on `main`, then run `git merge yeni-ozellik`.'],
      },
      'git-log-verify': {
        description: 'Review the one-line history after the merge with `git log --oneline`.',
        hints: ['Run `git log --oneline` and inspect the newest commit.'],
      },
    },
  },
  'git-4-push': {
    title: 'Connect and Push to a Remote Repository',
    summary: 'Configure a remote, inspect its URL, and push commits with an upstream branch',
    examples: ['git remote add origin https://github.com/klu/notlar.git', 'git remote -v', 'git push -u origin main'],
    content: `
### Add a Remote

A remote configuration associates a short name, usually \`origin\`, with a repository URL. \`git remote -v\` displays the configured fetch and push URLs. Adding a URL only stores configuration; it does not itself send data over the network.

\`\`\`
$ git remote add origin https://github.com/klu/notlar.git
$ git remote -v
origin  https://github.com/klu/notlar.git (fetch)
origin  https://github.com/klu/notlar.git (push)
\`\`\`

### Push Local Commits

\`git push -u origin main\` sends the local branch's commits to the configured remote. The \`-u\` option (also called \`--set-upstream\`) records the upstream branch, so later pushes can usually use the shorter \`git push\` command.

> **KLU simulation:** KLU does not connect to GitHub or the public internet. Remote URLs in these lessons resolve to local virtual repositories under \`/var/klu-remotes\`; push and pull operate only on that simulated filesystem.
`,
    tasks: {
      'git-remote-add': {
        description: 'Connect the local repository to a remote with `git remote add origin https://github.com/klu/notlar.git`.',
        hints: ['Run the command as shown.', 'This records the remote in the simulated repository configuration.'],
      },
      'git-remote-verify': {
        description: 'Run `git remote -v` to inspect the configured remote and its fetch and push URLs.',
        hints: ['Run `git remote -v`.', 'You should see fetch and push URLs for origin.'],
      },
      'git-push-main': {
        description: 'Send your commits to the remote with `git push -u origin main`.',
        hints: ['Run `git push -u origin main`.', 'The `-u` flag sets the upstream branch for later pushes.'],
      },
    },
  },
  'git-4-clone-pull': {
    title: 'Clone a Project and Pull Updates',
    summary: 'Clone a simulated remote, enter the project, pull a new commit, and inspect history',
    examples: ['git clone https://github.com/klu/notlar.git', 'cd ekip-projesi', 'git pull', 'git log --oneline'],
    content: `
### Clone a Repository

\`git clone <url>\` creates a working directory, copies the available files and history, and configures the remote as \`origin\`. In this exercise the URL maps to a local virtual remote; it is not fetched from GitHub.

\`\`\`
$ git clone https://github.com/klu/notlar.git
$ cd notlar
$ git remote -v
\`\`\`

### Pull New Changes

After another contributor pushes a commit, \`git pull\` fetches it from the configured remote and integrates it into the current branch. Inspect the working tree and history afterward to confirm what arrived.

\`\`\`
$ git pull
$ git log --oneline
\`\`\`

> **KLU simulation:** The URL is a lesson fixture. Clone and pull use local repositories under \`/var/klu-remotes\`, without a real GitHub or internet connection.
`,
    tasks: {
      'git-clone-notlar': {
        description: 'Clone the remote repository with `git clone https://github.com/klu/notlar.git`.',
        hints: ['Run `git clone https://github.com/klu/notlar.git`.', 'A `notlar` directory will be created in your home directory.'],
      },
      'cd-ekip-projesi': {
        description: 'Enter the prepared team project directory with `cd ekip-projesi`.',
        hints: ['Run `cd ekip-projesi`.'],
      },
      'git-pull-updates': {
        description: 'Run `git pull` to receive the new commit pushed by your teammate.',
        hints: ['Run `git pull`.', 'The `gorevler.txt` file and the new commit will appear in the working tree.'],
      },
      'git-log-oneline': {
        description: 'Run `git log --oneline` to verify that the new commit appears in history.',
        hints: ['Run `git log --oneline`.'],
      },
    },
  },
};
