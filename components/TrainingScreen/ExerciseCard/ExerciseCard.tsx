import { memo, useState, useMemo, useEffect } from 'react'
import { StyleSheet, Pressable } from 'react-native'
import { Layout, Text, Icon, useTheme } from '@ui-kitten/components'
import { View } from 'react-native'
import Svg, { Line } from 'react-native-svg'
import SetsRow from './SetsRow'

import AddSetButton from './AddSetButton'
import SelectExerciseCard from './SelectExerciseCard'
import * as Animatable from 'react-native-animatable'
import { useSetValues } from '~/hooks/workout/useSetValues'
import { useExerciseNav } from '~/hooks/workout/useExerciseNav'
import useProgramChecks from '~/hooks/programInfo/useProgramChecks'
import useShifter from '~/hooks/workout/useShifter'
import StartTimerButton from './StartTimerButton'
import useExercises from '~/hooks/programInfo/useExercises'
import { useDispatch } from 'react-redux'
import { exerciseData } from '~/assets/data/exerciseData'
import { useIsMounted } from '~/hooks/utilities/useIsMounted'

const LOADING_ANIMATION_DURATION = 500
const LOADING_ANIMATION_STYLE = 'fadeIn'

const LOADING_ANIMATION_DELAY = 500

const UserNotes = memo<{
  notes: string
  theme: any
  isAccessory: boolean
  lift: any
  dispatch: any
  navigation: any
}>(({ notes, theme, isAccessory, lift, dispatch, navigation }) => {
  // if(lift?.userNotes && lift.userNotes !== '') {
  return (
    <View style={{ paddingVertical: 15 }}>
      <Pressable
        onPress={() =>
          navigation.navigate('Notes Screen', {
            exercise: { isAccessory, ...lift },
            notesType: 'workout',
          })
        }>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text category='h6' appearance='hint'>
            Notes
          </Text>

          <Icon
            style={{ width: 18, height: 18 }}
            fill={theme['text-hint-color']}
            name='edit-outline'
          />
        </View>

        <Text category='p2'>{notes}</Text>
      </Pressable>
    </View>
  )
  // }
  // return null
})

export default function ExerciseCard({
  lift,
  readiness,
  navigation,
  index,
  currentWeek,
  currentDay,
  blockType,
  cycleID,
  liftLength,
  updateAdjustmentValue,
  isPreview,
  programIndex = 0,
}) {
  const { exercises } = useExercises()
  const exerciseDetails = exercises?.[lift.exercise?.exerciseShortcode]

  // const exerciseDetails
  const shifter = useShifter({ lift, currentWeek, exerciseDetails, blockType })

  const {
    setValues,
    exerciseType,
    setUserAddedSets,
    userAddedSets,
    additionalAdjustments,
  } = useSetValues({
    lift,
    readiness,
    exerciseDetails,
    blockType,
    shifter,
    programIndex,
  })

  const { navigateToExerciseSwap, navigateToIndividualExercise } =
    useExerciseNav({
      item: lift,
      index,
      navigation,
      currentDay,
      currentWeek,
      blockType,
      cycleID,
      exerciseDetails,
      screen: isPreview ? 'Preview Workout' : 'MainTrainingScreen',
    })

  const { isBridge, isAccessory, isDeload } = useProgramChecks({
    lift,
    blockType,
  })

  const theme = useTheme()

  const [cardHeight, setCardHeight] = useState(0)

  const [color, setColor] = useState(theme['color-primary-default'])

  const dispatch = useDispatch()

  const exerciseDBInfo = useMemo(
    () =>
      exerciseData.find(
        (item) => item.exerciseShortcode === exerciseDetails?.exerciseShortcode
      ),
    [exerciseDetails]
  )

  useEffect(() => {
    let canContinue = true
    let newColor
    if (canContinue) {
      switch (lift.status) {
        case 'active':
          newColor = theme['color-success-default']
        case 'pending':
          newColor = theme['color-primary-default']
        case 'completed':
          newColor = theme['color-primary-default']
        default:
          newColor = theme['color-primary-default']
      }
      setColor(newColor)
    }
    return () => {
      canContinue = false
    }
  }, [lift.status])

  useEffect(() => {
    let canContinue = true
    if (!isAccessory && setValues?.length > 0 && canContinue) {
      updateAdjustmentValue({
        movement: lift.movement,
        index,
        value: additionalAdjustments,
      })
    }
    return () => {
      canContinue = false
    }
  }, [lift?.performance, readiness, additionalAdjustments])

  const canAddSets =
    (lift.topSets?.length > 1 &&
      lift.topSets[0] + userAddedSets !== lift.topSets[1] &&
      lift.topSets[1] > Object.keys(lift?.performance || {}).length) ||
    (isBridge && setValues && setValues?.length <= setValues[0]?.setRange?.[1])

  // const StartTimer = React.useCallback(() => {
  //     if (isBridge && !isAccessory) {
  //         return
  //     }
  //     return null
  // }, [isBridge, isAccessory, lift])

  if (!exerciseDetails) {
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
        useNativeDriver>
        <SelectExerciseCard
          lift={lift}
          setCardHeight={(e) => setCardHeight(e)}
          swapExercise={navigateToExerciseSwap}
        />
      </Animatable.View>
    )
  }

  if (!setValues || setValues?.length === 0) {
    return null
  }

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
      useNativeDriver>
      <Layout
        level='3'
        style={styles.cardContainer}
        onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}>
        <Svg
          height='100%'
          width='25'
          style={[
            styles.sideLine,
            {
              height: cardHeight + 20,
            },
          ]}>
          <Line
            x1='10'
            y1='5'
            x2='10'
            y2={cardHeight - 10}
            strokeLinecap='round'
            stroke={color}
            strokeWidth='3'
          />
        </Svg>
        {lift.isRehab && (
          <Text category='h6' style={{ width: '100%' }} status='primary'>
            Rehab
          </Text>
        )}

        <View style={styles.mainCardContent}>
          <View style={{ flex: 1 }}>
            <Text category='h4' style={{ paddingRight: 10, flex: 1 }}>
              {exerciseDetails.exerciseName}
            </Text>
            {lift.exercise.type === 'T' && (
              <Text category='h6' style={{ width: '100%' }}>
                Technique Sets
              </Text>
            )}
            {lift.isRehab && lift.notes && (
              <Text category='p1' style={{ marginBottom: 5 }}>
                {lift.notes}
              </Text>
            )}
          </View>
          <View style={styles.iconContainer}>
            {/* {!lift.isRehab && (
                            <Pressable    onPress={() => dispatch({type: 'OPEN_NOTES_SHEET', exercise: {isAccessory, ...lift}, notesType: 'workout'})}>
                                <Icon style={[styles.mainIcons, { marginRight: 15 }]} fill={theme['text-hint-color']} name="edit-outline" />
                            </Pressable>

                        )} */}
            <Pressable onPress={navigateToIndividualExercise}>
              <Icon
                style={[styles.mainIcons, styles.leftIcon]}
                fill={theme['text-hint-color']}
                name='info-outline'
              />
            </Pressable>
            {!lift.isRehab && (
              <Pressable onPress={navigateToExerciseSwap}>
                <Icon
                  style={styles.mainIcons}
                  fill={theme['text-hint-color']}
                  name='swap-outline'
                />
              </Pressable>
            )}
          </View>
        </View>

        <SetsRow
          setValues={setValues}
          currentWeek={currentWeek}
          currentDay={currentDay}
          exerciseIndex={index}
          lift={lift}
          color={color}
          exerciseDetails={exerciseDetails}
          exerciseType={exerciseType}
          setUserAddedSets={setUserAddedSets}
          isPerSide={exerciseDBInfo?.isPerSide === 'checked'}
        />
        <View style={styles.cardButtonsContainer}>
          {canAddSets && <AddSetButton setUserAddedSets={setUserAddedSets} />}
          {isBridge && !isAccessory && (
            <StartTimerButton time={lift.restTime} theme={theme} />
          )}
        </View>

        {!lift.isRehab && (
          <UserNotes
            notes={lift?.userNotes}
            theme={theme}
            isAccessory={isAccessory}
            lift={lift}
            dispatch={dispatch}
            navigation={navigation}
          />
        )}
      </Layout>
    </Animatable.View>
  )
}

const styles = StyleSheet.create({
  iconContainer: { flexDirection: 'row', width: 'auto', marginTop: 4 },
  cardButtonsContainer: {
    flexDirection: 'row',
  },
  mainIcons: {
    width: 25,
    height: 25,
  },
  leftIcon: { marginRight: 20 },

  cardContainer: {
    marginTop: 15,
    borderRadius: 16,
    padding: 15,
    paddingLeft: 30,
    minHeight: 150,
    width: '95%',
    alignSelf: 'center',
    // shadowColor: "#000",
    // shadowOffset: {
    //     width: 0,
    //     height: 2,
    // },
    // shadowOpacity: 0.23,
    // shadowRadius: 2.62,

    // elevation: 4,
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
    alignItems: 'flex-start',
  },
  addSetIcon: { width: 25, height: 25 },
  addSetText: { marginLeft: 5 },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 'auto',
    height: 50,
    borderRadius: 50,
    paddingHorizontal: 15,
  },
})
