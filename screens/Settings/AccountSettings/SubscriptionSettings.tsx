// import { View, Alert, StyleSheet } from 'react-native'
// import { Button, Layout, Text } from '@ui-kitten/components'
// import GradientHeader from '~/components/presentational/GradientHeader'
// import Iaphub from 'react-native-iaphub'
// import auth from '@react-native-firebase/auth'
// const SubscriptionSettings = () => {
//   return (
//     <Layout style={{ flex: 1, paddingBottom: 30 }}>
//       <GradientHeader title='Subscription' />

//       <Layout style={{ padding: 15 }}>
//         <Text category='h4' style={{ marginBottom: 15 }}>
//           DATA_HERE
//         </Text>
//       </Layout>
//     </Layout>
//   )
// }

// export default SubscriptionSettings

// const buttonGroupStyles = StyleSheet.create({
//   previewWorkoutButton: { width: '49%' },
//   skipWorkoutButton: { width: '45%' },
//   buttonGroupContainer: { paddingHorizontal: 15, marginTop: 5 },
//   startTrainingButton: { width: '100%', marginBottom: 15 },
//   buttonGroupWrapper: {
//     justifyContent: 'space-between',
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginVertical: 20,
//   },
//   flexButton: { flex: 1 },
//   unSkipWorkoutWrapper: {
//     justifyContent: 'space-between',
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginVertical: 20,
//   },
// })

import { Button, Layout, Text, useTheme, Icon } from '@ui-kitten/components'
import { useEffect, useCallback, useState } from 'react'
import {
  Alert,
  BackHandler,
  Linking,
  Pressable,
  ScrollView,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  restoreIAP,
  buyIAPProduct,
  getIAPProducts,
} from '~/reduxStore/reducers/iapSubscription'
import { useTypedSelector } from '~/reduxStore/reducers'
import { View } from 'react-native-animatable'
import { LoadingSplash } from '~/components/LoadingSplash'
import CycleStructureChart from '~/components/CycleStructureChart'
import { handleLogout } from '~/reduxStore/actions/authActions'
import { useFocusEffect } from '@react-navigation/native'
import { useNetInfo } from '@react-native-community/netinfo'
import { handleError } from '~/errorReporting'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '~/reduxStore/store'
import { FREE_USER_ROLES, SUBSCRIPTION_ENABLED } from '~/constants/main'
import { LogoPlaceholder } from '~/components/LogoPlaceholder'
import Iaphub from 'react-native-iaphub'
import GradientHeader from '~/components/presentational/GradientHeader'
const bulletItem = (item, index) => (
  <View
    key={index}
    style={{
      flexDirection: 'row',
      marginBottom: 5,
      paddingRight: 15,
      alignItems: 'center',
    }}>
    <View
      style={{
        width: 26,
        height: 26,
        borderRadius: 13,
        borderColor: 'green',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginTop: 4,
      }}>
      <Icon
        style={{ width: 20, height: 20, marginHorizontal: 10 }}
        fill={'green'}
        name='checkmark-outline'
      />
    </View>
    <Text style={{ color: '#686868', marginRight: 24 }}>{item}</Text>
  </View>
)
const whatYouGet = [
  'AI Learned personalized workouts that adapt in real time',
  'Personalized guidance with your journey',
  '200+ exercises to help you meet your fitness goals',
]

const SubscriptionSettings = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>()
  const [subscribedUser, setSubscribedUser] = useState(false)
  const subscription = useTypedSelector((state) => state.iapSubscription)
  const insets = useSafeAreaInsets()

  const theme = useTheme()
  const netInfo = useNetInfo()
  const userRole = useTypedSelector(
    ({ firebase: { profile } }) => profile?.role
  )
  const [showLoading, setShowLoading] = useState(false)

  // useLayoutEffect(() => {
  //   navigation.addListener('beforeRemove', (e) => {
  //     e.preventDefault()
  //   })
  // }, [])

  useEffect(() => {
    getActiveProducts()
  }, [])

  async function getActiveProducts() {
    await dispatch(getIAPProducts())
  }

  useEffect(() => {
    if (
      (subscription?.subscriptionsLoaded &&
        subscription?.activeProducts?.length > 0) ||
      FREE_USER_ROLES.includes(userRole) ||
      !SUBSCRIPTION_ENABLED
    ) {
      setSubscribedUser(true)
    } else {
      setSubscribedUser(false)
    }
  }, [subscription, userRole])

  const logUserOut = async () => {
    dispatch(handleLogout(navigation))
  }

  let productForSale = []
  if (subscription?.IAPProducts) {
    let data = JSON.parse(JSON.stringify(subscription))
    productForSale = data?.IAPProducts?.sort((a, b) => b?.price - a?.price)
  }

  useFocusEffect(
    useCallback(() => {
      const eventListener = BackHandler.addEventListener(
        'hardwareBackPress',
        () => true
      )

      return () => eventListener.remove()
    }, [])
  )

  const handleRestore = async () => {
    if (!netInfo.isConnected) {
      return Alert.alert(
        'Check Connection',
        'It appears you are not connected to the internet. Please connect and try again.'
      )
    }
    try {
      setShowLoading(true)
      await dispatch(restoreIAP()).unwrap()
    } catch (rejected) {
      handleError(rejected)
    } finally {
      setShowLoading(false)
    }
  }
  const handlePurchase = async (data) => {
    if (!netInfo.isConnected) {
      return Alert.alert(
        'Check Connection',
        'It appears you are not connected to the internet. Please connect and try again.'
      )
    }
    try {
      setShowLoading(true)
      await dispatch(buyIAPProduct(data)).unwrap()
    } catch (rejected) {
      handleError(rejected)
    } finally {
      setShowLoading(false)
    }
  }
  return (
    <View style={{ flex: 1 }}>
      <GradientHeader title='Subscription' />
      {!subscribedUser ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          // bounces={false}
          showsVerticalScrollIndicator={false}>
          <Layout
            style={{
              flex: 1,
              paddingTop: 30 + insets.top,
              justifyContent: 'space-between',
            }}>
            {/* <Layout style={{ marginLeft: 15 }}>
            <Pressable onPress={logUserOut} style={{ alignSelf: 'flex-start' }}>
              <Text appearance='hint' category='s1'>
                Log out
              </Text>
            </Pressable>
          </Layout> */}
            <View
              style={{
                paddingTop: 20,
                paddingHorizontal: 10,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <LogoPlaceholder scaledFontSize={48} />
            </View>

            <View
              style={{
                justifyContent: 'center',
                paddingBottom: 30,
                flexDirection: 'row',
                width: '100%',
              }}>
              <CycleStructureChart showFull />
            </View>

            <Layout
              level='3'
              style={{
                paddingVertical: 30,
                paddingHorizontal: 25,
                minHeight: 200,
                alignContent: 'center',
                justifyContent: 'center',
                borderRadius: 20,
                width: '100%',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                shadowOpacity: 0.53,
                shadowRadius: 0.62,

                elevation: 4,
              }}>
              <Text category='h2' style={{ textAlign: 'center' }}>
                Subscribe Now
              </Text>
              <View
                style={{
                  backgroundColor: 'white',
                  marginTop: 16,
                  marginBottom: 8,
                  padding: 8,
                  borderRadius: 8,
                }}>
                {whatYouGet.map(bulletItem)}
              </View>

              {productForSale.map((info) => {
                return (
                  <View
                    style={{
                      backgroundColor: 'white',
                      marginVertical: 10,
                      borderRadius: 8,
                    }}>
                    <View style={{ marginVertical: 10 }}>
                      <Text
                        style={{
                          textAlign: 'center',
                          marginBottom: 8,
                          color: '#272727',
                          fontSize: 20,
                        }}
                        category='s1'>
                        {info.localizedTitle}
                      </Text>
                      {/* <Text
                      style={{
                        textAlign: 'center',
                        marginBottom: 20,
                        color: '#272727',
                      }}
                      category='s2'>
                      {info.description}
                    </Text> */}
                    </View>

                    <View style={{ paddingTop: 10 }}>
                      <Button
                        disabled={subscription.subscriptionStatus === 'loading'}
                        status='secondary'
                        style={{}}
                        size='giant'
                        onPress={() => {
                          handlePurchase(info)
                        }}>
                        {info.localizedPrice} {info.currency}
                      </Button>
                    </View>
                  </View>
                )
              })}
              {/* <View style={{ marginVertical: 10 }}> */}
              {/* <Text
                style={{ textAlign: 'center', marginBottom: 20 }}
                category='s1'>
                DATA_HERE
              </Text> */}

              {/* {whatYouGet.map(bulletItem)}
            </View> */}

              <View style={{ paddingTop: 10 }}>
                {/* <Button
                disabled={subscription.subscriptionStatus === 'loading'}
                status='secondary'
                style={{ marginBottom: 10 }}
                size='giant'
                onPress={handlePurchase}>
                {productForSale?.[0] && `${productForSale?.[0]?.price}/month`}
              </Button> */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Button
                    size='small'
                    status='primary'
                    appearance='ghost'
                    onPress={handleRestore}>
                    Restore purchases
                  </Button>
                  <Button
                    size='small'
                    status='primary'
                    appearance='ghost'
                    onPress={() =>
                      Linking.openURL('https://www.evolveai.app/terms-of-use')
                    }>
                    Terms & Conditions
                  </Button>
                </View>

                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>

    </View> */}
              </View>

              {showLoading && (
                <LoadingSplash title='Processing, please wait...' level='3' />
              )}
            </Layout>
          </Layout>
        </ScrollView>
      ) : (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              textAlign: 'center',
              marginBottom: 8,
              color: '#fff',
              fontSize: 24,
            }}
            category='s1'>
            You have already subscribed.
          </Text>
        </View>
      )}
    </View>
  )
}

export default SubscriptionSettings
