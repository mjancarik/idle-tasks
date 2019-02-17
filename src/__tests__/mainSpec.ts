import * as main from '../main'

describe('IdleQueue', () => {
  it('export all handlers', () => {
    expect(main).toMatchInlineSnapshot(`
Object {
  "Event": Object {
    "0": "Start",
    "1": "Error",
    "2": "Finish",
    "Error": 1,
    "Finish": 2,
    "Start": 0,
  },
  "IdleQueue": [Function],
  "createIdleQueue": [Function],
  "once": [Function],
}
`)
  })
})
