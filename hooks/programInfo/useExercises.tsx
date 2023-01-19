import { useState, useEffect } from 'react'
import { isEmpty, isLoaded } from 'react-redux-firebase'
import { useTypedSelector } from '~/reduxStore/reducers'

const useExercises = () => {
  const exercise1 = useTypedSelector(
    ({ firestore: { data } }) => data.exercises
  )
  const exercise2 = useTypedSelector(
    ({ firestore: { data } }) => data?.exercises2
  )

  const programListening = useTypedSelector(
    ({ userProgram }) => userProgram?.programListening
  )
  const exerciseListening = useTypedSelector(
    ({ userProgram }) => userProgram?.exerciseListening
  )

  const [allExercises, setAllExercise] = useState(null)

  useEffect(() => {
    let canContinue = true
    if (canContinue) {
      setAllExercise({ ...exercise1, ...(exercise2 || []) })
    }
    return () => {
      canContinue = false
    }
  }, [exercise1, exercise2])

  return {
    exercises: allExercises,
    allExercisesLoaded:
      isLoaded(exercise1) &&
      ((exercise2 && isLoaded(exercise2)) || !exercise2) &&
      programListening &&
      exerciseListening,
  }
}

export default useExercises
