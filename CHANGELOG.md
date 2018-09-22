# Changelog

## [Unreleased]
- Hyperlink Git commits to GitHub (#887)
- Display short hash + summary for commits (#879)
- Hyperlink to GitHub entities (#860)
- Add GitHub reactions to the graph (#846)
- Detect references to commits (#833)
- Detect references in commit messages (#829)
- Add commit authorship to the graph (#826)
- Add `MentionsAuthor` edges to the graph (#808)
<!-- Please add new entries to the _top_ of this section. -->

## [0.1.0]
- Organize weight config by plugin (#773)
- Configure edge forward/backward weights separately (#749)
- Combine "load graph" and "run pagerank" into one button (#759)
- Store GitHub data compressed at rest, reducing space usage by 6–8× (#750)
- Improve weight sliders display (#736)
- Separate bots from users in the UI (#720)
- Add a feedback link to the prototype (#715)
- Support combining multiple repositories into a single graph (#711)
- Normalize scores so that 1000 cred is split amongst users (#709)
- Stop persisting weights in local store (#706)
- Execute GraphQL queries with exponential backoff (#699)
- Introduce a simplified Git plugin that only tracks commits (#685)
- Rename cred explorer table columns (#680)
- Display version string in the app's footer
- Support hosting SourceCred instances at arbitrary gateways, not just
  the root of a domain (#643)
- Aggregate over connection types in the cred explorer (#502)
- Start tracking changes in `CHANGELOG.md`

