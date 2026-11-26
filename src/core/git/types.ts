/**
 * Core type definitions for the Virtual Git engine.
 */

export interface GitCommit {
  hash: string;
  shortHash: string;
  parent: string | null;
  /** Snapshot of all files in this commit: relative path -> content */
  tree: Record<string, string>;
  message: string;
  author: string;
  timestamp: number;
}

export type GitIndex = Record<string, string>;

export interface GitStagedChanges {
  newFiles: string[];
  modifiedFiles: string[];
  deletedFiles: string[];
}

export interface GitUnstagedChanges {
  modifiedFiles: string[];
  deletedFiles: string[];
}

export interface GitStatusResult {
  branch: string;
  isInitial: boolean;
  staged: GitStagedChanges;
  unstaged: GitUnstagedChanges;
  untracked: string[];
}
