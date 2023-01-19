import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { handleError } from '~/helpers/errorReporting'
import auth from '@react-native-firebase/auth'

import { showErrorNotification, showSuccessNotification } from './notifications'

import { customLog } from '~/helpers/CustomLog'

import { exerciseData } from '~/assets/data/exerciseData'
import { chunkArray } from '~/helpers/Arrays'

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
  currentExerciseQuery: null,
  currentExercisesToFind: [],
  currentProgramQuery: null,
  exercisesLoaded: false,
  programLoaded: false,
}

export const findMissingExercises = createAsyncThunk(
  '##program/findMissingExercises',
  async (
    {
      exercises,
      foundExercises,
    }: { exercises: string[]; foundExercises: string[] },
    { rejectWithValue, dispatch, getState, extra: { getFirestore } }
  ) => {
    const state = getState()
    const firestore = getFirestore()

    try {
      const missingLifts = exercises?.filter(
        (ex) => !foundExercises.includes(ex)
      )

      if (missingLifts.length > 0) {
        customLog(missingLifts, 'missing lifts')
        dispatch({ type: 'MISSING_LIFTS' })
        missingLifts.forEach(async (code) => {
          const newExercise = exerciseData.find(
            (exercise) => exercise.exerciseShortcode === code
          )

          if (newExercise) {
            const { coachingCues, videoID, description, ...rest } = newExercise
            firestore
              .collection(`users/${state.firebase.auth.uid}/exercises`)
              .doc(code)
              .set(
                {
                  ...rest,
                  units: state.firebase.profile.units === 1 ? 'kg' : 'lb',
                },
                { merge: true }
              )
          }
        })
        return `missing lifts added: ${missingLifts}`
      }
      return 'no missing lifts'
    } catch (e) {
      handleError(e)
      return rejectWithValue(e)
    }
  }
)
export const unsetExercises = createAsyncThunk(
  '##program/unsetExercises',
  async (
    exercises,
    { rejectWithValue, dispatch, getState, extra: { getFirestore } }
  ) => {
    const firestore = getFirestore()
    const state = getState()

    const exerciseQuery = state.userProgram.currentExerciseQuery

    if (exerciseQuery?.length > 0) {
      try {
        firestore.unsetListeners(exerciseQuery)
        dispatch(setExerciseQuery([]))
      } catch (e) {
        handleError(e)
        return rejectWithValue(e)
      }
    }
    return 'no exercises found'
  }
)

export const getExercises = createAsyncThunk(
  '##program/getExercises',
  async (
    exercises: string[],
    { rejectWithValue, dispatch, extra: { getFirestore } }
  ) => {
    const firestore = getFirestore()
    const { currentUser } = auth()

    if (exercises?.length > 0 && currentUser) {
      try {
        const queryChunk = chunkArray(exercises, 10)
        const foundExercises = []
        if (queryChunk.length > 0) {
          const chunkedCollections = await Promise.all(
            queryChunk?.map(async (chunk) => {
              if (chunk.length > 0) {
                return await firestore
                  .collection(`users/${currentUser.uid}/exercises`)
                  .where('exerciseShortcode', 'in', chunk)
                  .get()
              }
            })
          )
          chunkedCollections.forEach((collection) => {
            collection?.forEach((doc) => {
              foundExercises.push(doc.id)
            })
          })

          await dispatch(findMissingExercises({ exercises, foundExercises }))
        }

        return 'listeners started'
      } catch (e) {
        console.log('boop')

        handleError(e)
        return rejectWithValue(e.message)
      }
    } else {
      return rejectWithValue('no exercises to get')
    }
  }
)

const userProgram = createSlice({
  name: '##program',
  initialState,
  reducers: {
    setActiveDay: (state, action) => {
      state.activeWeek = action.payload.activeWeek
      state.activeDay = action.payload.activeDay
    },
    fetchActiveWeek: (state, action) => {
      state.activeWeek = action.payload
    },
    fetchActiveDay: (state, action) => {
      state.activeDay = action.payload
    },
    startedProgramListener: (state) => {
      state.programListening = true
    },
    cancelledProgramListener: (state) => {
      state.programListening = false
    },
    startedExerciseListener: (state) => {
      state.exerciseListening = true
    },
    cancelledExerciseListener: (state) => {
      state.exerciseListening = false
    },
    submitSignupComplete: (state) => {
      state.actions = 'show_preview'
      state.hasProgram = true
    },
    restoreProgramDetails: (state, action) => {
      state.programCycle = action.payload.programCycle
      state.programVolumeData = action.payload.programVolumeData
      state.programDetails = action.payload.programDetails
      state.hasProgram = action.payload.hasProgram
      state.actions = 'show_preview'
    },
    updateUserProgram: (state, action) => {
      return {
        ...state,
        programDetails: { ...state.programDetails, ...action.payload },
      }
    },
    setExerciseQuery: (state, action) => {
      state.currentExerciseQuery = action.payload.query
      state.currentExercisesToFind = action.payload.exercises
    },
    setProgramQuery: (state, action) => {
      state.currentProgramQuery = action.payload
    },
    resetPreview: (state) => {
      state.actions = ''
    },
    clearUserProgram: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getExercises.pending, (state) => {
        state.exercisesLoaded = false
      })
      .addCase(getExercises.fulfilled, (state) => {
        state.exercisesLoaded = true
      })
      .addCase(getExercises.rejected, (state) => {
        state.exercisesLoaded = false
      })
      .addCase(unsetExercises.fulfilled, (state) => {
        state.exercisesLoaded = false
      })
  },
})

export const {
  setActiveDay,
  fetchActiveDay,
  fetchActiveWeek,
  startedExerciseListener,
  startedProgramListener,
  cancelledExerciseListener,
  cancelledProgramListener,
  submitSignupComplete,
  restoreProgramDetails,
  updateUserProgram,
  resetPreview,
  clearUserProgram,
  setExerciseQuery,
  setProgramQuery,
} = userProgram.actions

export default userProgram.reducer
