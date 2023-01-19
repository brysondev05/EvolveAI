// import React from 'react'

// import { createStackNavigator } from '@react-navigation/stack'

// import { AuthStackParamList } from '~/types/navigation'
// import OnBoardingScreen from '~/screens/OnBoardingScreen'
// import SignUpScreen from '~/screens/Authentication/SignUpScreen'
// import SignInScreen from '~/screens/Authentication/SignInScreen'
// import ForgotPasswordScreen from '~/screens/Authentication/ForgotPasswordScreen'

// import ProgramCreationScreen from '~/screens/ProgramCreation/ProgramCreationScreen'

// const AuthStack = createStackNavigator<AuthStackParamList>()

// export const AuthStackScreens = ({ isSignout }) => {
//   return (
//     <AuthStack.Navigator initialRouteName='OnBoarding'>
//       <AuthStack.Screen
//         name='OnBoarding'
//         component={OnBoardingScreen}
//         options={{
//           title: 'OnBoarding',
//           animationTypeForReplace: isSignout ? 'pop' : 'push',
//           headerShown: false,
//         }}
//       />
//       <AuthStack.Screen
//         name='SignIn'
//         component={SignInScreen}
//         options={{
//           title: 'Sign In',
//           headerShown: false,
//         }}
//       />
//       <AuthStack.Screen
//         name='Reset'
//         component={ForgotPasswordScreen}
//         options={{ headerShown: false }}
//       />
//       <AuthStack.Screen
//         name='SignUp'
//         component={SignUpScreen}
//         options={{
//           title: 'Sign Up',
//           headerShown: false,
//         }}
//       />
//       <AuthStack.Screen
//         name='ProgramCreation'
//         component={ProgramCreationScreen}
//         options={{
//           title: 'Create your program',
//           headerShown: false,
//         }}
//       />
//     </AuthStack.Navigator>
//   )
// }

// export default AuthStackScreens
