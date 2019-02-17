import { type } from 'os'
import {
  cIC,
  createMicrotask,
  DEADLINE,
  IRequestIdleCallbackDeadline,
  once,
  rIC,
  TIdleTask,
} from './utils'

export interface IIdleQueueOptions {
  ensureTasks?: boolean
  timeout?: number
}

type TCallback = (data: object) => void

export enum Event {
  Start,
  Error,
  Finish,
}

export default class IdleQueue {
  private _config: IIdleQueueOptions
  private _scheduleHandler: any
  private _browserHandler: any
  private _tasks: TIdleTask[] = []
  private _boundedRun: TIdleTask
  private _event: { [TKeyEvent in Event]: TCallback[] }
  private _dispatchOnce: { [TKeyEvent2 in Event]: (data: object) => void } | {}
  private _results: any[]

  constructor(config: IIdleQueueOptions = {}) {
    this._config = config

    this._scheduleHandler = null
    this._browserHandler = null

    this._event = {
      [Event.Start]: [],
      [Event.Error]: [],
      [Event.Finish]: [],
    }

    this._results = []

    this._dispatchOnce = Object.keys(Event).reduce((result, eventName) => {
      const EVENT = Event[eventName]
      result[EVENT] = once((data: object) => {
        this._dispatch(EVENT, data)
      })

      return result
    }, {})

    this._boundedRun = (deadline: IRequestIdleCallbackDeadline) =>
      this.run(deadline)
  }

  public init() {
    if (this._config.ensureTasks) {
      this._browserHandler = this._createBrowserHandler()

      this._bindEventListener(this._browserHandler)
    }
  }

  public destroy() {
    if (this._config.ensureTasks) {
      this._unbindEventListener(this._browserHandler)
    }
  }

  public addTask(task: TIdleTask): void {
    this._tasks.push(task) // vratit id tasku, once
  }

  public removeTask(task: TIdleTask): void {
    const index = this._tasks.indexOf(task) // nebo id tasku

    if (index !== -1) {
      this._tasks.splice(index, 1)
    }
  }

  public on(event: Event, callback: TCallback) {
    this._event[event].push(callback)
  }

  public off(event: Event, callback: TCallback) {
    const index = this._event[event].indexOf(callback)

    if (index !== -1) {
      this._event[event].splice(index, 1)
    }
  }

  public schedule(): void {
    this._scheduleHandler = rIC(this._boundedRun, this._config.timeout)
  }

  public run(deadline: IRequestIdleCallbackDeadline) {
    cIC(this._scheduleHandler)

    this._dispatchOnce[Event.Start]()

    try {
      while (
        this._tasks.length !== 0 &&
        (deadline.timeRemaining() > 0 || deadline.didTimeout)
      ) {
        const task = this._tasks.shift()
        if (task) {
          this._results.push(task(deadline))
        }
      }

      if (this._tasks.length !== 0) {
        this.schedule()
        return
      }
    } catch (error) {
      this._dispatch(Event.Error, { error })
      this.destroy()
      return
    }

    Promise.all(this._results)
      .then(() => {
        this._dispatchOnce[Event.Finish]({ results: this._results })
        this.destroy()
      })
      .catch(error => {
        this._dispatch(Event.Error, { error })
        this.destroy()
      })
  }

  private _dispatch(event: Event, data: object = {}) {
    this._event[event].forEach(callback => callback(data))
  }

  private _createBrowserHandler() {
    const microtask = createMicrotask(this._boundedRun)

    return once(() => microtask(DEADLINE))
  }

  private _bindEventListener(handler: () => void) {
    if (typeof addEventListener === 'function') {
      addEventListener('visibilitychange', handler, true)
      addEventListener('beforeunload', handler, true)
    }
  }

  private _unbindEventListener(handler: () => void) {
    if (typeof removeEventListener === 'function') {
      removeEventListener('visibilitychange', handler)
      removeEventListener('beforeunload', handler)
    }
  }
}
