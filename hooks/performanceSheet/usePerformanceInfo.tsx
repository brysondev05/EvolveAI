import { useState, useEffect, useCallback } from 'react'
import { Platform } from 'react-native'
import { useDispatch } from 'react-redux'
import CalculateMax, {
  convertToKG,
  convertToLB,
  round,
} from '~/helpers/Calculations'
import {
  logLift,
  postPerformance,
  updateMax,
} from '~/reduxStore/actions/programActions'
import { useTypedSelector } from '~/reduxStore/reducers'
import useBands from '../workout/useBands'
import * as Haptics from 'expo-haptics'
import { customLog } from '~/helpers/CustomLog'
import { useActionSheet } from '@expo/react-native-action-sheet'
import useTimer from '../useTimer'
import { useNavigation } from '@react-navigation/native'

const suggestedAMRAPReps = 12

export const usePerformanceInfo = ({
  setIsUpdating,
  autoTimerEnabled,
  performanceInfo,
}) => {
  const {
    expectedPerformance: {
      reps: expectedReps,
      rpe: expectedRPE,
      weight: expectedWeight,
      units,
    },
    actualPerformance: thisSetPerformance,
    setIndex,
    exerciseIndex,
    exerciseID,
    previousPerformance,
    ignorePreviousPerformance,
    currentWeek,
    currentDay,
    isAccessory,
    lift,
    is10RMTest,
    weightIncrement,
    restTime,
  } = performanceInfo || {}

  const navigation = useNavigation()
  const dayInfo = useTypedSelector(({ firestore: { data } }) => data.dayInfo)
  const exercise = useTypedSelector(
    ({ firestore: { data } }) =>
      data?.exercises?.[lift?.exercise?.exerciseShortcode]
  )
  const dispatch = useDispatch()
  const { showActionSheetWithOptions } = useActionSheet()
  const { handleTimeStart } = useTimer()

  const [max10Update, setMax10Update] = useState(null)
  const [performance, setPerformance] = useState({
    weight: '',
    reps: '',
    rpe: '',
    units: 'kg',
  })

  const [max, setMax] = useState([0, 0])
  const [max10, setMax10] = useState(0)
  const [maxUpdate, setMaxUpdate] = useState(false)
  const movementType = exerciseID.substr(0, 2)

  const { usesBands, setUsesBands, bands, setBands, bandsButtons } = useBands({
    units,
  })
  const [usingBodyweight, setUsingBodyweight] = useState(false)

  const blockType = dayInfo?.blockType
  const hasPerformance =
    thisSetPerformance && thisSetPerformance?.weight !== null
  const isMaxTest =
    expectedRPE &&
    expectedRPE?.length > 0 &&
    expectedRPE[0] === 10 &&
    blockType?.[0] !== 'P'

  useEffect(() => {
    if (usingBodyweight && performance.weight !== '0') {
      setPerformance({ ...performance, weight: '0' })
    }
  }, [usingBodyweight, performance])
  useEffect(() => {
    setMaxUpdate(false)
    setMax10Update(false)
  }, [exerciseID])

  useEffect(() => {
    if (hasPerformance) {
      const { weight, reps, rpe, units: performanceUnits } = thisSetPerformance

      let actualWeight = weight
      if (performanceUnits !== units) {
        actualWeight =
          performanceUnits === 'kg'
            ? convertToLB(weight, weightIncrement)
            : convertToKG(weight, weightIncrement)
      }

      setPerformance({ weight: String(actualWeight), reps, rpe, units })

      if (thisSetPerformance.bands) {
        setUsesBands(true)
        setBands(thisSetPerformance.bands)
      } else {
        setUsesBands(false)
      }
      if (thisSetPerformance.usingBodyweight) {
        setUsingBodyweight(true)
        // setPerformance({...performance, weight: "0"})
      } else {
        setUsingBodyweight(false)
      }
    } else if (
      (previousPerformance?.weight || previousPerformance?.usingBodyweight) &&
      !ignorePreviousPerformance
    ) {
      if (expectedWeight?.length > 0 && expectedWeight[0] !== 0) {
        setPerformance({
          weight:
            expectedWeight?.length > 0
              ? String(expectedWeight[0])
              : previousPerformance.weight,
          reps: previousPerformance.reps,
          rpe: previousPerformance.rpe,
          units,
        })
        if (previousPerformance.bands) {
          setUsesBands(true)
          setBands(previousPerformance.bands)
        } else {
          setUsesBands(false)
        }

        if (previousPerformance.usingBodyweight) {
          setUsingBodyweight(true)
        } else {
          setUsingBodyweight(false)
        }
      } else {
        setPerformance({
          weight: previousPerformance.weight,
          reps: previousPerformance.reps,
          rpe: previousPerformance.rpe,
          units: previousPerformance.units,
        })

        if (previousPerformance.bands) {
          setUsesBands(true)
          setBands(previousPerformance.bands)
        } else {
          setUsesBands(false)
        }

        if (previousPerformance.usingBodyweight) {
          setUsingBodyweight(true)
        } else {
          setUsingBodyweight(false)
        }
      }
    } else {
      setPerformance({
        reps:
          expectedReps?.length > 0
            ? String(
                expectedReps[0] === -1 ? suggestedAMRAPReps : expectedReps[0]
              )
            : '',
        weight: expectedWeight?.length > 0 ? String(expectedWeight[0]) : '',
        rpe: expectedRPE?.length > 0 ? String(expectedRPE[0]) : '',
        units,
      })
      setUsingBodyweight(false)
      setUsesBands(false)
    }
  }, [performanceInfo])

  const handleMaxChange = useCallback(
    (max, type) => {
      dispatch(
        updateMax({
          exerciseID: performanceInfo?.exerciseID,
          max,
          units,
          weight: performance?.weight,
          reps: performance?.reps,
          rpe: performance?.rpe,
        })
      )
      dispatch(
        postPerformance({
          performance: {
            weight: performance?.weight,
            reps: performance?.reps,
            rpe: performance?.rpe,
            units,
          },
          exerciseIndex: performanceInfo?.exerciseIndex,
          setIndex: performanceInfo?.setIndex,
          isMaxTest,
          currentWeek,
          currentDay,
          isAccessory,
          lift,
        })
      )
    },
    [
      performance,
      max,
      isMaxTest,
      performanceInfo,
      currentDay,
      currentWeek,
      isAccessory,
      lift,
      units,
    ]
  )

  const handlePerformanceChange = useCallback(() => {
    const hasBands =
      usesBands && Object.values(bands).reduce((acc, item) => acc + item) > 0

    if (isMaxTest && maxUpdate) {
      showActionSheetWithOptions(
        {
          options: [
            `${max[0]}${units}`,
            `${round((max[1] + max[0]) / 2, weightIncrement)}${units}`,
            `${max[1]}${units}`,
            'Cancel',
          ],
          cancelButtonIndex: 3,
          message:
            "We've created a range of maxes for you to pick from, we suggest being conservative in your choice unless you are certain you could have achieved more",
          title: 'Select your new max',
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            return handleMaxChange(max[0], 'test')
          }
          if (buttonIndex === 1) {
            return handleMaxChange(
              round((max[1] + max[0]) / 2, weightIncrement),
              'test'
            )
          }
          if (buttonIndex === 2) {
            return handleMaxChange(max[1], 'test')
          }
          if (buttonIndex === 3) {
            setIsUpdating({ done: false, clear: false })
            return
          }
        }
      )
    } else if (
      performance?.reps == '1' &&
      expectedReps?.[0] == '1' &&
      blockType?.[0] === 'P' &&
      !dayInfo?.isTaper
    ) {
      const newMax = CalculateMax({
        weight: performance.weight,
        reps: performance?.reps,
        rpe: performance?.rpe,
        units: 'kg',
      })

      dispatch(
        logLift({
          exerciseID,
          estimatedMax: (newMax[1] + newMax[0]) / 2,
          units,
          type: 'peakSingle',
          weight: performance?.weight,
          reps: performance?.reps,
          rpe: performance?.rpe,
          bands: hasBands && bands,
          usingBodyweight,
        })
      )
      dispatch(
        postPerformance({
          performance: {
            units,
            weight: performance?.weight,
            reps: performance?.reps,
            rpe: performance?.rpe,
            bands: hasBands && bands,
            usingBodyweight,
          },
          exerciseIndex,
          setIndex,
          isMaxTest,
          currentWeek,
          currentDay,
          isAccessory,
          lift,
        })
      )
    } else if (is10RMTest && setIndex === 2) {
      const newMax = CalculateMax({
        weight: performance?.weight,
        reps: performance?.reps,
        rpe: performance?.rpe,
        units,
      })

      const estimatedMax = (newMax[1] + newMax[0]) / 2
      dispatch(
        updateMax({
          exerciseID,
          max: max10,
          units,
          reps: performance?.reps,
          weight: performance?.weight,
          rpe: performance?.rpe,
          type: '10RM',
          bands: hasBands && bands,
          usingBodyweight,
        })
      )

      dispatch(
        logLift({
          exerciseID,
          estimatedMax,
          rm10: max10,
          units,
          type: '10RMTest',
          bands: hasBands && bands,
          usingBodyweight,
          weight: performance?.weight,
          reps: performance?.reps,
          rpe: performance?.rpe,
        })
      )

      dispatch(
        postPerformance({
          performance: {
            bands: hasBands && bands,
            usingBodyweight,
            weight: performance?.weight,
            reps: performance?.reps,
            rpe: performance?.rpe,
            units,
            is10RMTest,
            maxUpdate: null,
          },
          exerciseIndex,
          setIndex,
          isMaxTest,
          currentWeek,
          currentDay,
          isAccessory,
          lift,
        })
      )
    } else if (max10Update) {
      customLog('updating 10RM')

      let max10 = exercise?.rm10?.amount

      if (exercise?.rm10?.units !== units) {
        if (units === 'lb') {
          max10 = convertToLB(exercise?.rm10?.amount)
        } else {
          max10 = convertToKG(exercise?.rm10?.amount)
        }
      }
      dispatch(
        postPerformance({
          performance: {
            bands: hasBands && bands,
            usingBodyweight,
            weight: performance?.weight,
            reps: performance?.reps,
            rpe: performance?.rpe,
            units,
            is10RMTest,
            maxUpdate: {
              exerciseID,
              max: max10Update + max10,
              units,
              weight: performance?.weight,
              reps: performance?.reps,
              rpe: performance?.rpe,
              type: '10RM',
            },
          },
          exerciseIndex,
          setIndex,
          isMaxTest,
          currentWeek,
          currentDay,
          isAccessory,
          lift,
        })
      )
    } else {
      dispatch(
        postPerformance({
          performance: {
            bands: hasBands && bands,
            usingBodyweight,
            weight: performance?.weight,
            reps: performance?.reps,
            rpe: performance?.rpe,
            units,
            is10RMTest,
            maxUpdate: null,
          },
          exerciseIndex,
          setIndex,
          isMaxTest,
          currentWeek,
          currentDay,
          isAccessory,
          lift,
        })
      )
    }

    if ((exercise?.autoTimer || restTime) && autoTimerEnabled) {
      let timerRPE = Number(performance?.rpe)

      const getTime = () => {
        if (restTime) {
          return restTime
        }
        if (!isAccessory) {
          if (timerRPE <= 6.5) {
            return exercise?.autoTimer[6] * 60
          }
          if (timerRPE < 8) {
            return exercise?.autoTimer[7] * 60
          }
          if (timerRPE < 9) {
            return exercise?.autoTimer[8] * 60
          }
          return exercise?.autoTimer[9] * 60
        } else {
          if (timerRPE >= 4) {
            return exercise?.autoTimer[6] * 60
          }
          if (timerRPE === 3) {
            return exercise?.autoTimer[7] * 60
          }
          if (timerRPE === 2) {
            return exercise?.autoTimer[8] * 60
          }
          return exercise?.autoTimer[9] * 60
        }
      }

      handleTimeStart(getTime())
    }
    return setTimeout(() => {
      navigation.goBack()
    }, 100)
  }, [
    performance,
    maxUpdate,
    max,
    isMaxTest,
    performanceInfo,
    lift,
    currentWeek,
    currentDay,
    isAccessory,
    units,
    maxUpdate,
    max10,
    usingBodyweight,
    usesBands,
    bands,
    max10Update,
    exercise,
    autoTimerEnabled,
  ])

  const handleWeightRepsRPEChange = useCallback(
    ({
      type,
      change,
      max = null,
      min = null,
    }: {
      type: 'weight' | 'reps' | 'rpe' | 'rir' | 'seconds'
      change: 'increase' | 'decrease'
      max?: any
      min?: any
    }) => {
      let unitIncrease = 1
      let dataType = 'weight'

      switch (type) {
        case 'weight':
          unitIncrease = weightIncrement
          break
        case 'reps':
          unitIncrease = 1
          dataType = 'reps'
          break
        case 'rpe':
          unitIncrease = 0.5
          dataType = 'rpe'
          break
        case 'rir':
          ;(unitIncrease = 1), (dataType = 'rpe')
          break
        case 'seconds':
          unitIncrease = 1
          dataType = 'reps'
          break
      }

      if (
        (max &&
          performance[dataType] === String(max) &&
          change === 'increase') ||
        (min &&
          performance[dataType] === String(min) &&
          change === 'decrease') ||
        (change === 'decrease' && Number(performance[dataType]) <= 0)
      ) {
        return
      }

      if (Platform.OS === 'ios') {
        Haptics.selectionAsync()
      }

      setPerformance((oldPerformance) => {
        const parsedPerformance = parseFloat(oldPerformance[dataType])

        const startingNumber = !isNaN(parsedPerformance) ? parsedPerformance : 0

        const newValue =
          change === 'increase'
            ? String(startingNumber + unitIncrease)
            : String(startingNumber - unitIncrease)
        return { ...performance, [dataType]: newValue }
      })
    },
    [performance]
  )

  return {
    max,
    max10,
    setMax10,
    max10Update,
    setMax10Update,
    maxUpdate,
    isMaxTest,
    setMax,
    setMaxUpdate,
    hasPerformance,
    performance,
    setPerformance,
    handleWeightRepsRPEChange,
    usingBodyweight,
    setUsingBodyweight,
    usesBands,
    setUsesBands,
    bandsButtons,
    movementType,
    handlePerformanceChange,
  }
}
