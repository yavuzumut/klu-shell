import type { CommandDocTranslation } from '../../types';

export const EN_COMMAND_DOCS: Record<string, CommandDocTranslation> = {
  pwd: {
    summary: 'Print current working directory.',
    usage: 'pwd',
    manPage: `NAME
    pwd - print name of current/working directory

SYNOPSIS
    pwd

DESCRIPTION
    Print the full filename of the current working directory.`,
  },
  ls: {
    summary: 'List directory contents.',
    usage: 'ls [-a] [-l] [-la] [PATH...]',
    manPage: `NAME
    ls - list directory contents

SYNOPSIS
    ls [OPTION]... [FILE]...

DESCRIPTION
    List information about the FILEs (the current directory by default).
    Sort entries alphabetically.

OPTIONS
    -a, --all
        do not ignore entries starting with . (shows hidden files)
    -l
        use a long listing format (permissions, owner, size, date)`,
  },
  cd: {
    summary: 'Change the shell working directory.',
    usage: 'cd [DIRECTORY]',
    manPage: `NAME
    cd - change working directory

SYNOPSIS
    cd [DIRECTORY]

DESCRIPTION
    Change the current directory to DIRECTORY. The default DIRECTORY is the value of the HOME variable.`,
  },
  mkdir: {
    summary: 'Create directories.',
    usage: 'mkdir [-p] DIRECTORY...',
    manPage: `NAME
    mkdir - make directories

SYNOPSIS
    mkdir [OPTION]... DIRECTORY...

DESCRIPTION
    Create the DIRECTORY(ies), if they do not already exist.

OPTIONS
    -p, --parents
        no error if existing, make parent directories as needed`,
  },
  touch: {
    summary: 'Create empty file or update timestamps.',
    usage: 'touch FILE...',
    manPage: `NAME
    touch - change file timestamps or create empty files

SYNOPSIS
    touch FILE...

DESCRIPTION
    Update the access and modification times of each FILE to the current time. A FILE argument that does not exist is created empty.`,
  },
  cat: {
    summary: 'Concatenate files and print on the standard output.',
    usage: 'cat [-n] [FILE...]',
    manPage: `NAME
    cat - concatenate files and print on the standard output

SYNOPSIS
    cat [OPTION]... [FILE]...

DESCRIPTION
    Concatenate FILE(s) to standard output. With no FILE, or when FILE is -, read standard input.

OPTIONS
    -n, --number
        number all output lines`,
  },
  echo: {
    summary: 'Display a line of text.',
    usage: 'echo [-n] [-e] [STRING...]',
    manPage: `NAME
    echo - display a line of text

SYNOPSIS
    echo [SHORT-OPTION]... [STRING]...

DESCRIPTION
    Echo the STRING(s) to standard output.`,
  },
  cp: {
    summary: 'Copy files and directories.',
    usage: 'cp [-r|-R] SOURCE... DEST',
    manPage: `NAME
    cp - copy files and directories

SYNOPSIS
    cp [OPTION]... SOURCE... DEST

OPTIONS
    -r, -R, --recursive
        copy directories recursively`,
  },
  mv: {
    summary: 'Move (rename) files.',
    usage: 'mv SOURCE... DEST',
    manPage: `NAME
    mv - move (rename) files

SYNOPSIS
    mv SOURCE... DEST

DESCRIPTION
    Rename SOURCE to DEST, or move SOURCE(s) to DIRECTORY.`,
  },
  rm: {
    summary: 'Remove files or directories.',
    usage: 'rm [-r|-R] [-f] FILE...',
    manPage: `NAME
    rm - remove files or directories

SYNOPSIS
    rm [OPTION]... FILE...

OPTIONS
    -r, -R, --recursive
        remove directories and their contents recursively
    -f, --force
        ignore nonexistent files and arguments, never prompt`,
  },
  clear: {
    summary: 'Clear the terminal screen.',
    usage: 'clear',
    manPage: `NAME
    clear - clear the terminal screen

SYNOPSIS
    clear`,
  },
  help: {
    summary: 'List available commands.',
    usage: 'help [COMMAND]',
    manPage: `NAME
    help - display information about available commands

SYNOPSIS
    help [COMMAND]`,
  },
  man: {
    summary: 'Format and display manual pages.',
    usage: 'man COMMAND',
    manPage: `NAME
    man - an interface to the system reference manuals

SYNOPSIS
    man COMMAND`,
  },
  history: {
    summary: 'Display command history list.',
    usage: 'history [-c] [N]',
    manPage: `NAME
    history - GNU History Library

SYNOPSIS
    history [N]
    history -c`,
  },
  head: {
    summary: 'Output the first part of files.',
    usage: 'head [-n LINES] [FILE...]',
    manPage: `NAME
    head - output the first part of files

SYNOPSIS
    head [OPTION]... [FILE]...`,
  },
  tail: {
    summary: 'Output the last part of files.',
    usage: 'tail [-n LINES] [FILE...]',
    manPage: `NAME
    tail - output the last part of files

SYNOPSIS
    tail [OPTION]... [FILE]...`,
  },
  wc: {
    summary: 'Print newline, word, and byte counts for each file.',
    usage: 'wc [-l] [-w] [-c] [FILE...]',
    manPage: `NAME
    wc - print newline, word, and byte counts for each file

SYNOPSIS
    wc [OPTION]... [FILE]...`,
  },
  grep: {
    summary: 'Print lines matching a pattern.',
    usage: 'grep [-i] [-v] [-n] [-c] [-E] PATTERN [FILE...]',
    manPage: `NAME
    grep - print lines matching a pattern

SYNOPSIS
    grep [OPTION...] PATTERNS [FILE...]`,
  },
  sort: {
    summary: 'Sort lines of text files.',
    usage: 'sort [-r] [-n] [-u] [FILE...]',
    manPage: `NAME
    sort - sort lines of text files

SYNOPSIS
    sort [OPTION]... [FILE]...`,
  },
  uniq: {
    summary: 'Report or omit repeated lines.',
    usage: 'uniq [-c] [-d] [-u] [-i] [INPUT [OUTPUT]]',
    manPage: `NAME
    uniq - report or omit repeated lines

SYNOPSIS
    uniq [OPTION]... [INPUT [OUTPUT]]`,
  },
  find: {
    summary: 'Search for files in a directory hierarchy.',
    usage: 'find [PATH...] [-name PATTERN] [-type f|d]',
    manPage: `NAME
    find - search for files in a directory hierarchy

SYNOPSIS
    find [path...] [expression]`,
  },
  chmod: {
    summary: 'Change file mode bits (permissions).',
    usage: 'chmod [-R] MODE FILE...',
    manPage: `NAME
    chmod - change file mode bits

SYNOPSIS
    chmod [OPTION]... MODE[,MODE]... FILE...`,
  },
  whoami: {
    summary: 'Print effective userid.',
    usage: 'whoami',
    manPage: `NAME
    whoami - print effective userid

SYNOPSIS
    whoami`,
  },
  uname: {
    summary: 'Print system information.',
    usage: 'uname [-a] [-s] [-n] [-r] [-m]',
    manPage: `NAME
    uname - print system information

SYNOPSIS
    uname [OPTION]...`,
  },
  date: {
    summary: 'Print or set the system date and time.',
    usage: 'date [-u] [+FORMAT]',
    manPage: `NAME
    date - print or set the system date and time

SYNOPSIS
    date [OPTION]... [+FORMAT]`,
  },
  env: {
    summary: 'Run a program in a modified environment or print environment.',
    usage: 'env',
    manPage: `NAME
    env - run a program in a modified environment

SYNOPSIS
    env`,
  },
  export: {
    summary: 'Set export attribute for shell variables.',
    usage: 'export NAME[=VALUE]...',
    manPage: `NAME
    export - set export attribute for shell variables

SYNOPSIS
    export [-fn] [name[=value] ...]`,
  },
  which: {
    summary: 'Locate a command.',
    usage: 'which [-a] COMMAND...',
    manPage: `NAME
    which - locate a command

SYNOPSIS
    which [options] [--] filename ...`,
  },
  ps: {
    summary: 'Report a snapshot of the current processes.',
    usage: 'ps [aux]',
    manPage: `NAME
    ps - report a snapshot of the current processes

SYNOPSIS
    ps [options]`,
  },
  kill: {
    summary: 'Send a signal to a process.',
    usage: 'kill [-s SIGNAL | -SIGNAL] PID...',
    manPage: `NAME
    kill - terminate a process

SYNOPSIS
    kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...`,
  },
  stat: {
    summary: 'Display file or file system status.',
    usage: 'stat [-c FORMAT] FILE...',
    manPage: `NAME
    stat - display file or file system status

SYNOPSIS
    stat [OPTION]... FILE...`,
  },
  realpath: {
    summary: 'Print the resolved path.',
    usage: 'realpath FILE...',
    manPage: `NAME
    realpath - print the resolved path

SYNOPSIS
    realpath [OPTION]... FILE...`,
  },
  basename: {
    summary: 'Strip directory and suffix from filenames.',
    usage: 'basename NAME [SUFFIX]',
    manPage: `NAME
    basename - strip directory and suffix from filenames

SYNOPSIS
    basename NAME [SUFFIX]`,
  },
  git: {
    summary: 'Virtual version control system (init, status, add, commit, log, diff, restore, branch, switch, merge, clone, remote, push, pull)',
    usage: 'git <command> [options]',
    manPage: `NAME
    git - the stupid content tracker

SYNOPSIS
    git [--version] [--help] [-C <path>] <command> [<args>]

DESCRIPTION
    Git is a fast, scalable, distributed revision control system with an unusually rich command set that provides both high-level operations and full access to internals.`,
  },
};
