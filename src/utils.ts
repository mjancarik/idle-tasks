type TRequestIdleCallbackHandle = number
interface IRequestIdleCallbackOptions {
  timeout?: number
}
export interface IRequestIdleCallbackDeadline {
  readonly didTimeout: boolean
  timeRemaining: () => number
}

export type TIdleTask = (
  deadline: IRequestIdleCallbackDeadline,
) => void | Promise<any>

declare const requestIdleCallback: (
  callback: TIdleTask,
  opts?: IRequestIdleCallbackOptions,
) => TRequestIdleCallbackHandle
declare const cancelIdleCallback: (handle: TRequestIdleCallbackHandle) => void
declare const safari: {
  pushNotification: () => void
}

export const DEADLINE: IRequestIdleCallbackDeadline = {
  didTimeout: true,
  timeRemaining: () => Infinity,
}

export function rIC(task: TIdleTask, timeout?: number): any {
  return isRequestIdleCallbackSupport()
    ? requestIdleCallback(task, { timeout })
    : setTimeout(() => task(DEADLINE), timeout || 50)
}

export function cIC(handle: TRequestIdleCallbackHandle): any {
  return isRequestIdleCallbackSupport()
    ? cancelIdleCallback(handle)
    : clearTimeout(handle)
}

export function isRequestIdleCallbackSupport(): boolean {
  return typeof window === 'object' && typeof requestIdleCallback === 'function'
}

export function createMicrotask(
  task: TIdleTask,
): (deadline: IRequestIdleCallbackDeadline) => Promise<void> {
  return deadline => Promise.resolve(deadline).then(task)
}

export function once(handler: (...rest: any[]) => any) {
  let isCallHandler = false
  let result = null

  return (...rest: any[]) => {
    if (!isCallHandler) {
      isCallHandler = true
      result = handler(...rest)
    }

    return result
  }
}
