import auth from '@react-native-firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { findLifterClass } from '~/reduxStore/actions/powerlifting/helpers/blockHelpers'
import moment from 'moment-timezone'
import { getProgramWeeks } from './programActions'

import functions from '@react-native-firebase/functions'

import { convertToKG, convertToLB, round } from '~/helpers/Calculations'
import produce from 'immer'
import * as Sentry from 'sentry-expo'

import { restoreProgram } from './setupActions'
import analytics from '@react-native-firebase/analytics'
import Intercom from '@intercom/intercom-react-native'
import { AppEventsLogger } from 'react-native-fbsdk-next'
import { handleError } from '~/errorReporting'
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions'
import { dateToDate } from '~/helpers/Dates'
import {
  showErrorNotification,
  showSuccessNotification,
} from '../reducers/notifications'
import {
  clearUserProgram,
  submitSignupComplete,
  updateUserProgram,
} from '../reducers/userProgram'
import { hideLoading, showLoading } from '../reducers/globalUI'

export const restoreQuestionnaireData = () => async (dispatch, getState) => {
  try {
    const { userBioData, userLiftingData, userProgramData } =
      getState().firestore.data.userProgram?.programDetails
    if (userBioData.trainingHistory === null) {
      throw new Error(
        'Error loading program data. Please try restarting the app and trying again. If the issue persists please contact support'
      )
    }
    const previousBioData = produce(userBioData, (next) => {
      next.birthday = dateToDate(userBioData.birthday)
      if (userBioData.unitsIndex === 0) {
        next.units = 'standard'
        next.height = String(round(userBioData.height / 2.54, 0.5))
        next.bodyweight = String(convertToLB(userBioData.bodyweight))
        next.unitsIndex = 0
      } else {
        next.units = 'metric'
        next.height = String(userBioData.height)
        next.bodyweight = String(userBioData.bodyweight)
        next.unitsIndex = 1
      }
    })
    const previousLiftingData = produce(userLiftingData, (next) => {
      if (userBioData.unitsIndex === 0) {
        next.squat.max = String(convertToLB(userLiftingData.squat.max))
        next.bench.max = String(convertToLB(userLiftingData.bench.max))

        next.deadlift.max = String(convertToLB(userLiftingData.deadlift.max))
      } else {
        next.squat.max = String(userLiftingData.squat.max)
        next.bench.max = String(userLiftingData.bench.max)

        next.deadlift.max = String(userLiftingData.deadlift.max)
      }
    })

    const previousProgramData = produce(userProgramData, (next) => {
      next.meetDate = dateToDate(userProgramData.meetDate)
      next.meetIdex = 0
      next.startDate = new Date()
      if (!userProgramData.powerbuilding) {
        next.powerbuilding = {
          plFocus: 0,
          upperFocus: 0,
          lowerFocus: 0,
        }
      }
    })

    if (previousBioData.trainingHistory === null) {
      throw new Error(
        'Error loading program data. Please try restarting the app and trying again. If the issue persists please contact support'
      )
    }
    const payload = {
      userBioData: previousBioData,
      userLiftingData: previousLiftingData,
      userProgramData: previousProgramData,
    }
    await dispatch({ type: 'RESTORE_QUESTIONNAIRE', payload })

    return dispatch({ type: 'RESTORE_QUESTIONNAIRE_COMPLETE' })
  } catch (e) {
    handleError(e)
    dispatch(hideLoading())
    return dispatch(
      showErrorNotification({
        title: 'Error',
        description: __DEV__
          ? e.message
          : 'Error loading program data. Please try restarting the app and trying again. If the issue persists please contact support',
      })
    )
  }
}
export const daySort = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
}

const sortTrainingDays = (trainingDays: {
  [s: string]: boolean
}): [string, number][] => {
  return Object.entries(trainingDays)
    .sort(([keyA, value], [keyB, valueB]) => daySort[keyA] - daySort[keyB])
    .filter(([key, value]) => value)
    .map(([key, value]: [string, boolean]) => [key, daySort[key]])
}
export const hasPrepWeek = (userProgramData) => {
  const startDay = moment
    .tz(userProgramData.startDate, userProgramData.timezone)
    .isoWeekday()

  const sortedTrainingDays = sortTrainingDays(userProgramData.trainingDays)
  const prepDays = sortedTrainingDays.filter(
    ([day, val]) => val >= startDay
  )?.length
  const hasPrep = prepDays > 0 && prepDays < sortedTrainingDays?.length
  return {
    prepDays,
    hasPrep,
  }
}

function parseFormData(
  { userBioData, userLiftingData, userProgramData },
  firestore
) {
  let bodyweight = parseFloat(userBioData.bodyweight)
  let height = parseFloat(userBioData.height)
  let squatMax = parseFloat(userLiftingData.squat.max)
  let benchMax = parseFloat(userLiftingData.bench.max)
  let deadliftMax = parseFloat(userLiftingData.deadlift.max)
  if (userBioData.unitsIndex == 0) {
    bodyweight = convertToKG(bodyweight)
    squatMax = convertToKG(squatMax)
    benchMax = convertToKG(benchMax)
    deadliftMax = convertToKG(deadliftMax)
    height = Math.round(height * 2.54) //convert inches to cm
  }

  const squatClass = findLifterClass({
    gender: userBioData.genderIndex,
    bodyweight,
    type: 'Squat',
    weight: squatMax,
  })
  const benchClass = findLifterClass({
    gender: userBioData.genderIndex,
    bodyweight,
    type: 'Bench',
    weight: benchMax,
  })

  const deadliftClass = findLifterClass({
    gender: userBioData.genderIndex,
    bodyweight,
    type: 'Deadlift',
    weight: deadliftMax,
  })
  const lifterClass = findLifterClass({
    gender: userBioData.genderIndex,
    bodyweight,
    type: 'Total',
    weight: squatMax + deadliftMax + benchMax,
  })

  const age = moment().diff(moment(userBioData.birthday), 'years')
  let userDietType = 2

  if (userBioData.dietGoal === 0) {
    userDietType = 0
  } else if (userBioData.dietGoal === 1 && userBioData.dietType === 0) {
    userDietType = 1
  } else if (userBioData.dietGoal === 1 && userBioData.dietType === 1) {
    userDietType = 2
  } else if (userBioData.dietGoal === 2 && userBioData.dietType === 0) {
    userDietType = 3
  } else if (userBioData.dietGoal === 2 && userBioData.dietType === 1) {
    userDietType = 4
  }

  // const {squat: squatWeakness, bench: benchWeakness, deadlift: deadliftWeakness} = getWeaknesses(userLiftingData);

  // const newBioData = {
  //     ...userBioData,
  //     units: 1, bodyweight, height, age, dietType: userDietType,
  //     birthday: userBioData.birthday
  // }
  const newBioData = produce(userBioData, (next) => {
    next.units = 1
    next.bodyweight = bodyweight
    next.height = height
    next.age = age
    next.dietType = userDietType
  })

  const newLiftingData = produce(userLiftingData, (next) => {
    next.squat.max = squatMax
    next.squat.class = squatClass
    next.bench.max = benchMax
    next.bench.class = benchClass
    next.deadlift.max = deadliftMax
    next.deadlift.class = deadliftClass
    next.lifterClass = lifterClass
  })
  // const newLiftingData = {
  //     ...userLiftingData, squat: {
  //         ...userLiftingData.squat,
  //         max: squatMax,
  //         class: squatClass,
  //     },
  //     bench: {
  //         ...userLiftingData.bench,
  //         max: benchMax,
  //         class: benchClass,
  //     },
  //     deadlift: {
  //         ...userLiftingData.deadlift,
  //         max: deadliftMax,
  //         class: deadliftClass,
  //     }, lifterClass
  // }

  // const newProgramData = {
  //     ...userProgramData,
  //     startDate: firestore.Timestamp.fromDate(userProgramData.startDate),
  //     meetDate: firestore.Timestamp.fromDate(userProgramData.meetDate)
  // }
  // const newProgramData = {
  //     ...userProgramData,
  //     startDate: new Date(userProgramData.startDate),
  //     meetDate: new Date(userProgramData.meetDate)
  // }
  const { hasPrep, prepDays } = hasPrepWeek(userProgramData)
  const newProgramData = produce(userProgramData, (next) => {
    next.startDate = firestore.Timestamp.fromDate(
      dateToDate(userProgramData.startDate)
    )
    next.meetDate = firestore.Timestamp.fromDate(
      dateToDate(userProgramData.meetDate)
    )
    next.prepWeek = {
      hasPrep,
      prepDays,
    }
  })

  return {
    userBioData: newBioData,
    userLiftingData: newLiftingData,
    userProgramData: newProgramData,
  }
}

export const submitSignUp =
  (type) =>
  async (dispatch, getState, { getFirestore }) => {
    try {
      const { currentUser } = auth()
      if (!currentUser) {
        return dispatch(
          showErrorNotification({
            title: 'Notice',
            description: 'Please log in again',
          })
        )
      }

      const firestore = getFirestore()
      dispatch(showLoading('Generating the smartest program for you...'))

      const { userBioData, userLiftingData, userProgramData } = parseFormData(
        getState().signUp,
        firestore
      )

      console.log({ userBioData, userLiftingData, userProgramData })

      if (userBioData.trainingHistory === null) {
        throw new Error(
          'Error loading program data. Please try restarting the app and trying again. If the issue persists please contact support'
        )
      }

      const hasAppTracking = await check(
        PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY
      )

      if (type === 'existingUserProgram') {
        dispatch(showLoading('Analyzing previous workouts...'))

        await dispatch(
          clearProgram({ reset: 'partial', hideLoadingScreen: false })
        )
        await firestore
          .doc(`/users/${currentUser.uid}/program/programDetails/`)
          .set({
            userBioData,
            userProgramData,
            userLiftingData,
          })
        dispatch(showLoading('Updating lift performances...'))
        await functions().httpsCallable('powerlifting-updateCompMaxes')({
          userLiftingData,
          unitsIndex: userBioData.unitsIndex,
        })

        await firestore.doc(`/users/${currentUser.uid}/`).set(
          {
            currentBlock: 0,
            currentWeek: 1,
            programVersion: userProgramData?.programIndex === 0 ? 'PL1' : 'PB2',
          },
          { merge: true }
        )
        dispatch(showLoading('Creating your new program...'))

        await functions().httpsCallable('powerlifting-regenerateUserProgram')()
        await analytics().logEvent('existing_new_program')
        AppEventsLogger.logEvent('existingNewProgram')
      } else {
        dispatch(showLoading('Analyzing athlete information...'))
        await dispatch(
          clearProgram({ reset: 'full', hideLoadingScreen: false })
        )
        await firestore
          .doc(`/users/${currentUser.uid}/program/programDetails/`)
          .set({
            userBioData,
            userProgramData,
            userLiftingData,
          })
        dispatch(showLoading('Generating your new program...'))
        if (userProgramData?.programIndex === 1) {
          await functions().httpsCallable('powerbuilding-createNewPBProgram')()
          AppEventsLogger.logEvent('createdNewPBProgram')
        } else {
          await functions().httpsCallable('powerlifting-createNewProgram')()
          AppEventsLogger.logEvent('createdNewProgram')
        }
        dispatch(showLoading('Estimating variation exercises...'))
        await functions().httpsCallable('powerlifting-estimateMaxes')({
          userLiftingData,
          unitsIndex: userBioData.unitsIndex,
          userID: currentUser.uid,
        })
        await analytics().logEvent('new_program')
      }

      Intercom.updateUser({
        customAttributes: {
          created_program: 'true',
          'Deadlift Class': userLiftingData?.deadlift.class,
          'Squat Class': userLiftingData?.squat.class,
          'Bench Class': userLiftingData?.bench.class,
          'Training History': userBioData?.trainingHistory,
          Birthday: userBioData?.birthday,
          'Diet Goal': userBioData?.dietGoal,
          Sleep: userBioData?.sleep,
          Stress: userBioData?.lifeStress,
          Gender: userBioData?.genderIndex === 0 ? 'male' : 'female',
          'App Meet date': dateToDate(userProgramData?.meetDate),
          Program: userProgramData?.program,
          historic_Workload: userBioData.historicWorkload,
        },
      })

      await analytics().setUserProperties({
        userGender: userBioData.genderIndex === 0 ? 'male' : 'female',
        birthday: dateToDate(userBioData.birthday)?.toJSON(),
        bodyweight: String(userBioData.bodyweight),
        height: String(userBioData.height),
        dietGoal: String(userBioData.dietGoal),
        dietType: String(userBioData.dietType),
        trainingHistory: String(userBioData.trainingHistory),
        historicWorkload: String(userBioData.historicWorkload),
        sleep: String(userBioData.sleep),
        lifeStress: String(userBioData.lifeStress),
        program: userProgramData?.program,
        startDate: dateToDate(userProgramData.startDate).toJSON(),
        meetDate:
          userProgramData.meetIndex === 1
            ? dateToDate(userProgramData.meetDate).toJSON()
            : null,
        hasMeet: userProgramData.meetIndex === 1 ? 'true' : 'false',
        bridgeBlocksYN: userProgramData.brideBlocksYN === 1 ? 'true' : 'false',
        bridgeBlockLength: String(userProgramData.bridgeBlocks + 1),
        customPeriodizations:
          userProgramData.periodizationYN === 1 ? 'true' : 'false',
        trainingDaysPerWeek: String(userProgramData.trainingDaysPerWeek),
      })

      Intercom.logEvent('created_app_program', {
        program: userProgramData?.program,
      })

      await dispatch(restoreProgram({ unset: false, force: true }))
      await dispatch(getProgramWeeks())
      dispatch(hideLoading())
      return dispatch(submitSignupComplete())
    } catch (e) {
      console.log(e)

      Sentry.Native.captureException(e)
      dispatch(hideLoading())
      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to create program. please try again. If this problem persists please reach out to our team.',
        })
      )
    }
  }

export const clearProgram =
  ({ reset = 'full', hideLoadingScreen = true }) =>
  async (dispatch, getState, { getFirestore }) => {
    try {
      // dispatch({ type: "SHOW_LOADING", loadingTitle: 'Cleaning up...' })

      await functions()
        .httpsCallable('powerlifting-clearProgramming')({
          type: reset,
        })
        .catch((error) => {
          console.log('error', error)
        })

      await dispatch(clearUserProgram())
      if (reset === 'full') {
        await dispatch({ type: '@@reduxFirestore/CLEAR_DATA' })
      }
      if (hideLoadingScreen) {
        dispatch(hideLoading())
      }
      await analytics().logEvent('cleared_program')

      return dispatch({ type: 'CLEAR_PROGRAM_COMPLETE' })
    } catch (e) {
      Sentry.Native.captureException(e)
      dispatch(hideLoading())
      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to clear program, please try again. If this problem persists please reach out to our team.',
        })
      )
    }
  }

export const regenerateProgram =
  (fullReset = false, hideLoadingScreen = true) =>
  async (dispatch) => {
    try {
      dispatch(showLoading('Rebuilding your program...'))
      await functions().httpsCallable('powerlifting-regenerateUserProgram')({
        fullReset,
      })

      await analytics().logEvent('regenerated_program')
      Intercom.logEvent('created_app_program', { program: 'powerlifting' })

      await dispatch(getProgramWeeks())
      dispatch(
        showSuccessNotification({
          title: 'Complete',
          description: 'Your program has been updated!',
        })
      )

      if (hideLoadingScreen) {
        dispatch(hideLoading())
      }
      return dispatch({ type: 'PROGRAM_REGENERATED' })
    } catch (e) {
      console.log(e)
      Sentry.Native.captureException(e)
      dispatch(hideLoading())
      return dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to regenerate program, please try again. If this problem persists please reach out to our team.',
        })
      )
    }
  }

export function updateMeetDate({ newMeetDate, keepBridge = false }) {
  const { currentUser } = auth()

  return async (dispatch, getState, { getFirestore }) => {
    try {
      const {
        firestore: {
          data: {
            userProgram: {
              programDetails: { userProgramData },
            },
          },
        },
      } = getState()
      dispatch(showLoading('Updating meet date...'))

      const newProgramData = produce(userProgramData, (next: any) => {
        next.meetDate = newMeetDate
        next.meetIndex = 1
        next.startDate = moment.tz(userProgramData.timezone).toDate()
        next.bridgeBlocksYN = keepBridge ? 1 : 0

        const { hasPrep, prepDays } = hasPrepWeek(next)
        next.prepWeek = {
          hasPrep,
          prepDays,
        }
      })
      // const {hasPrep, prepDays} = hasPrepWeek(userProgramData)
      // const newProgramData = { ...userProgramData, meetDate: newMeetDate, meetIndex: 1, startDate: new Date(), bridgeBlocksYN: keepBridge ? 1 : 0, prepWeek: {hasPrep, prepDays} }

      const firestore = getFirestore()

      const userProgram = firestore.doc(
        `users/${currentUser.uid}/program/programDetails`
      )

      await userProgram.update('userProgramData', newProgramData)
      await firestore.doc(`users/${currentUser.uid}`).update({
        currentWeek: 1,
        currentBlock: 0,
      })
      dispatch(
        updateUserProgram({
          userProgramData: newProgramData,
        })
      )
      await analytics().logEvent('changed_meet_date')
      await dispatch(
        clearProgram({ reset: 'trainingOnly', hideLoadingScreen: false })
      )
      await dispatch(regenerateProgram(true, false))
    } catch (e) {
      Sentry.Native.captureException(e)
      dispatch(
        showErrorNotification({
          title: 'Error',
          description: __DEV__
            ? e.message
            : 'Unable to update meet date, please try again. If this problem persists please reach out to our team.',
        })
      )
    } finally {
      return dispatch(hideLoading())
    }
  }
}
