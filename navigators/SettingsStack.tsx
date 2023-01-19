import { Icon, useTheme, Text } from '@ui-kitten/components'

import { createStackNavigator } from '@react-navigation/stack'
import ProgramSettings from '~/screens/Settings/ProgramSettings'
import AccountSettings from '~/screens/Settings/AccountSettings'
import ProfileSettings from '~/screens/Settings/ProfileSettings'
import MainSettingsScreen from '~/screens/Settings/MainSettingsScreen'
import mainHeaderOptions from './MainHeader'
import TrainingDaySettings from '~/screens/Settings/ProgramSettings/TrainingDaySettings'
import WeaknessSettings from '~/screens/Settings/ProgramSettings/WeaknessSettings'
import UnitSettings from '~/screens/Settings/ProgramSettings/UnitSettings'
import MeetDateSettings from '~/screens/Settings/ProgramSettings/MeetDateSettings'
import SubscriptionSettings from '~/screens/Settings/AccountSettings/SubscriptionSettings'
import PasswordSettings from '~/screens/Settings/AccountSettings/PasswordSettings'
import EmailSettings from '~/screens/Settings/AccountSettings/EmailSettings'
import { Pressable } from 'react-native'

const SettingsStack = createStackNavigator()

export const CustomBack = ({
  navigation,
  theme,
  onBack = false,
  backScreen = '',
  type = 'Back',
}) => (
  <Pressable
    onPress={() => {
      if (type === 'Done') {
        return navigation.navigate('Base')
      }
      if (onBack) {
        return navigation.pop()
      }
      if (backScreen === 'MainSettings') {
        return navigation.navigate('MainSettings')
      }
      return navigation.navigate(backScreen)
    }}
    style={{
      marginRight: 15,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    }}>
    {type === 'Back' && (
      <Icon
        style={{ width: 35, height: 35 }}
        fill={theme['color-primary-500']}
        name='arrow-ios-back-outline'
      />
    )}

    <Text
      category='p1'
      style={{ fontSize: 17, color: theme['color-primary-500'] }}>
      {type}
    </Text>
  </Pressable>
)

export const SettingsHomeOption = ({
  theme,
  navigation,
  onBack = false,
  backScreen = '',
  hasBack = true,
}) => {
  return {
    title: '',
    headerStyle: {
      backgroundColor: theme['background-basic-color-1'],
      borderWidth: 0,
      // shadowOffset: {
      //   height: 0,
      // },
    },
    headerTintColor: theme['text-hint-color'],
    headerTitleStyle: {
      fontSize: 30,
      left: 0,
      // textAlign: 'left',
      // fontWeight: 'bold',
    },

    // headerStyleInterpolator: HeaderStyleInterpolators.forNoAnimation,
    headerLeft: () =>
      hasBack && (
        <CustomBack
          navigation={navigation}
          theme={theme}
          onBack={onBack}
          backScreen={backScreen}
        />
      ),
    headerRight: () => (
      <CustomBack
        navigation={navigation}
        theme={theme}
        onBack={onBack}
        backScreen={backScreen}
        type='Done'
      />
    ),
  }
}

export const SettingsHeaderOption = ({
  theme,
  navigation,
  onBack = false,
  backScreen = '',
}) => {
  return {
    title: '',
    headerStyle: {
      backgroundColor: theme['background-basic-color-1'],
      borderWidth: 0,
      shadowOffset: {
        height: 0,
      },
    },
    headerTintColor: theme['text-hint-color'],
    headerTitleStyle: {
      fontSize: 30,
      left: 0,
      textAlign: 'left',
      fontWeight: 'bold',
    },
  }
}
export const SettingsStackScreens = ({ navigation }) => {
  const theme = useTheme()

  // const mainSettingsScreen = 'MainSettings', { screen: 'MainSettings' }
  return (
    <SettingsStack.Navigator initialRouteName='MainSettings'>
      <SettingsStack.Screen
        name='MainSettings'
        component={MainSettingsScreen}
        options={SettingsHomeOption({
          navigation,
          theme,
          backScreen: 'Base',
          onBack: false,
          hasBack: false,
        })}
      />
      <SettingsStack.Screen
        name='ProgramSettings'
        component={ProgramSettings}
        options={SettingsHomeOption({
          navigation,
          theme,
          backScreen: 'MainSettings',
          onBack: false,
        })}
      />
      <SettingsStack.Screen
        name='ProfileSettings'
        component={ProfileSettings}
        options={SettingsHomeOption({
          navigation,
          theme,
          backScreen: 'MainSettings',
          onBack: false,
        })}
      />
      <SettingsStack.Screen
        name='AccountSettings'
        component={AccountSettings}
        options={SettingsHomeOption({
          navigation,
          theme,
          backScreen: 'MainSettings',
          onBack: false,
        })}
      />
      <SettingsStack.Screen
        name='TrainingDays'
        component={TrainingDaySettings}
        options={SettingsHomeOption({
          navigation,
          theme,
          onBack: false,
          backScreen: 'ProgramSettings',
        })}
      />

      <SettingsStack.Screen
        name='Weaknesses'
        component={WeaknessSettings}
        options={SettingsHomeOption({ navigation, theme, onBack: true })}
      />
      <SettingsStack.Screen
        name='Units'
        component={UnitSettings}
        options={SettingsHomeOption({ navigation, theme, onBack: true })}
      />
      <SettingsStack.Screen
        name='MeetDate'
        component={MeetDateSettings}
        options={SettingsHomeOption({
          navigation,
          theme,
          onBack: false,
          backScreen: 'ProgramSettings',
        })}
      />
      <SettingsStack.Screen
        name='Subscription Settings'
        component={SubscriptionSettings}
        options={SettingsHomeOption({
          navigation,
          theme,
          onBack: false,
          backScreen: 'AccountSettings',
        })}
      />
      <SettingsStack.Screen
        name='Password'
        component={PasswordSettings}
        options={SettingsHomeOption({
          navigation,
          theme,
          onBack: false,
          backScreen: 'AccountSettings',
        })}
      />
      <SettingsStack.Screen
        name='Email'
        component={EmailSettings}
        options={SettingsHomeOption({
          navigation,
          theme,
          onBack: false,
          backScreen: 'AccountSettings',
        })}
      />
    </SettingsStack.Navigator>
  )
}
