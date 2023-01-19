import { useCallback, useMemo } from 'react'
import * as React from 'react'
import { Linking, StyleSheet, Platform, Alert } from 'react-native'
import { createDrawerNavigator } from '@react-navigation/drawer'

import { Text, Drawer, DrawerItem, Divider } from '@ui-kitten/components'

import { useDispatch } from 'react-redux'
import TabNavigation from './BottomTabs'
import { useTypedSelector } from '~/reduxStore/reducers'
import { View } from 'react-native'
import * as Updates from 'expo-updates'
import { ModifyMeetDate } from '~/screens/ProgramModifications/ModifyMeetDate'

import { SettingsHomeOption } from './SettingsStack'

import CopyProgram from '~/screens/CopyProgram'

import Constants from 'expo-constants'
import Config from 'react-native-config'
import { handleLogout } from '~/reduxStore/actions/authActions'
import { regenerateProgram } from '~/reduxStore/actions'
import { useIsMounted } from '~/hooks/utilities/useIsMounted'

import Intercom from '@intercom/intercom-react-native'
import {
  AdminJuggIcon,
  BugIcon,
  InfoIcon,
  JuggIcon,
  LogoutIcon,
  ReviewIcon,
  SettingsIcon,
  ChatIcon,
} from '~/components/Icons'
import AccountSettings from '~/screens/Settings/AccountSettings'
import EmailSettings from '~/screens/Settings/AccountSettings/EmailSettings'
import PasswordSettings from '~/screens/Settings/AccountSettings/PasswordSettings'
import SubscriptionSettings from '~/screens/Settings/AccountSettings/SubscriptionSettings'
import MainSettingsScreen from '~/screens/Settings/MainSettingsScreen'
import ProfileSettings from '~/screens/Settings/ProfileSettings'
import ProgramSettings from '~/screens/Settings/ProgramSettings'
import MeetDateSettings from '~/screens/Settings/ProgramSettings/MeetDateSettings'
import TrainingDaySettings from '~/screens/Settings/ProgramSettings/TrainingDaySettings'
import UnitSettings from '~/screens/Settings/ProgramSettings/UnitSettings'
import WeaknessSettings from '~/screens/Settings/ProgramSettings/WeaknessSettings'
import {
  showErrorNotification,
  showSuccessNotification,
} from '~/reduxStore/reducers/notifications'
import ThemeColor from '~/constants/color'

const DrawerStack = createDrawerNavigator()

const DrawerContent = ({ navigation }) => {
  const userName = useTypedSelector(
    ({ firebase: { profile } }) => profile?.name
  )
  const userRole = useTypedSelector(
    ({ firebase: { profile } }) => profile?.role
  )
  const userEmail = useTypedSelector(({ firebase: { auth } }) => auth?.email)
  const dispatch = useDispatch()

  const isMounted = useIsMounted()

  const handleUpdateApp = React.useCallback(async () => {
    try {
      dispatch(
        showSuccessNotification({
          title: 'Updating',
          description: 'Updating app...',
        })
      )
      await Updates.fetchUpdateAsync()
      await Updates.reloadAsync()
    } catch (e) {
      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: e.message,
        })
      )
    }
  }, [])

  const DrawerContents = useMemo(
    () => [
      //Disabling FQA section for now as suggested by Rhea on 03-Nov-22
      // {
      //   title: 'FAQ',
      //   icon: InfoIcon,
      //   action: () => {},
      // },
      {
        title: 'Report a bug',
        icon: ChatIcon,
        action: () => Intercom.displayMessageComposer(),
      },

      {
        title: 'Settings',
        icon: SettingsIcon,
        action: () => navigation.navigate('MainSettings'),
      },
      {
        title: 'Log Out',
        icon: LogoutIcon,
        action: async () => {
          return dispatch(handleLogout(navigation))
        },
      },
      {
        title: 'Update App',
        icon: JuggIcon,
        action: () => handleUpdateApp(),
        adminOnly: true,
      },
      {
        title: 'Copy Program',
        icon: AdminJuggIcon,
        action: () => {
          if (!userEmail?.includes('+cs')) {
            Alert.alert(
              'You sure about that?',
              `This is not a customer service based email account. Please confirm you want to really want to duplicate a program`,
              [
                {
                  text: 'Confirm',
                  style: 'destructive',
                  onPress: () => navigation.navigate('CopyProgram'),
                },
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
              ]
            )
          } else {
            return navigation.navigate('CopyProgram')
          }
        },
        adminOnly: true,
      },
      {
        title: 'Regenerate Program',
        icon: AdminJuggIcon,
        action: () => {
          if ((userRole && userRole === 'admin') || __DEV__) {
            if (!userEmail?.includes('+cs')) {
              Alert.alert(
                'You sure about that?',
                `This is not a customer service based email account. Please confirm you want to regenerate your current program`,
                [
                  {
                    text: 'Confirm',
                    style: 'destructive',
                    onPress: () => dispatch(regenerateProgram()),
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                ]
              )
            } else {
              return dispatch(regenerateProgram())
            }
          }
        },
        adminOnly: true,
      },
    ],
    []
  )
  const handleDrawSelect = useCallback(async (index) => {
    DrawerContents[index.row].action()
  }, [])

  return (
    <View style={styles.sideBarContainer}>
      <Text category='h6' style={styles.userName}>
        {userName}
      </Text>
      <Drawer
        style={styles.drawerContainer}
        selectedIndex={null}
        onSelect={handleDrawSelect}>
        {DrawerContents.map((item, index) => {
          if (item.adminOnly && userRole !== 'admin' && !__DEV__) {
            return null
          }
          return (
            <DrawerItem
              key={index}
              style={styles.drawerItem}
              title={item.title}
              accessoryLeft={item.icon}
            />
          )
        })}
      </Drawer>
      <View style={styles.drawerFooter}>
        <Divider style={styles.drawerDivider} />
        <Text appearance='hint' style={styles.footerCopy}>
          V{Constants.nativeAppVersion} (53)
        </Text>
        {userRole && userRole === 'admin' && (
          <Text appearance='hint' style={styles.footerCopy}>
            {' '}
            {Config.RELEASE_CHANNEL} {Config.ENVIRONMENT} 27521
          </Text>
        )}
        <Text appearance='hint' style={styles.copyrite}></Text>
      </View>
    </View>
  )
}

export const DrawerNavigator = ({ loaded, theme }) => (
  <DrawerStack.Navigator
    screenOptions={{
      drawerStyle: { width: '80%', display: loaded ? 'flex' : 'none' },
      headerShown: false,
      headerTitleStyle: {},
    }}
    drawerContent={(props) => <DrawerContent {...props} />}>
    <DrawerStack.Screen name='Base' component={TabNavigation} />

    {/* <DrawerStack.Screen name='Home' component={HomeScreen} /> */}
    {/* <DrawerStack.Screen name='New Program' component={ProgramCreationScreen} /> */}
    <DrawerStack.Screen name='Modify Meet Date' component={ModifyMeetDate} />
    {/* <DrawerStack.Screen name='SettingsStack' component={SettingsStackScreens} /> */}
    <DrawerStack.Group screenOptions={{ headerShown: true }}>
      <DrawerStack.Screen
        name='MainSettings'
        component={MainSettingsScreen}
        options={({ navigation }) =>
          SettingsHomeOption({
            navigation,
            theme,
            backScreen: 'Base',
            onBack: false,
            hasBack: false,
          })
        }
      />
      <DrawerStack.Screen
        name='ProgramSettings'
        component={ProgramSettings}
        options={({ navigation }) =>
          SettingsHomeOption({
            navigation,
            theme,
            backScreen: 'MainSettings',
            onBack: false,
          })
        }
      />
      <DrawerStack.Screen
        name='ProfileSettings'
        component={ProfileSettings}
        options={({ navigation }) =>
          SettingsHomeOption({
            navigation,
            theme,
            backScreen: 'MainSettings',
            onBack: false,
          })
        }
      />
      <DrawerStack.Screen
        name='AccountSettings'
        component={AccountSettings}
        options={({ navigation }) =>
          SettingsHomeOption({
            navigation,
            theme,
            backScreen: 'MainSettings',
            onBack: false,
          })
        }
      />
      <DrawerStack.Screen
        name='TrainingDays'
        component={TrainingDaySettings}
        options={({ navigation }) =>
          SettingsHomeOption({
            navigation,
            theme,
            onBack: false,
            backScreen: 'ProgramSettings',
          })
        }
      />

      <DrawerStack.Screen
        name='Weaknesses'
        component={WeaknessSettings}
        options={({ navigation }) =>
          SettingsHomeOption({ navigation, theme, onBack: true })
        }
      />
      <DrawerStack.Screen
        name='Units'
        component={UnitSettings}
        options={({ navigation }) =>
          SettingsHomeOption({ navigation, theme, onBack: true })
        }
      />
      <DrawerStack.Screen
        name='MeetDate'
        component={MeetDateSettings}
        options={({ navigation }) =>
          SettingsHomeOption({
            navigation,
            theme,
            onBack: false,
            backScreen: 'ProgramSettings',
          })
        }
      />
      <DrawerStack.Screen
        name='Subscription Settings'
        component={SubscriptionSettings}
        options={({ navigation }) =>
          SettingsHomeOption({
            navigation,
            theme,
            onBack: false,
            backScreen: 'AccountSettings',
          })
        }
      />
      <DrawerStack.Screen
        name='Password'
        component={PasswordSettings}
        options={({ navigation }) =>
          SettingsHomeOption({
            navigation,
            theme,
            onBack: false,
            backScreen: 'AccountSettings',
          })
        }
      />
      <DrawerStack.Screen
        name='Email'
        component={EmailSettings}
        options={({ navigation }) =>
          SettingsHomeOption({
            navigation,
            theme,
            onBack: false,
            backScreen: 'AccountSettings',
          })
        }
      />
    </DrawerStack.Group>
    <DrawerStack.Screen name='CopyProgram' component={CopyProgram} />
  </DrawerStack.Navigator>
)

export default DrawerNavigator

const styles = StyleSheet.create({
  sideBarContainer: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: ThemeColor.primary,
  },
  userName: { paddingLeft: 15 },
  drawerContainer: { paddingTop: 20, backgroundColor: 'transparent' },
  drawerItem: { backgroundColor: 'transparent' },
  drawerFooter: { marginBottom: 40 },
  drawerDivider: { marginVertical: 20 },
  footerCopy: { paddingLeft: 20 },
  copyrite: { paddingHorizontal: 20, fontSize: 12, marginTop: 5 },
})
