import IdleQueue, { Event, IIdleQueueOptions } from './IdleQueue'
import { once } from './utils'

function createIdleQueue(config: IIdleQueueOptions) {
  const idleQueue = new IdleQueue(config)

  idleQueue.init()

  return idleQueue
}

export { createIdleQueue, Event, IdleQueue, once }
