import { createStackNavigator } from '@react-navigation/stack'

import { useTheme } from '@ui-kitten/components'

import IndividualExercise from '~/screens/ExerciseDatabase/IndividualExercise'
import ExerciseIndex from '~/screens/ExerciseDatabase/ExerciseIndex'

import { ModalHeader } from '~/components/Navigation/ModalHeader'

const ExerciseStack = createStackNavigator()

export const ExerciseStackScreens = ({ navigation }) => {
  const theme = useTheme()
  return (
    <ExerciseStack.Navigator
      screenOptions={{ headerMode: 'screen' }}
      initialRouteName='Exercise Database'>
      <ExerciseStack.Screen
        name='Exercise Database'
        component={ExerciseIndex}
        options={({ navigation }) =>
          ModalHeader({
            navigation,
            title: 'Exercise Database',
            headerTransparent: false,
            blurHeader: false,
          })
        }
      />
      <ExerciseStack.Screen
        name='IndividualExercise'
        component={IndividualExercise}
        options={({ navigation }) =>
          ModalHeader({
            navigation,
            title: '',
            headerTransparent: true,
            blurHeader: true,
          })
        }
      />
      {/* <ExerciseStack.Screen
        name='RecordMax'
        component={RecordMaxScreen}
        options={mainHeaderOptions({ navigation, theme })}
      />
      <ExerciseStack.Screen name='Create Exercise' component={CreateExercise} />
      <ExerciseStack.Screen
        name='Exercise History'
        component={ExerciseHistory}
        options={mainHeaderOptions({ navigation, theme })}
      /> */}
    </ExerciseStack.Navigator>
  )
}

export default ExerciseStackScreens
