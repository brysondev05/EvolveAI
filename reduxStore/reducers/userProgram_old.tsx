import { customLog } from '~/helpers/CustomLog'

const initialState = {
  actions: '',
  hasProgram: false,
  programDetails: {},
  programCycle: {},
  programVolumeData: {},
  activeWeek: null,
  activeDay: null,
  programWeeks: [],
  programListening: false,
  exerciseListening: false,
}

export default function userProgram(
  state = initialState,
  action: {
    programCycle: any
    programVolumeData: any
    programDetails: any
    type: any
    activeWeek: any
    hasProgram: boolean
    activeDay: any
    programWeeks: any
    userProgramData
  }
) {
  const {
    programCycle,
    programVolumeData,
    programDetails,
    activeWeek,
    type,
    hasProgram,
    activeDay,
    programWeeks,
    userProgramData,
  } = action

  switch (type) {
    case 'CLEAR_PROGRAM':
      return initialState
    case 'SIGN_OUT':
      return initialState
    default:
      return state
  }
}
