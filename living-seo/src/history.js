export function buildProjectFromRuns(projectConfig, previousRun, currentRun) {
  if (!previousRun || !currentRun) {
    throw new Error('Two runs are required to compare ranking changes');
  }

  const keywordIndex = new Map(previousRun.keywords.map((entry) => [key(entry.keyword, entry.location), entry]));
  const pageSnapshots = {};

  for (const currentKeyword of currentRun.keywords) {
    const previousKeyword = keywordIndex.get(key(currentKeyword.keyword, currentKeyword.location));
    if (!previousKeyword) {
      continue;
    }

    for (const result of [...previousKeyword.results, ...currentKeyword.results]) {
      if (!result?.url) {
        continue;
      }

      pageSnapshots[result.url] = {
        previous: previousRun.pageSnapshots?.[result.url] || null,
        current: currentRun.pageSnapshots?.[result.url] || null,
      };
    }
  }

  return {
    projectName: projectConfig.projectName,
    business: projectConfig.business,
    watchedCompetitors: projectConfig.watchedCompetitors || [],
    keywords: currentRun.keywords.map((currentKeyword) => {
      const previousKeyword = keywordIndex.get(key(currentKeyword.keyword, currentKeyword.location));
      return {
        keyword: currentKeyword.keyword,
        location: currentKeyword.location,
        previous: previousKeyword?.results || [],
        current: currentKeyword.results || [],
      };
    }),
    pageSnapshots,
  };
}

function key(keyword, location) {
  return `${keyword}::${location}`;
}
