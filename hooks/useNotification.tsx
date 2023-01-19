import notifee, { TriggerType, TimestampTrigger } from '@notifee/react-native'
import { useAssets } from 'expo-asset'
import { useCallback } from 'react'

import { useAsyncStorage } from './utilities/useStorage'

const useNotifications = () => {
  // const handlePermissionCheck = async () => {
  //   const settings = await Notifications.getPermissionsAsync()
  //   return (
  //     settings.granted ||
  //     settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  //   )
  // }

  const [optimizationCheck, setOptimizationCheck] = useAsyncStorage(
    '@optimizationChecked',
    false
  )

  const setupNotification = useCallback(
    async ({
      id = '',
      title = '',
      body = '',
      seconds = 10000,
      isCritical = false,
    }) => {
      const now = new Date()

      now.setSeconds(now.getSeconds() + seconds)
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: now.getTime(),
      }

      const channelId = await notifee.createChannel({
        id,
        name: id,
      })

      await notifee.requestPermission({
        criticalAlert: isCritical,
      })
      await notifee.createTriggerNotification(
        {
          title,
          body,
          id,

          android: {
            channelId,
            showTimestamp: true,
            // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
          },
          ios: {
            critical: isCritical,
            foregroundPresentationOptions: {
              badge: false,
              sound: false,
            },
          },
        },
        trigger
      )

      // 1. checks if battery optimization is enabled
      // const batteryOptimizationEnabled =
      //   await notifee.isBatteryOptimizationEnabled()
      // if (batteryOptimizationEnabled && !optimizationCheck) {
      //   // 2. ask your users to disable the feature
      //   Alert.alert(
      //     'Restrictions Detected',
      //     'To ensure notifications are delivered and the timer can run, please disable battery optimization for the app.',
      //     [
      //       // 3. launch intent to navigate the user to the appropriate screen
      //       {
      //         text: 'OK, open settings',
      //         onPress: async () =>
      //           await notifee.openBatteryOptimizationSettings(),
      //       },
      //       {
      //         text: 'Cancel',
      //         onPress: () => console.log('Cancel Pressed'),
      //         style: 'cancel',
      //       },
      //     ],
      //     { cancelable: false }
      //   )
      //   setOptimizationCheck(true)
      // }
    },
    []
  )

  const cancelNotification = async (id = null) => {
    notifee.cancelTriggerNotification(id)
  }
  return {
    setupNotification,
    cancelNotification,
  }
}

export default useNotifications
