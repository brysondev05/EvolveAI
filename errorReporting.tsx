import * as Sentry from 'sentry-expo'

export const handleMessage = (message) => {
  if (__DEV__) {
    console.log(message)
  } else {
    Sentry.Native.captureMessage(message)
  }
}
export const handleError = (error: object) => {
  if (__DEV__) {
    console.log(error)
  } else {
    Sentry.Native.captureException(error)
  }
}
