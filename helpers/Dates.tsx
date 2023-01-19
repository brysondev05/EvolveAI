import { customLog } from './CustomLog'
import { handleError } from './errorReporting'

/**
 * Takes any date value and returns a date object
 * @param date
 * @returns Date Object
 */
export const dateToDate = (date): Date => {
  try {
    if (!date) {
      return
    }
    if (typeof date === 'string') {
      return new Date(date)
    }
    if (typeof date.toDate === 'function') {
      return date.toDate()
    }
    if (typeof date.getMonth === 'function') {
      return date
    }
    if (typeof date.seconds === 'number') {
      return new Date(date.seconds * 1000)
    }
    if (typeof date._seconds === 'number') {
      return new Date(date._seconds * 1000)
    }

    return new Date()
  } catch (e) {
    handleError(e)
    customLog(date, 'date convert error')
  }
}
