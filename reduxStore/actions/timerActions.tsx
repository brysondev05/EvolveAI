import moment from 'moment'
import { customLog } from '~/helpers/CustomLog'

let timer = null

// export const startTimer = (time) => (dispatch, getState) => {
//   clearInterval(timer)

//   // dispatch({ type: 'TIMER_START', time })

//   // timer = setInterval(() => dispatch({ type: 'TIMER_TICK' }), 1000)
//   // dispatch({ type: "TIMER_TICK"})
// }

// export const stopTimer = () => {
//   clearInterval(timer)
//   return { type: 'TIMER_STOP' }
// }

// export const resumeTimer = () => async (dispatch, getState) => {
//   const { timer: timerState } = getState()
//   if (timerState.timerRunning) {
//     const now = moment()
//     const timeEnd = moment(timerState.timerEnd)
//     const timeDiff = timeEnd.diff(now, 'seconds')

//     if (timeDiff > 1) {
//       customLog(`Updating Timer, timeDiff: ${timeDiff}`, 'Timer')
//       return dispatch(startTimer(timeDiff))
//     } else {
//       customLog('Stopping Timer', 'Timer')

//       return dispatch(stopTimer())
//     }
//   }
// }
