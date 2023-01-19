import { useNavigationContainerRef } from '@react-navigation/native'
import { useState, useMemo, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useFirestoreConnect } from 'react-redux-firebase'
import { fetchTrainingDay } from '~/reduxStore/actions/trainingDayActions'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useWorkoutInfo } from '../programInfo/useWorkoutInfo'
import useDayProgramming from '../programInfo/useDayProgramming'
import { getExercises } from '~/reduxStore/reducers/userProgram'
import { AppDispatch } from '~/reduxStore/store'
import { chunkArray } from '~/helpers/Arrays'

export const useWorkoutSetup = () => {
  const navigationRef = useNavigationContainerRef()

  const route = navigationRef.current?.getCurrentRoute()
  const userID = useTypedSelector((state) => state.firebase?.auth?.uid)

  const programSettings = useTypedSelector((state) => state.userProgram)

  const { nextPending } = useWorkoutInfo()

  const dispatch = useDispatch<AppDispatch>()
  const { liftsToFind } = useDayProgramming()

  useEffect(() => {
    let canContinue = true
    let hasPendingWorkout
    let week
    let day
    if (canContinue) {
      const { activeWeek, activeDay } = programSettings

      week = activeWeek ?? nextPending.week
      day = activeDay ?? nextPending.day
      hasPendingWorkout = week && day
      if (hasPendingWorkout) {
        dispatch(fetchTrainingDay({ day, week }))
      } else {
        //find next day
      }
    }
    return () => {
      canContinue = false
      if (hasPendingWorkout) {
        dispatch(fetchTrainingDay({ day, week, unSet: true }))
      }
    }
  }, [
    nextPending.week,
    nextPending.day,
    route,
    programSettings.activeWeek,
    programSettings.activeDay,
  ])

  const [activeLifts, setActiveLifts] = useState([])

  useEffect(() => {
    if (
      userID &&
      liftsToFind &&
      JSON.stringify(liftsToFind) !== JSON.stringify(activeLifts)
    ) {
      setActiveLifts(liftsToFind)
      dispatch(getExercises(liftsToFind))
    }
  }, [liftsToFind, userID])

  const query = useMemo(() => {
    if (liftsToFind) {
      const queryChunk = chunkArray(liftsToFind, 10)

      const queryArr = queryChunk.reduce((acc, chunk, index) => {
        acc.push({
          collection: 'users',
          doc: userID,
          subcollections: [{ collection: 'exercises' }],
          where: ['exerciseShortcode', 'in', chunk],
          storeAs: index > 0 ? 'exercises2' : 'exercises',
        })
        return acc
      }, [])
      return queryArr
    }
    return null
  }, [liftsToFind, userID])

  useFirestoreConnect(userID && liftsToFind?.length > 0 && query)

  useFirestoreConnect(
    userID && [
      {
        collection: 'users',
        doc: userID,
        subcollections: [{ collection: 'program' }],
        storeAs: 'userProgram',
      },
    ]
  )
}
