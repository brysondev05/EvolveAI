import auth from '@react-native-firebase/auth'
import { useState, useEffect } from 'react'
import { useFirestore } from 'react-redux-firebase'
import { convertToKG, convertToLB } from '~/helpers/Calculations'
import useProgramChecks from '../programInfo/useProgramChecks'

export const useShifter = ({
  lift,
  currentWeek,
  exerciseDetails,
  blockType,
}) => {
  const { isBridge, isSetProgram } = useProgramChecks({ lift, blockType })
  const { currentUser } = auth()
  const firestore = useFirestore()
  const previousWeek = Number(currentWeek) - 1
  const [shift, setShift] = useState(0)

  const exerciseUnits = exerciseDetails?.units
  useEffect(() => {
    const getEntry = async () => {
      const previousWeekEntries = await firestore
        .collection(`users/${currentUser?.uid}/programDays`)
        .where('week', '==', previousWeek)
        .where(
          'movements',
          'array-contains',
          `${lift.exercise.movement}_${lift.exercise.type}`
        )
        .limit(1)
        .get()

      if (!previousWeekEntries.empty) {
        previousWeekEntries.forEach((entry) => {
          const { mainLifts } = entry.data()

          const lastLift = mainLifts?.find(
            (liftEntry) =>
              liftEntry.exercise?.exerciseShortcode ===
                exerciseDetails?.exerciseShortcode &&
              liftEntry?.exercise.type === lift?.exercise.type
          )

          if (lastLift && lastLift?.performance) {
            const performanceValues = Object.values(lastLift.performance)
            const useableValues = performanceValues.filter(
              (perf) => perf.weight && perf.weight > 0
            )

            if (useableValues.length > 0) {
              if (useableValues?.length === 1 && lastLift.dropset) {
                const dropSet =
                  Number(useableValues[0].weight) * lastLift.dropPercentage[0]
                setShift(dropSet)
              } else {
                if (lift.shifter === 'PreviousWeekLightest') {
                  setShift(
                    Math.min(
                      ...useableValues.map((perf) => {
                        let weight = Number(perf.weight)
                        if (
                          perf?.units?.toLowerCase() !==
                          exerciseUnits.toLowerCase()
                        ) {
                          weight =
                            perf?.units?.toLowerCase() === 'kg'
                              ? convertToLB(weight)
                              : convertToKG(weight)
                        }
                        return Number(weight)
                      })
                    )
                  )
                } else {
                  if (useableValues?.length > 1) {
                    useableValues.shift()
                  }
                  setShift(
                    Math.max(
                      ...useableValues.map((perf) => {
                        let weight = Number(perf.weight)
                        if (
                          perf?.units?.toLowerCase() !==
                          exerciseUnits?.toLowerCase()
                        ) {
                          weight =
                            perf?.units?.toLowerCase() === 'kg'
                              ? convertToLB(weight)
                              : convertToKG(weight)
                        }
                        return Number(weight)
                      })
                    )
                  )
                }
              }
            } else {
              setShift(-1)
            }
          } else {
            setShift(-1)
          }
        })
      } else {
        setShift(-1)
      }
    }
    if (
      lift.shifter !== 'FALSE' &&
      !isSetProgram &&
      !isBridge &&
      !lift.isAccessory
    ) {
      getEntry()
    } else {
      setShift(0)
    }
  }, [lift, currentWeek, exerciseDetails])

  return shift
}

export default useShifter
