import { test } from 'uvu'
import assert from 'node:assert'

// import toposort from 'toposort'
import { analyze, checkLoop } from '../../main/ts/toposource'

test('toposource', () => {
  const cases: [[string, string][], ReturnType<typeof analyze>][] = [
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

test('checkLoop() detects loops', () => {
  const cases: [Map<string, string[]>, string?][] = [
    [
      new Map([
        ['a', ['b']],
        ['b', ['c']],
        ['c', ['a']]
      ]),

      'Loop detected'
    ],
    [
      new Map([
        ['a', ['c']],
        ['b', ['c']],
        ['c', ['c']]
      ]),
      'Loop detected'
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
      assert.throws(() => checkLoop(next), Error, err)
      return
    }

    assert.doesNotThrow(() => checkLoop(next))
  })
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
