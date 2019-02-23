import * as utils from '../utils'

describe('utils', () => {
  describe('once method', () => {
    it('should be call defined method only once', () => {
      const mockMethod = jest.fn()
      const method = utils.once(mockMethod)

      method()
      method()
      method()

      expect(mockMethod.mock.calls.length).toEqual(1)
    })

    it('should be call defined method with params', () => {
      const mockMethod = jest.fn()
      const method = utils.once(mockMethod)
      const args = [1, 2, 3]

      method(...args)
      method()
      method()

      expect(mockMethod.mock.calls[0]).toEqual(args)
    })
  })

  describe('createMicroTask method', () => {
    it('should return promise base micro task', done => {
      const mockMethod = jest.fn()
      const microtask = utils.createMicrotask(mockMethod)

      microtask(utils.DEADLINE)
        .then(() => {
          expect(mockMethod.mock.calls.length).toEqual(1)
          expect(mockMethod.mock.calls[0][0]).toEqual(utils.DEADLINE)
          done()
        })
        .catch(done)
    })
  })
})
