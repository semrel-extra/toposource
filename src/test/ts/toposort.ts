import { test } from 'uvu'
import assert from 'node:assert'

import toposort from 'toposort'
import { analyze, checkLoop } from '../../main/ts/toposource'

test('toposort', () => {
  const cases: [[string, string][], ReturnType<typeof analyze>][] = [
    [
      [['a', 'c'], ['e', 'c']],
      {
        next: new Map()
          .set('a', ['c'])
          .set('e', ['c']),
        prev: new Map()
          .set('c', ['a', 'e']),
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
        next: new Map()
          .set('a', ['b'])
          .set('b', ['c'])
          .set('c', ['d'])
          .set('d', ['e'])
          .set('f', ['e'])
          .set('g', ['f'])
          .set('h', ['g']),
        prev: new Map()
          .set('b', ['a'])
          .set('c', ['b'])
          .set('d', ['c'])
          .set('e', ['d', 'f'])
          .set('f', ['g'])
          .set('g', ['h']),
        sources: [ 'a', 'h' ],
        queue: ['a', 'h', 'b', 'g', 'c', 'f', 'd', 'e'],
        graphs: [{
          sources: ['a', 'h'],
          nodes: new Set(['a', 'h', 'b', 'g', 'c', 'f', 'd', 'e'])
        }]
      }
    ],
    [
      [['a', 'b'], ['b', 'c'], ['d', 'c'], ['e', 'f']],
      {
        next: new Map()
          .set('a', ['b'])
          .set('b', ['c'])
          .set('d', ['c'])
          .set('e', ['f']),
        prev: new Map()
          .set('b', ['a'])
          .set('c', ['b', 'd'])
          .set('f', ['e']),
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
      new Map()
        .set('a', ['b'])
        .set('b', ['c'])
        .set('c', ['a']),
      'Loop detected'
    ],
    [
      new Map()
        .set('a', ['c'])
        .set('b', ['c'])
        .set('c', ['c']),
      'Loop detected'
    ],
    [
      new Map()
    ],
    [
      new Map()
        .set('a', ['b', 'c'])
        .set('b', ['d'])
        .set('c', ['d'])
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
