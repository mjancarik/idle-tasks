import IdleQueue, { Event, IIdleQueueOptions } from '../IdleQueue'
import * as utils from '../utils'

jest.mock('../utils')

describe('IdleQueue', () => {
  let idleQueue: IdleQueue

  beforeEach(() => {
    idleQueue = new IdleQueue({ ensureTasks: true, timeout: 50 })
  })

  it('should set ensure callback', () => {
    idleQueue.init()

    expect(utils.ensureCallingTasks).toHaveBeenCalled()
  })

  describe('run method', () => {
    const task = jest.fn()
    const start = jest.fn()
    const error = jest.fn()
    const finish = jest.fn()

    beforeEach(() => {
      jest.clearAllMocks()
      idleQueue = new IdleQueue({ ensureTasks: true, timeout: 50 })

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

    it('should call task with deadline argument', () => {
      idleQueue.run(utils.DEADLINE)

      expect(task).toHaveBeenCalledWith(utils.DEADLINE)
    })
  })
})
