import React, { useCallback, useEffect, useState } from 'react'

import { Layout } from '@ui-kitten/components'
import { useDispatch } from 'react-redux'
import { handleLogout } from '~/reduxStore/actions/authActions'

import { useTypedSelector } from '~/reduxStore/reducers'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { LoadingSplash } from '~/components/LoadingSplash'
import { Sheets } from '~/components/Sheets'
import { useUserInit } from '~/hooks/topLevel/useUserInit'
import { useSubscriptionSetup } from '~/hooks/topLevel/useSubscriptionSetup'
import { useAppState } from '~/hooks/topLevel/useAppState'
import { useNotificationSetup } from '~/hooks/topLevel/useNotificationSetup'
import { MainNav } from '~/navigators/MainNav'
import { useWorkoutSetup } from '~/hooks/topLevel/useWorkoutSetup'
import { useRestTimer } from '~/hooks/topLevel/useRestTimer'
import * as SplashScreen from 'expo-splash-screen'

export const AppContent = ({ fontsLoaded }) => {
  const dispatch = useDispatch()
  const globalUI = useTypedSelector((state) => state.globalUI)
  const isLoading = useTypedSelector((state) => state.auth.isLoading)

  const [isReallyReady, setIsReallyReady] = useState(false)
  const { iapLoaded } = useSubscriptionSetup()
  useNotificationSetup()

  useAppState()
  useUserInit({ iapLoaded })
  useWorkoutSetup()
  useRestTimer()

  // const authAction = useTypedSelector((state) => state.auth.action)

  // useEffect(() => {
  //   const forceSignout = async () => {
  //     dispatch(handleLogout())
  //     dispatch({ type: 'HANDLE_LOGOUT_COMPLETE' })
  //   }
  //   if (authAction === 'forceSignout') {
  //     forceSignout()
  //   }
  // }, [authAction])

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      setIsReallyReady(true)
      setTimeout(async () => {
        await SplashScreen.hideAsync()
      }, 100)
    }
  }, [fontsLoaded, isLoading])

  return (
    <SafeAreaProvider>
      <Layout style={{ flex: 1 }}>
        {true && <MainNav />}
        <Sheets />

        {globalUI.showLoading && (
          <LoadingSplash title={globalUI.loadingTitle} />
        )}
      </Layout>
    </SafeAreaProvider>
  )
}
