import { test } from 'uvu'
import assert from 'node:assert'
import {analyze} from 'toposource'

test('index (cjs)', () => {
  assert.ok(typeof analyze === 'function')
})

test.run()
