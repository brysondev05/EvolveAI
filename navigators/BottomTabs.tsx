import { memo, useState } from 'react'

import {
  Avatar,
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  Text
} from '@ui-kitten/components'

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import HomeStackScreens from './HomeStack'
import WorkoutStackScreens from './WorkoutStack'
import ExerciseStackScreens from './ExerciseStack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Platform ,Image} from 'react-native'
import ToolsStackScreens from './ToolsStack'
import ThemeColor from '~/constants/color'
import NutritionTabStack from './NutritionTabStack'

const Tab = createBottomTabNavigator()

const DashIcon = memo((props) => <Icon {...props} name='grid-outline' />)
const WorkoutIcon = memo((props) => <Icon {...props} name='flash-outline' />)

const ExercisesIcon = memo((props) => (
  <Icon {...props} name='archive-outline' />
))

const BottomTabBar = ({ navigation, state }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const insets = useSafeAreaInsets()
  const FeedIcon = memo((props) =>
  <Avatar
    size='small'
    shape='square'
    style={{ tintColor: selectedIndex == 0 ? ThemeColor.skyBlue : ThemeColor.white, height: 20, width: 20,marginTop:5 }}
    source={require('~/assets/icons/FeedTabIcon.png')}
  />
)
const WorkoutIcon = memo((props) =>
<Avatar
    size='small'
    shape='square'
    style={{ tintColor: selectedIndex == 1 ? ThemeColor.skyBlue : ThemeColor.white, height: 24, width: 15,marginTop:4 }}
    source={require('~/assets/icons/WorkoutTabIcon.png')}
  />
  )
  const Dash1Icon = memo((props) =>
    <Avatar
      size='small'
      shape='square'
      style={{ tintColor: selectedIndex == 2 ? ThemeColor.skyBlue : ThemeColor.white, height: 24, width: 24 }}
      source={require('~/assets/icons/DashboardIcon.png')}
    />
  )
  const NutritionIcon = memo((props) =>
    <Avatar
      size='small'
      shape='square'
      style={{ tintColor: selectedIndex == 3 ? ThemeColor.skyBlue : ThemeColor.white, height: 24, width: 24 }}
      source={require('~/assets/icons/NutritionTabIcon.png')}
    />
  )
  const ProfileIcon = memo((props) =>
    <Avatar
      size='small'
      shape='square'
      style={{ tintColor: selectedIndex == 4 ? ThemeColor.skyBlue : ThemeColor.white, height: 24, width: 24 }}
      source={require('~/assets/icons/ProfileTabIcon.png')}
    />
  )
  return (
    <BottomNavigation
      selectedIndex={state.index}
      style={{
        paddingBottom:
          Platform.OS === 'ios' ? insets.bottom : insets.bottom + 5,
        paddingTop: 5,
        borderTopColor: ThemeColor.borderColor,
        borderTopWidth: 1,
      }}
      indicatorStyle={{
        height: 0,
      }}
      onSelect={(index) => {
        setSelectedIndex(index)
        navigation.navigate(state.routeNames[index])
      }}>
        <BottomNavigationTab
        title={evaProps =>
          <Text {...evaProps}
            style={{ fontSize: 12, color: selectedIndex == 0 ? ThemeColor.skyBlue : ThemeColor.gray5 ,marginTop:5}}>{
              'Feed'}
          </Text>
        }
        icon={FeedIcon} />
      <BottomNavigationTab
        title={evaProps =>
          <Text {...evaProps}
            style={{ fontSize: 12, color: selectedIndex == 1 ? ThemeColor.skyBlue : ThemeColor.gray5 ,marginTop:2,}}>{
              'Workout'}
          </Text>
        }
        icon={WorkoutIcon} />
      <BottomNavigationTab
        title={evaProps =>
          <Text {...evaProps}
            style={{ fontSize: 12, color: selectedIndex == 2 ? ThemeColor.skyBlue : ThemeColor.gray5,marginTop:5, }}>{
              'Dashboard'}
          </Text>
        }
        icon={Dash1Icon}
      />
      <BottomNavigationTab
        title={evaProps =>
          <Text {...evaProps}
            style={{ fontSize: 12, color: selectedIndex == 3 ? ThemeColor.skyBlue : ThemeColor.gray5 ,marginTop:5}}>{
              'Nutrition'}
          </Text>
        }
        icon={NutritionIcon} />
      <BottomNavigationTab
        title={evaProps =>
          <Text {...evaProps}
            style={{ fontSize: 12, color: selectedIndex == 4 ? ThemeColor.skyBlue : ThemeColor.gray5,marginTop:5 }}>{
              'Profile'}
          </Text>
        } icon={ProfileIcon} />
    </BottomNavigation>
  )
}

export const TabNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        headerTitleStyle: {},
      }}
      tabBar={(props) => <BottomTabBar {...props} />}>
      <Tab.Screen name="FeedTabScreen" component={WorkoutStackScreens}/>
      <Tab.Screen name="MainWorkout" component={WorkoutStackScreens}/>
      <Tab.Screen name='HomeScreen' component={HomeStackScreens} />
      <Tab.Screen name='NutritionTabStack' component={NutritionTabStack} />
      <Tab.Screen name='ExerciseIndex' component={ExerciseStackScreens} />
    </Tab.Navigator>
  )
}

export default TabNavigation
