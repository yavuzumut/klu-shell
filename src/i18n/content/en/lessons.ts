import type { LessonTranslation, LevelTranslation } from '../../types';

export const EN_LEVELS: Record<string, LevelTranslation> = {
  "level-0": {
    "title": "Before You Begin",
    "description": "Terminal, shell and Linux fundamentals; how KLU works and key habits."
  },
  "level-1": {
    "title": "Beginner",
    "description": "Terminal navigation, file and directory operations."
  },
  "level-2": {
    "title": "Intermediate",
    "description": "Redirection (>, >>), pipelines (|), text processing (grep, head, tail, wc, sort, uniq) and file searching (find)."
  },
  "level-3": {
    "title": "Advanced",
    "description": "System info, environment variables ($VAR, env, export), file permissions (chmod), logical operators (&&, ||), path tools (stat, realpath, basename), and process management (ps, kill)."
  }
};

/** Additional English explanations that preserve the source lessons' teaching depth. */
export const EN_LESSON_EXTENSIONS: Record<string, string> = {
  'l0-intro': `### How the Pieces Fit Together

The terminal is the interface, while the shell interprets what you type. The shell turns a command into a request to the operating system; the Linux kernel manages hardware and system resources. These names describe different layers, even though people often use “terminal” to mean the whole command-line experience.

The prompt is a visual cue, not part of the command. In the example, \`~\` represents the home directory and \`$\` marks a regular user prompt; a real root prompt often uses \`#\`. The username and host portions identify the account and machine in an actual shell. Type only the command after the prompt, then press Enter. Linux distributions combine the kernel with user tools, so they are complete operating systems built around that core. KLU simulates this workflow in the browser; it is not a real Bash process or Linux kernel.`,
  'l0-klu-works': `### What Runs in the Browser

KLU pairs a shell command interpreter with a virtual filesystem. Commands read and change that in-memory tree rather than your computer's files. Lesson setup restores the expected starting files so a task can be repeated; the free terminal filesystem resets when the page is refreshed.

### Progress and Safety Boundaries

Lesson progress is stored separately in browser storage. Clearing that storage removes the saved progress. “Safe to experiment” applies to KLU's sandbox only: real shells can modify or permanently delete files on the machine where they run. The commands are useful practice, but not every Linux feature or command is implemented here.`,
  'l0-modes-tools': `### Practice and Reference Areas

Use Lessons for guided tasks and instant checks, or switch to Sandbox to explore without a lesson validator. The File Tree shows the current virtual files and lets you inspect them. Git has its own workspace and guided Git 1–4 lessons; its remotes are local simulations.

The Cheat Sheet sends a selected command to the sandbox terminal. Explore introduces external Linux tools and their real installation commands; those tools do not run inside KLU. The theme selector changes the interface and terminal appearance, while the language switcher changes interface and lesson text.`,
  'l0-habits': `### Read a Command Before Running It

Separate the command name from its options and arguments. A hyphenated short option such as \`-la\` can combine options; long options usually begin with two hyphens, as in \`--help\`. The argument tells the command what path or value to use.

### Recover and Get Help

Use the Up and Down arrows to recall history, Tab to complete supported names, and Ctrl+C to cancel the current input. Ctrl+L clears the display without deleting files or history. When unsure, inspect a command's help or manual before trying options. KLU implements a teaching-oriented subset of shell behavior, so real Bash shortcuts and options may differ.`,
  'l0-real-linux': `### What Transfers—and What Does Not

The command-line ideas in this course—paths, options, quoting, pipes, and redirection—are useful on real Linux systems. KLU's supported command set and filesystem are deliberately limited, however, and its commands do not affect a real operating system. The same command can support more options or have different consequences on a real machine, so check the real system's manual before relying on behavior learned in a simulator.

### Choose a Safe First Environment

WSL provides a genuine Linux environment on Windows; a virtual machine runs a separate guest system; macOS includes a Terminal app with a Unix-like shell. A live USB can boot a Linux environment without installing it to the internal drive, while dual boot installs Linux alongside another operating system. Package managers such as \`apt\`, \`dnf\`, and \`pacman\` install software on supported distributions; they are outside KLU's simulated command set. Learn the target environment's recovery and backup practices before running commands that delete or change system files.

### What to Learn Next

The next Linux level practices directory navigation with \`cd\`, listings with \`ls\`, and creating, reading, copying, moving, and removing files with \`mkdir\`, \`touch\`, \`cat\`, \`cp\`, \`mv\`, and \`rm\`. Begin with a disposable practice directory, inspect paths before changing them, and keep backups of real work. KLU's lesson fixtures make these tasks repeatable; on a real system, your commands act on its actual files.`,
  'l1-welcome': `### Working Directory and Absolute Paths

The shell keeps a current working directory, so a relative path is interpreted from that location. An absolute path begins at the root directory \`/\` and identifies the same location regardless of where you are. The home shortcut \`~\` expands to your user's home directory.

Try \`pwd\` after changing directories to see this context. In KLU, \`/home/kullanici\` is the simulated home path; the username is part of the exercise environment and is not your computer account.`,
  'l1-listing': `### Hidden Files and Long Listings

Names beginning with a dot are hidden by convention; they are still present in the directory. Add \`-a\` to include them. The \`-l\` option shows a detailed row with mode bits, owner, group, size, date, and name. Use both options together to inspect hidden entries and metadata.

\`\`\`
$ ls -la
\`\`\`

The listing uses the files seeded for this lesson. Its Turkish names are part of the current virtual filesystem and are intentionally retained where tasks check for those exact entries.`,
  'l1-navigation': `### Relative and Absolute Movement

The command \`cd\` changes the shell's working directory. A directory name such as \`Belgeler\` is relative to your current location; \`/etc\` is absolute. The special path \`..\` means the parent directory, while \`~\` means home. Use \`pwd\` to verify every move.

\`\`\`
$ cd Belgeler
$ pwd
$ cd ..
\`\`\`

This lesson checks its seeded directory paths, so keep the provided path names exactly as shown in its tasks.`,
  'l1-creating': `### Parent Directories and Empty Files

Without \`-p\`, \`mkdir\` creates the requested directory only when its parent already exists. With \`-p\`, it creates missing parents along the path and does not complain if those directories already exist. This makes it useful for preparing a nested project layout in one command.

\`\`\`
$ mkdir -p projects/docs/notes
$ touch projects/notes.txt
\`\`\`

\`touch\` creates a missing empty file; when the file exists, it updates its timestamps rather than replacing its contents. The task checks use the lesson's own fixed virtual paths, while these English names illustrate the general pattern.`,
  'l1-reading': `### Read Only What You Need

\`cat\` prints a file's contents to standard output. For a short file this is convenient; for long files, commands such as \`head\` and \`tail\` are easier to scan. The \`-n\` option on \`cat\` adds line numbers, which helps refer to a particular line without changing the file.

### Manuals and Quick Help

\`man <command>\` opens the command's detailed manual page. \`<command> --help\` is a shorter usage summary when the command supports it. The file names in the tasks point to lesson fixtures, including a hidden file, and must remain unchanged for their output checks.`,
  'l1-copy-move': `### Copying and Moving Are Different

\`cp\` leaves the source in place and creates a copy at the destination. To copy a directory tree, include \`-r\`; otherwise the command rejects a directory. \`mv\` moves an item or renames it when the source and destination are in the same directory.

\`\`\`
$ cp source.txt backup.txt
$ cp -r projects docs-backup
$ mv draft.txt final.txt
\`\`\`

When the destination is an existing directory, \`mv\` places the source inside it. The task checks use specific seeded files and destinations, so use those exact paths when solving them.`,
  'l1-removing': `### Remove Carefully

\`rm\` removes files. It does not move them to a recycle bin, and the command-line interface may not offer a simple undo. The recursive option \`-r\` is needed for a directory and its contents; \`-f\` suppresses prompts and errors for missing paths, so combining it with recursion deserves particular care.

\`\`\`
$ rm old-notes.txt
$ rm -r old-project
\`\`\`

Before running a removal command, inspect the target with \`pwd\` and \`ls\`. The lesson's final task checks that one file has moved into the requested archive path and no longer remains at its original path.`,
  'l2-redirection': `### Standard Output and Redirection

Commands normally write their results to standard output, which the terminal displays. A single \`>\` creates a file or replaces its existing contents. A double \`>>\` creates the file if needed and appends after its current contents. The spaces around the operator are conventional and make the command easier to read.

\`\`\`
$ echo "First line" > notes.txt
$ echo "Another line" >> notes.txt
$ cat notes.txt
\`\`\`

Redirection changes where output goes; it does not print that redirected text to the terminal. This lesson's validator checks exact text and a specific file, so use the prescribed task strings and path when completing it.`,
  'l2-pipes': `### Connect Small Commands

A pipe sends the left command's standard output to the right command's standard input. It does not create an intermediate file. Commands can therefore be combined to filter, count, sort, or preview a stream of results.

\`\`\`
$ ls | head -n 2
$ cat notes.txt | wc -l
\`\`\`

Read a pipeline from left to right: first identify what the first command produces, then what the next command does with that input. The task's prepared file contains the expected number of lines, so retain its exact path for the checked task.`,
  'l2-head-tail': `### Preview Long Files

\`head\` shows the beginning of a file and \`tail\` shows its end. Both default to ten lines; \`-n\` selects another count. These commands are useful for quickly checking a log without printing the entire file.

\`\`\`
$ head -n 3 server.log
$ tail -n 2 server.log
\`\`\`

The exercise checks particular log lines, so its fixture path and expected line text remain fixed. The English file name above is a general example; use the task's specified file while practicing.`,
  'l2-wc': `### Choose What to Count

\`wc\` can count lines with \`-l\`, words with \`-w\`, and bytes with \`-c\`. With no option it prints all three counts. It can read a file directly or receive text from a pipeline, for example \`ls | wc -l\` to count entries in a directory listing.

\`\`\`
$ wc -l poem.txt
$ wc -w poem.txt
\`\`\`

The seeded poem is used by the task checks to make the expected counts repeatable. Keep the provided path for task completion; the English name here describes a typical real-world file.`,
  'l2-grep': `### Match Patterns in Text

\`grep\` prints lines that match a pattern. Use \`-i\` to ignore letter case, \`-n\` to show line numbers, and \`-c\` to print only the number of matching lines. A pattern may be a word or a regular expression. Quote patterns that contain spaces or shell metacharacters.

\`\`\`
$ grep -in "memory" application.log
$ grep -c ERROR application.log
\`\`\`

The lesson's fixture includes known log records and the checks expect their exact text. The English command examples explain the flags; use the prescribed search term and fixture path for the graded tasks.`,
  'l2-sort-uniq': `### Sort Before Removing Duplicates

\`sort\` orders lines alphabetically by default. Use \`-n\` for numeric order and \`-r\` to reverse the result. \`uniq\` removes only adjacent duplicate lines, so sort first when you want duplicates separated in the original input to collapse as well.

\`\`\`
$ sort names.txt | uniq
$ sort names.txt | uniq -c
\`\`\`

The \`-c\` option prefixes each unique line with its count. The exercise's city data deliberately contains repeated names and its validator checks the exact resulting order; retain that fixture when doing the task.`,
  'l2-find': `### Filter a Directory Tree

\`find\` starts at a path and visits its descendants. The \`-name\` predicate filters by a filename pattern; \`-type f\` selects regular files and \`-type d\` selects directories. You can combine predicates to narrow the result.

\`\`\`
$ find projects -name "*.js"
$ find projects -type d
\`\`\`

Quote wildcard patterns so the shell passes them to \`find\` instead of expanding them before the command runs. The command reports one matching path per line, which makes its output easy to pipe into another command or compare with an expected list. This lesson checks named files and directory paths in its prepared project tree, so use the task's root path exactly.`,
  'l3-system-info': `### Read System Identity

\`whoami\` prints the active user name. \`uname\` reports the operating-system name, while \`uname -a\` includes additional kernel and machine details; \`-r\` prints only the kernel release. \`date\` shows the current date and time according to the environment. These are read-only inspection commands: they help identify the context before you choose other commands, and they do not change files or system settings.

\`\`\`
$ whoami
$ uname -a
$ date
\`\`\`

KLU returns simulator-defined system values rather than inspecting your host computer. The expected virtual username is \`kullanici\`; that output is part of the validator and is not localized. On a real machine the output reflects its actual account, kernel, architecture, and clock, which may differ from these lesson fixtures.`,
  'l3-environment': `### Inspect the Environment

Environment variables are named values available to programs launched by the shell. \`env\` lists them, and \`echo $NAME\` expands one value into a command argument. The \`export NAME=value\` form defines or updates a variable and makes it available to child processes.

\`\`\`
$ env | grep USER
$ export CITY="Springfield"
$ echo $CITY
\`\`\`

Variable names are case-sensitive. The task uses a custom check for the exact variable \`SEHIR\` and value \`Kirklareli\`; changing either would fail that check, so those values stay as defined by the exercise.`,
  'l3-which-path': `### Search Order in PATH

\`PATH\` is a colon-separated list of directories. When you type a command without a slash, the shell checks those directories in order and runs the first matching executable. \`which\` reports the resolved executable path in this simulator.

\`\`\`
$ echo $PATH
$ which ls
$ which grep
\`\`\`

An absolute executable path can be run directly; a relative executable in the current directory is commonly written with a \`./\` prefix. KLU's search path and command locations are virtual fixture values, not paths on the host system.`,
  'l3-chmod-numeric': `### Calculate Numeric Modes

The three digits in a mode apply to owner, group, and others. Each digit is the sum of read (\`4\`), write (\`2\`), and execute (\`1\`): \`7\` means all three, \`6\` means read and write, and \`5\` means read and execute. Thus \`755\` gives the owner full access and gives the other classes read and execute; \`644\` gives only the owner write access.

\`\`\`
$ chmod 644 report.txt
$ chmod 755 backup.sh
$ ls -l
\`\`\`

The mode is stored on the virtual file node. The lesson checks the exact modes on its seeded files, so keep the required paths and numeric values unchanged.`,
  'l3-chmod-symbolic': `### Change One Permission Symbolically

Symbolic modes identify a class and an operation. For example, \`u+x\` adds execute permission for the owner; \`a+x\` adds it for everyone. A bare \`+x\` in KLU applies the supported execute-bit change. Removing write access uses \`-w\`.

\`\`\`
$ chmod +x hello.sh
$ ./hello.sh
\`\`\`

The current directory is not searched automatically for programs, so \`./\` explicitly points to the script there. KLU checks the execute bit before running a script. The task's script path and expected greeting are fixed by its validator and must remain unchanged.`,
  'l3-processes-ps': `### Read a Process Listing

\`ps\` displays processes in the current session. The \`aux\` form includes a broader process list with user, PID, CPU and memory columns, and command name. A PID uniquely identifies a process in the current process table.

\`\`\`
$ ps
$ ps aux
$ ps aux | grep worker
\`\`\`

Piping the list to \`grep\` is a quick way to find a command by name. The worker process is a simulator fixture, so use \`worker.py\` as specified in the task's output checks.`,
  'l3-kill-process': `### Send a Signal to a Process

\`kill PID\` sends the default SIGTERM signal, which asks a process to stop cleanly. If it does not exit, \`kill -9 PID\` sends SIGKILL, which forces termination and does not allow cleanup. Confirm the PID from a current process listing before acting; PIDs can be reused after a process exits.

\`\`\`
$ ps aux | grep loop
$ kill 2048
$ ps
\`\`\`

The stuck loop and PID in this exercise are controlled fixtures. The task checks the process state and expects the specified process to be stopped.`,
  'l3-logic-operators': `### Conditional Command Chains

\`&&\` runs the next command only when the previous command succeeds. \`||\` runs the next command only when the previous command fails. A semicolon separates commands that should run regardless of the earlier exit status. These operators let a short command line express a simple decision.

\`\`\`
$ mkdir -p projects && cd projects
$ cat missing.txt || echo "File not found"
\`\`\`

The left command's exit status controls which part of the chain runs. The graded examples use fixed directory and output text values; keep \`calisma\` and \`Dosya yok\` exactly where required by the checks.`,
  'l3-path-and-stat': `### Inspect Paths and Metadata

\`stat\` reports metadata such as file type, size, permissions, and timestamps. \`realpath\` resolves a relative path to an absolute one. \`basename\` extracts the final path component and can remove a supplied suffix.

\`\`\`
$ stat documents/report.pdf
$ realpath ..
$ basename documents/report.pdf .pdf
\`\`\`

These commands answer different questions: metadata about a node, the full location of a path, and the final name in a path. The lesson's seeded PDF path is case-sensitive and is retained in the task descriptions and validator checks.`,
};
export const EN_LESSON_EXAMPLES: Record<string, string[]> = {
  'l0-intro': ['help', 'echo "Merhaba Linux"'],
  'l0-klu-works': ['pwd', 'echo "Testing KLU"'],
  'l0-modes-tools': ['history', 'help'],
  'l0-habits': ['pwd --help', 'man ls', 'clear'],
  'l0-real-linux': ['clear', 'help'],
  'l1-welcome': ['pwd', 'echo "Merhaba Dünya"', 'help', 'clear'],
  'l1-listing': ['ls', 'ls -a', 'ls -l', 'ls -la', 'ls /etc'],
  'l1-navigation': ['cd Belgeler', 'pwd', 'cd ..', 'cd /etc', 'cd ~', 'cd -'],
  'l1-creating': ['mkdir projeler', 'touch notlar.txt', 'mkdir -p okul/2024/matematik', 'ls -l'],
  'l1-reading': ['cat merhaba.txt', 'cat -n Belgeler/alisveris.txt', 'man cat', 'ls --help'],
  'l1-copy-move': ['ls calisma', 'cp merhaba.txt merhaba_yedek.txt', 'mv calisma/taslak.txt calisma/son.txt', 'cp -r Belgeler Belgeler_yedek'],
  'l1-removing': ['ls cop', 'rm cop/eski1.txt', 'rm -r eski_proje', 'mkdir arsiv', 'mv merhaba.txt arsiv/'],
  'l2-redirection': ['echo "Yeni Başlangıç" > ~/notlar.txt', 'echo "İkinci Satır" >> ~/notlar.txt', 'cat ~/notlar.txt', 'ls > ~/liste.txt'],
  'l2-pipes': ['cat ~/gorevler.txt | wc -l', 'ls | head -n 2', 'cat /etc/passwd | wc -l'],
  'l2-head-tail': ['head ~/sunucu.log', 'head -n 3 ~/sunucu.log', 'tail -n 2 ~/sunucu.log', 'head -n 5 /var/log/syslog'],
  'l2-wc': ['wc ~/siir.txt', 'wc -l ~/siir.txt', 'wc -w ~/siir.txt', 'ls | wc -l'],
  'l2-grep': ['grep ERROR ~/uygulama.log', 'grep -i bellek ~/uygulama.log', 'grep -n ERROR ~/uygulama.log', 'grep -c ERROR ~/uygulama.log'],
  'l2-sort-uniq': ['sort ~/sehirler.txt', 'sort -r ~/sehirler.txt', 'sort ~/sehirler.txt | uniq', 'sort ~/sehirler.txt | uniq -c'],
  'l2-find': ['find . -name "*.js"', 'find ~/proje -type d', 'find . -maxdepth 1 -type f', 'find ~ -name "*.txt"'],
  'l3-system-info': ['whoami', 'uname', 'uname -a', 'uname -r', 'date'],
  'l3-environment': ['env', 'echo $USER', 'echo $HOME', 'env | grep USER', 'export SEHIR="Kirklareli"', 'echo $SEHIR'],
  'l3-which-path': ['echo $PATH', 'which ls', 'which grep', 'which bash', 'which cat'],
  'l3-chmod-numeric': ['ls -l', 'chmod 644 rapor.txt', 'chmod 755 yedek.sh', 'chmod 700 gizli.txt'],
  'l3-chmod-symbolic': ['chmod +x selam.sh', './selam.sh', 'chmod -w selam.sh', 'ls -l'],
  'l3-processes-ps': ['ps', 'ps aux', 'ps aux | grep worker', 'ps aux | grep bash'],
  'l3-kill-process': ['ps', 'ps aux | grep loop', 'kill 2048', 'kill -9 2048'],
  'l3-logic-operators': ['mkdir -p calisma && cd calisma', 'cat yok.txt || echo "Dosya yok"', 'echo "Hello" > notes.txt && cat notes.txt', 'grep root /etc/passwd && echo "User found"'],
  'l3-path-and-stat': ['stat belgeler/rapor.pdf', 'realpath .', 'realpath ..', 'basename /var/log/syslog', 'basename belgeler/rapor.pdf .pdf'],
};

export const EN_LESSONS: Record<string, LessonTranslation> = {
  "l0-intro": {
    "title": "What is a Terminal, Shell, and Linux?",
    "summary": "The difference between GUI and CLI, core terminal concepts, and Linux architecture",
    "content": "\n### GUI vs CLI: Two Ways to Talk to Your Computer\n\nMost users interact with their computer through a **GUI** (Graphical User Interface)—clicking icons, dragging windows, and browsing menus with a mouse.\n\nThe **CLI** (Command Line Interface) lets you command your operating system directly by typing text commands.\n\n- **Terminal:** The window emulator that receives your keyboard input and displays text output.\n- **Shell (e.g. bash, zsh):** The command interpreter that reads your commands, executes them, and talks to the operating system kernel.\n- **Linux:** The secure, open-source operating system kernel that powers supercomputers, cloud servers, Android phones, and the modern internet.\n",
    "tasks": {
      "l0-help": {
        "description": "Run `help` to list available built-in commands.",
        "hints": [
          "Just type `help` and press Enter."
        ]
      },
      "l0-echo": {
        "description": "Print `Merhaba Linux` to the terminal using `echo \"Merhaba Linux\"`.",
        "hints": [
          "Type `echo \"Merhaba Linux\"` and press Enter; the expected output is checked exactly."
        ]
      }
    }
  },
  "l0-klu-works": {
    "title": "How KLU Works?",
    "summary": "Browser-based sandbox, memory-backed virtual filesystem, and safety boundaries",
    "content": "\n### What is KLU?\n\nKLU is a zero-install interactive Linux simulator that runs directly in your browser.\nIt features a virtual filesystem in memory and an isolated shell environment.\n\n- **Safe Sandbox:** You cannot break your computer or delete personal files here. Feel free to experiment!\n- **State Reset:** You can reset the filesystem at any time using the \"Reset Terminal\" button.\n- **Practice for Real Systems:** Paths, flags, and shell concepts transfer to Linux and Unix-like systems, while KLU supports only a teaching-focused subset of their commands and behavior.\n",
    "tasks": {
      "l0-pwd": {
        "description": "Check your current starting directory with `pwd`.",
        "hints": [
          "Type `pwd` to print your working directory."
        ]
      }
    }
  },
  "l0-modes-tools": {
    "title": "Modes and Tools",
    "summary": "Lessons, Sandbox mode, Git module, Cheat Sheet, and Explore section",
    "content": "\n### Five Dedicated Spaces in KLU\n\n1. **Lessons:** Guided curriculum from basics to advanced, step by step with instant task validation.\n2. **Sandbox (Free Mode):** Full freedom to practice any command with a live interactive filesystem tree.\n3. **Git Module:** Interactive Git workspace with branching, commits, diffs, and staging.\n4. **Cheat Sheet:** Quick reference for all supported shell commands.\n5. **Explore:** Curated showcase of modern CLI tools you can install on real Linux machines.\n",
    "tasks": {
      "l0-history": {
        "description": "View your recent command history with `history`.",
        "hints": [
          "Run `history` to list recent commands."
        ]
      }
    }
  },
  "l0-habits": {
    "title": "Terminal Habits & Shortcuts",
    "summary": "Tab completion, command history navigation (arrows), Ctrl+C and Ctrl+L",
    "content": "\n### Supercharge Your Speed with Shortcuts\n\n- **Tab:** Auto-completes file and directory names. Press Tab once to complete, or twice to see options.\n- **Up / Down Arrows (↑ / ↓):** Cycle through previously executed commands so you never re-type long commands.\n- **Ctrl + C:** Cancels the current running process or clears the current prompt line.\n- **Ctrl + L (or clear):** Clears the terminal screen instantly.\n",
    "tasks": {
      "l0-help-flag": {
        "description": "Inspect the `pwd` usage summary with `pwd --help`.",
        "hints": [
          "Run `pwd --help` to see the supported usage options."
        ]
      },
      "l0-man": {
        "description": "Open the manual page for the `cat` command with `man cat`.",
        "hints": [
          "Type `man cat`."
        ]
      }
    }
  },
  "l0-real-linux": {
    "title": "Moving to Real Linux & What Lies Ahead",
    "summary": "Dual boot, WSL, virtual machines, package managers, and next steps",
    "content": "\n### Taking Your Skills to Real Machines\n\nOnce you finish KLU, here is how you can use Linux on your daily computer:\n\n- **WSL (Windows Subsystem for Linux):** Run a genuine Linux environment inside Windows.\n- **Virtual Machines (VirtualBox / UTM):** Safely run a complete Linux desktop inside a virtual container.\n- **Dual Boot:** Install Ubuntu, Fedora, or Linux Mint alongside your current OS.\n- **Package Managers:** Install software via terminal using `apt`, `dnf`, or `pacman`.\n",
    "tasks": {
      "l0-clear": {
        "description": "Clear your terminal screen using `clear`.",
        "hints": [
          "Just type `clear`."
        ]
      }
    }
  },
  "l1-welcome": {
    "title": "Welcome to the Terminal",
    "summary": "Your first terminal command: print working directory with pwd",
    "content": "\n### Your First Command: `pwd`\n\nWhen you open a terminal, you are always located in a specific directory.\n`pwd` stands for **Print Working Directory** and prints the full path to where you currently are.\n\n```\n$ pwd\n/home/kullanici\n```\n\nIn Linux:\n- `/` is the root directory.\n- `/home/kullanici` is your user home directory (often abbreviated as `~`).\n",
    "tasks": {
      "pwd": {
        "description": "Run `pwd` to print your current working directory.",
        "hints": [
          "Type `pwd` and press Enter."
        ]
      }
      ,"echo": {
        "description": "Print the expected greeting `Merhaba Dünya` with `echo`; the task checks this exact output.",
        "hints": ["Run `echo Merhaba Dünya`. The expected output must remain `Merhaba Dünya`."]
      },
      "help": {
        "description": "Run `help` to review the available commands.",
        "hints": ["Type `help` and press Enter."]
      }
    }
  },
  "l1-listing": {
    "title": "Looking Around: ls",
    "summary": "List directory contents, reveal hidden files, and inspect details",
    "content": "\n### Listing Directory Contents: `ls`\n\nIn Linux, everything lives in a hierarchical tree of files and directories.\nUse `ls` (*list*) to inspect what files are located in your current directory.\n\n```\n$ ls\nBelgeler  Indirilenler  merhaba.txt  Muzik  Resimler\n```\n\nBlue items are **directories**, plain text items are **files**.\n\n### Flags & Options\n\n- `ls -a`: Show **all** files, including hidden files starting with a dot (`.`).\n- `ls -l`: Long listing format showing permissions, owner, byte size, and timestamp.\n- Combined options: `ls -la` or `ls -l -a`.\n",
    "tasks": {
      "ls": {
        "description": "Run `ls` to list the files in your home directory.",
        "hints": [
          "Just type `ls`."
        ]
      },
      "ls-a": {
        "description": "List **hidden files** in the home directory as well.",
        "hints": [
          "Use the `-a` flag with `ls`: `ls -a`."
        ]
      },
      "ls-dir": {
        "description": "List the contents of the `Belgeler` directory in long format (`-l`) without entering it.",
        "hints": [
          "Pass both `-l` and the directory name: `ls -l Belgeler`."
        ]
      }
    }
  },
  "l1-navigation": {
    "title": "Navigating Directories: cd",
    "summary": "Move between directories, jump to parent with .., and return home with cd",
    "content": "\n### Changing Directories: `cd`\n\nUse `cd` (*change directory*) to move around the filesystem.\n\n- `cd Belgeler`: Move into the `Belgeler` directory.\n- `cd ..`: Move up one level to the parent directory.\n- `cd ~`: Jump directly to your home directory.\n- `cd -`: Jump back to your previous directory.\n- `cd`: Typing `cd` alone always takes you back home.\n",
    "tasks": {
      "cd-into": {
        "description": "Navigate into the `Belgeler` directory using `cd Belgeler`.",
        "hints": [
          "Type `cd Belgeler`."
        ]
      },
      "cd-up": {
        "description": "Move back up to the parent directory using `cd ..`.",
        "hints": [
          "Type `cd ..`."
        ]
      },
      "cd-absolute": {
        "description": "Use the absolute path `/etc` to enter the system configuration directory: `cd /etc`.",
        "hints": [
          "Run `cd /etc`. An absolute path starts at `/` and does not depend on the current directory.",
          "Use the exact target `/etc`, which this task checks."
        ]
      }
    }
  },
  "l1-creating": {
    "title": "Creating Files and Directories",
    "summary": "Make directories with mkdir and create empty files with touch",
    "content": "\n### Creating Folders: `mkdir`\n\nUse `mkdir` (*make directory*) to create a new folder:\n```\n$ mkdir projeler\n```\nAdd `-p` to create nested parent directories all at once:\n```\n$ mkdir -p web/html/css\n```\n\n---\n\n### Creating Files: `touch`\n\nUse `touch` to create empty files or update their modification timestamp:\n```\n$ touch notlar.txt\n```\n",
    "tasks": {
      "mkdir": {
        "description": "Create a new directory named `kodlar` using `mkdir kodlar`.",
        "hints": [
          "Type `mkdir kodlar`."
        ]
      },
      "mkdir-p": {
        "description": "Create nested directories `ders/notlar` in one shot using `mkdir -p ders/notlar`.",
        "hints": [
          "Run `mkdir -p ders/notlar`."
        ]
      },
      "touch": {
        "description": "Create an empty file named `deneme.txt` with `touch deneme.txt`.",
        "hints": [
          "Run `touch deneme.txt`."
        ]
      }
    }
  },
  "l1-reading": {
    "title": "Reading Files and Getting Help",
    "summary": "Print file contents with cat, display text with echo, and explore man pages",
    "content": "\n### Displaying File Contents: `cat`\n\n`cat` (*concatenate*) prints the entire content of a file directly to your terminal screen:\n```\n$ cat merhaba.txt\n```\nUse `-n` to number each output line:\n```\n$ cat -n merhaba.txt\n```\n\n---\n\n### In-Depth Documentation: `man` and `--help`\n\n- `man <command>`: Displays full system manual pages.\n- `<command> --help`: Shows quick usage summaries.\n",
    "tasks": {
      "cat": {
        "description": "Print the content of `merhaba.txt` to the terminal with `cat merhaba.txt`.",
        "hints": [
          "Type `cat merhaba.txt`."
        ]
      },
      "cat-hidden": {
        "description": "Read the hidden note at `~/.gizli_not` with `cat`.",
        "hints": [
          "Include the leading dot in `.gizli_not`.",
          "Run `cat ~/.gizli_not`; the task checks the note's output."
        ]
      },
      "man": {
        "description": "Open the `ls` manual page with `man ls`.",
        "hints": [
          "Run `man ls` to view the detailed manual."
        ]
      }
    }
  },
  "l1-copy-move": {
    "title": "Copying, Moving, and Renaming",
    "summary": "Copy files/folders with cp, and move/rename with mv",
    "content": "\n### Copying Files & Directories: `cp`\n\n- `cp kaynak.txt hedef.txt`: Copies a file.\n- `cp -r kaynak_dizin hedef_dizin`: Recursively copies an entire directory.\n\n---\n\n### Moving & Renaming: `mv`\n\nIn Linux, renaming is simply moving a file to a new name in the same folder:\n- `mv eski_ad.txt yeni_ad.txt`: Renames a file.\n- `mv dosya.txt Belgeler/`: Moves a file into a directory.\n",
    "tasks": {
      "cp": {
        "description": "Copy `merhaba.txt` to `merhaba_kopya.txt` using `cp merhaba.txt merhaba_kopya.txt`.",
        "hints": [
          "Run `cp merhaba.txt merhaba_kopya.txt`."
        ]
      },
      "mv-rename": {
        "description": "Rename `merhaba_kopya.txt` to `selam.txt` using `mv merhaba_kopya.txt selam.txt`.",
        "hints": [
          "Run `mv merhaba_kopya.txt selam.txt`."
        ]
      },
      "cp-r": {
        "description": "Copy the `Belgeler` directory and its contents to `Belgeler_yedek` with `cp -r`.",
        "hints": [
          "Directory copies require the recursive flag: `cp -r ~/Belgeler ~/Belgeler_yedek`.",
          "The check looks for `rapor.txt` inside the copied directory."
        ]
      }
    }
  },
  "l1-removing": {
    "title": "Deleting and Final Level 1 Challenge",
    "summary": "Safely remove files and directories with rm and rm -r",
    "content": "\n### Removing Files and Folders: `rm`\n\n> ⚠️ **Warning:** The command line does not have a Recycle Bin / Trash folder! Deleted files are gone permanently.\n\n- `rm dosya.txt`: Removes a file.\n- `rm -r klasor`: Removes a directory and all its contents recursively.\n- `rm -rf klasor`: Forcefully removes without prompting.\n",
    "tasks": {
      "rm": {
        "description": "Remove `~/cop/eski1.txt` while leaving `eski2.txt` in place.",
        "hints": [
          "Run `rm ~/cop/eski1.txt`.",
          "Do not remove the directory or its other file."
        ]
      },
      "rm-r": {
        "description": "Recursively delete the `eski_proje` directory using `rm -r eski_proje`.",
        "hints": [
          "Run `rm -r eski_proje`."
        ]
      },
      "final": {
        "description": "Create an `archive` directory and move `merhaba.txt` into it.",
        "hints": [
          "Use `mkdir ~/arsiv && mv ~/merhaba.txt ~/arsiv/`.",
          "The check requires the file at `~/arsiv/merhaba.txt` and no longer at its original path."
        ]
      }
    }
  },
  "l2-redirection": {
    "title": "Output Redirection: > and >>",
    "summary": "Redirect standard output to files: overwrite with > and append with >>",
    "content": "\n### Redirecting Command Output\n\nBy default, commands print their output to the terminal screen (stdout).\nUsing redirection operators, you can send that output directly into a file:\n\n- `>`: Overwrites the target file (creates it if it does not exist).\n- `>>`: Appends new content to the end of the target file without erasing previous lines.\n\n```\n$ echo \"Ilk satir\" > dosya.txt\n$ echo \"Ikinci satir\" >> dosya.txt\n```\n",
    "tasks": {
      "redir-overwrite": {
        "description": "Replace the contents of `~/notlar.txt` with the exact text `Yeni Başlangıç` using `>`.",
        "hints": [
          "Run `echo \"Yeni Başlangıç\" > ~/notlar.txt`; the checked text is exact."
        ]
      },
      "redir-append": {
        "description": "Append the exact text `İkinci Satır` to `~/notlar.txt` with `>>`, preserving the first line.",
        "hints": [
          "Run `echo \"İkinci Satır\" >> ~/notlar.txt`.",
          "The check confirms both lines remain in the file."
        ]
      },
      "redir-command": {
        "description": "Redirect the output of `ls` into `~/liste.txt`.",
        "hints": [
          "Use `>` to send output to the file: `ls > ~/liste.txt`.",
          "The task checks that the file contains `Belgeler`."
        ]
      }
    }
  },
  "l2-pipes": {
    "title": "Pipelines: |",
    "summary": "The Unix philosophy: connect the output of one command to the input of another",
    "content": "\n### The Power of Pipelines (`|`)\n\nThe pipe operator `|` takes the output of the command on its left and feeds it directly as the input to the command on its right.\n\n```\n$ ls /etc | wc -l\n```\n\nThis combines small, focused Unix utilities to build powerful data processing pipelines.\n",
    "tasks": {
      "pipe-cat-wc": {
        "description": "Count the lines in `~/gorevler.txt` by piping `cat` into `wc -l`.",
        "hints": [
          "Run `cat ~/gorevler.txt | wc -l`; the file contains five lines."
        ]
      },
      "pipe-redirect": {
        "description": "Send the first two entries from `ls` into `~/ilk_ikisi.txt` using a pipeline and redirection.",
        "hints": [
          "Run `ls | head -n 2 > ~/ilk_ikisi.txt`.",
          "The check verifies that the destination file exists."
        ]
      }
    }
  },
  "l2-head-tail": {
    "title": "Head & Tail: head and tail",
    "summary": "Quickly preview the beginning or end of files and monitor logs",
    "content": "\n### Inspecting File Boundaries\n\n- `head dosya.txt`: Displays the first 10 lines of a file.\n- `head -n 5 dosya.txt`: Displays the first 5 lines.\n- `tail dosya.txt`: Displays the last 10 lines of a file.\n- `tail -n 3 dosya.txt`: Displays the last 3 lines.\n",
    "tasks": {
      "head-lines": {
        "description": "Show the first three lines of `~/sunucu.log`.",
        "hints": [
          "Run `head -n 3 ~/sunucu.log`.",
          "The output should stop after the checked third log line."
        ]
      },
      "tail-lines": {
        "description": "Show the last two lines of `~/sunucu.log`.",
        "hints": [
          "Run `tail -n 2 ~/sunucu.log`.",
          "Check that the final two log entries appear, but not line 8."
        ]
      }
    }
  },
  "l2-wc": {
    "title": "Word and Line Counts: wc",
    "summary": "Count lines (-l), words (-w), and characters (-c) in files and pipes",
    "content": "\n### Word Count: `wc`\n\n`wc` (*word count*) analyzes text streams and files:\n- `wc -l`: Count lines.\n- `wc -w`: Count words.\n- `wc -c`: Count bytes/characters.\n",
    "tasks": {
      "wc-lines": {
        "description": "Count the lines in `~/siir.txt` with `wc -l`.",
        "hints": [
          "Run `wc -l ~/siir.txt`; the output should include `3`.",
          "Use the `-l` flag to count lines."
        ]
      },
      "wc-words": {
        "description": "Count the words in `~/siir.txt` with `wc -w`.",
        "hints": [
          "Run `wc -w ~/siir.txt`; the expected count is `10`.",
          "Use the `-w` flag to count words."
        ]
      }
    }
  },
  "l2-grep": {
    "title": "Searching Text: grep",
    "summary": "Search lines with regular expressions, case-insensitivity (-i), and line numbers (-n)",
    "content": "\n### Searching Text with `grep`\n\n`grep` searches files and text streams for matching patterns:\n- `grep \"aranan\" dosya.txt`: Prints matching lines.\n- `-i`: Ignore case (case-insensitive).\n- `-n`: Show line numbers.\n- `-c`: Count matching lines only.\n- `-v`: Invert match (show lines that do NOT contain the pattern).\n",
    "tasks": {
      "grep-find": {
        "description": "Find `ERROR` lines in `~/uygulama.log` and exclude `DEBUG` entries from the result.",
        "hints": [
          "Run `grep ERROR ~/uygulama.log`.",
          "The checked output includes the database and timeout errors but not DEBUG lines."
        ]
      },
      "grep-case-lines": {
        "description": "Search `~/uygulama.log` for `bellek` without case sensitivity and include line numbers.",
        "hints": ["Run `grep -in bellek ~/uygulama.log`; this should find the uppercase `WARN` entry."]
      },
      "grep-count": {
        "description": "Count how many lines contain `\"ERROR\"` in `uygulama.log` using `grep -c \"ERROR\" uygulama.log`.",
        "hints": [
          "Run `grep -c \"ERROR\" uygulama.log`."
        ]
      }
    }
  },
  "l2-sort-uniq": {
    "title": "Sorting & Deduplicating: sort and uniq",
    "summary": "Sort lines alphabetically/numerically and clean consecutive duplicates",
    "content": "\n### Sorting Lines: `sort`\n\n- `sort dosya.txt`: Sorts lines alphabetically.\n- `sort -n`: Sorts numerically.\n- `sort -r`: Reverses sort order.\n\n---\n\n### Removing Duplicates: `uniq`\n\n`uniq` removes consecutive duplicate lines. To remove all duplicates across an entire file, always sort first:\n```\n$ sort isimler.txt | uniq\n```\n",
    "tasks": {
      "sort-basic": {
        "description": "Sort the city names in `~/sehirler.txt` alphabetically.",
        "hints": [
          "Run `sort ~/sehirler.txt`.",
          "The output begins with two `Ankara` lines followed by `Bursa`."
        ]
      },
      "sort-uniq-pipe": {
        "description": "Pipe `sort` and `uniq` together to produce a sorted, deduplicated list of `sehirler.txt`.",
        "hints": [
          "Run `sort sehirler.txt | uniq`."
        ]
      }
    }
  },
  "l2-find": {
    "title": "Searching the Filesystem: find",
    "summary": "Search directory trees by -name, -type, and -maxdepth",
    "content": "\n### Finding Files with `find`\n\n`find` recursively scans directory hierarchies:\n- `find . -name \"*.txt\"`: Search for files ending with `.txt` in current directory.\n- `find . -type f`: Search for regular files only.\n- `find . -type d`: Search for directories only.\n",
    "tasks": {
      "find-name": {
        "description": "Find JavaScript files under the prepared `~/proje` directory using the `*.js` name pattern.",
        "hints": [
          "Run `find ~/proje -name \"*.js\"`.",
          "The output should include `app.js`, `util.js`, and `app.test.js`, but not `readme.txt`."
        ]
      },
      "find-type": {
        "description": "Find all directories under `proje` using `find proje -type d`.",
        "hints": [
          "Run `find proje -type d`."
        ]
      }
    }
  },
  "l3-system-info": {
    "title": "System and User Info: whoami, uname, date",
    "summary": "Identify user identity, inspect kernel architecture, and view system time",
    "content": "\n### Inspecting System Metadata\n\n- `whoami`: Prints your current username.\n- `uname -a`: Prints kernel release, OS name, and hardware architecture.\n- `date`: Prints current system date, time, and timezone.\n",
    "tasks": {
      "whoami-task": {
        "description": "Run `whoami` to see the active username. In this simulator the expected value is `kullanici`.",
        "hints": [
          "Type `whoami` and press Enter.",
          "The task checks for the virtual account name `kullanici`."
        ]
      },
      "uname-task": {
        "description": "Print complete kernel and architecture details with `uname -a`.",
        "hints": [
          "Run `uname -a`."
        ]
      },
      "date-task": {
        "description": "Display current system date and time using `date`.",
        "hints": [
          "Run `date`."
        ]
      }
    }
  },
  "l3-environment": {
    "title": "Environment Variables: env, $VARIABLE, and export",
    "summary": "Terminal memory: inspect active variables and export new ones",
    "content": "\n### What are Environment Variables?\n\nEnvironment variables store system-wide configuration parameters:\n- `env`: Lists all active environment variables.\n- `echo $USER`: Prints the value of the USER variable.\n- `export SEHIR=\"Kirklareli\"`: Defines a new variable available to child processes.\n",
    "tasks": {
      "env-grep-task": {
        "description": "Filter `env` output with `grep` to find the value of `USER`.",
        "hints": [
          "Run `env | grep USER`."
        ]
      },
      "export-var-task": {
        "description": "Define a new environment variable with `export SEHIR=\"Kirklareli\"`.",
        "hints": [
          "Run `export SEHIR=\"Kirklareli\"`."
        ]
      },
      "echo-var-task": {
        "description": "Print the newly defined variable using `echo $SEHIR`.",
        "hints": [
          "Run `echo $SEHIR`."
        ]
      }
    }
  },
  "l3-which-path": {
    "title": "Command Lookup & $PATH: which",
    "summary": "How the shell finds executables: the $PATH variable and which command",
    "content": "\n### How Does the Shell Find Commands?\n\nWhen you type `ls`, the shell doesn't search your entire hard drive. It searches directories listed in the `$PATH` variable in order.\nUse `which <command>` to see the exact absolute path of the executable that will be run.\n",
    "tasks": {
      "echo-path-task": {
        "description": "Inspect the list of executable directories by running `echo $PATH`.",
        "hints": [
          "Run `echo $PATH`."
        ]
      },
      "which-ls-task": {
        "description": "Find the executable path of `ls` using `which ls`.",
        "hints": [
          "Run `which ls`."
        ]
      },
      "which-grep-task": {
        "description": "Find the executable path of `grep` using `which grep`.",
        "hints": [
          "Run `which grep`."
        ]
      }
    }
  },
  "l3-chmod-numeric": {
    "title": "File Permissions & chmod (Numeric: 755, 644)",
    "summary": "Manage read (4), write (2), and execute (1) permissions using numbers",
    "content": "\n### Understanding Numeric Permissions\n\nEvery file in Linux has permissions for **Owner**, **Group**, and **Others**:\n- **Read (r)** = 4\n- **Write (w)** = 2\n- **Execute (x)** = 1\n\nCommon combinations:\n- `755` (`rwxr-xr-x`): Owner full access (7), others read+execute (5). Standard for scripts and programs.\n- `644` (`rw-r--r--`): Owner read+write (6), others read-only (4). Standard for regular documents.\n",
    "tasks": {
      "chmod-644-task": {
        "description": "Set permissions of `rapor.txt` to 644 using `chmod 644 rapor.txt`.",
        "hints": [
          "Run `chmod 644 rapor.txt`."
        ]
      },
      "chmod-755-task": {
        "description": "Make `yedek.sh` executable using `chmod 755 yedek.sh`.",
        "hints": [
          "Run `chmod 755 yedek.sh`."
        ]
      }
    }
  },
  "l3-chmod-symbolic": {
    "title": "Symbolic Permissions & Script Execution: chmod +x",
    "summary": "Symbolic permissions (+x, -w) and executing scripts with ./",
    "content": "\n### Symbolic Permissions\n\nInstead of numbers, you can add or remove specific permission flags:\n- `chmod +x script.sh`: Add execute permission for everyone.\n- `chmod -w dosya.txt`: Remove write permission (make read-only).\n\nTo execute a script in your current directory, prefix it with `./`:\n```\n$ ./script.sh\n```\n",
    "tasks": {
      "chmod-plus-x-task": {
        "description": "Grant execution permission to `selam.sh` with `chmod +x selam.sh`.",
        "hints": [
          "Run `chmod +x selam.sh`."
        ]
      },
      "run-script-task": {
        "description": "Execute your script by running `./selam.sh`.",
        "hints": [
          "Type `./selam.sh` and press Enter."
        ]
      }
    }
  },
  "l3-processes-ps": {
    "title": "Monitoring Processes: ps",
    "summary": "Inspect running tasks, PIDs, and ps aux usage",
    "content": "\n### Viewing Running Processes: `ps`\n\n- `ps`: Shows processes running in the current terminal session.\n- `ps aux`: Shows all processes across the entire operating system, including owner and memory/CPU usage.\n- Each process is identified by a unique **PID** (Process ID).\n",
    "tasks": {
      "ps-simple-task": {
        "description": "Run `ps` to list processes in the current terminal session.",
        "hints": [
          "Run `ps`; the output should include the `bash` process."
        ]
      },
      "ps-aux-task": {
        "description": "View all system processes in detail using `ps aux`.",
        "hints": [
          "Run `ps aux`."
        ]
      },
      "ps-grep-task": {
        "description": "Filter the process list for `\"worker\"` using `ps aux | grep worker`.",
        "hints": [
          "Run `ps aux | grep worker`."
        ]
      }
    }
  },
  "l3-kill-process": {
    "title": "Terminating Processes: kill",
    "summary": "Stop hanging or stuck processes by PID using kill and kill -9",
    "content": "\n### Terminating Processes: `kill`\n\nWhen a process gets stuck or runs out of control, send it a signal to terminate:\n- `kill <PID>`: Sends SIGTERM (polite request to exit and clean up).\n- `kill -9 <PID>`: Sends SIGKILL (instant, unconditional termination by the kernel).\n",
    "tasks": {
      "find-stuck-task": {
        "description": "Find the looping process by filtering the process list for `loop.py`.",
        "hints": [
          "Run `ps aux | grep loop`.",
          "Read the process ID (PID) from the matching `loop.py` row."
        ]
      },
      "kill-stuck-task": {
        "description": "Terminate the stuck process using `kill 2048` (or the PID found).",
        "hints": [
          "Run `kill 2048`."
        ]
      },
      "verify-killed-task": {
        "description": "Run `ps` to verify the process is no longer running.",
        "hints": [
          "Type `ps`."
        ]
      }
    }
  },
  "l3-logic-operators": {
    "title": "Logical Operators: && (AND) and || (OR)",
    "summary": "Chain commands conditionally based on success exit codes (0)",
    "content": "\n### Conditional Execution\n\n- `komut1 && komut2`: Runs `komut2` **only if** `komut1` succeeded (exit code 0).\n- `komut1 || komut2`: Runs `komut2` **only if** `komut1` failed (non-zero exit code).\n- `komut1 ; komut2`: Runs `komut2` unconditionally regardless of outcome.\n",
    "tasks": {
      "and-chain-task": {
        "description": "Create directory `calisma` and navigate into it only on success: `mkdir -p calisma && cd calisma`.",
        "hints": [
          "Run `mkdir -p calisma && cd calisma`."
        ]
      },
      "or-chain-task": {
        "description": "Try reading `yok.txt` and print fallback message on failure: `cat yok.txt || echo \"Dosya yok\"`.",
        "hints": [
          "Run `cat yok.txt || echo \"Dosya yok\"`."
        ]
      }
    }
  },
  "l3-path-and-stat": {
    "title": "File Inspection & Path Tools: stat, realpath, basename",
    "summary": "Detailed file metadata (stat), absolute path resolution (realpath), and filename extraction (basename)",
    "content": "\n### Path & Metadata Inspection\n\n- `stat dosya.txt`: Displays full inode metadata, permissions, exact byte size, and timestamps.\n- `realpath ..`: Resolves relative paths into clean absolute canonical paths.\n- `basename /a/b/c.txt`: Extracts the filename (`c.txt`) from a path.\n",
    "tasks": {
      "stat-file-task": {
        "description": "Inspect the metadata of `belgeler/rapor.pdf` with `stat`.",
        "hints": [
          "Run `stat belgeler/rapor.pdf`.",
          "The output must identify `rapor.pdf` as a regular file."
        ]
      },
      "realpath-task": {
        "description": "Find the absolute path of the parent directory with `realpath ..`.",
        "hints": [
          "Run `realpath ..`."
        ]
      },
      "basename-task": {
        "description": "Extract the filename without suffix from `belgeler/rapor.pdf` using `basename belgeler/rapor.pdf .pdf`.",
        "hints": [
          "Run `basename belgeler/rapor.pdf .pdf`."
        ]
      }
    }
  }
};
