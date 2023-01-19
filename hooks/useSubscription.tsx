import { useState, useEffect, useCallback } from 'react'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import NetInfo from '@react-native-community/netinfo'
import { isEmpty } from 'react-redux-firebase'
import { useMMKVObject } from 'react-native-mmkv'
import { storage } from '~/storage'
import { useNavigation } from '@react-navigation/native'
import { syncUserSubscriptions } from '~/reduxStore/reducers/iapSubscription'
import { FREE_USER_ROLES, SUBSCRIPTION_ENABLED } from '~/constants/main'

//Subscription hooks is used to check weather login user made payment or not. If not user redirect to subscription page
const useSubscription = (shouldHandleRedirect = false) => {
  const subscription = useTypedSelector((state) => state.iapSubscription)
  // const [localSubscription] = useMMKVObject('subscription', storage)
  const [isConnected, setIsConnected] = useState(true)

  const userProgram = useTypedSelector(
    ({ firestore }) => firestore.data?.userProgram
  )
  const [hasSubscription, setHasSubscription] = useState(true)
  const userRole = useTypedSelector(
    ({ firebase: { profile } }) => profile?.role
  )
  const dispatch = useDispatch()

  const navigation = useNavigation()

  useEffect(() => {
    if (subscription.subscriptionsLoaded) {
      if (
        subscription.activeProducts?.length < 1 &&
        !FREE_USER_ROLES.includes(userRole) &&
        !isEmpty(userProgram) &&
        SUBSCRIPTION_ENABLED
      ) {
        setHasSubscription(false)
        if (shouldHandleRedirect) {
          navigation.navigate('Subscription')
        }
      } else {
        setHasSubscription(true)
      }
    }
  }, [subscription, /*localSubscription,*/ isConnected, userRole, userProgram])
  useEffect(() => {
    if (subscription.subscriptionsLoaded) {
      if (
        subscription.activeProducts?.length < 1 &&
        !FREE_USER_ROLES.includes(userRole)
      ) {
        dispatch(syncUserSubscriptions())
      }
    }
  }, [isConnected, userRole])

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected)
    })
    return () => {
      unsubscribe()
    }
  }, [])

  return {
    hasSubscription,
  }
}
export default useSubscription
