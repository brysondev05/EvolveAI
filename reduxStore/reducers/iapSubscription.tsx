import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import Iaphub from 'react-native-iaphub'
import { handleError } from '~/helpers/errorReporting'
import DeviceInfo from 'react-native-device-info'
import auth from '@react-native-firebase/auth'
import { showErrorNotification, showSuccessNotification } from './notifications'
import { dateToDate } from '~/helpers/Dates'
import Intercom from '@intercom/intercom-react-native'
import NetInfo from '@react-native-community/netinfo'
import { AppEventsLogger } from 'react-native-fbsdk-next'
import analytics from '@react-native-firebase/analytics'
import * as Sentry from 'sentry-expo'
import { storage } from '~/storage'
import { customLog } from '~/helpers/CustomLog'
import { hideLoading } from './globalUI'

interface ValidationErrors {
  errorMessage: string
  field_errors: Record<string, string>
}

// const iapInit = createAsyncThunk('iapSubscription/iapInit', (async()))
// First, create the thunk
const setIAPUserID = createAsyncThunk<
  string,
  string,
  { rejectValue: ValidationErrors }
>(
  '$$iapSubscription/setIAPUserID',
  async (userID = '', { rejectWithValue }) => {
    try {
      await Iaphub.login(userID)
      return 'userLoaded'
    } catch (e) {
      handleError(e)
      rejectWithValue(e)
    }
  }
)

export const getIAPProducts = createAsyncThunk(
  '$$iapSubscription/getIAPProducts',
  async (val, { rejectWithValue, dispatch }) => {
    try {
      let products = []
      try {
        products = await Iaphub.getProductsForSale()
      } catch (e) {
        handleError(e)
      }

      await dispatch(getUserIAPProducts())

      return products
    } catch (e) {
      handleError(e)
      rejectWithValue(e)
    }
  }
)

export const getUserIAPProducts = createAsyncThunk(
  '$$iapSubscription/getUserIAPProducts',
  async (val, { dispatch, rejectWithValue, extra: { getFirestore } }) => {
    try {
      const isEmulator = await DeviceInfo.isEmulator()
      if (!isEmulator) {
      }
      const { currentUser } = auth()
      await Iaphub.login(currentUser?.uid)

      if (!currentUser) {
        dispatch(
          showErrorNotification({
            title: 'Notice',
            description: 'Please log in again',
          })
        )
        return rejectWithValue('not logged in')
      }

      const firestore = getFirestore()

      const subRef = firestore
        .collection('users')
        .doc(currentUser.uid)
        .collection('subscriptions')
      const webSubscriptions = await subRef
        .where('status', 'in', ['trialing', 'active'])
        .get()

      let products = []
      try {
        products = await Iaphub.getActiveProducts({
          includeSubscriptionStates: ['retry_period'],
        })
      } catch (e) {
        handleError(e)
      }

      if (products?.length > 0 || !webSubscriptions.empty) {
        const subscriptionEnd =
          products?.length > 0
            ? firestore.Timestamp.fromDate(new Date(products[0].expirationDate))
            : webSubscriptions?.docs[0]?.data()?.current_period_end
        Intercom.updateUser({
          customAttributes: {
            has_app_subscription: 'true',
            subscription_expiry: dateToDate(subscriptionEnd)?.toString(),
            Program: 'powerlifting',
          },
        })
        firestore.doc(`users/${currentUser.uid}`).update({
          passedSignup: true,
          subscription: subscriptionEnd,
          lastSeen: firestore.Timestamp.now(),
        })
      } else {
        firestore.doc(`users/${currentUser.uid}`).update({
          subscription: false,
          lastSeen: firestore.Timestamp.now(),
        })
        Intercom.updateUser({
          customAttributes: {
            has_app_subscription: 'false',
          },
        })
      }

      const webProducts = []

      if (!webSubscriptions.empty) {
        webSubscriptions.forEach((sub) => {
          const {
            current_period_start,
            trial_start,
            trial_end,
            current_period_end,
          } = sub.data()
          webProducts.push({
            currentPeriodEnd: dateToDate(current_period_end),
            currentPeriodStart: dateToDate(current_period_start),
            trialEnd: dateToDate(trial_end),
            trialStart: dateToDate(trial_start),
            isWeb: true,
          })
        })
      }

      return [...(products || []), ...(webProducts || [])]
    } catch (e) {
      handleError(e)
    }
  }
)

export const buyIAPProduct = createAsyncThunk(
  '$$iapSubscription/buyIAPProduct',
  async (
    product: {
      sku: string
      price: number
      currency: string
      localizedTitle: string
    },
    { dispatch, getState, rejectWithValue }
  ) => {
    try {
      const networkState = await NetInfo.fetch()
      const { currentUser } = auth()

      const subscription = getState().iapSubscription
      await Iaphub.login(currentUser?.uid)

      if (!networkState.isConnected) {
        rejectWithValue(
          'You appear to be currently offline, please try again when you have a connection or try restarting the app. If this problem persists please contact support (DATA_HERE)'
        )
      }

      if (subscription.subscriptionStatus === 'loading') {
        rejectWithValue(
          'Subscription purchase in process. If you believe this is an error, please quit the app and try again.'
        )
      }
      if (product === null) {
        rejectWithValue(
          'Unable to find purchase. Please try restoring your purchase or restarting the app. If this problem persists please contact support (DATA_HERE)'
        )
      }

      if (!product.sku) {
        dispatch(
          showErrorNotification({
            title: 'Error',
            description:
              'Unable to process. Please try again. If this error persists please contact DATA_HERE',
          })
        )
        await dispatch(getIAPProducts())
        return rejectWithValue('no sku found')
      }

      customLog({ product, sku: product.sku }, 'Buying IAP Product')
      const transaction = await Iaphub.buy(product.sku)

      // The webhook could not been sent to my server
      if (transaction.webhookStatus == 'failed') {
        handleError({ message: 'problem validating user subscription' })
        dispatch(
          showErrorNotification({
            title: 'Purchase Delayed',
            description:
              'Your purchase was successful but we need some more time to validate it, should arrive soon! Please come back in 24 hours. Otherwise contact the support (DATA_HERE)',
          })
        )
        return
      }
      AppEventsLogger.logPurchase(product?.price, product?.currency, {
        program: 'powerlifting',
        listing: product?.localizedTitle,
      })
      await analytics().logPurchase({
        value: product?.price,
        currency: product?.currency,
        items: [
          {
            item_brand: 'jts',
            item_name: 'powerlifting',
            item_list_name: product?.localizedTitle,
          },
        ],
      })
      Intercom.logEvent('purchasedSubscription', {
        value: product?.price,
        currency: product?.currency,
        date: new Date().toString(),
      })
      dispatch(
        showSuccessNotification({
          title: 'Thank you!',
          description: 'Purchase successful',
        })
      )
      dispatch(getIAPProducts())
      return 'success'
    } catch (err) {
      // Purchase popup cancelled by the user (ios only)
      if (err.code == 'user_cancelled') {
        dispatch(
          showErrorNotification({
            title: '',
            description: 'Purchase cancelled',
          })
        )
        return rejectWithValue(err)
      }

      // Couldn't buy product because it has been bought in the past but hasn't been consumed (restore needed)
      else if (err.code == 'product_already_owned') {
        dispatch(
          showErrorNotification({
            title: 'Product already owned',
            description:
              'Please restore your purchases in order to fix that issue',
          })
        )
        return rejectWithValue(err)
      }
      // The payment has been deferred (awaiting approval from parental control)
      else if (err.code == 'deferred_payment') {
        dispatch(
          showErrorNotification({
            title: 'Purchase awaiting approval',
            description:
              'Your purchase is awaiting approval from the parental control',
          })
        )
        return rejectWithValue(err)
      }
      // The receipt has been processed on IAPHUB but something went wrong
      else if (err.code == 'receipt_validation_failed') {
        dispatch(
          showErrorNotification({
            title: 'Validation error',
            description:
              "We're having trouble validating your transaction, we'll retry ASAP!",
          })
        )
        return rejectWithValue(err)
      }
      // The receipt hasn't been validated on IAPHUB (Could be an issue like a network error...)
      else if (err.code == 'receipt_request_failed') {
        dispatch(
          showErrorNotification({
            title: 'Validation error',
            description:
              'Please try to restore your purchases later or contact the support (DATA_HERE)',
          })
        )
        return rejectWithValue(err)
      }
      // Couldn't buy product for many other reasons (the user shouldn't be charged)
      else {
        const { currentUser } = auth()

        Sentry.Native.addBreadcrumb({
          category: 'subscription',
          message: 'Error purchasing subscription',
          level: 'error',
          data: {
            uID: currentUser?.uid,
            product,
            subscription: getState()?.iapSubscription,
          },
        })
        handleError(err)

        dispatch(
          showErrorNotification({
            title: 'Purchase error',
            description:
              'We were not able to process your purchase, please try again and/or restarting the app. If the problem persists, please contact the support riv.rhea@gmail.com',
          })
        )
        return rejectWithValue(err)
      }
    }
  }
)

export const syncUserSubscriptions = createAsyncThunk(
  '$$iapSubscription/syncSubscriptions',
  async (force, { dispatch, rejectWithValue, getState, requestId }) => {
    try {
      const { currentUser } = auth()
      const { currentRequestId, syncStatus } = getState().iapSubscription
      if (syncStatus !== 'pending' || requestId !== currentRequestId) {
        return
      }

      if (!currentUser) {
        return dispatch(
          showErrorNotification({
            title: 'Notice',
            description: 'Please log in again',
          })
        )
      }
      await Iaphub.login(currentUser?.uid)
      await dispatch(getIAPProducts())

      // if (isEmulator || Config.SUBSCRIPTION_ENABLED === 'false') {
      //   return dispatch({ type: 'EMULATE_SUBSCRIPTION' })
      // }
      // if (
      //   Config.SUBSCRIPTION_ENABLED !== 'false' &&
      //   (networkState.isConnected || force)
      // ) {
      //   await dispatch(setIAPUserID(currentUser.uid))
      //    dispatch(getIAPProducts())
      // }
      return
    } catch (e) {
      dispatch(hideLoading())

      handleError(e)
      dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to sync your subscription. This this problem persists, please contact support (DATA_HERE).',
        })
      )
      return rejectWithValue(e)
    }
  }
)

export const restoreIAP = createAsyncThunk(
  '$$iapSubscription/restoreSubscription',
  async (val, { dispatch, rejectWithValue, getState }) => {
    try {
      const { currentUser } = auth()
      await Iaphub.login(currentUser?.uid)

      // TODO: re-enable when Iaphub is configured. Disabled to test Stripe integration.
    
      await Iaphub.restore()

      await dispatch(getIAPProducts())

      const activeProducts = getState().iapSubscription?.activeProducts

      if (activeProducts && activeProducts?.length > 0) {
        dispatch(
          showSuccessNotification({
            title: 'Success!',
            description: 'Subscription Restored',
          })
        )
        return
      }
      dispatch(
        showErrorNotification({
          title: 'No Subscription Found',
          description:
            "We couldn't find any active subscriptions. Purchase a new one to get started",
        })
      )
      return
    } catch (e) {
      handleError(e)
      rejectWithValue(e)
      return dispatch(
        showErrorNotification({
          title: 'Subscription Not Restored',
          description: __DEV__
            ? e.message
            : 'Unable to restore subscription, please check your connection and restart the app. If you need further help please email DATA_HERE',
        })
      )
    }
  }
)

const initialSubscriptionState = {
  activeProducts: [],
  IAPProducts: [],
  skuProcessing: [],
  subscriptionsLoaded: false,
  subscriptionStatus: 'pending',
  currentRequestId: undefined,
  syncStatus: 'idle',
}
// Then, handle actions in your reducers:
const iapSubscription = createSlice({
  name: '$$iapSubscription',
  initialState: initialSubscriptionState,
  reducers: {
    clearSubscription: (state) => {
      return initialSubscriptionState
    },
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder
      .addCase(setIAPUserID.fulfilled, (state, action) => {
        // Add user to the state array
      })
      .addCase(getIAPProducts.fulfilled, (state, action) => {
        state.IAPProducts = action.payload
      })
      .addCase(getUserIAPProducts.fulfilled, (state, action) => {
        state.activeProducts = action.payload

        const subscriptionInfo = {
          lastChecked: new Date(),
          activeProducts: action.payload,
        }
        storage.set('subscription', JSON.stringify(subscriptionInfo))
      })
      .addCase(buyIAPProduct.pending, (state, action) => {})
      .addCase(buyIAPProduct.rejected, (state, action) => {
        state.subscriptionStatus = 'pending'
        state.skuProcessing = null
      })
      .addCase(syncUserSubscriptions.pending, (state, action) => {
        if (state.syncStatus === 'idle') {
          state.syncStatus = 'pending'
          state.currentRequestId = action.meta.requestId
        }
      })
      .addCase(syncUserSubscriptions.fulfilled, (state, action) => {
        state.subscriptionsLoaded = true
        state.syncStatus = 'loaded'
        state.currentRequestId = undefined
      })
      .addCase(syncUserSubscriptions.rejected, (state, action) => {
        const { requestId } = action.meta
        if (
          state.syncStatus === 'pending' &&
          state.currentRequestId === requestId
        ) {
          state.syncStatus = 'idle'
          // state.error = action.error
          state.currentRequestId = undefined
        }
      })
  },
})
export const { clearSubscription } = iapSubscription.actions
export default iapSubscription.reducer

// // Later, dispatch the thunk as needed in the app
// dispatch(setIAPUserID('123'))
