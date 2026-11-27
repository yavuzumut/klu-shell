import type { LessonTranslation, LevelTranslation } from '../../../types';

export const EN_LEVELS: Record<string, LevelTranslation> = {
  "level-2": {
    "title": "Intermediate",
    "description": "Redirection (>, >>), pipelines (|), text processing (grep, head, tail, wc, sort, uniq) and file searching (find)."
  },
};

export const EN_LESSON_EXTENSIONS: Record<string, string> = {
  'l2-redirection': `### Standard Output and Redirection

Commands normally write their results to standard output, which the terminal displays. A single \`>\` creates a file or replaces its existing contents. A double \`>>\` creates the file if needed and appends after its current contents. The spaces around the operator are conventional and make the command easier to read.

\`\`\`
$ echo "First line" > notes.txt
$ echo "Another line" >> notes.txt
$ cat notes.txt
\`\`\`

Redirection changes where output goes; it does not print that redirected text to the terminal. This lesson's validator checks exact text and a specific file, so use the prescribed task strings and path when completing it.

> **Caution:** A single > replaces an existing file, so use it carefully when the file already contains useful data.`,
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

The exercise checks particular log lines, so its fixture path and expected line text remain fixed. The English file name above is a general example; use the task's specified file while practicing.

> **Tip:** Preview only the lines you need instead of printing a large log in full.`,
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
  'l2-sort-uniq': `**Sort Before Removing Duplicates**

\`sort\` orders lines alphabetically by default. Use \`-n\` for numeric order and \`-r\` to reverse the result. \`uniq\` removes only adjacent duplicate lines, so sort first when you want duplicates separated in the original input to collapse as well.

\`\`\`
$ sort names.txt | uniq
$ sort names.txt | uniq -c
\`\`\`

The \`-c\` option prefixes each unique line with its count. The exercise's city data deliberately contains repeated names and its validator checks the exact resulting order; retain that fixture when doing the task.

> **Remember:** uniq removes only adjacent duplicate lines; sort first when duplicates may be separated.`,
  'l2-find': `### Filter a Directory Tree

\`find\` starts at a path and visits its descendants. The \`-name\` predicate filters by a filename pattern; \`-type f\` selects regular files and \`-type d\` selects directories. You can combine predicates to narrow the result.

\`\`\`
$ find projects -name "*.js"
$ find projects -type d
\`\`\`

Quote wildcard patterns so the shell passes them to \`find\` instead of expanding them before the command runs. The command reports one matching path per line, which makes its output easy to pipe into another command or compare with an expected list. This lesson checks named files and directory paths in its prepared project tree, so use the task's root path exactly.

> **Tip:** Quote wildcard patterns so the shell passes them to find instead of expanding them first.`,
};

export const EN_LESSON_EXAMPLES: Record<string, string[]> = {
  'l2-redirection': ['echo "Yeni Başlangıç" > ~/notlar.txt', 'echo "İkinci Satır" >> ~/notlar.txt', 'cat ~/notlar.txt', 'ls > ~/liste.txt'],
  'l2-pipes': ['cat ~/gorevler.txt | wc -l', 'ls | head -n 2', 'cat /etc/passwd | wc -l'],
  'l2-head-tail': ['head ~/sunucu.log', 'head -n 3 ~/sunucu.log', 'tail -n 2 ~/sunucu.log', 'head -n 5 /var/log/syslog'],
  'l2-wc': ['wc ~/siir.txt', 'wc -l ~/siir.txt', 'wc -w ~/siir.txt', 'ls | wc -l'],
  'l2-grep': ['grep ERROR ~/uygulama.log', 'grep -i bellek ~/uygulama.log', 'grep -n ERROR ~/uygulama.log', 'grep -c ERROR ~/uygulama.log'],
  'l2-sort-uniq': ['sort ~/sehirler.txt', 'sort -r ~/sehirler.txt', 'sort ~/sehirler.txt | uniq', 'sort ~/sehirler.txt | uniq -c'],
  'l2-find': ['find . -name "*.js"', 'find ~/proje -type d', 'find . -maxdepth 1 -type f', 'find ~ -name "*.txt"'],
};

export const EN_LESSONS: Record<string, LessonTranslation> = {
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
};
