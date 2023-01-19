// import Iaphub from 'react-native-iaphub'
// import auth from '@react-native-firebase/auth'
// import DeviceInfo from 'react-native-device-info'
// import Config from 'react-native-config'
// import { handleError } from '~/errorReporting'
// import analytics from '@react-native-firebase/analytics'
// import Intercom from '@intercom/intercom-react-native'
// import * as Sentry from '@sentry/react-native'
// import { AppEventsLogger } from 'react-native-fbsdk-next'
// import NetInfo from '@react-native-community/netinfo'
// import { check, PERMISSIONS, RESULTS } from 'react-native-permissions'
// import { dateToDate } from '~/helpers/Dates'
// import {
//   showErrorNotification,
//   showSuccessNotification,
// } from '../reducers/notifications'

// export const iapInit = async () => {
//   try {
//     await Iaphub.init({
//       // The app id is available on the settings page of your app
//       appId: Config.IAPHUB_ID,
//       // The (client) api key is available on the settings page of your app
//       apiKey: Config.IAPHUB_KEY,
//       // App environment (production by default, other environments must be created on the IAPHUB dashboard)
//       environment: Config.ENVIRONMENT,
//     })
//     return
//   } catch (e) {
//     handleError(e)
//   }
// }

// export const setIAPUserID = async (userID) => {
//   const isEmulator = await DeviceInfo.isEmulator()

//   // if (!isEmulator) {
//   //     try {
//   //         await Iaphub.setUserId(userID);
//   //     } catch (e) {
//   //         handleError(e)
//   //         return 'unable to confirm subscription'
//   //     }
//   // }
//   try {
//     await Iaphub.setUserId(userID)
//   } catch (e) {
//     handleError(e)
//     return 'unable to confirm subscription'
//   }
//   return
// }

// export const getIAPProducts = () => async (dispatch) => {
//   const isEmulator = await DeviceInfo.isEmulator()

//   if (!isEmulator) {
//     const products = await Iaphub.getProductsForSale()
//     console.log(products)

//     return dispatch({ type: 'SET_IAP_PRODUCTS', products })
//   }
//   return dispatch({ type: 'IS_DEV' })
// }

// export const getActiveIAPProducts =
//   () =>
//   async (dispatch, getState, { getFirestore }) => {
//     try {
//       const isEmulator = await DeviceInfo.isEmulator()

//       if (!isEmulator) {
//         const { currentUser } = auth()
//         if (!currentUser) {
//           return dispatch(
//             showErrorNotification({
//               title: 'Notice',
//               description: 'Please log in again',
//             })
//           )
//         }
//         const firestore = getFirestore()

//         const subRef = firestore
//           .collection('users')
//           .doc(currentUser.uid)
//           .collection('subscriptions')
//         const webSubscriptions = await subRef
//           .where('status', 'in', ['trialing', 'active'])
//           .get()

//         const products = await Iaphub.getActiveProducts({
//           includeSubscriptionStates: ['retry_period', 'paused'],
//         })

//         //   console.log(webSubscriptions.docs[0].data());

//         if (products?.length > 0 || !webSubscriptions.empty) {
//           const subscriptionEnd =
//             products?.length > 0
//               ? firestore.Timestamp.fromDate(
//                   new Date(products[0].expirationDate)
//                 )
//               : webSubscriptions?.docs[0]?.data()?.current_period_end
//           Intercom.updateUser({
//             customAttributes: {
//               has_app_subscription: 'true',
//               subscription_expiry: dateToDate(subscriptionEnd)?.toString(),
//               Program: 'powerlifting',
//             },
//           })
//           await firestore.doc(`users/${currentUser.uid}`).update({
//             passedSignup: true,
//             subscription: subscriptionEnd,
//             lastSeen: firestore.Timestamp.now(),
//           })
//         } else {
//           await firestore.doc(`users/${currentUser.uid}`).update({
//             subscription: false,
//             lastSeen: firestore.Timestamp.now(),
//           })
//           Intercom.updateUser({
//             customAttributes: {
//               has_app_subscription: 'false',
//             },
//           })
//         }

//         const webProducts = []

//         if (!webSubscriptions.empty) {
//           webSubscriptions.forEach((sub) => {
//             const {
//               current_period_start,
//               trial_start,
//               trial_end,
//               current_period_end,
//             } = sub.data()
//             webProducts.push({
//               currentPeriodEnd: dateToDate(current_period_end),
//               currentPeriodStart: dateToDate(current_period_start),
//               trialEnd: dateToDate(trial_end),
//               trialStart: dateToDate(trial_start),
//             })
//           })
//         }

//         return dispatch({
//           type: 'SET_ACTIVE_PRODUCTS',
//           products: products.length > 0 ? products : webProducts,
//         })
//       }
//       return dispatch({ type: 'IS_DEV' })
//     } catch (e) {
//       console.log(e)
//     }
//   }

// export const buyIAPProduct = (product) => async (dispatch, getState) => {
//   try {
//     const networkState = await NetInfo.fetch()

//     const subscription = getState().subscription

//     if (!networkState.isConnected) {
//       throw 'You appear to be currently offline, please try again when you have a connection or try restarting the app. If this problem persists please contact support (DATA_HERE)'
//     }

//     if (subscription.subscriptionStatus === 'loading') {
//       throw 'Subscription purchase in process. If you believe this is an error, please quit the app and try again.'
//     }
//     if (!product) {
//       throw 'Unable to find purchase. Please try restoring your purchase or restarting the app. If this problem persists please contact support (DATA_HERE)'
//     }
//     const productSku = product?.sku || 'standard_monthly_may_21'

//     await dispatch({ type: 'START_SUBSCRIPTION_LOADING' })

//     await dispatch({ type: 'SET_SKU_PROCESSING', productSku })

//     const transaction = await Iaphub.buy(productSku)
//     await dispatch({ type: 'END_SUBSCRIPTION_LOADING' })

//     await dispatch({ type: 'SET_SKU_PROCESSING', productSku: null })
//     // The webhook could not been sent to my server
//     if (transaction.webhookStatus == 'failed') {
//       handleError({ message: 'problem validating user subscription' })
//       return dispatch(
//         showErrorNotification({
//           title: 'Purchase Delayed',
//           description:
//             'Your purchase was successful but we need some more time to validate it, should arrive soon! Please come back in 24 hours. Otherwise contact the support (DATA_HERE)',
//         })
//       )
//     }
//     // Everything was successful! Yay!
//     else {
//       const hasAppTracking = await check(
//         PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY
//       )

//       if (
//         hasAppTracking !== RESULTS.DENIED &&
//         hasAppTracking !== RESULTS.BLOCKED
//       ) {
//         AppEventsLogger.logPurchase(
//           product?.priceAmount,
//           product?.priceCurrency,
//           { program: 'powerlifting', listing: product?.title }
//         )
//         await analytics().logPurchase({
//           value: product?.priceAmount,
//           currency: product?.priceCurrency,
//           items: [
//             {
//               item_brand: 'jts',
//               item_name: 'powerlifting',
//               item_list_name: product?.title,
//             },
//           ],
//         })
//         Intercom.logEvent('purchasedSubscription', {
//           value: product?.priceAmount,
//           currency: product?.priceCurrency,
//           date: new Date().toString(),
//         })
//       }

//       dispatch(
//         showSuccessNotification({
//           title: 'Thank you!',
//           description: 'Purchase successful',
//         })
//       )
//     }
//     // Refresh the user to update the products for sale
//     try {
//       dispatch(getActiveIAPProducts())
//       return dispatch(getIAPProducts())
//     } catch (err) {
//       handleError(err)
//       return dispatch(
//         showErrorNotification({
//           title: 'Error',
//           description: 'Problem getting products, please try again',
//         })
//       )
//     }
//   } catch (err) {
//     const { currentUser } = auth()

//     dispatch({ type: 'SET_SKU_PROCESSING', productSku: null })
//     dispatch({ type: 'END_SUBSCRIPTION_LOADING' })

//     // Purchase popup cancelled by the user (ios only)
//     if (err.code == 'user_cancelled') {
//       return dispatch(
//         showErrorNotification({
//           title: '',
//           description: 'Purchase cancelled',
//         })
//       )
//     }

//     // Couldn't buy product because it has been bought in the past but hasn't been consumed (restore needed)
//     else if (err.code == 'product_already_owned') {
//       return dispatch(
//         showErrorNotification({
//           title: 'Product already owned',
//           description:
//             'Please restore your purchases in order to fix that issue',
//         })
//       )
//     }
//     // The payment has been deferred (awaiting approval from parental control)
//     else if (err.code == 'deferred_payment') {
//       return dispatch(
//         showErrorNotification({
//           title: 'Purchase awaiting approval',
//           description:
//             'Your purchase is awaiting approval from the parental control',
//         })
//       )
//     }
//     // The receipt has been processed on IAPHUB but something went wrong
//     else if (err.code == 'receipt_validation_failed') {
//       return dispatch(
//         showErrorNotification({
//           title: 'Validation error',
//           description:
//             "We're having trouble validating your transaction, we'll retry ASAP!",
//         })
//       )
//     }
//     // The receipt hasn't been validated on IAPHUB (Could be an issue like a network error...)
//     else if (err.code == 'receipt_request_failed') {
//       return dispatch(
//         showErrorNotification({
//           title: 'Validation error',
//           description:
//             'Please try to restore your purchases later or contact the support (DATA_HERE)',
//         })
//       )
//     }
//     // Couldn't buy product for many other reasons (the user shouldn't be charged)
//     else {
//       Sentry.Native.addBreadcrumb({
//         category: 'subscription',
//         message: 'Error purchasing subscription',
//         level: 'error,
//         data: {
//           uID: currentUser?.uid,
//           product,
//           subscription: getState()?.subscription,
//         },
//       })
//       handleError(err)
//       return dispatch(
//         showErrorNotification({
//           title: 'Purchase error',
//           description:
//             'We were not able to process your purchase, please try restarting. If the problem persists, please contact the support (DATA_HERE)',
//         })
//       )
//     }
//   }
// }

// export const restoreIAP = () => async (dispatch, getState) => {
//   try {
//     dispatch({ type: 'START_SUBSCRIPTION_LOADING' })
//     await Iaphub.restore()

//     await dispatch(getActiveIAPProducts())

//     await dispatch(getIAPProducts())

//     const activeProducts = getState().subscription.activeProducts
//     dispatch({ type: 'END_SUBSCRIPTION_LOADING' })

//     if (activeProducts && activeProducts?.length > 0) {
//       return dispatch(
//         showSuccessNotification({
//           title: 'Success!',
//           description: 'Subscription Restored',
//         })
//       )
//     }
//     return dispatch(
//       showErrorNotification({
//         title: 'No Subscription Found',
//         description:
//           "We couldn't find any active subscriptions. Purchase a new one to get started",
//       })
//     )
//   } catch (e) {
//     dispatch({ type: 'END_SUBSCRIPTION_LOADING' })
//     handleError(e)
//     return dispatch(
//       showErrorNotification({
//         title: 'Subscription Not Restored',
//         description: e.message,
//       })
//     )
//   }
// }

// const coupons = ['powerbeta', 'undo']
// export const setUserIAPTag = (tag, userID) => async (dispatch) => {
//   try {
//     const isEmulator = await DeviceInfo.isEmulator()

//     if (coupons.includes(tag)) {
//       dispatch({ type: 'START_SUBSCRIPTION_LOADING' })
//       await Iaphub.setUserTags({ promo_code: tag })
//       await Iaphub.setUserId(userID)
//       await dispatch(getIAPProducts())
//       await dispatch(getActiveIAPProducts())
//       dispatch({ type: 'END_SUBSCRIPTION_LOADING' })
//       return dispatch(
//         showSuccessNotification({
//           title: 'Success!',
//           description: 'Promo code applied',
//         })
//       )
//     } else if (!isEmulator && Config.ENVIRONMENT === 'production') {
//       await Iaphub.setUserTags({ promo_code: '' })
//       await Iaphub.setUserId(userID)
//     }
//     return dispatch(
//       showErrorNotification({
//         title: 'Not Found',
//         description: 'This code could not be found or is no longer available',
//       })
//     )
//   } catch (e) {
//     dispatch({ type: 'END_SUBSCRIPTION_LOADING' })
//     return dispatch(
//       showErrorNotification({
//         title: 'Subscription Not Restored',
//         description: e.message,
//       })
//     )
//   }
// }

// export const syncUserSubscriptions =
//   (force = false) =>
//   async (dispatch) => {
//     try {
//       const { currentUser } = auth()
//       const networkState = await NetInfo.fetch()

//       if (!currentUser) {
//         return dispatch(
//           showErrorNotification({
//             title: 'Notice',
//             description: 'Please log in again',
//           })
//         )
//       }
//       const isEmulator = await DeviceInfo.isEmulator()

//       if (isEmulator || Config.SUBSCRIPTION_ENABLED === 'false') {
//         return dispatch({ type: 'EMULATE_SUBSCRIPTION' })
//       }
//       if (
//         Config.SUBSCRIPTION_ENABLED !== 'false' &&
//         (networkState.isConnected || force)
//       ) {
//         await setIAPUserID(currentUser.uid)
//         await dispatch(getIAPProducts())
//         await dispatch(getActiveIAPProducts())
//       }
//       return
//     } catch (e) {
//       dispatch({ type: 'HIDE_LOADING' })
//       handleError(e)
//       return dispatch(
//         showErrorNotification({
//           title: 'Error',
//           description: __DEV__
//             ? e.message
//             : 'Unable to sync your subscription. This this problem persists, please contact support (DATA_HERE).',
//         })
//       )
//     }
//   }
