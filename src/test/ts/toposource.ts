import { test } from 'uvu'
import assert from 'node:assert'

// import toposort from 'toposort'
import { analyze, checkLoop } from '../../main/ts/toposource'
import type { TEdges, TGraph } from '../../main/ts/interface'

test('toposource', () => {
  const cases: [[string, string?][], ReturnType<typeof analyze>][] = [
    [
      [['a', 'c'], ['e', 'c']],
      {
        next: new Map([
          ['a', ['c']],
          ['e', ['c']]
        ]),
        prev: new Map([
          ['c', ['a', 'e']]
        ]),
        sources: [ 'a', 'e' ],
        queue: ['a', 'e', 'c'],
        graphs: [{
          sources: ['a', 'e'],
          nodes: new Set(['a', 'c', 'e'])
        }]
      }
    ],
    [
      [['a', 'b'], ['c']],
      {
        next: new Map([
          ['a', ['b']],
        ]),
        prev: new Map([
          ['b', ['a']]
        ]),
        sources: [ 'a', 'c' ],
        queue: ['a', 'c', 'b'],
        graphs: [{
          sources: ['a'],
          nodes: new Set(['a', 'b'])
        }, {
          sources: ['c'],
          nodes: new Set(['c'])
        }]
      }
    ],
    [
      [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['f', 'e'], ['g', 'f'], ['h', 'g']],
      {
        next: new Map([
          ['a', ['b']],
          ['b', ['c']],
          ['c', ['d']],
          ['d', ['e']],
          ['f', ['e']],
          ['g', ['f']],
          ['h', ['g']]
        ]),
        prev: new Map([
          ['b', ['a']],
          ['c', ['b']],
          ['d', ['c']],
          ['e', ['d', 'f']],
          ['f', ['g']],
          ['g', ['h']],
        ]),
        sources: [ 'a', 'h' ],
        queue: ['a', 'h', 'b', 'g', 'c', 'f', 'd', 'e'],
        graphs: [{
          sources: ['a', 'h'],
          nodes: new Set(['a', 'h', 'b', 'g', 'c', 'f', 'd', 'e'])
        }]
      }
    ],
    [
      [['a', 'b'], ['c', 'd'], ['d', 'b']],
      {
        next: new Map([
          ['a', ['b']],
          ['c', ['d']],
          ['d', ['b']]
        ]),
        prev: new Map([
          ['b', ['a', 'd']],
          ['d', ['c']]
        ]),
        sources: [ 'a', 'c' ],
        queue: ['a', 'c', 'd', 'b'],
        graphs: [{
          sources: ['a', 'c'],
          nodes: new Set(['a', 'c', 'd', 'b'])
        }]
      }
    ],
    [
      [['a', 'b'], ['b', 'c'], ['d', 'c'], ['e', 'f']],
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
        }]
      }
    ]
  ]

  cases.forEach(([edges, expected], index) => {
    assert.deepStrictEqual(analyze(edges), expected, `case ${index}`)
  })
})

test('toposource sources exclude targets and preserve first occurrence order', () => {
  const edges: TEdges = [['b', 'c'], ['a', 'b'], ['z'], ['a', 'b'], ['z'], ['c']]

  assert.deepStrictEqual(analyze(edges, {}).sources, ['a', 'z'])
  assert.deepStrictEqual(analyze([]).sources, [])
})

test('checkLoop() detects loops', () => {
  const cases: [Map<string, string[]>, string?][] = [
    [
      new Map([
        ['a', ['b']],
        ['b', ['c']],
        ['c', ['a']]
      ]),
      'Loop detected: a,b,c,a'
    ],
    [
      new Map([
        ['a', ['c']],
        ['b', ['c']],
        ['c', ['c']]
      ]),
      'Loop detected: c,c'
    ],
    [
      new Map()
    ],
    [
      new Map([
        ['a', ['b', 'c']],
        ['b', ['d']],
        ['c', ['d']]
      ])
    ],
  ]

  cases.forEach(([next, err]) => {
    if (err) {
      assert.throws(() => checkLoop(next), {
        name: 'Error',
        message: err
      }, err)
      return
    }

    assert.doesNotThrow(() => checkLoop(next))
  })
})

test('toposource merges graphs bridged by a later source', () => {
  const cases: [TEdges, TGraph[]][] = [
    // https://github.com/semrel-extra/toposource/issues/19
    [
      [['a', 'x'], ['b', 'y'], ['c', 'x'], ['c', 'y']],
      [{nodes: new Set(['a', 'b', 'c', 'x', 'y']), sources: ['a', 'b', 'c']}]
    ],
    // the same topology, the bridging source comes first
    [
      [['0', 'x'], ['0', 'y'], ['a', 'x'], ['b', 'y']],
      [{nodes: new Set(['0', 'a', 'b', 'x', 'y']), sources: ['0', 'a', 'b']}]
    ],
    // one source bridges three graphs, an unrelated one stays apart
    [
      [['a', 'x'], ['b', 'y'], ['c', 'z'], ['d', 'x'], ['d', 'y'], ['d', 'z'], ['e', 'f']],
      [
        {nodes: new Set(['a', 'b', 'c', 'd', 'x', 'y', 'z']), sources: ['a', 'b', 'c', 'd']},
        {nodes: new Set(['e', 'f']), sources: ['e']}
      ]
    ],
    // the bridge is reached through a chain
    [
      [['a', 'x'], ['b', 'y'], ['x', 'z'], ['c', 'y'], ['c', 'w'], ['w', 'z']],
      [{nodes: new Set(['a', 'b', 'c', 'w', 'x', 'y', 'z']), sources: ['a', 'b', 'c']}]
    ],
    // sources keep their order after a merge: [a, c] + [b, d] + e
    [
      [['a', 'x'], ['b', 'y'], ['c', 'x'], ['d', 'y'], ['e', 'x'], ['e', 'y']],
      [{nodes: new Set(['a', 'b', 'c', 'd', 'e', 'x', 'y']), sources: ['a', 'b', 'c', 'd', 'e']}]
    ],
    // graphs that are not bridged stay apart
    [
      [['a', 'x'], ['b', 'y'], ['c', 'x'], ['d', 'q'], ['e', 'q'], ['e', 'y']],
      [
        {nodes: new Set(['a', 'c', 'x']), sources: ['a', 'c']},
        {nodes: new Set(['b', 'd', 'e', 'q', 'y']), sources: ['b', 'd', 'e']}
      ]
    ],
  ]

  cases.forEach(([edges, graphs]) => {
    const result = analyze(edges).graphs
    assert.deepStrictEqual(result, graphs, JSON.stringify(edges))

    const seen = new Set<string>()
    for (const {nodes} of result) {
      for (const node of nodes) {
        assert.ok(!seen.has(node), `${node} belongs to more than one graph`)
        seen.add(node)
      }
    }
  })
})

test('toposource preserves source order when strict is disabled', () => {
  const edges: TEdges = [
    ['d', 'x'], ['z'], ['b', 'y'], ['c', 'x'], ['a', 'y'], ['e', 'x'], ['e', 'y']
  ]
  const result = analyze(edges, {graphs: true, strict: false})

  assert.deepStrictEqual(result.sources, ['d', 'z', 'b', 'c', 'a', 'e'])
  assert.deepStrictEqual(result.graphs, [
    {nodes: new Set(['a', 'b', 'c', 'd', 'e', 'x', 'y']), sources: ['d', 'b', 'c', 'a', 'e']},
    {nodes: new Set(['z']), sources: ['z']}
  ])
})

test('toposource handles options', () => {
  assert.deepEqual(analyze([['a', 'b']], ).queue, ['a', 'b'])
  assert.deepEqual(analyze([['a', 'b']], {queue: true}).queue, ['a', 'b'])
  assert.equal(analyze([['a', 'b']], {queue: false}).queue, undefined)
})

// test('toposource produces the same queue as toposort', () => {
//   const cases: ReadonlyArray<[string, string | undefined]>[] = [
//     [['a', 'b']],
//     [['1', '3'], ['1', '2'], ['2', '4'], ['2', '5'], ['3', '2'], ['5', '6'], ['4', '9'], ['6', '7'], ['6', '8'], ['9', '8']]
//   ]
//
//   cases.forEach((edges) => {
//     console.log('!!!', analyze(edges as [string, string][]))
//     assert.deepEqual(toposort(edges), analyze(edges as [string, string][]).queue)
//   })
// })

test.run()
