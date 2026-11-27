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
        "description": "Print a message to the terminal screen using `echo \"Hello Linux\"`.",
        "hints": [
          "Type `echo \"Hello Linux\"` and press Enter."
        ]
      }
    }
  },
  "l0-klu-works": {
    "title": "How KLU Works?",
    "summary": "Browser-based sandbox, memory-backed virtual filesystem, and safety boundaries",
    "content": "\n### What is KLU?\n\nKLU is a zero-install interactive Linux simulator that runs directly in your browser.\nIt features a virtual filesystem in memory and an isolated shell environment.\n\n- **Safe Sandbox:** You cannot break your computer or delete personal files here. Feel free to experiment!\n- **State Reset:** You can reset the filesystem at any time using the \"Reset Terminal\" button.\n- **Real Linux Path:** Commands and habits you learn here transfer 1:1 to Ubuntu, Debian, Fedora, Arch, and macOS.\n",
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
        "description": "Inspect command usage by running `ls --help`.",
        "hints": [
          "Type `ls --help` to see option flags."
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
    "content": "\n### Taking Your Skills to Real Machines\n\nOnce you finish KLU, here is how you can use Linux on your daily computer:\n\n- **WSL (Windows Subsystem for Linux):** Run a genuine Ubuntu terminal inside Windows with zero performance penalty.\n- **Virtual Machines (VirtualBox / UTM):** Safely run a complete Linux desktop inside a virtual container.\n- **Dual Boot:** Install Ubuntu, Fedora, or Linux Mint alongside your current OS.\n- **Package Managers:** Install software via terminal using `apt`, `dnf`, or `pacman`.\n",
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
      "cd-documents": {
        "description": "Navigate into the `Belgeler` directory using `cd Belgeler`.",
        "hints": [
          "Type `cd Belgeler`."
        ]
      },
      "cd-parent": {
        "description": "Move back up to the parent directory using `cd ..`.",
        "hints": [
          "Type `cd ..`."
        ]
      },
      "cd-root": {
        "description": "Jump to the root directory `/` with `cd /`.",
        "hints": [
          "Type `cd /`."
        ]
      },
      "cd-home": {
        "description": "Return directly to your home directory with `cd ~` or just `cd`.",
        "hints": [
          "Type `cd ~`."
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
      "cat-n": {
        "description": "Display `merhaba.txt` with line numbers using `cat -n merhaba.txt`.",
        "hints": [
          "Type `cat -n merhaba.txt`."
        ]
      },
      "echo": {
        "description": "Print `\"Linux harika\"` to the screen using `echo \"Linux harika\"`.",
        "hints": [
          "Type `echo \"Linux harika\"`."
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
      "mv-move": {
        "description": "Move `selam.txt` into the `Belgeler` folder using `mv selam.txt Belgeler/`.",
        "hints": [
          "Run `mv selam.txt Belgeler/`."
        ]
      }
    }
  },
  "l1-removing": {
    "title": "Deleting and Final Level 1 Challenge",
    "summary": "Safely remove files and directories with rm and rm -r",
    "content": "\n### Removing Files and Folders: `rm`\n\n> ⚠️ **Warning:** The command line does not have a Recycle Bin / Trash folder! Deleted files are gone permanently.\n\n- `rm dosya.txt`: Removes a file.\n- `rm -r klasor`: Removes a directory and all its contents recursively.\n- `rm -rf klasor`: Forcefully removes without prompting.\n",
    "tasks": {
      "rm-file": {
        "description": "Delete `gereksiz.txt` from your home directory using `rm gereksiz.txt`.",
        "hints": [
          "Run `rm gereksiz.txt`."
        ]
      },
      "rm-dir": {
        "description": "Recursively delete the `eski_proje` directory using `rm -r eski_proje`.",
        "hints": [
          "Run `rm -r eski_proje`."
        ]
      },
      "final-task": {
        "description": "Create a directory named `final_gorev`, create a file `not.txt` inside it, and verify with `ls final_gorev`.",
        "hints": [
          "Run `mkdir final_gorev && touch final_gorev/not.txt && ls final_gorev`."
        ]
      }
    }
  },
  "l2-redirection": {
    "title": "Output Redirection: > and >>",
    "summary": "Redirect standard output to files: overwrite with > and append with >>",
    "content": "\n### Redirecting Command Output\n\nBy default, commands print their output to the terminal screen (stdout).\nUsing redirection operators, you can send that output directly into a file:\n\n- `>`: Overwrites the target file (creates it if it does not exist).\n- `>>`: Appends new content to the end of the target file without erasing previous lines.\n\n```\n$ echo \"Ilk satir\" > dosya.txt\n$ echo \"Ikinci satir\" >> dosya.txt\n```\n",
    "tasks": {
      "l2-redirection": {
        "description": "Write `\"Linux ogreniyorum\"` into `notlar.txt` using the `>` operator: `echo \"Linux ogreniyorum\" > notlar.txt`.",
        "hints": [
          "Run `echo \"Linux ogreniyorum\" > notlar.txt`."
        ]
      },
      "append-task": {
        "description": "Append `\"Ikinci satir\"` to `notlar.txt` using the `>>` operator.",
        "hints": [
          "Run `echo \"Ikinci satir\" >> notlar.txt`."
        ]
      }
    }
  },
  "l2-pipes": {
    "title": "Pipelines: |",
    "summary": "The Unix philosophy: connect the output of one command to the input of another",
    "content": "\n### The Power of Pipelines (`|`)\n\nThe pipe operator `|` takes the output of the command on its left and feeds it directly as the input to the command on its right.\n\n```\n$ ls /etc | wc -l\n```\n\nThis combines small, focused Unix utilities to build powerful data processing pipelines.\n",
    "tasks": {
      "l2-pipes": {
        "description": "Count how many items are in the root directory `/` by piping `ls /` into `wc -l`.",
        "hints": [
          "Run `ls / | wc -l`."
        ]
      },
      "cat-grep-pipe": {
        "description": "Pipe the content of `liste.txt` into `grep` to filter lines containing `\"meyve\"`.",
        "hints": [
          "Run `cat liste.txt | grep meyve`."
        ]
      }
    }
  },
  "l2-head-tail": {
    "title": "Head & Tail: head and tail",
    "summary": "Quickly preview the beginning or end of files and monitor logs",
    "content": "\n### Inspecting File Boundaries\n\n- `head dosya.txt`: Displays the first 10 lines of a file.\n- `head -n 5 dosya.txt`: Displays the first 5 lines.\n- `tail dosya.txt`: Displays the last 10 lines of a file.\n- `tail -n 3 dosya.txt`: Displays the last 3 lines.\n",
    "tasks": {
      "l2-head-tail": {
        "description": "Display the first 3 lines of `veriler.txt` using `head -n 3 veriler.txt`.",
        "hints": [
          "Run `head -n 3 veriler.txt`."
        ]
      },
      "tail-task": {
        "description": "Display the last 2 lines of `veriler.txt` using `tail -n 2 veriler.txt`.",
        "hints": [
          "Run `tail -n 2 veriler.txt`."
        ]
      }
    }
  },
  "l2-wc": {
    "title": "Word and Line Counts: wc",
    "summary": "Count lines (-l), words (-w), and characters (-c) in files and pipes",
    "content": "\n### Word Count: `wc`\n\n`wc` (*word count*) analyzes text streams and files:\n- `wc -l`: Count lines.\n- `wc -w`: Count words.\n- `wc -c`: Count bytes/characters.\n",
    "tasks": {
      "l2-wc": {
        "description": "Count the total number of lines in `metin.txt` using `wc -l metin.txt`.",
        "hints": [
          "Run `wc -l metin.txt`."
        ]
      },
      "wc-words": {
        "description": "Count the total number of words in `metin.txt` using `wc -w metin.txt`.",
        "hints": [
          "Run `wc -w metin.txt`."
        ]
      }
    }
  },
  "l2-grep": {
    "title": "Searching Text: grep",
    "summary": "Search lines with regular expressions, case-insensitivity (-i), and line numbers (-n)",
    "content": "\n### Searching Text with `grep`\n\n`grep` searches files and text streams for matching patterns:\n- `grep \"aranan\" dosya.txt`: Prints matching lines.\n- `-i`: Ignore case (case-insensitive).\n- `-n`: Show line numbers.\n- `-c`: Count matching lines only.\n- `-v`: Invert match (show lines that do NOT contain the pattern).\n",
    "tasks": {
      "l2-grep": {
        "description": "Search for lines containing `\"hata\"` in `sunucu.log` using `grep -i \"hata\" sunucu.log`.",
        "hints": [
          "Run `grep -i \"hata\" sunucu.log`."
        ]
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
      "l2-sort-uniq": {
        "description": "Sort `sehirler.txt` alphabetically and print to screen using `sort sehirler.txt`.",
        "hints": [
          "Run `sort sehirler.txt`."
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
      "l2-find": {
        "description": "Find all files with extension `.js` inside the `proje` folder using `find proje -name \"*.js\"`.",
        "hints": [
          "Run `find proje -name \"*.js\"`."
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
      "l3-system-info": {
        "description": "Run `whoami` to check which user account you are currently operating in.",
        "hints": [
          "Type `whoami`."
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
      "l3-environment": {
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
      "l3-which-path": {
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
      "l3-chmod-numeric": {
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
      "l3-chmod-symbolic": {
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
      "l3-processes-ps": {
        "description": "Run `ps` to list active processes in your terminal.",
        "hints": [
          "Type `ps`."
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
      "l3-kill-process": {
        "description": "Find the PID of the stuck loop process using `ps aux | grep loop`.",
        "hints": [
          "Run `ps aux | grep loop`."
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
      "l3-logic-operators": {
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
      "l3-path-and-stat": {
        "description": "Inspect detailed metadata of `belgeler/rapor.pdf` using `stat belgeler/rapor.pdf`.",
        "hints": [
          "Run `stat belgeler/rapor.pdf`."
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
