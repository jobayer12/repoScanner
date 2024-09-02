export const isValidGitHubRepoUrl = (url: string) => {
  // Regular expression to match GitHub repository URLs
  const githubRepoUrlPattern =
    /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+(\/)?$/;

  // Test the URL against the pattern
  return githubRepoUrlPattern.test(url);
};

export const convertToApiUrl = (url: string) => {
  // Create a URL object from the input string
  const parsedUrl = new URL(url.includes('://') ? url : 'https://' + url);

  // Extract the path from the original URL
  const path = parsedUrl.pathname;

  // Construct the new URL with the GitHub API base URL
  const apiUrl = `https://api.github.com/repos${path}`;

  return apiUrl;
};
