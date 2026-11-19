# toposource
> Directed graphs analyzer for parallel traversals

[![CI](https://github.com/semrel-extra/toposource/actions/workflows/ci.yaml/badge.svg?branch=master&event=push)](https://github.com/semrel-extra/toposource/actions/workflows/ci.yaml)
[![Maintainability](https://qlty.sh/gh/semrel-extra/projects/toposource/maintainability.svg)](https://qlty.sh/gh/semrel-extra/projects/toposource)
[![Code Coverage](https://qlty.sh/gh/semrel-extra/projects/toposource/coverage.svg)](https://qlty.sh/gh/semrel-extra/projects/toposource)
[![npm (tag)](https://img.shields.io/npm/v/toposource)](https://www.npmjs.com/package/toposource)

## Usage

```ts
import { analyze } from 'toposource'

analyze([['a', 'b'], ['b', 'c'], ['d', 'c'], ['e', 'f']])
// →
{
  next: new Map([
    ['a', ['b']],
    ['b', ['c']],
    ['d', ['c']],
    ['e', ['f']]
  ]),
  prev: new Map([
    ['b', ['a']],
    ['c', ['b', 'd']],
    ['f', ['e']]
  ]),
  sources: [ 'a', 'd', 'e' ],
  queue: ['a', 'd', 'e', 'b', 'c', 'f'],
  graphs: [{
    sources: ['a', 'd'],
    nodes: new Set(['a', 'b', 'd', 'c'])
  }, {
    sources: ['e'],
    nodes: new Set(['e', 'f'])
  },
}
```

## Alternatives
* [toposort](https://github.com/marcelklehr/toposort)
* [batching-toposort](https://github.com/glebec/batching-toposort)
* [js-graph-algorithms](https://github.com/chen0040/js-graph-algorithms)
* [topology-runner](https://github.com/smartprocure/topology-runner)
* [graph-data-structure](https://github.com/datavis-tech/graph-data-structure)

## License
[MIT](./LICENSE)
