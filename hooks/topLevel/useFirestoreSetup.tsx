import { useEffect } from 'react'
import firebase from '@react-native-firebase/app'
import firestore from '@react-native-firebase/firestore'
import { createFirestoreInstance } from 'redux-firestore'
import Config from 'react-native-config'

import { customLog } from '~/helpers/CustomLog'
import { Settings } from 'react-native-fbsdk-next'
import { Store } from '~/reduxStore/store'

export const useFirestoreSetup = () => {
  useEffect(() => {
    async function applyFirestoreSettings() {
      Settings.initializeSDK()

      if (Config.USE_FIREBASE_FUNCTIONS_EMULATOR === 'true') {
        firebase.functions().useEmulator('localhost', 5001)
      }

      const db = firestore()

      if (!__DEV__) {
        db.settings({ ignoreUndefinedProperties: true })
      }
    }

    applyFirestoreSettings().catch((e) => {
      customLog(e, 'firestore settings')
      return
    })
  }, [])

  const rrfConfig = {
    userProfile: 'users',
    useFirestoreForProfile: true,
    oneListenerPerPath: true,
  }

  return {
    rrfProps: {
      firebase,
      config: rrfConfig,
      dispatch: Store.dispatch,
      createFirestoreInstance,
    },
  }
}
