import { StyleSheet, View, Pressable } from 'react-native'
import {
  Select,
  SelectItem,
  Text,
  Button,
  Icon,
  useTheme,
} from '@ui-kitten/components'
import * as Animatable from 'react-native-animatable'
import { LinearGradient } from 'expo-linear-gradient'
import { resumeWorkout } from '~/reduxStore/actions/programActions'
import {
  cancelActiveWorkout,
  setTrainingDayActive,
} from '~/reduxStore/actions/trainingDayActions'
import ReadinessButton from './ReadinessButton'

const renderOption = (title: string) => <SelectItem title={title} key={title} />

const CompleteIcon = (props) => (
  <Icon {...props} name='checkmark-circle-outline' />
)

export default function MainWorkoutHeader({
  readinessScores,
  activeWeek,
  activeDay,
  handleReadinessChange,
  showReadinessModal,
  theme,
  isPreview,
  programIndex,
}) {
  const gradientColors = [
    theme['background-basic-color-1'],
    theme['background-basic-color-3'],
  ]
  // const { squat: squatReadiness, bench: benchReadiness, deadlift: deadliftReadiness, upperPull: upperPullReadiness } = readinessScores

  const [
    squatReadiness,
    benchReadiness,
    deadliftReadiness,
    upperPullReadiness,
  ] = readinessScores
  const readinessRatings = [
    '1 - Low Readiness',
    '2 - Below Average',
    '3 - Average',
    '4 - Above Average',
    '5 - High Readiness',
  ]
  // const squatValue = readinessRatings[squatReadiness.row][0];
  // const benchValue = readinessRatings[benchReadiness.row][0];

  // const deadliftValue = readinessRatings[deadliftReadiness.row][0];

  const powerliftingReadiness = [
    ['Squat', squatReadiness],
    ['Bench', benchReadiness],
    ['Deadlift', deadliftReadiness],
  ]

  const powerbuildingReadiness = [
    ['Squat', squatReadiness],
    ['Bench', benchReadiness],
    ['Deadlift', deadliftReadiness],
    ['Upper Pull', upperPullReadiness],
  ]

  const programReadiness =
    programIndex === 0 ? powerliftingReadiness : powerbuildingReadiness

  return (
    <View style={{ paddingTop: isPreview ? 30 : 100 }}>
      <LinearGradient
        colors={gradientColors}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          opacity: 1,
        }}
      />
      <View style={{ padding: 15 }}>
        <Pressable onPress={() => showReadinessModal(true)}>
          <Text category='h4' style={{ marginBottom: 10 }}>
            Daily Readiness Ratings{' '}
            <Icon
              style={{ width: 20, height: 20 }}
              fill={theme['text-hint-color']}
              name='info-outline'
            />
          </Text>
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          {programReadiness.map(([type, value]) => (
            <ReadinessButton
              key={type}
              type={type}
              theme={theme}
              onPress={() => {
                handleReadinessChange(type)
              }}
              value={value}
            />
          ))}
          {/* <Select
              style={styles.select}
              placeholder='Default'
              value={squatValue}
              selectedIndex={squatReadiness}
              onSelect={index => handleReadinessChange('squat', index)}>
              {readinessRatings.map(renderOption)}
            </Select> */}
        </View>
      </View>
    </View>
  )
}

export const MainWorkoutFooter = ({
  dispatch,
  status,
  adjustmentValues,
  readinessScores,
  cancelNotification,
  isPreview,
  navigation,
}) => {
  if (isPreview && !__DEV__) {
    return null
  }
  if (status !== 'complete') {
    return (
      <Animatable.View
        animation='fadeIn'
        duration={500}
        delay={1000}
        style={styles.completeWorkoutButton}>
        {status === 'active' ? (
          <>
            <Button
              status='secondary'
              size='large'
              onPress={() => {
                // navigation.navigate('Meditate Screen')
                cancelNotification()
                navigation.navigate('End of Session', {
                  adjustmentValues,
                  readinessScores,
                })
              }}
              appearance='outline'>
              Finish Workout{' '}
            </Button>
            <Button
              status='basic'
              size='large'
              onPress={() => {
                cancelNotification()
                dispatch(cancelActiveWorkout())
              }}
              style={{ marginTop: 15 }}
              appearance='outline'>
              Cancel Workout
            </Button>
          </>
        ) : (
          <Button
            status='secondary'
            size='large'
            onPress={() => {
              dispatch(setTrainingDayActive())
            }}
            appearance='outline'>
            Start Workout{' '}
          </Button>
        )}
      </Animatable.View>
    )
  }

  return (
    <Animatable.View
      animation='fadeIn'
      duration={500}
      delay={1000}
      style={styles.completeWorkoutButton}>
      <Button
        style={{ marginBottom: 15 }}
        status='success'
        size='large'
        onPress={() => {
          // dispatch({
          //   type: 'TOGGLE_FINISH_WORKOUT_SHEET',

          // })
          navigation.navigate('End of Session', {
            adjustmentValues,
            readinessScores,
          })
        }}
        accessoryRight={CompleteIcon}>
        Workout Complete{' '}
      </Button>
      <Button
        status='basic'
        size='large'
        onPress={() => dispatch(resumeWorkout())}
        appearance='outline'>
        Resume Workout{' '}
      </Button>
    </Animatable.View>
  )
}

const styles = StyleSheet.create({
  select: {
    flex: 1,
    margin: 2,
  },
  completeWorkoutButton: {
    paddingHorizontal: 15,
    paddingTop: 5,
    marginTop: 15,
    paddingBottom: 30,
  },
})
