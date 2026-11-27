import type { LessonTranslation, LevelTranslation } from '../../../types';

export const EN_LEVELS: Record<string, LevelTranslation> = {
  "level-0": {
    "title": "Before You Begin",
    "description": "Terminal, shell and Linux fundamentals; how KLU works and key habits."
  },
};

export const EN_LESSON_EXTENSIONS: Record<string, string> = {
  'l0-klu-works': `### What Runs in the Browser

KLU pairs a shell command interpreter with a virtual filesystem. Commands read and change that in-memory tree rather than your computer's files. Lesson setup restores the expected starting files so a task can be repeated; the free terminal filesystem resets when the page is refreshed.

### Progress and Safety Boundaries

Lesson progress is stored separately in browser storage. Clearing that storage removes the saved progress. “Safe to experiment” applies to KLU's sandbox only: real shells can modify or permanently delete files on the machine where they run. The commands are useful practice, but not every Linux feature or command is implemented here.`,
  'l0-modes-tools': `### Practice and Reference Areas

Use Lessons for guided tasks and instant checks, or switch to Sandbox to explore without a lesson validator. The File Tree shows the current virtual files and lets you inspect them. Git has its own workspace and guided Git 1–4 lessons; its remotes are local simulations.

The Cheat Sheet sends a selected command to the sandbox terminal. Explore introduces external Linux tools and their real installation commands; those tools do not run inside KLU. The theme selector changes the interface and terminal appearance, while the language switcher changes interface and lesson text.`,
  'l0-habits': `### Read a Command Before Running It

Separate the command name from its options and arguments. A hyphenated short option such as \`-la\` can combine options; long options usually begin with two hyphens, as in \`--help\`. The argument tells the command what path or value to use.

\`ls -la /home\` lists the \`/home\` directory, including hidden entries, in a detailed format.
\`\`\`text
command [options/flags] [arguments/targets]
ls -la /home
\`\`\`

### Recover and Get Help

Use the Up and Down arrows to recall history, Tab to complete supported names, and Ctrl+C to cancel the current input. Ctrl+L clears the display without deleting files or history. When unsure, inspect a command's help or manual before trying options. KLU implements a teaching-oriented subset of shell behavior, so real Bash shortcuts and options may differ.`,
  'l0-real-linux': `### What Transfers—and What Does Not

The command-line ideas in this course—paths, options, quoting, pipes, and redirection—are useful on real Linux systems. KLU's supported command set and filesystem are deliberately limited, however, and its commands do not affect a real operating system. The same command can support more options or have different consequences on a real machine, so check the real system's manual before relying on behavior learned in a simulator.

> **Safety reminder:** On a real Linux system, files removed with rm are permanently deleted; there is no graphical trash bin by default.

### Choose a Safe First Environment

WSL provides a genuine Linux environment on Windows; a virtual machine runs a separate guest system; macOS includes a Terminal app with a Unix-like shell. A live USB can boot a Linux environment without installing it to the internal drive, while dual boot installs Linux alongside another operating system. Package managers such as \`apt\`, \`dnf\`, and \`pacman\` install software on supported distributions; they are outside KLU's simulated command set. Learn the target environment's recovery and backup practices before running commands that delete or change system files.

### What to Learn Next

The next Linux level practices directory navigation with \`cd\`, listings with \`ls\`, and creating, reading, copying, moving, and removing files with \`mkdir\`, \`touch\`, \`cat\`, \`cp\`, \`mv\`, and \`rm\`. Begin with a disposable practice directory, inspect paths before changing them, and keep backups of real work. KLU's lesson fixtures make these tasks repeatable; on a real system, your commands act on its actual files. Git is a version-control system for recording changes; KLU's Git lessons practice it with local simulated remotes.`,
};

export const EN_LESSON_EXAMPLES: Record<string, string[]> = {
  'l0-intro': ['help', 'echo "Merhaba Linux"'],
  'l0-klu-works': ['pwd', 'echo "Testing KLU"'],
  'l0-modes-tools': ['history', 'help'],
  'l0-habits': ['pwd --help', 'man ls', 'clear'],
  'l0-real-linux': ['clear', 'help'],
};

export const EN_LESSONS: Record<string, LessonTranslation> = {
  "l0-intro": {
    "title": "What is a Terminal, Shell, and Linux?",
    "summary": "The difference between GUI and CLI, core terminal concepts, and Linux architecture",
    "content": "\n<div class=\"klu-welcome-card\">\n  <div class=\"klu-logo-frame klu-logo-frame-welcome\">\n    <img src=\"/klu-logo-cropped.webp\" alt=\"KLU\" class=\"klu-welcome-logo\" />\n  </div>\n  <div class=\"klu-welcome-content\">\n    <div class=\"klu-welcome-title\">Hi, I'm KLU! 👋</div>\n    <p class=\"klu-welcome-desc\">Welcome to Linux and the terminal. We'll explore the command line together, one safe step at a time.</p>\n  </div>\n</div>\n\n### What Is Linux?\nLinux is a **kernel**: the core layer that connects computer hardware with running programs and manages system resources. Distributions such as **Ubuntu, Fedora, and Arch** combine the Linux kernel with user tools and package managers to form complete operating systems. Linux runs much of the web and cloud infrastructure, as well as Android devices. The command-line ideas you learn here apply across those systems.\n\n### What Are the Terminal and Shell?\n- **Terminal:** The window that accepts typed input and displays text output.\n- **Shell:** The program that reads commands and passes requests to the operating system. Bash is a widely used shell. KLU simulates a Bash-like workflow in the browser; it does not run a real Bash process or Linux kernel.\n\nThe line shown in the terminal is called the **prompt**:\n\n```\nuser@klu:~$\n```\n\n| Part | Meaning |\n|---|---|\n| \`user\` | The account signed in to this shell session |\n| \`klu\` | The machine's network hostname |\n| \`~\` | Your current directory; tilde is shorthand for your home directory |\n| \`$\` | A regular-user prompt; root prompts commonly use \`#\` |\n\nType a command after the prompt and press **Enter** to run it.\n",
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
};
