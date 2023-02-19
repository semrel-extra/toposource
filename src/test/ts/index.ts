import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { analyze, checkLoop } from '../../main/ts/index'

test('index has proper index', () => {
  assert.ok(typeof analyze === 'function')
  assert.ok(typeof checkLoop === 'function')
})

test.run()
