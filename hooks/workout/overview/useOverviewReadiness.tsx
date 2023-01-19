import moment from 'moment'
import { useState, useEffect } from 'react'
import {
  isLoaded,
  useFirestore,
  useFirestoreConnect,
} from 'react-redux-firebase'
import { round } from '~/helpers/Calculations'
import { dateToDate } from '~/helpers/Dates'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDayNumber } from './useDayNumber'
const padToTwo = (number) => (number <= 9 ? `0${number}` : number)

export const useOverviewReadiness = () => {
  const activeDay = useTypedSelector(
    ({ firestore: { ordered } }) => ordered?.dayInfo?.[0]
  )
  const startDate = useTypedSelector(
    ({ firestore: { data } }) =>
      data.userProgram?.programDetails?.userProgramData?.startDate
  )
  const programIndex = useTypedSelector(
    ({ firestore: { data } }) =>
      data.userProgram?.programDetails?.userProgramData?.programIndex
  )

  const dailyReadiness = useTypedSelector(
    ({ firestore: { data } }) => data.dailyReadiness
  )

  const programID = moment(dateToDate(startDate)).format('YYYYMMDD')
  const userID = useTypedSelector(({ firebase: { auth } }) => auth?.uid)
  const day = useDayNumber()

  const [readinessData, setReadiness] = useState(null)
  const getReadinessScore = (scores, programIndex = 0) => {
    const [squat, bench, deadlift] = scores

    if (programIndex === 0) {
      return round(squat + bench + deadlift + 11.5, 0.01)
    }

    return round(
      (scores.reduce((acc: number, item: number) => acc + item, 0) /
        scores.length) *
        3 +
        11.5,
      0.01
    )
  }

  useFirestoreConnect({
    collection: `users/${userID}/readiness`,
    doc: `${programID}_${activeDay?.week}_${day}`,
    storeAs: 'dailyReadiness',
  })

  useEffect(() => {
    if (isLoaded(dailyReadiness) && activeDay?.status === 'complete') {
      setReadiness(dailyReadiness)
    } else {
      setReadiness(null)
    }
  }, [dailyReadiness, activeDay?.status])

  // const fetchExistingRecord = async () => {
  //   const exitingData = await firestore
  //     .doc()
  //     .get()

  //   if (exitingData.exists) {
  //     const docData = exitingData.data()

  //     if (readinessData !== docData) {
  //       setReadiness(docData)
  //     }
  //   }
  //   return
  // }
  // if () {
  //   fetchExistingRecord()
  // } else {
  //   if (readinessData) {
  //     setReadiness(null)
  //   }
  // }

  // useEffect(() => {
  //   let canContinue = true
  //   if (canContinue) {
  //     fetchExistingRecord()
  //   }
  //   return () => {
  //     canContinue = false
  //   }
  // }, [activeDay])

  return {
    sessionStart: dateToDate(readinessData?.date)?.toLocaleDateString(),
    sessionLength:
      readinessData?.sessionLength &&
      `${readinessData.sessionLength.hours}:${padToTwo(
        readinessData.sessionLength.minutes
      )}`,
    readinessData,
    readinessScore:
      readinessData?.finalScore &&
      getReadinessScore(Object.values(readinessData?.finalScore), programIndex),
    sessionRPE: readinessData?.postSessionReview?.sessionRPE,
    sessionMindset: readinessData?.sessionMindset,
    sessionPositive: readinessData?.postSessionReview?.sessionPositive,
    sessionNegative: readinessData?.postSessionReview?.sessionNegative,
  }
}
