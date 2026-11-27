import type { LessonTranslation, LevelTranslation } from '../../../types';

export const EN_LEVELS: Record<string, LevelTranslation> = {
  "level-3": {
    "title": "Advanced",
    "description": "System info, environment variables ($VAR, env, export), file permissions (chmod), logical operators (&&, ||), path tools (stat, realpath, basename), and process management (ps, kill)."
  }
};

export const EN_LESSON_EXTENSIONS: Record<string, string> = {
  'l3-system-info': `**Read System Identity**

\`whoami\` prints the active user name. \`uname\` reports the operating-system name, while \`uname -a\` includes additional kernel and machine details; \`-r\` prints only the kernel release. \`date\` shows the current date and time according to the environment. These are read-only inspection commands: they help identify the context before you choose other commands, and they do not change files or system settings.

\`\`\`
$ whoami
$ uname -a
$ date
\`\`\`

KLU returns simulator-defined system values rather than inspecting your host computer. The expected virtual username is \`kullanici\`; that output is part of the validator and is not localized. On a real machine the output reflects its actual account, kernel, architecture, and clock, which may differ from these lesson fixtures.

> **KLU simulation:** These commands return fixture values from the virtual environment, not details about your computer.`,
  'l3-environment': `**Inspect the Environment**

Environment variables are named values available to programs launched by the shell. \`env\` lists them, and \`echo $NAME\` expands one value into a command argument. The \`export NAME=value\` form defines or updates a variable and makes it available to child processes.

\`\`\`
$ env | grep USER
$ export CITY="Springfield"
$ echo $CITY
\`\`\`

### Read a Variable's Value

Prefix a variable name with \`$\` to expand its value in a command. For example, \`echo $USER\` prints the current user's value; variable names are case-sensitive.

### List Variables with \`env\`

Run \`env\` to inspect the environment passed to the shell. Pipe its output into \`grep\` to find one name, as in \`env | grep USER\`.

### Define a Variable with \`export\`

Use \`export NAME=value\` to define a value for the current shell and make it available to child processes. The task uses the exact variable \`SEHIR\` and value \`Kirklareli\`; changing either would fail its validator.`,
  'l3-which-path': `### Search Order in PATH

\`PATH\` is a colon-separated list of directories. When you type a command without a slash, the shell checks those directories in order and runs the first matching executable. \`which\` reports the resolved executable path in this simulator.

\`\`\`
$ echo $PATH
$ which ls
$ which grep
\`\`\`

### A Toolbelt of Search Locations

Think of \`PATH\` as an ordered toolbelt: the shell checks each directory from left to right until it finds an executable. The first match wins, so changing the order can change which program runs.

An absolute executable path can be run directly; a relative executable in the current directory is commonly written with a \`./\` prefix. KLU's search path and command locations are virtual fixture values, not paths on the host system.`,
  'l3-chmod-numeric': `### Calculate Numeric Modes

The three digits in a mode apply to owner, group, and others. Each digit is the sum of read (\`4\`), write (\`2\`), and execute (\`1\`): \`7\` means all three, \`6\` means read and write, and \`5\` means read and execute. Thus \`755\` gives the owner full access and gives the other classes read and execute; \`644\` gives only the owner write access.

\`\`\`
$ chmod 644 report.txt
$ chmod 755 backup.sh
$ ls -l
\`\`\`

### Apply a Three-Digit Mode

Give \`chmod\` a three-digit value and a path, for example \`chmod 755 script.sh\`. The owner, group, and others digits are applied in that order. The mode is stored on the virtual file node; this lesson checks exact modes and paths, so keep its required values unchanged.`,
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

### Think of a Process as a Running Task

Each process has its own PID, much like a task identifier in a system monitor. A process listing is a snapshot: inspect it immediately before using a PID because that number can later refer to another process.

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

### AND: Continue Only on Success

With \`&&\`, the shell runs the next command only if the previous one exits successfully. This is useful when a later command depends on an earlier setup step, such as creating and then entering a directory.

### OR: Run a Fallback on Failure

With \`||\`, the next command runs only after a failure. It can provide a fallback message when an expected file or command is unavailable.

The left command's exit status controls which part of the chain runs. The graded examples use fixed directory and output text values; keep \`calisma\` and \`Dosya yok\` exactly where required by the checks.`,
  'l3-path-and-stat': `### Inspect Paths and Metadata

\`stat\` reports metadata such as file type, size, permissions, and timestamps. \`realpath\` resolves a relative path to an absolute one. \`basename\` extracts the final path component and can remove a supplied suffix.

\`\`\`
$ stat documents/report.pdf
$ realpath ..
$ basename documents/report.pdf .pdf
\`\`\`

### Resolve a Canonical Path with \`realpath\`

\`realpath\` follows path components such as \`..\` and reports the canonical absolute location. Use it to remove ambiguity about which directory a relative path refers to.

### Extract a Name with \`basename\`

\`basename\` returns the last component of a path; an optional suffix removes a known extension. These commands answer different questions: metadata about a node, the full location of a path, and the final name in a path. The lesson's seeded PDF path is case-sensitive and is retained in its tasks and validators.`,
};

export const EN_LESSON_EXAMPLES: Record<string, string[]> = {
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
