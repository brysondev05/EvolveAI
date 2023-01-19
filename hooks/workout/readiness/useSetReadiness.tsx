import { useState, useEffect, useCallback } from 'react'
import { Platform } from 'react-native'
import firestore from '@react-native-firebase/firestore'

import { postReadiness } from '~/reduxStore/actions/readinessActions'
import DeviceInfo from 'react-native-device-info'
import { setTrainingDayActive } from '~/reduxStore/actions/trainingDayActions'
import * as Haptics from 'expo-haptics'
import { customLog } from '~/helpers/CustomLog'
import { useDispatch } from 'react-redux'
import useNotifications from '~/hooks/useNotification'
import { round } from '~/helpers/Calculations'

const values = {
  userSleep: [-1.5, -0.5, 0, 0.5, 1],
  userMotivation: [-1, -0.5, 0, 0, 0.5],
  userBody: [-1.5, -0.5, 0, 0, 0.5, 1],
  userDiet: [-1.5, -0.25, 0, 0.5, 0.75],
  userUpperBody: [-0.5, -0.25, 0, 0.25, 0.5],
  userLowerBody: [-0.5, -0.25, 0, 0.25, 0.5],
  bodyPart: [-0.5, -0.25, 0, 0.25, 0.5],
}
const getFinalScore = ({
  withPrevious = true,
  readinessScore,
  lastRatings,
}) => {
  const PecScore = values.bodyPart[readinessScore.userBodyParts.userPec]
  const LatScore = values.bodyPart[readinessScore.userBodyParts.userLat]
  const LBScore = values.bodyPart[readinessScore.userBodyParts.userLB]
  const GlutesScore = values.bodyPart[readinessScore.userBodyParts.userGlutes]
  const QuadsScore = values.bodyPart[readinessScore.userBodyParts.userQuads]

  const SleepScore = values.userSleep[readinessScore.userSleep]
  const MotivationScore = values.userMotivation[readinessScore.userMotivation]
  const BodyScore = values.userBody[readinessScore.userBody]
  const DietScore = values.userDiet[readinessScore.userDiet]

  const scoreTwo = 2.5 + SleepScore + MotivationScore + BodyScore + DietScore

  const score = scoreTwo

  const deadliftBody = round(
    LBScore * 0.375 + GlutesScore * 0.32 + QuadsScore * 0.25 + LatScore * 0.055,
    0.01
  )

  const squatBody = LBScore * 0.35 + GlutesScore * 0.3 + QuadsScore * 0.35

  const benchBody = LatScore * 0.5 + PecScore * 0.5

  const upperBody = LatScore * 0.9 + LBScore * 0.05 + PecScore * 0.05

  const deadliftScore = +(deadliftBody + scoreTwo).toFixed(2)
  const squatScore = +(squatBody + scoreTwo).toFixed(2)
  const benchScore: number = +(benchBody + scoreTwo).toFixed(2)
  const upperPullScore = +(upperBody + scoreTwo).toFixed(2)

  if (lastRatings && withPrevious) {
    const checkedLastRatings = Object.fromEntries(
      Object.entries(lastRatings).map(([key, rating]: [string, number]) => {
        if (isNaN(rating)) {
          return [key, 2.5]
        }
        return [key, rating]
      })
    )

    const initialRatings = {
      squat: round(squatScore * 0.6 + checkedLastRatings?.squat * 0.4, 0.01),
      bench: round(benchScore * 0.6 + checkedLastRatings?.bench * 0.4, 0.01),
      deadlift: round(
        deadliftScore * 0.6 + checkedLastRatings?.deadlift * 0.4,
        0.01
      ),
      upperPull: round(
        upperPullScore * 0.6 + checkedLastRatings?.upperPull * 0.4,
        0.01
      ),
    }

    const finalRatings = Object.fromEntries(
      Object.entries(initialRatings).map(([key, rating]: [string, number]) => {
        if (isNaN(rating)) {
          return [key, 2.5]
        }
        return [key, rating]
      })
    )

    return {
      score,
      ...finalRatings,
      dataPoints: {
        userBodyParts: {
          PecScore,
          LatScore,
          LBScore,
          GlutesScore,
          QuadsScore,
        },
        userSleep: SleepScore,
        userMotivation: MotivationScore,
        userBody: BodyScore,
        userDiet: DietScore,
      },
    }
  }

  return {
    score,
    squat: squatScore,
    bench: benchScore,
    deadlift: deadliftScore,
    upperPull: upperPullScore,
    dataPoints: {
      userBodyParts: {
        PecScore,
        LatScore,
        LBScore,
        GlutesScore,
        QuadsScore,
      },
      userSleep: SleepScore,
      userMotivation: MotivationScore,
      userBody: BodyScore,
      userDiet: DietScore,
    },
  }
}

export const useSetReadiness = ({
  day,
  week,
  programID,
  userID,
  isOffDay,
  setValue,
  getValues,
  units,
  navigation,
}) => {
  const dispatch = useDispatch()
  const { setupNotification } = useNotifications()
  const [lastRatings, setLastRatings] = useState()

  useEffect(() => {
    let canContinue = true
    if (canContinue) {
      const fetchExistingRecord = async () => {
        const exitingData = await firestore()
          .doc(`users/${userID}/readiness/${programID}_${week}_${day}`)
          .get()

        if (exitingData.exists) {
          const docData = exitingData.data()

          if (typeof docData.dataValues !== 'undefined') {
            Object.entries(docData.dataValues).forEach(([key, value]) =>
              setValue(key, value)
            )
          }
          return
        }
        return
      }

      const fetchLastRecord = async () => {
        if (canContinue) {
          const now = new Date()
          const latest = new Date()

          now.setHours(now.getHours() - 6)
          latest.setHours(latest.getHours() - 168)

          const exitingData = await firestore()
            .collection(`users/${userID}/readiness`)
            .where('date', '<', firestore.Timestamp.fromDate(now))
            .where('date', '>=', firestore.Timestamp.fromDate(latest))
            .orderBy('date', 'desc')
            .limit(5)
            .get()

          let hasReadiness = false
          if (!exitingData.empty) {
            exitingData.forEach((docData) => {
              if (
                typeof docData.data().finalScore !== 'undefined' &&
                !hasReadiness
              ) {
                setLastRatings(docData.data().finalScore)
                hasReadiness = true
                return
              }
              return
            })

            return
          }
          return
        }
      }
      fetchExistingRecord()
      fetchLastRecord()
    }
    return () => {
      canContinue = false
    }
  }, [day, week, programID])

  const handleBodyweightChange = useCallback(
    (change: 'increase' | 'decrease') => {
      if (Platform.OS === 'ios') {
        Haptics.selectionAsync()
      }
      const unitIncrease = units === 'kg' ? 0.25 : 0.25

      const userBodyweight = getValues('userBodyweight')
      const parsedPerformance = parseFloat(userBodyweight)

      const startingNumber = !isNaN(parsedPerformance) ? parsedPerformance : 0

      const newValue =
        change === 'increase'
          ? String(round(startingNumber + unitIncrease, 0.25))
          : String(round(startingNumber - unitIncrease, 0.25))

      setValue('userBodyweight', newValue)
    },
    []
  )

  const createUserReadiness = useCallback(
    async (data) => {
      try {
        const { score, squat, bench, deadlift, upperPull, dataPoints } =
          getFinalScore({
            withPrevious: true,
            readinessScore: data,
            lastRatings,
          })

        if (__DEV__) {
          customLog({ squat, bench, deadlift, upperPull }, 'Readiness Score')
        }

        await dispatch(
          postReadiness({
            scores: { score, squat, bench, deadlift, upperPull },
            dataPoints,
            bodyweight: { weight: data.userBodyweight, units },
            readinessScoreIndex: data,
            rehab: {
              movementsToRehab: data.rehab,
              rehabWeeks: data.rehabWeeks,
            },
            sessionMindset: data.sessionMindset,
          })
        )

        // if (isOffDay) {
        //   return navigation.navigate('Drawer', {
        //     screen: 'WorkoutTab',
        //     params: { screen: 'HomeScreen' },
        //   })
        // }

        setupNotification({
          id: 'startWorkout',
          title: 'Workout still active',
          body: "Don't forget to come back and rate your workout!",
          seconds: 14400,
        })
        dispatch(setTrainingDayActive())
        return navigation.navigate('MainTrainingScreen')
      } catch (error) {}
    },
    [isOffDay, lastRatings]
  )

  return {
    createUserReadiness,
    handleBodyweightChange,
  }
}
