export function getControlledPromise() {
  let promiseResolve
  let promiseReject

  const promise = new Promise((resolve, reject) => {
    promiseResolve = resolve
    promiseReject = reject
  })
  promise.resolve = promiseResolve
  promise.reject = promiseReject
  return promise
}