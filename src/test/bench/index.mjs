import assert from 'node:assert'
import Benchmark from 'benchmark'
import toposort from 'toposort'
import {analyze} from '../../../target/esm/index.mjs'

const suite = new Benchmark.Suite

const getEdgesForNode = ({ prefix = '', i, j, maxI, maxJ }) => {
  const node = `${prefix}${i}_${j}`
  const res = []
  if (i < maxI) {
    res.push([node, `${prefix}${i + 1}_${j}`])
  }
  if (j < maxJ) {
    res.push([node, `${prefix}${i}_${j + 1}`])
  }
  if (j < maxJ && i < maxI) {
    res.push([node, `${prefix}${i + 1}_${j + 1}`])
  }
  return res
}

// src/test/resources/graphs/dense-square.svg
export const generateSquareDenseGraph = ({ width, height, prefix }) => {
  const edges = []

  for(let i = 0; i < width; i++) {
    for(let j = 0; j < height; j++) {
      edges.push(...getEdgesForNode({ prefix, i, j, maxI: width - 1, maxJ: height - 1 }))
    }
  }

  return edges
}

const edges = generateSquareDenseGraph({prefix: 'a', height: 10, width: 10})

// const edges = [
//   ['b', 'c'],
//   ['f', 'g'],
//   ['c', 'd'],
//   ['d', 'e'],
//   ['a', 'e'],
//   ['e', 'f'],
//   ['a', 'b'],
//   ['a', 'c'],
//   ['a', 'd'],
// ]

// const edges = [['1', '3'], ['1', '2'], ['2', '4'], ['2', '5'], ['3', '2'], ['5', '6'], ['4', '9'], ['6', '7'], ['6', '8'], ['9', '8']]

// add tests
suite
  .add('toposort', function() {
    toposort(edges)
  })
  .add('toposource', function() {
    analyze(edges, {queue: true})
  })

  // add listeners
  .on('cycle', function(event) {
    console.log(String(event.target))
  })
  .on('complete', function() {
    const fastest = this.filter('fastest').map('name')
    console.log('Fastest is ' + fastest)

    // assert.equal(fastest, 'toposource')
  })
  // run async
  .run({ 'async': true })
