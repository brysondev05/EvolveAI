import { useEffect, useState } from 'react'
import Iaphub from 'react-native-iaphub'
import Config from 'react-native-config'
import { handleError } from '~/helpers/errorReporting'
export const useSubscriptionSetup = () => {
  const [iapLoaded, setIAPLoaded] = useState(false)

  useEffect(() => {
    const startUp = async () => {
      try {
        await Iaphub.start({
          appId: '62aa2e8ae45de915106c8d24',
          apiKey: 'uNxOmnfDHoeVq1kkBdsuFnPnnocHA5Z',
          environment: 'production',
        })
        return
      } catch (e) {
        handleError(e)
      } finally {
        setIAPLoaded(true)
      }
    }
    startUp()
  }, [])

  return {
    iapLoaded,
  }
}
