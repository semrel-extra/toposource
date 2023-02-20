const { test } = require('uvu')
const assert = require('node:assert')
const toposource = require('toposource')

test('index (cjs)', () => {
  assert.ok(typeof toposource.analyze === 'function')
})

test.run()
