import { useRef, useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { startTimer, stopTimer } from "~/reduxStore/reducers/timerUpdate"
// import * as Notifications from 'expo-notifications'
import { useTypedSelector } from "~/reduxStore/reducers"
import { Vibration, AppState, Platform } from "react-native"
import moment from "moment"
import { Audio } from "expo-av"
import { customLog } from "~/helpers/CustomLog"
import { handleError } from "~/errorReporting"
import useNotifications from "./useNotification"

const useTimer = () => {
  const appState = useRef(AppState.currentState)

  const [appStateVisible, setAppStateVisible] = useState(appState.current)
  const [sounds, setSounds] = useState({
    tenSec: null,
    thirtySec: null,
    begin: null,
    fiveSec: null,
  })

  const timer = useTypedSelector((state) => state.timer)

  useEffect(() => {
    return sounds
      ? () => {
          Object.values(sounds).forEach((sound) => sound?.unloadAsync())
        }
      : undefined
  }, [sounds])

  useEffect(() => {
    const VIBRATE_TIME_MS = 500

    const PATTERN = [
      1 * VIBRATE_TIME_MS,
      1.1 * VIBRATE_TIME_MS,
      1.2 * VIBRATE_TIME_MS,
    ]

    const now = moment()
    const timeEnd = moment(timer.timerEnd)
    const timeDiff = timeEnd.diff(now, "seconds")

    const handleTimer = async () => {
      if (timer.time === 0 && timer.timerRunning) {
        dispatch(stopTimer())
        Vibration.vibrate(PATTERN)
        dispatch({
          type: "SHOW_NOTIFICATION",
          title: "Back to work!",
          description: "Start your next set now. Make it a good one.",
        })
        // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }
    }

    handleTimer()
  }, [timer.time, timer.timerRunning])

  const dispatch = useDispatch()

  const { setupNotification, cancelNotification } = useNotifications()

  const handleTimeStart = async (length) => {
    try {
      customLog("requested timer start", "Timer")

      setupNotification({
        id: "timer",
        title: "Back to work!",
        body: "Begin your next set now. Make it a good one",
        seconds: length,
      })
    } catch (e) {
      handleError(e)
    } finally {
      return dispatch(startTimer(length))
    }
  }

  const handleTimeStop = async () => {
    cancelNotification("timer")
    return dispatch(stopTimer())
  }

  return {
    handleTimeStart,
    handleTimeStop,
  }
}

export default useTimer
