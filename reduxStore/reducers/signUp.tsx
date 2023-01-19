import moment from 'moment-timezone'
import * as Localization from 'expo-localization'

let birthdayDate = new Date()

birthdayDate.setFullYear(birthdayDate.getFullYear() - 25)

const timezone = Localization.timezone

const meetDate = moment.tz(timezone).add(26, 'weeks').hour(8).toDate()

const initialState = {
  userBioData: {
    birthday: birthdayDate,
    genderIndex: null,
    bodyweight: '',
    units: 'standard',
    unitsIndex: null,
    height: '',
    dietGoal: null,
    dietType: null,
    trainingHistory: null,
    historicWorkload: null,
    historicRecovery: null,
    sleep: null,
    lifeStress: null,
  },
  userProgramData: {
    program: 'powerlifting',
    powerbuilding: {
      plFocus: 0,
      upperFocus: 0,
      lowerFocus: 0,
    },
    startDate: moment.tz(timezone).hour(8).toDate(),
    programIndex: 0,
    meetDate,
    meetIndex: null,
    periodizationYN: null,
    bridgeBlocksYN: null,
    bridgeBlocks: null,
    trainingDaysPerWeek: null,
    timezone,
    trainingDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    periodization: {
      squat: {
        hypertrophy: null,
        strength: null,
        peaking: null,
      },
      bench: {
        hypertrophy: null,
        strength: null,
        peaking: null,
      },
      deadlift: {
        hypertrophy: null,
        strength: null,
        peaking: null,
      },
    },
  },
  userLiftingData: {
    squat: {
      style: null,
      max: '',
      weakness: null,
    },
    bench: {
      style: null,
      max: '',
      weakness: null,
    },
    deadlift: {
      style: null,
      max: '',
      weakness: null,
    },
  },
  headerIndex: 0,
  actions: '',
}

const lightWeakFemale = {
  userBioData: {
    birthday: '1986-07-14T22:58:26.000Z',
    genderIndex: 1,
    bodyweight: '130',
    units: 'standard',
    unitsIndex: 0,
    height: '53',
    dietGoal: 1,
    dietType: 0,
    trainingHistory: 0,
    historicWorkload: 0,
    historicRecovery: 4,
    sleep: 2,
    lifeStress: 0,
  },
  userProgramData: {
    program: 'powerlifting',
    startDate: '2020-07-14T22:58:26.226Z',
    programIndex: 0,
    meetDate: '2021-01-23T23:58:26.226Z',
    meetIndex: 0,
    periodizationYN: 0,
    bridgeBlocksYN: 0,
    bridgeBlocks: null,
    trainingDaysPerWeek: 3,
    trainingDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    periodization: {
      squat: {
        hypertrophy: null,
        strength: null,
        peaking: null,
      },
      bench: {
        hypertrophy: null,
        strength: null,
        peaking: null,
      },
      deadlift: {
        hypertrophy: null,
        strength: null,
        peaking: null,
      },
    },
  },
  userLiftingData: {
    squat: {
      style: 0,
      max: '130',
      weakness: null,
    },
    bench: {
      style: 0,
      max: '77',
      weakness: null,
    },
    deadlift: {
      style: 0,
      max: '120',
      weakness: null,
    },
  },
  headerIndex: 0,
  actions: '',
}

export default function signUp(
  state = initialState,
  action: { type: any; payload: any }
) {
  switch (action.type) {
    case 'UPDATE_LIFTING_DATA':
      return { ...state, userLiftingData: action.payload }
    case 'UPDATE_BIO_DATA':
      return { ...state, userBioData: action.payload }
    case 'UPDATE_PROGRAM_DATA':
      return { ...state, userProgramData: action.payload }
    case 'RESTORE_QUESTIONNAIRE':
      return {
        ...state,
        userBioData: action.payload.userBioData,
        userLiftingData: action.payload.userLiftingData,
        userProgramData: action.payload.userProgramData,
      }
    case 'PREVIEW_PROGRAM_CREATED':
      return { ...state, actions: 'signup_complete' }
    case 'CLEAR_QUESTIONNAIRE':
      return initialState
    case 'SIGN_OUT':
      return initialState
    default:
      return state
  }
}
