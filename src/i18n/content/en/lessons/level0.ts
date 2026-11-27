import type { LessonTranslation, LevelTranslation } from '../../../types';

export const EN_LEVELS: Record<string, LevelTranslation> = {
  "level-0": {
    "title": "Before You Begin",
    "description": "Terminal, shell and Linux fundamentals; how KLU works and key habits."
  },
};

export const EN_LESSON_EXTENSIONS: Record<string, string> = {
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
    "content": "### Where Does the Name KLU Come From?\n\nKLU takes its inspiration from CLU, the artificial intelligence program in the film *Tron*. Just as CLU creates and manages a digital world for its creator, KLU gives you a safe terminal world where you can learn Linux without touching your real computer. The K comes from the Turkish word **komut**, meaning “command.”\n\n### A Safe Laboratory in Your Browser\n\nKLU is a **virtual filesystem and shell** that run entirely in your browser, with no installation or external server required.\n\n- **Safe sandbox:** You can experiment here without changing or deleting files on your computer. This safety applies only to KLU: on real Linux, `rm` permanently deletes files, and there is no trash bin to restore them from.\n- **Files and progress:** Terminal files are virtual and are not created on your computer. Your progress is saved in this browser's `localStorage`; clearing browser data removes it, and progress does not automatically sync across devices. The Sandbox filesystem lives in memory and resets to its initial state when you refresh the page.\n\n### Lesson Panel and Tasks\n\n- **Left Panel:** Read the lesson, open example commands, and work through its tasks.\n- **Example Commands:** Click an example button to send its command directly to the terminal.\n- **Hints:** Hints appear progressively after incorrect attempts. After three wrong attempts, **Show solution** becomes available.\n- **↺ Reset terminal**: Use the button at the bottom of the Left Panel to restore the lesson's starting filesystem.",
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
    "content": "KLU provides several work areas and reference tools to support your learning:\n\n### Top Navigation Tabs\n\n- **📖 Lessons:** Follow guided lessons with step-by-step tasks.\n- **💻 Sandbox:** Try commands freely without lesson checks.\n- **🌿 Git:** Practise version control in the interactive Git lessons.\n- **📑 Cheat Sheet:** Browse supported commands and examples; select one to send to the Sandbox terminal.\n- **🚀 Explore:** Browse guides to external Linux tools such as `yt-dlp`. These tools do not run in KLU.\n\n### Helper Panels and Settings\n\n- **🗂️ File Tree:** View the virtual filesystem live. Select a directory to enter it or a file to read it in the terminal.\n- **🎨 Theme and Accent Color:** Choose from five themes and customize the accent color using the palette button in the upper-right corner.",
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
    "content": "Terminal work becomes faster and safer when you build a few habits:\n\n### 1. Command Anatomy\n\nA Linux command usually follows this pattern:\n\n```text\ncommand [options/flags] [arguments/targets]\n```\nFor example, `ls -la /home` uses `ls` as the command, `-la` to include hidden files in a detailed listing, and `/home` as the target directory. Short options can be combined; long options usually start with two hyphens, as in `--help`.\n\n### 2. Essential Shortcuts\n\n- **Tab:** Type the first characters of a command or filename and press Tab to complete it; press Tab twice to see matching options when needed.\n- **Up / Down Arrows (↑ / ↓):** Recall previously run commands without typing them again.\n- **Ctrl+C:** Cancel the current input line in KLU. On a real Linux system, it can also stop a running foreground process.\n- **Ctrl+L:** Clear the terminal display; it has the same screen-clearing effect as `clear`.\n\n### 3. Getting Help from Commands\n\n- **`--help` flag:** Show a command's usage summary, for example `pwd --help`.\n- **`man` command:** Open a detailed manual page, for example `man ls`.",
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
    "content": "### Differences Between KLU and Real Linux\n\n- **In-memory simulation:** Changes in KLU stay in the browser's virtual filesystem. On real Linux, commands can affect files on disk, the network, and hardware.\n- **Command range:** KLU simulates a focused set of commands. A real Linux distribution includes many more commands, package managers such as `apt`, `pacman`, and `dnf`, and system tools such as `systemctl` and `journalctl`.\n- **Shared fundamentals:** Paths such as `/`, `~`, and `..`, along with options and flags, work as useful concepts in both. KLU is still a simplified teaching simulator; even features it models, such as `chmod` and scripts, may behave differently on a real system.\n\n> ⚠️ **Important reminder:** On real Linux, files removed with `rm` are permanently deleted; there is no trash bin like in many graphical interfaces.\n\n### How to Try Real Linux\n\n- **Windows:** Use WSL to install a genuine Linux environment, run a virtual machine with VirtualBox, or boot a live Linux USB without installing it.\n- **macOS:** The built-in Terminal provides a Unix-like command line. Its default shell is Zsh, but many basic commands are shared with Linux.\n\n### What Comes Next?\n\nYou are ready for **Level 1: Beginner**, where you will practise:\n\n- Navigating directories with `cd`\n- Listing files with `ls` and `ls -la`\n- Creating files and directories with `touch` and `mkdir`\n- Reading, copying, moving, and removing files with `cat`, `cp`, `mv`, and `rm`\n\nStart in a disposable practice directory and inspect paths before changing real files.\n\n### Git\n\nGit is a version control system for recording changes. You can explore it in KLU's interactive Git lessons.",
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
