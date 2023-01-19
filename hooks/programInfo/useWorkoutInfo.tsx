import { useMemo, useEffect, useState } from 'react'
import { customLog } from '~/helpers/CustomLog'
import { useTypedSelector } from '~/reduxStore/reducers'

export const useWorkoutInfo = () => {
  const programWeeks = useTypedSelector(
    ({ firestore: { data } }) => data.programWeeks
  )

  const [nextPending, setNextPending] = useState({
    week: 1,
    day: 1,
    hasBeenLoaded: false,
  })

  const activeWorkout = useMemo(
    () =>
      programWeeks &&
      Object.values(programWeeks)
        .sort((a, b) => a.cycleID - b.cycleID)
        .find((week) => week?.trainingDayStatus.includes('active')),
    [programWeeks]
  )

  useEffect(() => {
    const nextPendingWorkout =
      programWeeks &&
      Object.values(programWeeks)
        .sort((a, b) => a.cycleID - b.cycleID)
        .find(
          (week) =>
            week?.trainingDayStatus.includes('pending') &&
            week?.status !== 'complete'
        )

    if (
      activeWorkout &&
      !nextPending.hasBeenLoaded &&
      (nextPending.week !== activeWorkout?.startingWeek ||
        nextPending.day !==
          activeWorkout?.trainingDayStatus.indexOf('active') + 1)
    ) {
      setNextPending({
        week: activeWorkout?.startingWeek,
        day: activeWorkout?.trainingDayStatus.indexOf('active') + 1,
        hasBeenLoaded: true,
      })
    } else if (
      nextPendingWorkout &&
      !nextPending.hasBeenLoaded &&
      (nextPending.week !== nextPendingWorkout?.startingWeek ||
        nextPending.day !==
          nextPendingWorkout?.trainingDayStatus.indexOf('pending') + 1)
    ) {
      setNextPending({
        week: nextPendingWorkout?.startingWeek,
        day: nextPendingWorkout?.trainingDayStatus.indexOf('pending') + 1,
        hasBeenLoaded: true,
      })
    }
  }, [programWeeks, activeWorkout])

  return {
    nextPending,
    activeWorkout,
  }
}
