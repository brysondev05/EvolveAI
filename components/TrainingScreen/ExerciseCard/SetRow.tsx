import { useCallback, useMemo } from 'react'
import * as React from 'react'
import { useTheme, Text, Icon } from '@ui-kitten/components'
import { useDispatch } from 'react-redux'
import { View, Pressable } from 'react-native'
import { round, convertToLB, convertToKG } from '~/helpers/Calculations'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { postPerformance } from '~/reduxStore/actions/programActions'
import { RPEChart } from './ExerciseCardData'
import { customLog } from '~/helpers/CustomLog'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useNavigation } from '@react-navigation/native'

export default function SetRow({
  setValues,
  set,
  color,
  exerciseDetails,
  setIndex,
  setNumber,
  exerciseIndex,
  lift,
  currentWeek,
  currentDay,
  exerciseType,
  setUserAddedSets,
  isPerSide,
}) {
  const navigation = useNavigation()
  const { showActionSheetWithOptions } = useActionSheet()
  const theme = useTheme()
  const dispatch = useDispatch()
  const [canContinue, setCanContinue] = React.useState(true)
  const [showRPE, setShowRPE] = React.useState(false)
  const userRole = useTypedSelector(
    ({ firebase: { profile } }) => profile?.role
  )
  const isTopSetUnitsMatch =
    exerciseDetails?.units &&
    setIndex === 1 &&
    exerciseDetails?.max?.units !== exerciseDetails?.units &&
    set?.type === 'topSet'

  const isDropSetUnitsMatch =
    exerciseDetails?.units &&
    set.type === 'dropSet' &&
    setIndex > 1 &&
    setValues[0]?.performance?.units &&
    setValues[0]?.performance?.units !== exerciseDetails?.units

  const isStraightSetUnitsMatch =
    set.type === 'straightSets' &&
    exerciseDetails?.max?.units !== exerciseDetails?.units

  const hasPerformance = lift?.performance?.[setIndex]

  const [expectedPerformance, setExpectedPerformance] = React.useState({
    reps: set.reps,
    rpe: set.rpe,
    weight: [],
    units: exerciseDetails?.units ?? 'kg',
  })

  React.useEffect(() => {
    setExpectedPerformance({
      ...expectedPerformance,
      units: exerciseDetails?.units ?? 'kg',
    })
  }, [exerciseDetails?.units])

  React.useEffect(() => {
    setExpectedPerformance({
      ...expectedPerformance,
      reps: set.reps,
      rpe: set.rpe,
    })
  }, [JSON.stringify(set.reps), JSON.stringify(set.rpe)])

  React.useEffect(() => {
    if (lift.isCarrying) {
      setExpectedPerformance({
        ...expectedPerformance,
        reps: [],
        weight: [],
        rpe: [],
      })
    } else if (exerciseType === 'bridgeAccessory') {
      setExpectedPerformance({
        ...expectedPerformance,
        reps: lift.repsPerSet,
        weight: [],
        rpe: lift.RIR,
      })
    }
  }, [lift.isCarrying, exerciseType])

  // const [thisIntensity, setThisIntensity] = React.useState('')

  let { intensity, intensityAdj, weightIncrement } = set

  const thisIntensity = useMemo(() => {
    if (lift.isAccessory) {
      let accOutput = intensity
        .map((int, index) => {
          return int
        })
        .join(' - ')

      let repType = 'RIR'

      if (lift.isCarrying) {
        repType = 'yards'
      }
      if (lift.isJumping) {
        accOutput = intensity
          .map((int, index) => {
            return `${int * 100}%`
          })
          .join(' - ')
        repType = 'of max'
      }

      return `${accOutput} ${repType}`
    }
    if (lift.isRehab) {
      return `${intensity[0]}${exerciseDetails?.units}`
    }

    let intensityType = 'rpe'

    if (!Number.isInteger(intensity[0]) && set.shifter !== -1) {
      intensityType = '%'
    }

    let output
    if (intensityType === 'rpe') {
      output = intensity
        .map((int, index) => {
          return int
        })
        .join(' - ')
      output += ' RPE'
      setExpectedPerformance({ ...expectedPerformance, rpe: intensity })
    } else {
      let weights = ''
      let percentages = ''
      let weight = setValues?.[0]?.performance?.weight

      if (
        (setIndex === 1 && set.type === 'topSet') ||
        (set.type === 'straightSets' && set.shifter === 0)
      ) {
        weight = exerciseDetails.max?.amount
      } else if (set.shifter !== 0) {
        weight = set.shifter
      }

      if (!weight) {
        return ' - '
      }
      const finalWeightValues = []
      output = intensity.map((int, index) => {
        if (index > 0 && intensity[0] === intensity[1]) {
          return
        }
        let divider =
          index < intensity?.length - 1 && intensity[0] !== intensity[1]
            ? ' - '
            : exerciseDetails?.units?.toLowerCase() || 'kg'
        let percentDivider = index < intensity?.length - 1 ? ' - ' : '%'

        const weightToLift = weight * (int + intensityAdj)

        let rounded = round(weightToLift, weightIncrement, 'ceil')
        const percentage = Math.round(
          (rounded / exerciseDetails?.max?.amount) * 100
        )

        if (
          isTopSetUnitsMatch ||
          isDropSetUnitsMatch ||
          (isStraightSetUnitsMatch && !set.shifter)
        ) {
          rounded =
            exerciseDetails?.units?.toLowerCase() === 'lb'
              ? round(rounded * 2.20462, 5)
              : round(rounded / 2.20462, 2.5)
          // rounded = setIndex
        }
        // if(exerciseDetails.units !== exerciseDetails.max.units && set.type === 'topSet' || set.type === 'straightSets'){
        //     rounded = exerciseDetails.units === 'lb' ? round(rounded * 2.20462, 5) : round(rounded / 2.20462, 2.5)
        // }

        if (intensityAdj < -0.08) {
          weights = 'FINISH'
          percentages = ''
        } else {
          weights += `${rounded}${divider}`

          if (set.shifter && exerciseDetails?.max?.amount && set.isDeload) {
            try {
              const lowestReps = Math.min(...set.reps)
              const lowestRPE = Math.min(...set.rpe)

              const maxPercentage = RPEChart[lowestReps][lowestRPE] - 5

              if (maxPercentage) {
                let RPEPercentage = round(
                  exerciseDetails?.max?.amount * (maxPercentage / 100),
                  set.weightIncrement,
                  'floor'
                )
                if (exerciseDetails?.max?.units !== exerciseDetails?.units) {
                  RPEPercentage =
                    exerciseDetails?.units.toLowerCase() === 'lb'
                      ? convertToLB(RPEPercentage, set.weightIncrement)
                      : convertToKG(RPEPercentage, set.weightIncrement)
                }

                if (
                  RPEPercentage > rounded &&
                  RPEPercentage - rounded >= set.weightIncrement
                ) {
                  setShowRPE(true)
                  weights = `${rounded} - ${RPEPercentage}${exerciseDetails?.units}`
                }
              }
            } catch (e) {
              customLog({ e }, 'Deload RPE Fallback')
            }
          }
          if (isFinite(percentage)) {
            percentages += `${percentage}${percentDivider}`
          }
          finalWeightValues.push(rounded)
        }
      })
      setExpectedPerformance({
        ...expectedPerformance,
        weight: finalWeightValues,
      })
      output = weights
    }

    return output
  }, [setValues, set, intensity, exerciseDetails, lift])

  const performance = React.useCallback(() => {
    if (hasPerformance) {
      const {
        weight,
        reps,
        rpe,
        units = 'kg',
        usingBodyweight = false,
        bands = false,
      } = lift?.performance[setIndex]

      let actualWeight = weight

      if (units !== exerciseDetails?.units) {
        actualWeight =
          units === 'kg' ? convertToLB(weight) : convertToKG(weight)
      }

      let output = usingBodyweight ? 'BW' : actualWeight

      if (reps) {
        output += ` x ${reps}`
      }

      if (rpe) {
        if (lift.isAccessory) {
          output += ` @ ${rpe} RIR`
        } else {
          output += ` @ ${rpe} RPE`
        }
      }
      if (bands) {
        output += '\n' + '+ Bands'
      }
      return output
    }
    return 'Performance'
  }, [lift, exerciseDetails])

  const dispatchSheet = React.useCallback(() => {
    const previousPerformance = lift?.performance?.[setIndex - 1]

    navigation.navigate('Performance Screen', {
      type: 'TOGGLE_PERFORMANCE_SHEET',
      expectedPerformance,
      actualPerformance: lift?.performance?.[setIndex],
      previousPerformance,
      ignorePreviousPerformance: setNumber === 1,
      isAccessory: lift.isAccessory,
      exerciseIndex,
      setIndex,
      currentWeek,
      currentDay,
      exerciseType,
      exerciseID: lift.exercise?.exerciseShortcode,
      lift,
      weightIncrement: set.weightIncrement,
      exerciseStyle: exerciseDetails.style,
      is10RMTest: false,
      isBodyweight: set.isBodyweight,
      isPerSide: set.isPerSide,
      restTime: lift.restTime,
    })
  }, [
    lift,
    expectedPerformance,
    exerciseIndex,
    setIndex,
    setNumber,
    currentWeek,
    currentDay,
    exerciseType,
    exerciseDetails,
  ])

  if (canContinue) {
    const totalRepsCompleted = React.useMemo(
      () =>
        setValues.reduce((acc, set) => acc + Number(set?.performance?.reps), 0),
      [setValues]
    )
    const BridgeRepsLeft = React.useCallback(() => {
      if (
        lift.isBridge &&
        !lift.isAccessory &&
        setValues[setIndex - 1]?.performance?.reps &&
        !setValues[setIndex]?.performance?.reps
      ) {
        return (
          <View style={{ padding: 10 }}>
            <Text style={{ textAlign: 'center', fontSize: 80 }} category='h1'>
              {lift.totalReps - totalRepsCompleted}
            </Text>
            <Text style={{ textAlign: 'center' }} category='h6'>
              Reps Left
            </Text>
          </View>
        )
      }
      return null
    }, [lift, setValues, totalRepsCompleted])

    const handleSidePress = React.useCallback(() => {
      const previousPerformance = lift?.performance?.[setIndex - 1]
      if (previousPerformance) {
        showActionSheetWithOptions(
          {
            options: ['Copy Last Set Performance', 'Cut Set', 'Cancel'],
            cancelButtonIndex: 2,
          },
          (buttonIndex) => {
            if (buttonIndex === 1) {
              return dispatch(
                postPerformance({
                  performance: previousPerformance,
                  exerciseIndex,
                  setIndex: setIndex,
                  isMaxTest: false,
                  currentDay,
                  currentWeek,
                  isAccessory: lift.isAccessory,
                  lift,
                })
              )
            }
            if (buttonIndex === 2) {
              return setUserAddedSets((current) => current - 1)
            }
            // if(buttonIndex === 1) {
            //   return handleMaxChange(round((max[1] + max[0]) / 2,2.5), 'test')
            // }
            // if(buttonIndex === 2) {
            //   return handleMaxChange(max[1], 'test')
            // }
          }
        )
      }
    }, [lift, exerciseIndex, setIndex, currentDay, currentWeek])
    return (
      <View>
        {setIndex === 1 && (showRPE || __DEV__ || userRole === 'admin') && (
          <Text
            category='c1'
            status={userRole === 'admin' ? 'basic' : 'basic'}
            style={{ fontSize: 16 }}>
            Around{' '}
            {Array.isArray(set?.rpe) &&
              set?.rpe?.map(
                (rep, index, arr) =>
                  `${rep}${index < arr.length - 1 ? '-' : ''}`
              )}{' '}
            RPE
          </Text>
        )}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 12,
          }}>
          <Pressable
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: theme['background-basic-color-1'],
              width: 45,
              height: 45,
              borderRadius: 45,
            }}>
            <Text category='s1' style={{ color }}>
              {setNumber}
            </Text>
          </Pressable>

          <View style={{ flex: 1, paddingLeft: 10, paddingRight: 5 }}>
            {thisIntensity === '10 RPE' ? (
              <Pressable
                onPress={() =>
                  dispatch({ type: 'OPEN_INFO_SHEET', infoType: 'rpe10' })
                }
                style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text category='s1' style={{ fontSize: 17, textAlign: 'left' }}>
                  10 RPE{' '}
                </Text>
                <Icon
                  style={{ width: 18, height: 18, marginLeft: 3 }}
                  fill={theme['text-hint-color']}
                  name='info-outline'
                />
              </Pressable>
            ) : (
              <Text category='s1' style={{ fontSize: 17, textAlign: 'left' }}>
                {thisIntensity}
              </Text>
            )}
          </View>
          {!lift.isRehab && (
            <Pressable
              style={{
                paddingVertical: 10,
                paddingHorizontal: 15,
                backgroundColor: theme['background-basic-color-1'],
                borderRadius: 20,
              }}
              onPress={() => dispatchSheet()}>
              <Text category='s1' style={{ color }}>
                {performance()}
              </Text>
            </Pressable>
          )}
        </View>
        <BridgeRepsLeft />
      </View>
    )
  }
  return null
}
