import { useState, useEffect, useMemo } from 'react'
import { Pressable, FlatList } from 'react-native'
import { Layout, Text, Divider, Button } from '@ui-kitten/components'
import { useTypedSelector } from '~/reduxStore/reducers'
import { isLoaded, useFirestoreConnect, isEmpty } from 'react-redux-firebase'
import { useDispatch } from 'react-redux'
import ExerciseSwapItem from './ExerciseSwapItem'
import { exerciseData } from '~/assets/data/exerciseData'
import { customLog } from '~/helpers/CustomLog'

const pbShortNames = {
  upper: {
    0: 'LT',
    1: 'BI',
    2: 'CH',
    3: 'SH',
    4: 'TR',
  },
  lower: {
    0: 'CL',
    1: 'GL',
    2: 'HM',
    3: 'QD',
  },
}

export default function ExerciseSwap({ navigation, route }) {
  const {
    exerciseDetails,
    currentWeek,
    currentDay,
    index,
    swapCategory,
    exerciseCode,
    isAccessory,
    blockType,
    cycleID,
  } = useTypedSelector((state) => state.exerciseSwap)

  const { exerciseShortcode } = exerciseDetails || { exerciseShortcode: null }
  const userID = useTypedSelector((state) => state.firebase.auth.uid)
  const exercisePath = `users/${userID}/exercises`

  const userProgram = useTypedSelector(
    ({ firestore: { data } }) => data.userProgram
  )

  const userSwapExercises = useTypedSelector(
    ({ firestore: { ordered } }) => ordered.userSwapExercises
  )

  // const exercise = useTypedSelector(({firestore: {data}}) => data.thisExercise)

  // const altExercises = useTypedSelector(({firestore: {data}}) => data.altExercises)
  const swapCategories = []

  const [swaps, setSwaps] = useState([])

  // console.log({exerciseDetails, exerciseCode, swapCategory});

  useFirestoreConnect([
    {
      collection: exercisePath,
      where: [
        ['isUserExercise', '==', true],
        ['categories', 'array-contains', swapCategory],
      ],
      storeAs: 'userSwapExercises',
    },
  ])

  //     const findMainLift = () => useFirestoreConnect([{
  //     collection: exercisePath,
  //     doc: exerciseShortcode,
  //     storeAs:'thisExercise'
  // }, {
  //     collection: exercisePath,
  //     where: ['swapCategories', 'array-contains-any', swapCategories],
  //     storeAs: 'altExercises'
  // }])

  // const findThisLift = () => useFirestoreConnect([{
  //     collection: exercisePath,
  //     doc: exerciseShortcode,
  //     storeAs:'thisExercise'
  // }])

  //     const findAccLift = () => {

  //        return  useFirestoreConnect([{
  //         collection: exercisePath,
  //         orderBy: ['exerciseName'],
  //         where: ['categories', 'array-contains', swapCategory],
  //         storeAs: 'altExercises'
  //     }])

  // }

  let sortedExercises = []
  let swapCode = ''

  useEffect(() => {
    const swapCats = []

    if (
      !isAccessory &&
      exerciseCode &&
      swapCategory?.length > 2 &&
      typeof exerciseCode.type !== 'undefined'
    ) {
      const programInfo = userProgram?.programDetails?.userProgramData
      if (programInfo?.programIndex === 1) {
        customLog({
          qd: programInfo?.powerbuilding.lowerFocus,
          up: programInfo?.powerbuilding.upperFocus,
        })
        const bpFocus = ['SQ', 'DL'].includes(exerciseCode.movement)
          ? pbShortNames.lower[programInfo?.powerbuilding.lowerFocus]
          : pbShortNames.upper[programInfo?.powerbuilding.upperFocus]
        swapCode = `${exerciseCode.movement}_${bpFocus}_PB`
      } else {
        let codeMovementType
        if (['A', 'B', 'C', 'D'].indexOf(exerciseCode.type) !== -1) {
          codeMovementType = 'AD'
        } else if (exerciseCode.type.includes('M')) {
          codeMovementType = 'MF'
        } else if (exerciseCode.type.includes('L')) {
          codeMovementType = 'L'
        } else if (exerciseCode.type.includes('T')) {
          codeMovementType = 'COMP'
        }
        swapCode = `${exerciseCode.movement}_${exerciseCode.weakness}_${codeMovementType}`
      }

      for (let i = 0; i < 10; i++) {
        swapCats.push(`${swapCode}_${i}`)
      }

      customLog(swapCats, 'Exercise Swap Categories')
      setSwaps(swapCats)

      // findMainLift()
      // if(altExercises && !isEmpty(altExercises)){
      // sortedExercises = Object.values(altExercises).sort((a, b) => {
      //     const aFiltered = a?.swapCategories?.filter(a => a.includes(`${swapCode}_`))
      //     const bFiltered = b?.swapCategories?.filter(b=> b.includes(`${swapCode}_`))
      //     if(aFiltered && aFiltered && aFiltered?.length > 0 && bFiltered?.length > 0) {
      //       return aFiltered[0].localeCompare(bFiltered[0])
      //     }
      //     return
      //   })
      // }
      // }
    } else {
      if (['BN', 'SQ', 'DL'].includes(swapCategory)) {
        switch (swapCategory) {
          case 'BN':
            setSwaps(['BN0', 'BN52', 'BN61', 'BN54', 'BN80'])
            break
          case 'SQ':
            setSwaps(['SQ5', 'SQ0', 'SQ3', 'QD35', 'SQ11'])
            break
          case 'DL':
            setSwaps(['DL14', 'DL150', 'DL126', 'DL0', 'PC38'])
            break
        }
      } else {
        setSwaps([swapCategory])
        customLog({ swapCategory }, 'Exercise Swap Categories')
      }
      // if(exerciseShortcode) {
      //     // findThisLift()
      // }
      // findAccLift()
      // if(!isEmpty(altExercises)){
      //     sortedExercises = Object.values(altExercises)
      //     swapCode = `${exerciseCode.movement}`
      // }
    }
  }, [exerciseCode, swapCategory, exerciseShortcode])

  const exercise = exerciseData.find(
    ({ exerciseShortcode: shortCode }) => shortCode === exerciseShortcode
  )

  const altExercises = useMemo(() => {
    const allExercises = [...exerciseData, ...(userSwapExercises || [])]
    return allExercises?.filter(
      ({
        swapCategories: exerciseSwap,
        pbSwapCategories,
        categories,
        primaryCategory,
        isAccessory: canAccessory,
        isUserExercise = false,
        exerciseShortcode,
      }) => {
        const allCategories = !isAccessory
          ? [...(exerciseSwap || []), ...(pbSwapCategories || [])]
          : categories

        if (['BN', 'SQ', 'DL'].includes(swapCategory)) {
          if (swaps.includes(exerciseShortcode)) {
            return true
          }
        }

        if (
          (isAccessory || swapCategory.length === 2) &&
          !canAccessory &&
          !isUserExercise
        ) {
          return false
        }

        if (
          (isAccessory || swapCategory.length === 2) &&
          categories.filter((code) => swaps.includes(code)).length > 0
        ) {
          return true
        } else {
          if (allCategories.find((code) => swaps.includes(code))) {
            return true
          }
        }

        return false
      }
    )
  }, [swaps, userSwapExercises])

  sortedExercises = Object.values(altExercises)
    ?.sort((a, b) => {
      if (!isAccessory) {
        const aFiltered = a?.swapCategories?.filter((a) =>
          a.includes(`${swapCode}_`)
        )
        const bFiltered = b?.swapCategories?.filter((b) =>
          b.includes(`${swapCode}_`)
        )
        if (
          aFiltered &&
          aFiltered &&
          aFiltered?.length > 0 &&
          bFiltered?.length > 0
        ) {
          return aFiltered[0].localeCompare(bFiltered[0])
        }
      }

      return a.exerciseName.localeCompare(b.exerciseName)
    })
    ?.filter((exercise) => exerciseShortcode !== exercise.exerciseShortcode)

  // if(!isLoaded(exercise) && !isLoaded(altExercises) && sortedExercises?.length === 0 || isEmpty(altExercises)) {
  //     return <Layout style={{ flex: 1 }} />
  // }
  if (sortedExercises.length === 0) {
    return (
      <Layout style={{ flex: 1 }} >
        <ExerciseSwapFooter navigation={navigation} />
      </Layout>

    )
  }

  return (
    <Layout style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={{ marginTop: 15, paddingBottom: 80 }}
        ListHeaderComponent={ExerciseSwapHeader}
        ListFooterComponent={<ExerciseSwapFooter navigation={navigation} />}
        data={sortedExercises}
        renderItem={({ item }) => (
          <ExerciseSwapItem item={item} navigation={navigation} />
        )}
        keyExtractor={(item, index) => `${item.exerciseShortcode}${index}`}
      />
    </Layout>
  )
}

const ExerciseSwapHeader = () => {
  return (
    <Text category='h2' style={{ paddingHorizontal: 15 }}>
      Recommended
    </Text>
  )
}

const ExerciseSwapFooter = ({ navigation }) => {
  return (
    <Button
      onPress={() => navigation.navigate('All Exercises', { inModal: true })}
      appearance='ghost'>
      Show all exercises
    </Button>
  )
}
