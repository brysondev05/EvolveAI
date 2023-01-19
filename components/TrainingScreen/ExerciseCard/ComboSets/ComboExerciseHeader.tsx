import { View, Pressable } from 'react-native'
import { Layout, Text, Icon, useTheme, Button } from '@ui-kitten/components'
import { useExerciseNav } from '~/hooks/workout/useExerciseNav'
import { exerciseNiceNames } from '../ExerciseCardData'
import { exerciseData } from '~/assets/data/exerciseData'

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
    1: {
      letter: 'C',
      color: 'color-primary-100',
    },
  },
}

export const RM10Header = ({
  navigation,
  exercise,
  exerciseID,
  performanceStarted,
}) => (
  <>
    <Text category='s1'>
      3 sets - 10 Rep Max Test {!performanceStarted && 'or'}
    </Text>
    {!performanceStarted && (
      <Pressable
        onPress={() =>
          navigation.navigate('RecordMax', {
            exerciseID,
            initialUnits: exercise?.units,
            type: '10RM',
            previousMax: '',
          })
        }>
        <Text category='s1' status='primary'>
          Enter 10RM
        </Text>
      </Pressable>
    )}
  </>
)
const ComboExerciseHeader = ({
  exerciseDetails,
  setInfo,
  lift,
  comboSetIndex,
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

  const { letter, color } = alphaBet[comboSetIndex] || {
    letter: 'A',
    color: 'color-primary-500',
  }

  const hasExercise = exerciseDetails

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
    <View style={[styles.mainCardContent, { marginBottom: 15 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Pressable
          style={{
            alignSelf: 'flex-start',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme['background-basic-color-1'],
            width: 45,
            height: 45,
            borderRadius: 45,
          }}>
          <Text category='s1' style={{ color: theme[color], fontSize: 17 }}>
            {letter}
          </Text>
        </Pressable>
        {hasExercise ? (
          <>
            <View style={{ paddingHorizontal: 10, flex: 1 }}>
              <Text category='h5'>{exerciseDetails?.exerciseName}</Text>
              {is10RMTest ? (
                <RM10Header
                  performanceStarted={lift?.performance?.[0]?.is10RMTest}
                  navigation={navigation}
                  exercise={exerciseDetails}
                  exerciseID={exerciseDetails.exerciseShortcode}
                />
              ) : (
                <Text category='s1'>{`${lift.sets} sets`}</Text>
              )}
            </View>
            <Pressable onPress={() => navigateToIndividualExercise()}>
              <Icon
                style={[styles.mainIcons, { marginRight: 25 }]}
                fill={theme['text-hint-color']}
                name='info-outline'
              />
            </Pressable>
            <Pressable
              style={{ justifyContent: 'center', alignContent: 'center' }}
              onPress={navigateToExerciseSwap}>
              <Icon
                style={[styles.mainIcons]}
                fill={theme['text-hint-color']}
                name='swap-outline'
              />
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={navigateToExerciseSwap}
            style={{
              paddingLeft: 10,
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{ marginRight: 15 }} category='h6' appearance='hint'>
              Select {exerciseNiceNames[lift.exercise?.category]} Exercise
            </Text>
            <Icon
              style={styles.mainIcons}
              fill={theme['text-hint-color']}
              name='options-2-outline'
            />
          </Pressable>
        )}
      </View>
    </View>
  )
}

export default ComboExerciseHeader
