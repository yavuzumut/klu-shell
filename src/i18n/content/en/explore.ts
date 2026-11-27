export interface ExploreToolTranslation {
  description: string;
  warning?: string;
  tips?: string[];
  summary?: string;
  installNote?: string;
}

export const EN_EXPLORE_TOOLS: Record<string, ExploreToolTranslation> = {
  'yt-dlp': {
    description: 'Download video or audio from YouTube and many other sites.',
    warning: 'Downloading copyrighted material may violate service terms. Use your own videos or freely licensed content, and verify a program source before installing it with sudo.',
    installNote: 'Distribution packages may lag behind. The project recommends downloading its standalone binary directly; ffmpeg is required for MP3 conversion. On newer Ubuntu versions, pip may report an externally managed environment.',
  },
  'wttr-in': {
    description: 'Show weather in the terminal; no installation is needed, but curl is required.',
    installNote: 'No installation is needed; curl is sufficient.',
    tips: ['Try curl wttr.in/Istanbul.', 'Use ?format=3 for a compact result.', 'The service also supports queries such as wttr.in/Moon.'],
    warning: 'This is a free third-party service. Without a location in the URL, it estimates location from your IP address; an internet connection is required.',
  },
  fastfetch: {
    description: 'Display system information in a polished terminal layout.',
    installNote: 'Direct apt installation applies to Debian 13 and Ubuntu 25.04 or newer. Older Ubuntu releases may need the project PPA first.',
    warning: 'Neofetch was archived in April 2024; fastfetch is a maintained alternative. A shared screenshot may reveal your local IP address.',
  },
  btop: {
    description: 'Monitor CPU, memory, disks, network, and processes with colorful graphs.',
    installNote: 'The snap command is for Ubuntu and requires snap; Debian does not include snap by default.',
  },
  ncdu: { description: 'Show which directories use the most disk space in an interactive, sortable view of du.' },
  ripgrep: { description: 'Search text quickly while respecting .gitignore; the command is named rg.' },
  fd: {
    description: 'Search for files with a simple, fast command-line interface.',
    installNote: 'On Debian and Ubuntu, the executable may be named fdfind.',
  },
  bat: {
    description: 'View files with syntax highlighting, line numbers, and Git change markers.',
    installNote: 'On Debian and Ubuntu, the executable may be named batcat.',
  },
  eza: {
    description: 'List files like ls, with colors, icons, and Git information.',
    warning: 'The formerly recommended exa project is unmaintained; eza is its successor. Install eza rather than exa.',
    installNote: 'Some older distribution releases may not package eza.',
  },
  fzf: {
    description: 'Filter a list interactively with fuzzy matching; shell integration can search history with Ctrl+R.',
  },
  tldr: { description: 'Show concise, example-focused alternatives to lengthy man pages.' },
  tmux: {
    description: 'Keep multiple terminal panes and sessions in one terminal, even across disconnects.',
    tips: ['Detach with Ctrl+b, then d.', 'Return to a session with tmux attach.'],
  },
  cmatrix: {
    description: 'Show an animated stream of falling code inspired by The Matrix.',
    warning: 'It can use significant CPU; press Ctrl+C to exit.',
  },
  'cowsay-figlet-lolcat': {
    description: 'Make a cow say text, create large ASCII headings, and color output like a rainbow.',
    tips: ['Try cowsay "Hello".', 'Run figlet KLU for a large heading.', 'Pipe output with figlet KLU | lolcat.', 'Pipes are covered in Linux Level 2.'],
  },
  sl: {
    description: 'If you mistype ls as sl, a steam train will cross the terminal.',
  },
};
