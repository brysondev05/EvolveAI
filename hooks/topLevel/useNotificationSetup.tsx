import { useEffect } from 'react'
import { Notifier, NotifierComponents } from 'react-native-notifier'
import { Easing } from 'react-native-reanimated'
import { useDispatch } from 'react-redux'
import Notification from '~/components/Notification'
import { useTypedSelector } from '~/reduxStore/reducers'
import { dismissNotification } from '~/reduxStore/reducers/notifications'

export const useNotificationSetup = () => {
  const notifications = useTypedSelector((state) => state.notifications)
  const dispatch = useDispatch()
  useEffect(() => {
    if (notifications.showNotification) {
      if (notifications.alertType === 'Error') {
        Notifier.showNotification({
          title: notifications.title,
          description: notifications.description,
          duration: 5000,
          // showAnimationDuration: 200,
          Component: Notification,
          showEasing: Easing.bounce,
          onHidden: () => dispatch(dismissNotification()),
          componentProps: {
            alertType: notifications.alertType,
          },
        })
      } else {
        Notifier.showNotification({
          title: notifications.title,
          description: notifications.description,
          duration: 5000,
          showAnimationDuration: 200,
          Component: Notification,
          // Component: NotifierComponents.Alert,
          showEasing: Easing.ease,
          onHidden: () => dispatch(dismissNotification()),
        })
      }
    } else {
      Notifier.hideNotification()
    }
  }, [notifications])
}
