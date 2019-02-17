// import createMicrotask from './microtask'
import IdleQueue, { Event, IIdleQueueOptions } from './IdleQueue'
import { once } from './utils'

// function $registerImaPlugin() {} // tslint:disable-line no-empty

// export default select;

function createIdleQueue(config: IIdleQueueOptions) {
  const idleQueue = new IdleQueue(config)

  idleQueue.init()

  return idleQueue
}

export { createIdleQueue, Event, IdleQueue, once }
