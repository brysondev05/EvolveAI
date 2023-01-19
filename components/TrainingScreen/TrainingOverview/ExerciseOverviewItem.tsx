import { useCallback, memo, useState, useEffect } from 'react'
import { StyleSheet, View, Pressable } from 'react-native'
import { useTheme, Text, Icon } from '@ui-kitten/components'
import { useExerciseNav } from '~/hooks/workout/useExerciseNav'
import { isLoaded, isEmpty } from 'react-redux-firebase'
import { exerciseNiceNames } from '../ExerciseCard/ExerciseCardData'
import { convertToKG, convertToLB, round } from '~/helpers/Calculations'
import * as Animatable from 'react-native-animatable'
import useExercises from '~/hooks/programInfo/useExercises'
import useShifter from '~/hooks/workout/useShifter'
import { useIsMounted } from '~/hooks/utilities/useIsMounted'

const LOADING_ANIMATION_DURATION = 500
const LOADING_ANIMATION_STYLE = 'fadeIn'

const LOADING_ANIMATION_DELAY = 500

const repDisplay = (item) => {
  if (item.reps) {
    return ` x ${item.reps} ${item.repType || 'reps'}`
  }
  return ''
}
const ResultDisplay = (item) => (
  <View>
    {['accessory', 'bridge', 'preparatory'].includes(item.type) && (
      <Text category='s2' appearance='hint'>
        Average Set
      </Text>
    )}
    {['technique', 'straight'].includes(item.type) && (
      <Text category='s2' appearance='hint'>
        Best Set
      </Text>
    )}
    <Text category='s2'>
      {`${item.amount}${item.units}${repDisplay(item)} @ ${item.intensity} ${
        ['rpe', 'rir'].includes(item.intensityType)
          ? item.intensityType.toUpperCase()
          : item.intensityType
      }`}{' '}
    </Text>
    {item?.ERM?.length > 1 &&
      item.ERM[1] > 0 &&
      item.type === 'top' &&
      item.intensity >= 9 && (
        <>
          <Text category='label' appearance='hint' style={{ marginTop: 10 }}>
            Estimated Max
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text category='h1'>
              {item.ERM.map(
                (max, index) => `${max}${index === 0 ? ' - ' : ''}`
              )}
            </Text>
            <Text category='h6' appearance='hint'>
              {item.units}
            </Text>
          </View>
        </>
      )}
  </View>
)

const findWeightIntensity = (max, units, percentage) => {
  let estimatedIntensity = ''
  const unitRound = units.toLowerCase() === 'lb' ? 5 : 2.5

  if (percentage?.length > 1) {
    estimatedIntensity = `${round(
      max * (percentage?.[0] - 0.05),
      unitRound
    )}${units} - ${round(max * (percentage[1] + 0.025), unitRound)}${units}`
  } else {
    estimatedIntensity = `${round(
      max * (percentage?.[0] - 0.05),
      unitRound
    )}${units} - ${round(max * (percentage[0] + 0.025), unitRound)}${units}`
  }
  return estimatedIntensity
}

const IntensityDisplayContent = ({
  reps,
  intensity,
  percentage,
  lift,
  movementType,
  accessory,
  sets,
  shifter,
  isBridge,
  setType,
  repType,
}) => {
  const intensityType = () => {
    if (intensity?.[0][intensity?.[0].length - 1] === '%') {
      return ''
    }
    if (accessory) {
      return ' RIR'
    }
    return ' RPE'
  }
  const intensityValues =
    intensity &&
    intensity.map(
      (int, index) =>
        `${int}${index !== intensity?.length - 1 ? ' - ' : intensityType()}`
    )

  const getIntensity = useCallback(() => {
    if (shifter === -1) {
      return intensityValues
    }
    if (shifter > 0 && percentage?.[0] && percentage?.[0] !== -1) {
      return findWeightIntensity(shifter, lift.units, percentage)
    }
    if (lift?.max?.amount && percentage?.[0] && percentage?.[0] !== -1) {
      let weightToUse = lift.max.amount

      if (lift?.max?.units !== lift?.units) {
        weightToUse =
          lift?.max?.units?.toLowerCase() === 'lb'
            ? convertToKG(lift.max.amount)
            : convertToLB(lift.max.amount)
      }
      if (isBridge) {
        const unitRound = lift.units?.toLowerCase() === 'lb' ? 5 : 2.5
        return `${round(weightToUse * percentage[0], unitRound)}${lift.units}`
      }
      return findWeightIntensity(weightToUse, lift.units, percentage)
    }
    return intensityValues
  }, [shifter, lift?.units, lift?.max, percentage, intensityValues])

  return (
    <View>
      <View style={{ marginTop: 5 }}>
        <Text appearance='hint' style={{ fontSize: 14 }} category='s2'>
          Loading Strategy
        </Text>
        <Text category='s1'>{movementType}</Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ marginTop: 10, marginRight: 20 }}>
          <Text appearance='hint' style={{ fontSize: 14 }} category='s2'>
            {setType}
          </Text>
          <Text category='s2'>{sets}</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text appearance='hint' style={{ fontSize: 14 }} category='s2'>
            {repType}
          </Text>
          <Text category='s2'>{reps}</Text>
        </View>
      </View>
      {getIntensity() && (
        <View style={{ marginTop: 10 }}>
          <Text appearance='hint' style={{ fontSize: 14 }} category='s2'>
            Estimated Highest Intensity
          </Text>
          <Text category='s2'>{getIntensity()}</Text>
        </View>
      )}
    </View>
  )
}
const IntensityDisplay = memo(IntensityDisplayContent)
const findMovementType = (item, accessory) => {
  if (item.dropset) {
    return 'Top Set / Back-off Sets'
  }
  if (item.isBridge && !accessory) {
    return 'Bridge Set'
  }
  if (item.isBridge && accessory) {
    return 'Bridge Accessory Set'
  }
  if (accessory && item.isSuperSet) {
    return 'Accessory Combo Set'
  }
  if (accessory) {
    return 'Accessory'
  }
  if (item.exercise.type === 'T') {
    return 'Technique Sets'
  }
  return 'Straight Sets'
}

const ExerciseNameContents = memo<{
  navigateToIndividualExercise: any
  intensity: any
  showExpanded: any
  workoutStatus: any
  item: any
  exerciseDetails: any
  userNotes
  reps
  percentage: any
  accessory: any
  setsDisplay: any
  shifter: any
  setType: any
  repType: any
}>(
  ({
    navigateToIndividualExercise,
    intensity,
    showExpanded,
    workoutStatus,
    item,
    exerciseDetails,
    userNotes,
    reps,
    percentage,
    accessory,
    setsDisplay,
    shifter,
    setType,
    repType,
  }) => (
    <Pressable
      style={styles.maxAttemptButton}
      onPress={navigateToIndividualExercise}>
      {intensity?.length > 0 && intensity[0] === 10 && (
        <Text category='c2' status='primary'>
          New Rep Max Attempt
        </Text>
      )}
      <Text
        category={showExpanded && workoutStatus !== 'complete' ? 'h6' : 's1'}>
        {exerciseDetails?.exerciseName}
        {__DEV__ && `\n ${exerciseDetails?.exerciseShortcode}`}
      </Text>
      {workoutStatus === 'complete' &&
        item?.results &&
        ResultDisplay(item?.results)}
      {userNotes}
      {workoutStatus !== 'complete' && showExpanded && (
        <IntensityDisplay
          reps={reps}
          intensity={intensity}
          percentage={percentage}
          lift={exerciseDetails}
          movementType={findMovementType(item, accessory)}
          accessory={accessory}
          sets={setsDisplay}
          shifter={shifter}
          isBridge={item.isBridge}
          setType={setType}
          repType={repType}
        />
      )}
    </Pressable>
  )
)

const ExerciseButtons = memo<{ [key: string]: any }>(
  ({
    navigateToIndividualExercise,
    theme,
    isRehab,
    workoutStatus,
    navigateToExerciseSwap,
  }) => (
    <View style={styles.buttonContainer}>
      <Pressable
        onPress={navigateToIndividualExercise}
        style={styles.infoButton}>
        <Icon
          style={styles.mainIcons}
          fill={theme['text-hint-color']}
          name='info-outline'
        />
        <Text category='p2' appearance='hint'>
          Info
        </Text>
      </Pressable>

      {!isRehab && workoutStatus !== 'complete' && (
        <Pressable
          onPress={navigateToExerciseSwap}
          style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Icon
            style={styles.mainIcons}
            fill={theme['text-hint-color']}
            name='swap-outline'
          />
          <Text category='p2' appearance='hint'>
            Swap
          </Text>
        </Pressable>
      )}
    </View>
  )
)

const HoldingCard = memo<{
  index: any
  liftLength: any
  theme: any
  navigateToExerciseSwap: any
  exerciseCategory: any
}>(({ index, liftLength, theme, navigateToExerciseSwap, exerciseCategory }) => (
  <Animatable.View
    animation={LOADING_ANIMATION_STYLE}
    duration={LOADING_ANIMATION_DURATION}
    delay={
      index
        ? (index * LOADING_ANIMATION_DURATION) / liftLength +
          LOADING_ANIMATION_DELAY
        : LOADING_ANIMATION_DELAY
    }
    useNativeDriver
    style={[
      styles.holdingCard,
      { backgroundColor: theme['background-basic-color-4'] },
    ]}>
    <View style={styles.exerciseRow}>
      <Pressable
        onPress={navigateToExerciseSwap}
        style={styles.holdingSwapButton}>
        <Icon
          style={styles.mainIcons}
          fill={theme['text-primary-color']}
          name='options-2-outline'
        />
        <Text category='s2' status='primary' style={styles.selectText}>
          Select {exerciseNiceNames[exerciseCategory]} Exercise
        </Text>
      </Pressable>
    </View>
  </Animatable.View>
))

const ExerciseOverviewItem = ({
  item,
  index,
  navigation,
  currentDay,
  currentWeek,
  blockType,
  cycleID,
  workoutStatus,
  liftLength,
  showExpanded,
}) => {
  const theme = useTheme()
  const [movementDetails, setMovementDetails] = useState({
    repType: 'HR',
    reps: [0],
    intensity: [0],
    percentage: [0],
  })

  // const exerciseDetails = useTypedSelector(({ firestore: { data } }) => data.exercises && data.exercises[item.exercise?.exerciseShortcode])
  const isMounted = useIsMounted()

  const { exercises } = useExercises()
  const exerciseDetails = exercises?.[item.exercise?.exerciseShortcode]

  const { navigateToExerciseSwap, navigateToIndividualExercise } =
    useExerciseNav({
      item,
      index,
      navigation,
      currentDay,
      currentWeek,
      blockType,
      cycleID,
      exerciseDetails,
      screen: 'TrainingOverview',
    })

  const shifter = useShifter({
    lift: item,
    currentWeek,
    exerciseDetails,
    blockType,
  })

  const accessory = item.isAccessory

  useEffect(() => {
    let canContinue = true
    if (isLoaded(exerciseDetails) && !isEmpty(exerciseDetails) && canContinue) {
      const repType = exerciseDetails?.repType || 'HR'
      const itemIntensity = item.volume?.[repType]?.rpe
      const accIntensity = item?.intensity

      const getIntensity = () => {
        let intensity = itemIntensity
        if (item.isAccessory) {
          intensity = accIntensity
        }

        if (item.isBridge) {
          intensity = item.rpe || item.RIR
        }
        if (item.isJumping) {
          intensity = [`${item.intensity * 100}%`]
        }
        return intensity
      }
      const getPercentage = () => {
        if (item.isBridge) {
          return [item.percentage]
        }
        return item.volume?.[repType]?.percentage
      }

      const getReps = () => {
        let reps = item.volume?.[repType]?.reps || [0]
        if (item.isBridge) {
          reps = item.totalReps || reps?.join(' - ')
        }

        if (item.isRehab) {
          reps = [item.SRI[1]]
        }

        if (item.isAccessory) {
          reps = item.volume?.[repType]
        }
        if (item.isTaper) {
          reps = item.topReps
        }

        if (item.isPrep) {
          reps = item.topReps
        }
        if (item.isCarrying) {
          reps = `${item.distance} yards`
        }
        if (item.isJumping) {
          reps = item.reps
        }
        if (reps?.[0] === -1) {
          reps = 'AMRAP'
        } else if (reps && Array.isArray(reps)) {
          reps = reps?.join(' - ')
        }

        return reps
      }

      const newMovementDetails = {
        repType,
        reps: getReps(),
        intensity: getIntensity(),
        percentage: getPercentage(),
      }
      if (newMovementDetails !== movementDetails) {
        setMovementDetails(newMovementDetails)
      }
    }
    return () => {
      canContinue = false
    }
  }, [item, exerciseDetails])

  const userNotes = () => {
    if (
      workoutStatus === 'complete' &&
      item?.userNotes &&
      item?.userNotes !== ''
    ) {
      return (
        <>
          <Text category='s1' appearance='hint' style={{ marginTop: 5 }}>
            Notes
          </Text>
          <Text category='p2'>{item.userNotes}</Text>
        </>
      )
    }
    return null
  }

  if (isLoaded(exerciseDetails) && !isEmpty(exerciseDetails)) {
    const { intensity, reps, percentage } = movementDetails

    const background = () => {
      if (intensity && intensity[0] === 10) {
        return 'color-primary-transparent-200'
      } else {
        return 'background-basic-color-4'
      }
    }

    const setsDisplay = () => {
      if (blockType[0] === 'R' || item.isTaper) {
        return item?.topSets?.join(' - ')
      }
      if (item.isCarrying) {
        return `${item.sets} x ${item.time}min, ${item.timing}`
      }
      if (item.isBridge && item.repsPerSet) {
        return item.repsPerSet.join(' - ')
      }
      if (Array.isArray(item.sets)) {
        return item.sets.join(' - ')
      }
      return item.sets
    }
    const setType = () => {
      if (item.isCarrying) {
        return 'Timing'
      }
      if ((item.isBridge && item.movement === 'AB') || item.isJumping) {
        return 'Sets'
      }
      if (item.isBridge) {
        return 'Reps Per Set'
      }
      return 'Estimated Sets'
    }
    const repType = () => {
      if (item.isCarrying) {
        return 'Distance'
      }
      if (item.isBridge && !item.isJumping) {
        return 'Total Reps'
      }

      return 'Reps'
    }
    // const repDisplay = reps && (typeof reps === 'string' ? reps : reps[0] === -1 ? 'AMRAP' : reps.join('-'))
    return (
      <Animatable.View
        animation={LOADING_ANIMATION_STYLE}
        duration={LOADING_ANIMATION_DURATION}
        delay={
          index
            ? (index * LOADING_ANIMATION_DURATION) / liftLength +
              LOADING_ANIMATION_DELAY
            : LOADING_ANIMATION_DELAY
        }
        useNativeDriver
        style={[styles.trainingCard, { backgroundColor: theme[background()] }]}>
        <View style={styles.exerciseRow}>
          <ExerciseNameContents
            navigateToIndividualExercise={navigateToIndividualExercise}
            intensity={intensity}
            showExpanded={showExpanded}
            workoutStatus={workoutStatus}
            item={item}
            exerciseDetails={exerciseDetails}
            userNotes={userNotes()}
            reps={reps}
            percentage={percentage}
            accessory={accessory}
            setsDisplay={setsDisplay()}
            shifter={shifter}
            setType={setType()}
            repType={repType()}
          />

          <ExerciseButtons
            navigateToIndividualExercise={navigateToIndividualExercise}
            theme={theme}
            isRehab={item.isRehab}
            workoutStatus={workoutStatus}
            navigateToExerciseSwap={navigateToExerciseSwap}
          />
        </View>
      </Animatable.View>
    )
  }
  if (
    workoutStatus !== 'complete' &&
    (isEmpty(exerciseDetails) || !isLoaded(exerciseDetails))
  ) {
    return (
      <HoldingCard
        navigateToExerciseSwap={navigateToExerciseSwap}
        index={index}
        liftLength={liftLength}
        theme={theme}
        exerciseCategory={item?.exercise?.category}
      />
    )
  }
  return null
}

export default ExerciseOverviewItem

const styles = StyleSheet.create({
  holdingSwapButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonContainer: { flexDirection: 'row' },
  maxAttemptButton: { flex: 1 },
  infoButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 25,
  },
  holdingCard: {
    paddingHorizontal: 20,
    marginVertical: 5,
    marginHorizontal: 15,
    paddingVertical: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 1.62,

    elevation: 4,
  },
  trainingCard: {
    paddingLeft: 20,
    paddingRight: 20,
    marginVertical: 5,
    marginHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 1.62,
    elevation: 4,
  },
  selectText: { marginTop: -2, marginLeft: 5 },

  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainIcons: {
    width: 20,
    height: 20,
    marginBottom: 2.5,
  },
  cardContainer: {
    marginTop: 30,
    borderRadius: 16,
    padding: 15,
    paddingLeft: 30,
    minHeight: 150,
    width: '95%',
    alignSelf: 'center',
  },
  sideLine: {
    position: 'absolute',
    left: 5,
    top: 10,
    zIndex: 1000,
  },
  mainCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    paddingRight: 5,
  },
})
