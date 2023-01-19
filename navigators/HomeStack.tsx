import { useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import { useTheme, Text } from '@ui-kitten/components'

import mainHeaderOptions from './MainHeader'
import { View } from 'react-native'

import HomeScreen from '~/screens/Dashboard/HomeScreen'
import ProgramReview from '~/screens/Dashboard/ProgramReview'
import { EndOfBlockScreen } from '~/screens/EndOfBlockScreen'
import MeetDayScreen from '~/screens/Training/MeetDay'
import MultiModificationsScreen from '~/screens/ProgramModifications/MultiModificationsScreen'
import { useTypedSelector } from '~/reduxStore/reducers'
import EndOfProgram from '~/screens/EndOfProgram'
import MeetDayReview from '~/screens/Training/MeetDayReview'
import MeetDayMax from '~/screens/Training/MeetDayMax'
import { BlurHeader } from '~/components/Navigation/BlurHeader'
import { DrawIconOpener } from '~/components/Navigation/DrawerIcon'
import MovementOverview from '~/screens/Dashboard/MovementOverview'
import BlockReviewScreen from '~/screens/BlockReviewScreen'
import { LogoPlaceholder } from '~/components/LogoPlaceholder'

const HomeStack = createStackNavigator()

const HeaderLogo = (theme) => {
  return (
    <View
      style={{
        paddingLeft: 14,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <LogoPlaceholder scaledFontSize={25} />
    </View>
  )
}

export const HomeStackScreens = ({ navigation, route }) => {
  const endOfWeekSheet = useTypedSelector((state) => state.endOfWeekSheet)
  useEffect(() => {
    if (endOfWeekSheet?.action === 'end_of_week_complete') {
      return navigation.navigate('Dashboard')
    }
    if (endOfWeekSheet?.action === 'end_of_block_complete') {
      return navigation.navigate('BlockReview', {
        currentBlock: endOfWeekSheet?.cycleID,
        isNewBlockScreen: false,
      })
    }
  }, [endOfWeekSheet])
  const theme = useTheme()
  return (
    <HomeStack.Navigator
      initialRouteName='Dashboard'
      screenOptions={{ headerBackTitleVisible: false, title: '' }}>
      <HomeStack.Screen
        name='Dashboard'
        component={HomeScreen}
        options={({ route }) => {
          return {
            title: '',

            headerLeftContainerStyle: {
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
            },
            headerTransparent: false,
            gestureEnabled: true,
            cardOverlayEnabled: true,
            headerBackground: () => <BlurHeader isBorder route={route} />,
            headerLeft: () => HeaderLogo(theme),
            // headerBackTitleVisible: withBack,
            headerRight: () => <DrawIconOpener navigation={navigation} />,
          }
        }}
      />
      <HomeStack.Screen
        name='ProgramReview'
        component={ProgramReview}
        options={{
          headerTitle: '',
          headerBackground: () => <BlurHeader />,
        }}
      />

      <HomeStack.Screen
        options={({ route }) => {
          return {
            headerBackground: () => <BlurHeader />,
          }
        }}
        name='Movement Overview'
        component={MovementOverview}
      />
      {/* <HomeStack.Screen
    name="Exercise History"
    component={ExerciseHistory}
    /> */}
      <HomeStack.Group>
        <HomeStack.Screen name='BlockReview' component={BlockReviewScreen} />
        <HomeStack.Screen
          name='End of block'
          component={EndOfBlockScreen}
          options={({ route }) => {
            return {
              headerBackground: () => <BlurHeader />,
            }
          }}
        />

        <HomeStack.Screen
          options={({ route }) => {
            return {
              headerBackground: () => <BlurHeader />,
            }
          }}
          name='Modify your program'
          component={MultiModificationsScreen}
        />
        <HomeStack.Screen
          options={({ route }) => {
            return {
              headerBackground: () => <BlurHeader />,
            }
          }}
          name='Meet Day'
          component={MeetDayScreen}
        />
        <HomeStack.Screen
          options={mainHeaderOptions({ navigation, theme })}
          name='Update Meet Max'
          component={MeetDayMax}
        />
        <HomeStack.Screen
          options={({ route }) => {
            return {
              headerBackground: () => <BlurHeader />,
            }
          }}
          name='Meet Day Review'
          component={MeetDayReview}
        />

        <HomeStack.Screen
          options={({ route }) => {
            return {
              headerBackground: () => <BlurHeader />,
            }
          }}
          name='End of program'
          component={EndOfProgram}
        />
      </HomeStack.Group>
    </HomeStack.Navigator>
  )
}

export default HomeStackScreens
