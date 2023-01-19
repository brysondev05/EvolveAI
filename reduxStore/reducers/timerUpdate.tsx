import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { handleError } from '~/helpers/errorReporting'
import { showErrorNotification, showSuccessNotification } from './notifications'
import { dateToDate } from '~/helpers/Dates'
import * as Sentry from 'sentry-expo'
import { customLog } from '~/helpers/CustomLog'
import moment from 'moment'
import notifee, { TriggerType, TimestampTrigger } from '@notifee/react-native'

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
  androidRestrictionsCount: 0,
}

let time = null
export const startTimer = createAsyncThunk(
  '::Timer/startTimer',
  async (timeLength: number, { dispatch, rejectWithValue, getState }) => {
    clearInterval(time)
    const now = new Date()

    now.setSeconds(now.getSeconds() + timeLength)
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: now.getTime(),
    }

    const channelId = await notifee.createChannel({
      id: 'timer',
      name: 'timer',
    })

    await notifee.requestPermission()
    await notifee.createTriggerNotification(
      {
        title: 'Timer Ended',
        body: 'Back to work! Your next set starts now. Make it a good one',
        id: 'timer',
        android: {
          channelId,
          showTimestamp: true,
          // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
        },
      },
      trigger
    )

    time = setInterval(() => dispatch(timerTick()), 1000)
  }
)

export const resumeTimer = createAsyncThunk(
  '::Timer/resumeTimer',
  async (val, { dispatch, getState }) => {
    const { timer: timerState } = getState()

    if (timerState.timerRunning) {
      const now = moment()
      const timeEnd = moment(timerState.timerEnd)
      const timeDiff = timeEnd.diff(now, 'seconds')

      if (timeDiff > 1) {
        customLog(`Updating Timer, timeDiff: ${timeDiff}`, 'Timer')
        return dispatch(startTimer(timeDiff))
      } else {
        customLog('Stopping Timer', 'Timer')

        return dispatch(stopTimer())
      }
    }
  }
)

const timer = createSlice({
  name: '::Timer',
  initialState,
  reducers: {
    stopTimer: (state) => {
      clearInterval(time)
      notifee.cancelTriggerNotification('timer')
      return initialState
    },

    timerTick: (state) => {
      if (state.time > 0) {
        state.time -= 1
      }
    },
    toggleTimerSheet: (state) => {
      state.action =
        state.action === 'close_timer_sheet'
          ? 'open_timer_sheet'
          : 'close_timer_sheet'
    },
    openTimerSheet: (state) => {
      state.action = 'open_timer_sheet'
    },
    closeTimerSheet: (state) => {
      state.action = 'close_timer_sheet'
    },
    timerSoundUpdate: (state, action) => {
      state.soundStatus = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(startTimer.pending, (state, action) => {
      state.time = action.meta.arg

      state.timerRunning = true
      state.timerEnd = moment().add(action.meta.arg, 'seconds').toDate()
      state.timerStarts = moment().toDate()
    })
  },
})

export const {
  stopTimer,
  timerTick,
  toggleTimerSheet,
  openTimerSheet,
  closeTimerSheet,
  timerSoundUpdate,
} = timer.actions
export default timer.reducer
