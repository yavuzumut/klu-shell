/**
 * Core type definitions for the Virtual Git engine.
 */

export interface GitCommit {
  hash: string;
  shortHash: string;
  parent: string | null;
  /** Second parent of a merge commit (the merged branch tip). */
  mergeParent?: string | null;
  /** Snapshot of all files in this commit: relative path -> content */
  tree: Record<string, string>;
  message: string;
  author: string;
  timestamp: number;
}

export type GitIndex = Record<string, string>;

/** A single file difference; `null` content means the file is absent on that side. */
export interface GitFileDiff {
  path: string;
  oldContent: string | null;
  newContent: string | null;
}

export type GitConflictKind = 'both modified' | 'both added' | 'deleted by us' | 'deleted by them';

export interface GitConflict {
  path: string;
  kind: GitConflictKind;
}

/** Persisted state of an in-progress (conflicted) merge. */
export interface GitMergeState {
  /** Commit hash of the branch being merged in. */
  mergeHead: string;
  branch: string;
  message: string;
  /** Conflicts not yet resolved with `git add`. */
  conflicts: GitConflict[];
}

export interface GitBranchInfo {
  name: string;
  hash: string;
  current: boolean;
}

export type GitMergeResult =
  | { type: 'up-to-date' }
  | { type: 'fast-forward'; from: string; to: string; changedFiles: string[] }
  | { type: 'merge'; commit: GitCommit; changedFiles: string[] }
  | { type: 'conflict'; conflicts: GitConflict[]; autoMerged: string[] };

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
  /** Present while a conflicted merge is in progress. */
  merging?: { branch: string; conflicts: GitConflict[] };
}

export interface GitRemoteConfig {
  url: string;
}

export interface GitBranchConfig {
  remote: string;
  merge: string;
}

export interface GitRepoConfig {
  remotes: Record<string, GitRemoteConfig>;
  branches: Record<string, GitBranchConfig>;
}

export interface GitRemoteInfo {
  name: string;
  url: string;
}

export interface GitPushResult {
  remote: string;
  branch: string;
  url: string;
  isNewBranch: boolean;
  oldHash: string | null;
  newHash: string;
  setUpstream: boolean;
}

export type GitPullResult =
  | { type: 'up-to-date' }
  | { type: 'fast-forward'; from: string; to: string; changedFiles: string[] }
  | { type: 'merge'; commit: GitCommit; changedFiles: string[] }
  | { type: 'conflict'; conflicts: GitConflict[]; autoMerged: string[] };

