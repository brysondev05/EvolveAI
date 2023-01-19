// import React from 'react'
// import { StyleSheet } from 'react-native'
// import { Icon, useTheme } from '@ui-kitten/components'
// import { BlurView } from 'expo-blur'
// import { View, Platform } from 'react-native'
// import { Text } from '@ui-kitten/components'
// import { useTypedSelector } from '~/reduxStore/reducers'
// import CreateExercise from '~/screens/ExerciseDatabase/CreateExercise'
// import ExerciseHistory from '~/screens/ExerciseDatabase/ExerciseHistory'
// import ExerciseIndex from '~/screens/ExerciseDatabase/ExerciseIndex'
// import ExerciseSwap from '~/screens/ExerciseDatabase/ExerciseSwap'
// import IndividualExercise from '~/screens/ExerciseDatabase/IndividualExercise'
// import RecordMaxScreen from '~/screens/RecordMaxScreen'
// import MainTraining from '~/screens/Training/MainTrainingScreen'
// import mainHeaderOptions, { exerciseHeaderOptions } from './MainHeader'

// const ModalStack = createStackNavigator()

// const SwapExerciseHeader = ({ navigation }) => {
//   const exerciseDetails = useTypedSelector(
//     (state) => state.exerciseSwap.exerciseDetails
//   )
//   return {
//     headerShown: true,
//     title: 'erere',
//     headerTitle: () => (
//       <View
//         style={{
//           alignItems: 'center',
//           justifyContent: 'center',
//           paddingRight: Platform.OS === 'android' ? 50 : 0,
//         }}>
//         <Text>Swap</Text>
//         <Text style={{ flex: 1 }}>{exerciseDetails?.exerciseName}</Text>
//       </View>
//     ),
//     headerLeft: () => (
//       <Icon
//         name='arrow-ios-back-outline'
//         size={30}
//         color='#ffffff'
//         fill='white'
//         style={{ paddingLeft: 20 }}
//         onPress={() => {
//           navigation.goBack()
//         }}
//       />
//     ),
//     headerStyle: {
//       height: 50,
//     },
//     headerStatusBarHeight: 0,
//     safeAreaInsets: { top: 0 },
//     headerBackTitle: 'Back',
//     headerTransparent: true,
//     gestureEnabled: true,
//     cardOverlayEnabled: true,
//     headerBackground: () => (
//       <BlurView tint='dark' intensity={100} style={StyleSheet.absoluteFill} />
//     ),
//   }
// }

// const ExerciseModals = () => {
//   const theme = useTheme()
//   return (
//     <ModalStack.Navigator initialRouteName='MainWorkoutStack'></ModalStack.Navigator>
//   )
// }

// export default ExerciseModals
