export interface CheatCategoryTranslation {
  titleTr: string;
  title: string;
  items: Record<string, { description: string; example?: string }>;
}

export const EN_CHEAT_SHEET: CheatCategoryTranslation[] = [
  { titleTr: 'Gezinme ve Konum', title: 'Navigation & Location', items: {
    pwd: { description: 'Print the full path of the current working directory.' },
    cd: { description: 'Move between directories (.. parent, ~ home, - previous).' },
    realpath: { description: 'Resolve a relative path to its absolute path.' },
    basename: { description: 'Extract the filename from a path.' },
  } },
  { titleTr: 'Dosya ve Dizin Listeleme', title: 'Listing Files & Directories', items: {
    ls: { description: 'List directory contents (-l detailed, -a includes hidden files).' },
  } },
  { titleTr: 'Oluşturma ve Yazma', title: 'Creating & Writing', items: {
    mkdir: { description: 'Create directories (-p also creates parent directories).' },
    touch: { description: 'Create an empty file or update its timestamp.' },
    echo: { description: 'Print text or write it to a file using redirection.' },
  } },
  { titleTr: 'Dosya Okuma ve İnceleme', title: 'Reading & Inspecting Files', items: {
    cat: { description: 'Print file contents (-n numbers the lines).' },
    head: { description: 'Show the first lines of a file (-n sets the line count).' },
    tail: { description: 'Show the last lines of a file (-n sets the line count).' },
    wc: { description: 'Count lines, words, and bytes (-l counts lines).' },
    stat: { description: 'Show file size, permissions, and timestamp metadata.' },
  } },
  { titleTr: 'Metin ve Dosya Arama', title: 'Text & File Search', items: {
    grep: { description: 'Search text for a pattern (-i ignores case, -n shows line numbers).' },
    find: { description: 'Search files and directories (-name matches names, -type filters).' },
  } },
  { titleTr: 'Sıralama ve Düzenleme', title: 'Sorting & Deduplication', items: {
    sort: { description: 'Sort lines alphabetically or numerically (-r reverses, -n sorts numbers).' },
    uniq: { description: 'Remove or count adjacent duplicate lines (-c adds counts).' },
  } },
  { titleTr: 'İzinler ve Güvenlik', title: 'Permissions & Security', items: {
    chmod: { description: 'Change file and directory permissions (numeric modes or +x).' },
  } },
  { titleTr: 'Sistem ve Kullanıcı Bilgisi', title: 'System & User Information', items: {
    whoami: { description: 'Print the active username.' },
    uname: { description: 'Print operating system and kernel information (-a shows all).' },
    date: { description: 'Print the system date and time.' },
  } },
  { titleTr: 'Ortam ve Değişkenler', title: 'Environment & Variables', items: {
    env: { description: 'List the current environment variables.' },
    export: { description: 'Define or export an environment variable.', example: 'export NAME=KLU' },
    which: { description: 'Find the executable path for a command.' },
  } },
  { titleTr: 'Süreç Yönetimi', title: 'Process Management', items: {
    ps: { description: 'List running processes and their PIDs (aux shows all processes).' },
    kill: { description: 'Terminate a process by PID (-9 forces termination).' },
  } },
  { titleTr: 'Kopyalama ve Taşıma', title: 'Copying & Moving', items: {
    cp: { description: 'Copy files and directories (-r is required for directories).', example: 'cp -r Documents backup' },
    mv: { description: 'Move or rename files and directories.' },
  } },
  { titleTr: 'Silme İşlemleri', title: 'Removing Files', items: {
    rm: { description: 'Remove files and directories (-r recursive, -f force).' },
  } },
  { titleTr: 'Yardım ve Oturum Yönetimi', title: 'Help & Session', items: {
    help: { description: 'Show a brief summary of available commands.' },
    man: { description: 'Open the detailed manual page for a command.' },
    clear: { description: 'Clear the terminal screen (also Ctrl+L).' },
    history: { description: 'List previously executed commands.' },
  } },
  { titleTr: 'Git (Sürüm Kontrolü)', title: 'Git (Version Control)', items: {
    'git init': { description: 'Initialize a Git repository in the current directory.' },
    'git status': { description: 'Show working tree and staging area status.' },
    'git add': { description: 'Stage files for the next commit.' },
    'git commit': { description: 'Save staged changes with a commit message.' },
    'git log': { description: 'List commit history from newest to oldest.' },
    'git diff': { description: 'Show line-by-line differences in files.' },
    'git restore': { description: 'Discard working tree changes or unstage files.' },
    'git branch': { description: 'List or create branches.' },
    'git switch': { description: 'Switch branches (-c creates and switches).' },
    'git merge': { description: 'Merge the specified branch into the current branch.' },
    'git remote': { description: 'Manage and list remote repository configurations.' },
    'git push': { description: 'Send local commits to the simulated remote repository.' },
    'git pull': { description: 'Fetch changes from and integrate the simulated remote repository.' },
    'git clone': { description: 'Clone a repository from the local remote simulation.' },
  } },
];
