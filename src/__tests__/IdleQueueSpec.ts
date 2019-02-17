import { setGlobalMockMethod, toMockedInstance } from 'to-mock'
import IdleQueue, { Event, IIdleQueueOptions } from '../IdleQueue'
import * as utils from '../utils'

declare global {
  namespace NodeJS {
    interface Global {
      addEventListener: any
      removeEventListener: any
    }
  }
}

jest.mock('../utils', () => {
  const original = jest.requireActual('../utils')

  setGlobalMockMethod(jest.fn)

  return toMockedInstance(
    original,
    { __original__: original },
    ({ property }) => property === 'once',
  )
})

describe('IdleQueue', () => {
  let idleQueue: IdleQueue

  beforeEach(() => {
    idleQueue = new IdleQueue({ ensureTasks: true, timeout: 50 })
  })

  it('should bind event listeners for ensuring tasks could be called before unloading page', () => {
    global.addEventListener = jest.fn()

    idleQueue.init()

    expect(global.addEventListener).toHaveBeenCalled()
  })

  it('should unbind event listeners from dom', () => {
    global.removeEventListener = jest.fn()

    idleQueue.destroy()

    expect(global.addEventListener).toHaveBeenCalled()
  })

  describe('run method', () => {
    const task = jest.fn()
    const start = jest.fn()
    const error = jest.fn()
    const finish = jest.fn()

    beforeEach(() => {
      jest.clearAllMocks()
      idleQueue = new IdleQueue({ ensureTasks: true, timeout: 50 })
      spyOn(idleQueue, 'destroy')

      idleQueue.addTask(task)
      idleQueue.on(Event.Start, start)
      idleQueue.on(Event.Error, error)
      idleQueue.on(Event.Finish, finish)
    })

    it('shoulde call Event.Start', () => {
      idleQueue.run(utils.DEADLINE)

      expect(start).toHaveBeenCalled()
    })

    it('should call Event.Error for sync error', () => {
      idleQueue.addTask(() => {
        throw new Error('My error')
      })
      idleQueue.run(utils.DEADLINE)

      expect(error).toHaveBeenCalled()
    })

    it('should call Event.Error for async error', done => {
      idleQueue.addTask(() => {
        return Promise.reject(new Error('My error'))
      })
      idleQueue.run(utils.DEADLINE)

      setTimeout(() => {
        expect(error).toHaveBeenCalled()
        done()
      }, 0)
    })

    it('should call Event.Finish', done => {
      idleQueue.run(utils.DEADLINE)

      setTimeout(() => {
        expect(finish).toHaveBeenCalled()
        done()
      }, 0)
    })

    it('should call Event.Finish only once', done => {
      idleQueue.run(utils.DEADLINE)
      idleQueue.run(utils.DEADLINE)
      idleQueue.run(utils.DEADLINE)

      setTimeout(() => {
        expect(finish.mock.calls.length).toEqual(1)
        done()
      }, 0)
    })

    it('should call destroy', done => {
      idleQueue.run(utils.DEADLINE)

      setTimeout(() => {
        expect(idleQueue.destroy).toHaveBeenCalled()
        done()
      }, 0)
    })

    it('should call task with deadline argument', () => {
      idleQueue.run(utils.DEADLINE)

      expect(task).toHaveBeenCalledWith(utils.DEADLINE)
    })
  })
})
