import {
  createStackNavigator,
  TransitionPresets,
} from '@react-navigation/stack'
import { useTheme, Text, Icon, Button } from '@ui-kitten/components'
import { useState, useEffect } from 'react'
import { useTypedSelector } from '~/reduxStore/reducers'
import ForgotPasswordScreen from '~/screens/Authentication/ForgotPasswordScreen'
import SignInScreen from '~/screens/Authentication/SignInScreen'
import SignUpScreen from '~/screens/Authentication/SignUpScreen'
import CreateExercise from '~/screens/ExerciseDatabase/CreateExercise'
import ExerciseHistory from '~/screens/ExerciseDatabase/ExerciseHistory'
import ExerciseIndex from '~/screens/ExerciseDatabase/ExerciseIndex'
import ExerciseSwap from '~/screens/ExerciseDatabase/ExerciseSwap'
import IndividualExercise from '~/screens/ExerciseDatabase/IndividualExercise'
import OnBoardingScreen from '~/screens/OnBoardingScreen'
import ProgramCreationScreen from '~/screens/ProgramCreation/ProgramCreationScreen'
import RecordMaxScreen from '~/screens/RecordMaxScreen'
import SubscriptionScreen from '~/screens/SubscriptionScreen'
import MainTraining from '~/screens/Training/MainTrainingScreen'
import DrawerNavigator from './Drawer'
import AutoTimerPicker from '~/screens/AutoTimerPicker'
import { PerformanceScreen } from '~/screens/PerformanceScreen'
import NotesScreen from '~/screens/NotesScreen'
import MeditateScreen from '~/screens/MeditateScreen'
import { ModalHeader } from '~/components/Navigation/ModalHeader'
import EndOfSessionScreen from '~/screens/Training/EndOfSessionScreen'
import BenchmarkScreen from '~/screens/BenchmarkScreen'
import { BlurHeader } from '~/components/Navigation/BlurHeader'

export const MainStack = createStackNavigator()
const closeIcon = (props) => <Icon {...props} name='close-outline' />

export const MainNav = () => {
  const theme = useTheme()
  const token = useTypedSelector(({ firebase }) => firebase.auth?.uid)
  const [holding, setHolding] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      setHolding(true)
    }, 100)
  }, [])

  return (
    <MainStack.Navigator initialRouteName={token ? 'Drawer' : 'OnBoarding'}>
      {token && (
        <>
          <MainStack.Group
            screenOptions={{
              headerShown: false,
              headerTitleStyle: {},
            }}>
            <MainStack.Screen name='Drawer'>
              {(props) => (
                <DrawerNavigator loaded={holding} {...props} theme={theme} />
              )}
            </MainStack.Screen>
          </MainStack.Group>

          <MainStack.Group screenOptions={{ presentation: 'modal' }}>
            <MainStack.Screen
              name='Auto Timer'
              component={AutoTimerPicker}
              options={({ navigation }) =>
                ModalHeader({ navigation, title: 'Auto Timer' })
              }
            />

            <MainStack.Screen
              name='Performance Screen'
              component={PerformanceScreen}
              options={({ navigation }) =>
                ModalHeader({ navigation, title: 'Performance' })
              }
            />
            <MainStack.Screen
              name='Notes Screen'
              component={NotesScreen}
              options={({ navigation }) =>
                ModalHeader({ navigation, title: 'Notes' })
              }
            />
            <MainStack.Screen
              name='Preview Workout'
              component={MainTraining}
              options={({ navigation }) =>
                ModalHeader({
                  navigation,
                  title: 'Preview',
                  headerTransparent: true,
                  blurHeader: true,
                })
              }
            />

            <MainStack.Screen
              name='Individual Exercise Modal'
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

            <MainStack.Screen
              name='Individual Exercise No Modal'
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
            <MainStack.Screen
              name='RecordMax'
              component={RecordMaxScreen}
              options={({ navigation }) =>
                ModalHeader({ navigation, title: '' })
              }
            />
            <MainStack.Screen
              name='Benchmark'
              component={BenchmarkScreen}
              options={({ navigation }) =>
                ModalHeader({ navigation, title: '' })
              }
            />
            <MainStack.Screen
              name='Exercise History'
              component={ExerciseHistory}
              options={({ navigation }) =>
                ModalHeader({ navigation, title: 'Exercise History' })
              }
            />
            <MainStack.Screen
              name='ExerciseSwap'
              component={ExerciseSwap}
              options={({ navigation }) =>
                ModalHeader({ navigation, title: 'Swap Exercise' })
              }
            />
            <MainStack.Screen
              name='All Exercises'
              component={ExerciseIndex}
              options={({ navigation }) =>
                ModalHeader({
                  navigation,
                  title: 'Exercise Database',
                  headerTransparent: true,
                })
              }
            />
            <MainStack.Screen
              name='End of Session'
              component={EndOfSessionScreen}
              options={({ navigation }) =>
                ModalHeader({
                  navigation,
                  title: 'End of Session',
                  headerTransparent: false,
                })
              }
            />
            <MainStack.Screen
              name='Create Exercise'
              component={CreateExercise}
              options={{
                headerBackground: () => <BlurHeader />,
                // headerTransparent: true,
                // headerTitle: '',
                // headerStatusBarHeight: 15,
                ...TransitionPresets.DefaultTransition,
              }}
              // options={mainHeaderOptions({ navigation, theme, withHeader: true })}
            />
            <MainStack.Screen
              name='Meditate Screen'
              component={MeditateScreen}
            />
          </MainStack.Group>
        </>
      )}
      <MainStack.Group screenOptions={{ headerShown: false }}>
        <MainStack.Screen
          name='OnBoarding'
          component={OnBoardingScreen}
          options={{
            title: 'OnBoarding',
            animationTypeForReplace: 'push',
          }}
        />

        <MainStack.Screen
          name='SignIn'
          component={SignInScreen}
          options={{
            title: 'Sign In',
          }}
        />
        <MainStack.Screen name='Reset' component={ForgotPasswordScreen} />
        <MainStack.Screen
          name='SignUp'
          component={SignUpScreen}
          options={{
            title: 'Sign Up',
          }}
        />
        <MainStack.Screen
          name='ProgramCreation'
          component={ProgramCreationScreen}
          options={{
            title: 'Create your program',
          }}
        />
        <MainStack.Screen
          name='Subscription'
          component={SubscriptionScreen}
          options={{
            headerTransparent: true,
            gestureEnabled: false,
            headerRight: null,
            headerLeftLabelVisible: false,
            headerLeft: null,
            headerBackTitleVisible: false,
            headerTitle: '',
            presentation: 'modal',
          }}
        />
      </MainStack.Group>
    </MainStack.Navigator>
  )
}
