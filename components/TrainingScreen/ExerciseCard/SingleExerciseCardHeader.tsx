import { View, Pressable } from 'react-native'
import { useExerciseNav } from '~/hooks/workout/useExerciseNav'
import { Icon, Text } from '@ui-kitten/components'
import { useDispatch } from 'react-redux'
import { RM10Header } from './ComboSets/ComboExerciseHeader'
import Svg, { Line } from 'react-native-svg'
import SelectExerciseCard from './SelectExerciseCard'

const SingleExerciseCardHeader = ({
  exerciseDetails,
  setInfo,
  lift,
  comboSetIndex,
  cardHeight,
}) => {
  const {
    theme,
    styles,
    index,
    navigation,
    currentDay,
    currentWeek,
    cycleID,
    blockType,
    isPreview,
  } = setInfo

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

  const dispatch = useDispatch()

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

  return (
    <>
      {exerciseDetails ? (
        <>
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
              stroke={theme['color-primary-500']}
              strokeWidth='3'
            />
          </Svg>
          <View
            style={[
              styles.mainCardContent,
              { paddingLeft: 15, marginBottom: 15 },
            ]}>
            <View style={{ flex: 1 }}>
              <Text category='h4' style={{ paddingRight: 10, flex: 1 }}>
                {exerciseDetails?.exerciseName}
              </Text>
              {is10RMTest ? (
                <RM10Header
                  performanceStarted={lift?.performance?.[0]?.is10RMTest}
                  navigation={navigation}
                  exercise={exerciseDetails}
                  exerciseID={exerciseDetails.exerciseShortcode}
                />
              ) : (
                <Text>{`${lift.sets} sets`}</Text>
              )}
            </View>
            <View style={{ flexDirection: 'row', width: 'auto', marginTop: 4 }}>
              {/* <Pressable  onPress={() => dispatch({type: 'OPEN_NOTES_SHEET', exercise: {isAccessory: true, ...lift}, notesType: 'workout'})}>
                    <Icon style={[styles.mainIcons, { marginRight: 15 }]} fill={theme['text-hint-color']} name="edit-outline" />
                </Pressable> */}

              <Pressable onPress={() => navigateToIndividualExercise()}>
                <Icon
                  style={[styles.mainIcons, { marginRight: 15 }]}
                  fill={theme['text-hint-color']}
                  name='info-outline'
                />
              </Pressable>

              <Pressable onPress={navigateToExerciseSwap}>
                <Icon
                  style={styles.mainIcons}
                  fill={theme['text-hint-color']}
                  name='swap-outline'
                />
              </Pressable>
            </View>
          </View>
        </>
      ) : (
        <SelectExerciseCard
          lift={lift}
          setCardHeight={() => {}}
          swapExercise={navigateToExerciseSwap}
        />
      )}
    </>
  )
}

export default SingleExerciseCardHeader
