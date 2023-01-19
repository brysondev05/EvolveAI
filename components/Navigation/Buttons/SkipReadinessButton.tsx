import { useActionSheet } from '@expo/react-native-action-sheet'
import { useDispatch } from 'react-redux'
import useActiveWorkout from '~/hooks/programInfo/useActiveWorkout'
import { setTrainingDayActive } from '~/reduxStore/actions/trainingDayActions'
import { useTypedSelector } from '~/reduxStore/reducers'
import { Icon, Text } from '@ui-kitten/components'
import { Pressable } from 'react-native'
import useNotifications from '~/hooks/useNotification'

export const SkipReadinessButton = ({ navigation, theme, route }) => {
  const dispatch = useDispatch()
  const { showActionSheetWithOptions } = useActionSheet()
  const activeDay = useTypedSelector(({ firestore: { data } }) => data.dayInfo)

  const { setupNotification } = useNotifications()

  const { checkActiveWorkouts } = useActiveWorkout()

  const handleSkip = () => {
    if (activeDay.status !== 'active') {
      showActionSheetWithOptions(
        {
          options: ['Start Workout', 'Preview Workout', 'Cancel'],
          cancelButtonIndex: 2,
          title: 'Skipping Readiness',
          message:
            "To get the most out of using, we do not recommend skipping your readiness questionnaire unless you simply wish to preview this day's training.",
          destructiveButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) {
            try {
              await checkActiveWorkouts()
              dispatch(setTrainingDayActive())

              setupNotification({
                id: 'startWorkout',
                title: 'Workout still active',
                body: "Don't forget to come back and rate your workout!",
                seconds: 14400,
              })
              return navigation.navigate('MainTrainingScreen')
            } catch {
              return false
            }
          }
          if (buttonIndex === 1) {
            return navigation.navigate('MainTrainingScreen')
          }
        }
      )
    } else {
      return navigation.navigate('MainTrainingScreen')
    }
  }

  return (
    <Pressable
      onPress={handleSkip}
      style={{
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
      }}>
      <Text
        category='p1'
        style={{ fontSize: 17, color: theme['color-danger-500'] }}>
        Skip
      </Text>
      <Icon
        style={{ width: 35, height: 35 }}
        fill={theme['color-danger-500']}
        name='arrow-ios-forward-outline'
      />
    </Pressable>
  )
}
