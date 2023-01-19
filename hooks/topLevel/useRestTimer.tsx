import { useCallback, useEffect, useRef } from "react"
import { AppState } from "react-native"
import { useDispatch } from "react-redux"
import {
  resumeTimer,
  timerSoundUpdate,
} from "~/reduxStore/reducers/timerUpdate"
import { useTypedSelector } from "~/reduxStore/reducers"
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av"
import { handleError } from "~/errorReporting"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { customLog } from "~/helpers/CustomLog"
import { useAssets } from "expo-asset"

Audio.setAudioModeAsync({ 
  allowsRecordingIOS: false,
  staysActiveInBackground: true,
  interruptionModeIOS: InterruptionModeIOS.DuckOthers,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
  interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
})
export const useRestTimer = () => {
  const timer = useTypedSelector((state) => state.timer)
  const time = timer.time
  const dispatch = useDispatch()
  
  const [assets, assetsError] = useAssets([
    require("../../assets/countdown_audio.mp3"),
    require("../../assets/countdown_audio.mp3"),
    require("../../assets/countdown_audio.mp3")
  ])

  //Need assets file to handle the audio other need to remove the code to handle the audio.
  const handleAudio = useCallback(
    async (time, { soundStatuas }) => {
      try {
        if (assets.length > 0) {
          //console.log('Inside Asset', 'true')
          if (time === 30) {
            const { sound: soundObject30 } = await Audio.Sound.createAsync(
              assets[0],
              { shouldPlay: true, volume: 0.65 }
            )

            soundObject30.setOnPlaybackStatusUpdate((stat) => {
              if (stat.didJustFinish) {
                soundObject30.unloadAsync()
              }
            })
          }
          if (time === 10) {
            const { sound: soundObject10 } = await Audio.Sound.createAsync(
              assets[1],
              { shouldPlay: true, volume: 0.65 }
            )

            soundObject10.setOnPlaybackStatusUpdate((stat) => {
              if (stat.didJustFinish) {
                soundObject10.unloadAsync()
              }
            })
          }

          if (time === 1) {
            const { sound: soundObject } = await Audio.Sound.createAsync(
              assets[2],
              { shouldPlay: true, volume: 0.65 }
            )

            soundObject.setOnPlaybackStatusUpdate((stat) => {
              if (stat.didJustFinish) {
                soundObject.unloadAsync()
              }
            })
          }
        }
        if (assetsError) {
          console.log({ assets, secChange: true, mp3Change: true })

          handleError(assetsError)
        }
      } catch (e) {
        console.log({ assets, secChange: true, mp3Change: true })

        handleError(e)
      }
    },
    [assets, assetsError]
  )

  useEffect(() => {
    const setAudio = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      })
    }
    setAudio()
  }, [])
  useEffect(() => {
    if (timer.timerRunning) {
      handleAudio(time, timer)
    }
  }, [time, timer.timerRunning])

  const appState = useRef(AppState.currentState)

  useEffect(() => {
    const eventListener = AppState.addEventListener(
      "change",
      _handleAppStateChange
    )

    return () => {
      eventListener.remove()
    }
  }, [])

  const _handleAppStateChange = useCallback(
    async (nextAppState) => {
      const storeLastState = async () => {
        try {
          await AsyncStorage.setItem(
            "@sessionTimer",
            JSON.stringify(new Date())
          )
        } catch (e) {
          // saving error
        }
      }

      if (
        ["background", "inactive"].includes(appState.current) &&
        nextAppState === "active"
      ) {
        dispatch(resumeTimer())
      } else {
        storeLastState()
      }

      appState.current = nextAppState
      // setAppStateVisible(appState.current);
    },
    [appState]
  )
}
