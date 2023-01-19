import 'expo-asset'
import '@react-native-firebase/app'
import { useCallback, useEffect, useRef } from 'react'

import * as Sentry from 'sentry-expo'
import { Provider } from 'react-redux'
import { persistor, Store } from './reduxStore/store'
import { PersistGate } from 'redux-persist/integration/react'

import { NotifierWrapper } from 'react-native-notifier'

import * as eva from '@eva-design/eva'
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components'
import { default as mapping } from './mapping.json'

import { ThemeContext } from './context/theme-context'

import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { StatusBar } from 'expo-status-bar'
import { ReactReduxFirebaseProvider } from 'react-redux-firebase'
import { enableScreens } from 'react-native-screens'
enableScreens()

import { ActionSheetProvider } from '@expo/react-native-action-sheet'

import Config from 'react-native-config'
import { useTheming } from './hooks/topLevel/useTheming'
import { useFirestoreSetup } from './hooks/topLevel/useFirestoreSetup'
import analytics from '@react-native-firebase/analytics'

import { AppContent } from './screens/AppContent'
import { Alert } from 'react-native'

import * as Updates from 'expo-updates'
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler'
import { NavigationContainer } from '@react-navigation/native'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { appTheme } from './theme'

Sentry.init({
  dsn: 'https://66f0e883d7ef4a058c2e6c2b0f20f8c8@o1288613.ingest.sentry.io/4504161633959936',
  normalizeDepth: 20,
  enableInExpoDevelopment: false,
  enableOutOfMemoryTracking: false,
  debug: false, // Sentry will try to print out useful debugging information if something goes wrong with sending an event. Set this to `false` in production.
})

const errorHandler = (e, isFatal) => {
  Sentry.Native.captureException(e)

  if (isFatal) {
    Alert.alert(
      'Unexpected error occurred',
      `Let's restart your app and try again. If this error persists please contact DATA_HERE`,
      [
        {
          text: 'Restart',
          onPress: async () => {
            await Updates.fetchUpdateAsync()
            await Updates.reloadAsync()
          },
        },
      ]
    )
  } else {
    //   console.log(e);
  }
}

setJSExceptionHandler(errorHandler)
setNativeExceptionHandler((e) => {
  Sentry.Native.captureException(e)
})
const getActiveRouteName = (state: any): string => {
  if (state && typeof state.routes !== 'undefined') {
    const route = state.routes[state.index]

    if (route.state) {
      // Dive into nested navigators
      return getActiveRouteName(route.state)
    }

    return route.name
  }
  return 'onBoarding'
}

export const App = () => {
  const { theme, toggleTheme, fontsLoaded, navigationTheme } = useTheming()
  const { rrfProps } = useFirestoreSetup()
  const routeNameRef = useRef<string>()
  const navigationRef = useRef<any>()

  useEffect(() => {
    const splashHold = async () => {
      await SplashScreen.preventAutoHideAsync()
    }
    splashHold()
  }, [])

  const handleNavStateChange = useCallback(async (state) => {
    const previousRouteName = routeNameRef.current
    const currentRouteName = getActiveRouteName(state)
    if (previousRouteName !== currentRouteName) {
      await analytics().logScreenView({
        screen_name: currentRouteName,
        screen_class: currentRouteName,
      })
    }
    // Save the current route name for later comparision
    routeNameRef.current = currentRouteName
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={Store}>
        <PersistGate loading={null} persistor={persistor}>
          <ReactReduxFirebaseProvider {...rrfProps}>
            <ThemeContext.Provider value={{ theme, toggleTheme }}>
              <ApplicationProvider
                {...eva}
                customMapping={mapping}
                theme={{ ...eva[theme], ...appTheme }}>
                <ActionSheetProvider>
                  <NotifierWrapper>
                    <StatusBar style='light' />

                    <IconRegistry icons={EvaIconsPack} />
                    <NavigationContainer
                      ref={navigationRef}
                      theme={navigationTheme}
                      onStateChange={handleNavStateChange}>
                      <AppContent fontsLoaded={fontsLoaded} />
                    </NavigationContainer>
                  </NotifierWrapper>
                </ActionSheetProvider>
              </ApplicationProvider>
            </ThemeContext.Provider>
          </ReactReduxFirebaseProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  )
}
export default Sentry.Native.wrap(App)
