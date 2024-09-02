export interface IGithubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  default_branch: string;
}

export interface IGithubBranchCommit {
  sha: string;
}

export interface IGithubBranch {
  name: string;
  commit: IGithubBranchCommit;
}
