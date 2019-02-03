import {
  cIC,
  ensureCallingTasks,
  IRequestIdleCallbackDeadline,
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
  private _tasks: TIdleTask[] = []
  private _boundedRun: TIdleTask
  private _event: { [TKeyEvent in Event]: TCallback[] }
  private _results: any[]

  constructor(config: IIdleQueueOptions = {}) {
    this._config = config

    this._scheduleHandler = null

    this._event = {
      [Event.Start]: [],
      [Event.Error]: [],
      [Event.Finish]: [],
    }

    this._results = []

    this._boundedRun = (deadline: IRequestIdleCallbackDeadline) =>
      this.run(deadline)
  }

  public init() {
    if (this._config.ensureTasks) {
      ensureCallingTasks(this._boundedRun)
    }
  }

  public addTask(task: TIdleTask): void {
    this._tasks.push(task)
  }

  public removeTask(task: TIdleTask): void {
    const index = this._tasks.indexOf(task)

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

    this._dispatch(Event.Start)

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
      return
    }

    Promise.all(this._results)
      .then(() => {
        this._dispatch(Event.Finish, { results: this._results })
      })
      .catch(error => {
        this._dispatch(Event.Error, { error })
      })
  }

  private _dispatch(event: Event, data: object = {}) {
    this._event[event].forEach(callback => callback(data))
  }
}
