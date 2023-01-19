import { StyleSheet, View, Platform, UIManager } from 'react-native'
import { useTheme, Text, Icon } from '@ui-kitten/components'

import { createStackNavigator } from '@react-navigation/stack'
import TrainingOverview from '~/screens/Training/TrainingOverview'
import MainTraining from '~/screens/Training/MainTrainingScreen'

import ReadinessScreen from '~/screens/Readiness/ReadinessScreen'
import { useTypedSelector } from '~/reduxStore/reducers'

import { BlurView } from 'expo-blur'
import { useBlockType } from '~/hooks/programInfo/useBlockType'
import { capitalizeFullString } from '~/helpers/Strings'
import { useWorkoutInfo } from '~/hooks/programInfo/useWorkoutInfo'
import { WorkoutFlowBackButton } from '~/components/Navigation/Buttons/WorkoutFlowBackButton'
import { TimerButton } from '~/components/Navigation/Buttons/TimerButton'
import { SkipReadinessButton } from '~/components/Navigation/Buttons/SkipReadinessButton'
import { SkipWarmupButton } from '~/components/Navigation/Buttons/SkipWarmupButton'
import WarmUpScreen from '~/screens/Training/WarmUpScreen'
const WorkoutStack = createStackNavigator()
// const WorkoutStack = createNativeStackNavigator();
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }
}

const WorkoutScreenHeader = ({
  navigation,
  route,
  theme,
  dayInfo,
  title,
  blockName,
  blockColor,
  headerTitleVisible = true,
  blockType,
}) => {
  return {
    title,
    headerTitle: () =>
      headerTitleVisible &&
      dayInfo && (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: blockColor }}>{blockName}</Text>
          <Text style={{ textAlign: 'center' }}>
            {blockType === 'FinalPhase'
              ? 'Final Phase'
              : `Week ${dayInfo?.week}`}
            {dayInfo?.day
              ? `, Day ${dayInfo?.day}`
              : `\n${capitalizeFullString(dayInfo?.dayName)}`}
          </Text>
        </View>
      ),
    headerStyle: {
      backgroundColor: theme['background-basic-color-1'],

      height: 100,
      // shadowOffset: {
      //   height: 0,
      // },
    },

    headerTransparent: true,
    // gestureEnabled: true,
    cardOverlayEnabled: true,
    headerBackground: () => (
      <BlurView tint='dark' intensity={100} style={StyleSheet.absoluteFill} />
    ),
    headerLeft: () => (
      <WorkoutFlowBackButton
        theme={theme}
        routeName={route.name}
        navigation={navigation}
      />
    ),
    headerRight: () => <TimerButton theme={theme} />,
  }
}

export const WorkoutStackScreens = ({ navigation, route }) => {
  const { activeWorkout } = useWorkoutInfo()
  const theme = useTheme()
  const dayInfo = useTypedSelector(({ firestore: { data } }) => data.dayInfo)
  const blockType = useTypedSelector(
    ({ firestore: { data } }) =>
      dayInfo &&
      data.programWeeks &&
      data.programWeeks?.[`week${dayInfo.week}`]?.blockType
  )

  const { blockName, blockColor } = useBlockType({ blockType }) || {
    blockName: '',
    blockColor: 'blue',
  }

  return (
    <WorkoutStack.Navigator
      initialRouteName={
        activeWorkout ? 'MainTrainingScreen' : 'TrainingOverview'
      }
      screenOptions={{
        headerTitleStyle: {},
      }}>
      <WorkoutStack.Screen
        name='TrainingOverview'
        component={TrainingOverview}
        options={{ headerShown: false, headerTitle: 'Overview' }}
      />
      <WorkoutStack.Screen
        name='WarmUp'
        component={WarmUpScreen}
        options={({ route }) =>
          WorkoutScreenHeader({
            navigation,
            theme,
            route,
            dayInfo,
            title: 'Warmup',
            blockName,
            blockColor,
            blockType,
          })
        }
      />
      <WorkoutStack.Screen
        name='Readiness'
        component={ReadinessScreen}
        options={({ route }) =>
          WorkoutScreenHeader({
            navigation,
            theme,
            route,
            dayInfo,
            title: 'Readiness',
            blockName,
            blockColor,
            blockType,
          })
        }
      />
      <WorkoutStack.Screen
        name='MainTrainingScreen'
        component={MainTraining}
        options={({ route }) =>
          WorkoutScreenHeader({
            navigation,
            theme,
            route,
            dayInfo,
            title: 'Workout',
            blockName,
            blockColor,
            blockType,
          })
        }
      />
      {/* <WorkoutStack.Screen
        name='IndividualExercise'
        component={IndividualExercise}
        options={exerciseHeaderOptions({ navigation, theme })}
      />
      <WorkoutStack.Screen name='RecordMax' component={RecordMaxScreen} />
      <WorkoutStack.Screen name='ExerciseSwap' component={ExerciseSwap} />
      <WorkoutStack.Screen name='All Exercises' component={ExerciseIndex} />

      <WorkoutStack.Screen name='Create Exercise' component={CreateExercise} />
      <WorkoutStack.Screen
        name='Exercise History'
        component={ExerciseHistory}
      /> */}
    </WorkoutStack.Navigator>
  )
}

export default WorkoutStackScreens
