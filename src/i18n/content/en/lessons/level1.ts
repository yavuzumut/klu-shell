import type { LessonTranslation, LevelTranslation } from '../../../types';

export const EN_LEVELS: Record<string, LevelTranslation> = {
  "level-1": {
    "title": "Beginner",
    "description": "Terminal navigation, file and directory operations."
  },
};

export const EN_LESSON_EXTENSIONS: Record<string, string> = {
  'l1-listing': `**Hidden Files and Long Listings**

Names beginning with a dot are hidden by convention; they are still present in the directory. Add \`-a\` to include them. The \`-l\` option shows a detailed row with mode bits, owner, group, size, date, and name. Use both options together to inspect hidden entries and metadata.

\`\`\`
$ ls -la
\`\`\`

The listing uses the files seeded for this lesson. Its Turkish names are part of the current virtual filesystem and are intentionally retained where tasks check for those exact entries.

> **Tip:** Combine flags when they make the listing easier to inspect; \`ls -la\` includes hidden files and details.`,
  'l1-navigation': `### Relative and Absolute Movement

The command \`cd\` changes the shell's working directory. A directory name such as \`Belgeler\` is relative to your current location; \`/etc\` is absolute. The special path \`..\` means the parent directory, while \`~\` means home. Use \`pwd\` to verify every move.

\`\`\`
$ cd Belgeler
$ pwd
$ cd ..
\`\`\`

This lesson checks its seeded directory paths, so keep the provided path names exactly as shown in its tasks.

### Special Path Shortcuts

| Path | Meaning |
|---|---|
| .. | Parent directory |
| . | Current directory |
| ~ | Home directory |
| - | Previous directory (cd -) |

Running cd without an argument returns to your home directory. Use pwd whenever you are unsure where you are.

> **Tip:** The prompt path is a quick reminder of your location; run pwd to confirm it.`,
  'l1-creating': `**Parent Directories and Empty Files**

Without \`-p\`, \`mkdir\` creates the requested directory only when its parent already exists. With \`-p\`, it creates missing parents along the path and does not complain if those directories already exist. This makes it useful for preparing a nested project layout in one command.

\`\`\`
$ mkdir -p projects/docs/notes
$ touch projects/notes.txt
\`\`\`

\`touch\` creates a missing empty file; when the file exists, it updates its timestamps rather than replacing its contents. The task checks use the lesson's own fixed virtual paths, while these English names illustrate the general pattern.

> **Tip:** Use mkdir -p when one or more parent directories may not exist yet.`,
  'l1-reading': `### Read Only What You Need

\`cat\` prints a file's contents to standard output. For a short file this is convenient; for long files, commands such as \`head\` and \`tail\` are easier to scan. The \`-n\` option on \`cat\` adds line numbers, which helps refer to a particular line without changing the file.

**Manuals and Quick Help**

\`man <command>\` opens the command's detailed manual page. \`<command> --help\` is a shorter usage summary when the command supports it. The file names in the tasks point to lesson fixtures, including a hidden file, and must remain unchanged for their output checks.

> **Tip:** Use cat for short files; preview long logs with head or tail to keep output manageable.`,
  'l1-copy-move': `**Copying and Moving Are Different**

\`cp\` leaves the source in place and creates a copy at the destination. To copy a directory tree, include \`-r\`; otherwise the command rejects a directory. \`mv\` moves an item or renames it when the source and destination are in the same directory.

\`\`\`
$ cp source.txt backup.txt
$ cp -r projects docs-backup
$ mv draft.txt final.txt
\`\`\`

When the destination is an existing directory, \`mv\` places the source inside it. The task checks use specific seeded files and destinations, so use those exact paths when solving them.

> **Remember:** cp leaves the source in place, while mv relocates it or changes its name.`,
  'l1-removing': `### Remove Carefully

\`rm\` removes files. It does not move them to a recycle bin, and the command-line interface may not offer a simple undo. The recursive option \`-r\` is needed for a directory and its contents; \`-f\` suppresses prompts and errors for missing paths, so combining it with recursion deserves particular care.

\`\`\`
$ rm old-notes.txt
$ rm -r old-project
\`\`\`

Before running a removal command, inspect the target with \`pwd\` and \`ls\`. The lesson's final task checks that one file has moved into the requested archive path and no longer remains at its original path.`,
};

export const EN_LESSON_EXAMPLES: Record<string, string[]> = {
  'l1-welcome': ['pwd', 'echo "Merhaba Dünya"', 'help', 'clear'],
  'l1-listing': ['ls', 'ls -a', 'ls -l', 'ls -la', 'ls /etc'],
  'l1-navigation': ['cd Belgeler', 'pwd', 'cd ..', 'cd /etc', 'cd ~', 'cd -'],
  'l1-creating': ['mkdir projeler', 'touch notlar.txt', 'mkdir -p okul/2024/matematik', 'ls -l'],
  'l1-reading': ['cat merhaba.txt', 'cat -n Belgeler/alisveris.txt', 'man cat', 'ls --help'],
  'l1-copy-move': ['ls calisma', 'cp merhaba.txt merhaba_yedek.txt', 'mv calisma/taslak.txt calisma/son.txt', 'cp -r Belgeler Belgeler_yedek'],
  'l1-removing': ['ls cop', 'rm cop/eski1.txt', 'rm -r eski_proje', 'mkdir arsiv', 'mv merhaba.txt arsiv/'],
};

export const EN_LESSONS: Record<string, LessonTranslation> = {
  "l1-welcome": {
    "title": "Welcome to the Terminal",
    "summary": "Your first terminal command: print working directory with pwd",
        "content": "\n**Welcome to the terminal.** The prompt shows where you are and which account is active:\n\n```\nkullanici@klu:~$\n```\n\n| Part | Meaning |\n|---|---|\n| `kullanici` | The signed-in user in this simulated session |\n| `klu` | The machine name shown by the prompt |\n| `~` | Your home directory |\n| `$` | A regular-user prompt; root commonly uses `#` |\n\nWhen you type a command and press **Enter**, the shell runs it and displays the result.\n\n### Your First Commands\n\n- `pwd` (*print working directory*) shows your current directory.\n- `echo` prints the text you provide.\n- `help` lists the available commands.\n- `clear` clears the display (shortcut: **Ctrl+L**).\n\n> **Tip:** Press the Up arrow (↑) to recall earlier commands, or use **Tab** to complete supported command and file names.\n",
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
};
