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
$ git commit -m "Ilk notlar dosyasi eklendi"
[main (root-commit) 4a8b1c2] Ilk notlar dosyasi eklendi
 1 file changed, 0 insertions(+), 0 deletions(-)
\`\`\`

---

### Viewing History: \`git log\`

Run \`git log\` to review your repository's commit history:

\`\`\`
$ git log --oneline
4a8b1c2 Ilk notlar dosyasi eklendi
\`\`\`
`,
    tasks: {
      'git-add': {
        description: 'Stage `notlar.txt` for commit using `git add notlar.txt`.',
        hints: ['Type `git add notlar.txt` and check `git status` to confirm it is staged.'],
      },
      'git-commit': {
        description: 'Commit staged changes with message `"Ilk commit"` using `git commit -m "Ilk commit"`.',
        hints: ['Run `git commit -m "Ilk commit"`. Make sure the message matches.'],
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
    content: `
### Seeing Differences: \`git diff\`

When you edit files in your working directory, \`git diff\` displays exactly what was added, modified, or deleted line by line.

- Lines starting with **\`-\` (red)** were removed.
- Lines starting with **\`+\` (green)** were added.

\`\`\`
$ git diff
diff --git a/kod.py b/kod.py
--- a/kod.py
+++ b/kod.py
@@ -1,3 +1,4 @@
 def selam():
-    print("Merhaba")
+    print("Merhaba Dunya")
\`\`\`

---

### Working Directory vs Staging Area

- \`git diff\`: Compares **Working Directory** against **Staging Area**.
- \`git diff --staged\`: Compares **Staging Area** against the **last commit (HEAD)**.
`,
    tasks: {
      'git-diff-working': {
        description: 'Run `git diff` to view unstaged modifications made to `kod.py`.',
        hints: ['Type `git diff` to inspect line modifications.'],
      },
      'git-add-change': {
        description: 'Stage `kod.py` with `git add kod.py`.',
        hints: ['Run `git add kod.py`.'],
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
    content: `
### Discarding Mistakes: \`git restore\`

Made a mistake or staged something by accident?

- \`git restore --staged <file>\`: Removes file from staging area, leaving your working directory untouched.
- \`git restore <file>\`: Discards modifications in the working directory, restoring file to the last committed state.

---

### Ignoring Files: \`.gitignore\`

Files like temporary logs, compiled binaries, or sensitive environment files should not be tracked by Git.
Add file patterns to a \`.gitignore\` file in the root of your repository:

\`\`\`
*.log
node_modules/
.env
\`\`\`
`,
    tasks: {
      'git-restore-staged': {
        description: 'Remove `notlar.txt` from the staging area using `git restore --staged notlar.txt`.',
        hints: ['Run `git restore --staged notlar.txt`.'],
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
    content: `
### What is a Branch?

A branch in Git is simply a movable pointer to a commit. By creating a branch, you can build new features or experiment without affecting the stable \`main\` branch.

- \`git branch\`: List existing branches (* marks current branch).
- \`git branch <name>\`: Create a new branch.
- \`git switch <name>\`: Switch to an existing branch.
- \`git switch -c <name>\`: Create and switch to a new branch in one command.
- \`git branch -d <name>\`: Delete a merged branch.
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
    content: `
### Merging Branches

Once work on a branch is finished and verified, you merge it into your target branch (typically \`main\`):

\`\`\`
$ git switch main
$ git merge ozellik
Updating 4a8b1c2..8e2d3f1
Fast-forward
 kod.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
\`\`\`

- **Fast-forward:** If main hasn't diverged, Git simply moves the pointer forward.
- **3-way merge:** If both branches have new commits, Git creates a dedicated merge commit.
`,
    tasks: {
      'git-merge-feature': {
        description: 'Merge the `ozellik` branch into `main` using `git merge ozellik`.',
        hints: ['Make sure you are on `main`, then run `git merge ozellik`.'],
      },
      'git-delete-branch': {
        description: 'Delete the merged `ozellik` branch with `git branch -d ozellik`.',
        hints: ['Type `git branch -d ozellik`.'],
      },
    },
  },
  'git-4-push': {
    title: 'Cloning Remote Repositories: git clone',
    summary: 'Clone an existing remote repository and inspect origin configuration',
    content: `
### What is a Remote Repository?

A remote repository is a Git repository hosted on a server or another directory.
With \`git clone\`, Git copies the complete project history, creates a working directory, and automatically sets up a connection named \`origin\`.

\`\`\`
$ git clone /srv/git/proje.git
Cloning into 'proje'...
done.
\`\`\`
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
    title: 'Syncing Changes: push and pull',
    summary: 'Push local commits to remote with git push, and pull remote updates with git pull',
    content: `
### Synchronizing with Remote: \`git push\` and \`git pull\`

- \`git push\`: Uploads your local commits to the remote repository.
- \`git pull\`: Fetches commits from the remote repository and immediately integrates them into your current branch.

\`\`\`
$ git push origin main
$ git pull origin main
\`\`\`
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
