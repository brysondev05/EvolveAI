import Intercom from "@intercom/intercom-react-native"
import { useEffect, useState } from "react"
import { AppState } from "react-native"
import { useDispatch } from "react-redux"
import { getActiveIAPProducts } from "~/reduxStore/actions/subscriptionActions"
import { useTypedSelector } from "~/reduxStore/reducers"

export const useAppState = () => {
  const [appStatus, setAppStatus] = useState(AppState.currentState)
  const firebaseAuth = useTypedSelector(({ firebase }) => firebase.auth)

  const dispatch = useDispatch()
  const handleAppStateChange = async (nextAppState) => {
    if (
      ["inactive", "background"].includes(appStatus) &&
      nextAppState === "active" &&
      firebaseAuth.uid
    ) {
      Intercom.handlePushMessage()
      await dispatch(getActiveIAPProducts())
    }
    return setAppStatus(nextAppState)
  }
  /**
   * Handle PushNotification
   */

  useEffect(() => {
    const eventListener = AppState.addEventListener(
      "change",
      handleAppStateChange
    )

    return () => eventListener.remove()
  }, [])

  return {
    appStatus,
  }
}
