# toposource
[![CI](https://github.com/semrel-extra/toposource/actions/workflows/ci.yaml/badge.svg?branch=master&event=push)](https://github.com/semrel-extra/toposource/actions/workflows/ci.yaml)
[![Maintainability](https://api.codeclimate.com/v1/badges/41fea7047ed5521e2075/maintainability)](https://codeclimate.com/github/semrel-extra/toposource/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/41fea7047ed5521e2075/test_coverage)](https://codeclimate.com/github/semrel-extra/toposource/test_coverage)
> Directed graphs analyzer for parallel traversals

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

## License
[MIT](./LICENSE)
