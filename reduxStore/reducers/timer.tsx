import moment from 'moment'

const initialState = {
  time: 0,
  timerRunning: false,
  action: 'close_timer_sheet',
  timerEnd: new Date(),
  timerStarts: new Date(),
  type: 'chadbot',
  volume: 0.7,
  soundStatus: {
    begin: false,
    tenSec: false,
    thirtySec: false,
  },
}

export const timer = (state = initialState, action) => {
  const now = moment()

  switch (action.type) {
    case 'LOAD_TIMER':
      return { ...state, type: action.timeType, volume: action.volume }
    case 'CHANGE_TIMER_TYPE':
      return { ...state, type: action.timerType }
    case 'CHANGE_TIMER_VOLUME':
      return { ...state, volume: action.volume }
    case 'TOGGLE_TIMER_SHEET':
      if (state.action === 'open_timer_sheet') {
        return { ...state, action: 'close_timer_sheet' }
      }
      return { ...state, action: 'open_timer_sheet' }
    case 'OPEN_TIMER_SHEET':
      return { ...state, action: 'open_timer_sheet' }
    case 'CLOSE_TIMER_SHEET':
      return { ...state, action: 'close_timer_sheet' }
    case 'TIMER_START':
      return {
        ...state,
        time: action.time,
        timerStarts: now.format(),
        timerRunning: true,
        timerEnd: now.add(action.time, 'seconds').format(),
        soundStatus: initialState.soundStatus,
      }

    case 'BG_TIMER_UPDATE':
      return { ...state, time: action.time }
    case 'TIMER_TICK':
      if (state.time > 0) {
        return {
          ...state,
          time: state.time - 1,
        }
      }
      return state
    case 'TIMER_STOP':
      return {
        ...state,
        timerRunning: false,
        time: 0,
        timerSheet: 'close_timer_sheet',
      }
    case 'TIMER_SOUND_UPDATE':
      return { ...state, soundStatus: action.soundStatus }
    default:
      return state
  }
}

export default timer
