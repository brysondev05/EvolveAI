import { useMemo, useState } from 'react'
import { StyleSheet } from 'react-native'
import { Layout, Text, useTheme, Divider } from '@ui-kitten/components'
import { View } from 'react-native'

import * as Animatable from 'react-native-animatable'
import useExercises from '~/hooks/programInfo/useExercises'
import { useDispatch } from 'react-redux'
import ComboExerciseHeader from './ComboSets/ComboExerciseHeader'
import ComboSetRows from './ComboSets/ComboSetRows'
import SingleExerciseCardHeader from './SingleExerciseCardHeader'
import ComboSetNotes from './ComboSets/ComboSetNotes'
import { exerciseData } from '~/assets/data/exerciseData'

const LOADING_ANIMATION_DURATION = 500
const LOADING_ANIMATION_STYLE = 'fadeIn'

const LOADING_ANIMATION_DELAY = 500

const alphaBet = {
  0: {
    letter: 'A',
    color: 'color-primary-500',
  },
  1: {
    letter: 'B',
    color: 'color-primary-300',
  },
  2: {
    letter: 'C',
    color: 'color-primary-100',
  },
}
const ComboSetCard = ({
  lifts,
  navigation,
  index,
  currentWeek,
  currentDay,
  blockType,
  cycleID,
  isPreview,
  liftLength,
  dayStatus,
  programIndex = 0,
}) => {
  const theme = useTheme()
  const { exercises } = useExercises()

  const dispatch = useDispatch()

  const setInfo = {
    currentWeek,
    currentDay,
    blockType,
    cycleID,
    isPreview,
    navigation,
    theme,
    styles,
  }

  const setValues = []
  const RM10Intensities = [[4], [3], [0, 1]]

  lifts.forEach((lift, liftIndex) => {
    let reps = [0]
    let type = 'accessory'
    let percentage = blockType?.[0] === 'H' ? [0.7] : [0.8]
    let rpe = [2, 3]

    let intensityAdj = 0
    const { sets, intensity } = lift

    const exerciseDetails = exercises?.[lift.exercise?.exerciseShortcode]

    const { color, letter } = alphaBet[liftIndex] || {
      letter: '',
      color: 'color-primary-500',
    }

    const rm10Bands = exerciseDetails?.rm10?.bands || {}
    const isBandsOnly =
      exerciseDetails &&
      !exerciseDetails?.rm10?.amount &&
      Object.values(rm10Bands).filter((item) => item).length > 0

    const isBodyweightOnly = exerciseDetails?.rm10?.usingBodyweight
    const is10RMTest =
      (exerciseDetails &&
        !exerciseDetails?.rm10?.amount &&
        !isBodyweightOnly &&
        !isBandsOnly) ||
      lift?.performance?.[0]?.is10RMTest

    const weightIncrement =
      exerciseDetails && exerciseDetails.weightIncrement
        ? exerciseDetails?.weightIncrement
        : exerciseDetails?.units?.toLowerCase() === 'lb'
        ? 5
        : 2.5

    const exerciseDBInfo = exerciseData.find(
      (item) => item.exerciseShortcode === exerciseDetails?.exerciseShortcode
    )

    if (is10RMTest) {
      for (let i = 0; i < 3; i++) {
        const actPerformance =
          typeof lift.performance !== 'undefined' &&
          typeof lift?.performance[i + 1] !== 'undefined'
            ? lift?.performance[i + 1]
            : performance
        const setVal = {
          liftLetter: letter,
          color,
          lift,
          set: i + 1,
          status: 'pending',
          performance: actPerformance,
          type,
          reps: [10],
          percentage,
          rpe: RM10Intensities[i],
          hasDrop: lift.dropset,
          intensity: RM10Intensities[i],
          intensityAdj,
          is10RMTest: true,
          weightIncrement,
          isLastSet: i === 2,
          isPerSide: exerciseDBInfo?.isPerSide === 'checked',
          isBodyweight: exerciseDBInfo?.isBodyweight === 'checked',
        }
        if (typeof setValues[i] === 'undefined') {
          setValues[i] = [setVal]
        } else {
          setValues[i].push(setVal)
        }
      }
    } else {
      for (let i = 0; i < sets; i++) {
        const actPerformance =
          typeof lift.performance !== 'undefined' &&
          typeof lift?.performance[i + 1] !== 'undefined'
            ? lift?.performance[i + 1]
            : performance

        const setVal = {
          liftLetter: letter,
          color,
          lift,
          set: i + 1,
          status: 'pending',
          performance: actPerformance,
          type,
          reps,
          percentage,
          rpe,
          hasDrop: lift.dropset,
          intensity,
          intensityAdj,
          is10RMTest: false,
          weightIncrement,
          isLastSet: i === sets - 1,
          isBandsOnly,
          isBodyweightOnly: exerciseDetails?.rm10?.usingBodyweight,
          isPerSide: exerciseDBInfo?.isPerSide === 'checked',
          isBodyweight: exerciseDBInfo?.isBodyweight === 'checked',
        }
        if (typeof setValues[i] === 'undefined') {
          setValues[i] = [setVal]
        } else {
          setValues[i].push(setVal)
        }
      }
    }
  })

  const primaryColor = theme['color-primary-default']

  const allExercisesSelected = useMemo(
    () => lifts?.filter((lift) => lift?.exercise?.exerciseShortcode),
    [lifts]
  )

  const [cardHeight, setCardHeight] = useState(null)

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
        {lifts.length > 1 ? (
          <View style={{ paddingLeft: 0, marginBottom: 15 }}>
            <Text category='h5' style={{ marginLeft: 5, marginBottom: 15 }}>
              Combo Set
            </Text>
            {lifts?.map((lift, index) => (
              <ComboExerciseHeader
                key={index}
                exerciseDetails={exercises?.[lift?.exercise?.exerciseShortcode]}
                lift={lift}
                setInfo={setInfo}
                comboSetIndex={index}
              />
            ))}
          </View>
        ) : (
          <SingleExerciseCardHeader
            key={index}
            exerciseDetails={exercises?.[lifts[0]?.exercise?.exerciseShortcode]}
            lift={lifts[0]}
            setInfo={setInfo}
            comboSetIndex={index}
            cardHeight={cardHeight}
          />
        )}

        {allExercisesSelected?.length > 0 &&
          setValues.map((sets, setsIndex) => {
            return (
              <ComboSetRows
                isComboSet={lifts.length > 1}
                key={setsIndex}
                styles={styles}
                setsIndex={setsIndex}
                sets={sets}
                primaryColor={primaryColor}
                currentDay={currentDay}
                currentWeek={currentWeek}
                dispatch={dispatch}
                theme={theme}
                exercises={exercises}
                dayStatus={dayStatus}
              />
            )
          })}
        {allExercisesSelected?.length > 0 && (
          <>
            {lifts.length > 1 && (
              <Divider
                style={{
                  marginBottom: 15,
                  backgroundColor: theme['text-hint-color'],
                  opacity: 0.5,
                }}
              />
            )}
            {lifts.map((lift, index, arr) => (
              <ComboSetNotes
                lift={lift}
                key={index}
                index={index}
                length={arr.length}
                theme={theme}
                dispatch={dispatch}
                navigation={navigation}
              />
            ))}
          </>
        )}
      </Layout>
    </Animatable.View>
  )
}

export default ComboSetCard

const styles = StyleSheet.create({
  mainIcons: {
    width: 25,
    height: 25,
  },
  cardContainer: {
    marginTop: 30,
    borderRadius: 16,
    padding: 15,
    minHeight: 100,
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
    alignItems: 'flex-start',
  },
})
