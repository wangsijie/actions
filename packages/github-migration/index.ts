import axios from "axios";

if (!process.env.GH_TOKEN) {
  throw new Error('GH_TOKEN is missing');
}

interface RepoResponse {
  id: number;
  name: string;
  owner: {
    login: string;
  };
}

const getRepos = async (): Promise<string[]> => {
  const repos: string[] = [];
  let link = "https://api.github.com/user/repos?per_page=100";
  while (link) {
    const { data, headers } = await axios.get<RepoResponse[]>(link, {
      headers: { Authorization: `bearer ${process.env.GH_TOKEN}` },
    });
    // link: <https://api.github.com/user/repos?per_page=100&page=2>; rel="next", <https://api.github.com/user/repos?per_page=100&page=4>; rel="last"
    repos.push(
      ...data
        .filter((item) => item.owner.login === "wangsijie")
        .map((repo) => repo.name)
    );
    const linkSearch = /<([^<]+)>;\srel="next"/.exec(headers.link);
    if (linkSearch) {
      link = linkSearch[1];
    } else {
      break;
    }
  }
  return repos;
};

const createMigration = async (repositories: string[]): Promise<void> => {
  await axios.post(
    "https://api.github.com/user/migrations",
    { repositories },
    {
      headers: {
        authorization: `bearer ${process.env.GH_TOKEN}`,
        accept: "application/vnd.github.wyandotte-preview+json",
      },
    }
  );
};

const app = async (): Promise<void> => {
  const repos = await getRepos();
  await createMigration(repos);
}

app();
