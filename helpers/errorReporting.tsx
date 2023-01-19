import * as Sentry from 'sentry-expo'
import { customLog } from './CustomLog'

export const handleMessage = (message) => {
  if (__DEV__) {
    customLog(message, 'message')
  } else {
    Sentry.Native.captureMessage(message)
  }
}
export const handleError = (error: object) => {
  if (__DEV__) {
    customLog(error, 'error')
  } else {
    Sentry.Native.captureException(error)
  }
}
