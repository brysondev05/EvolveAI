import { useState, useEffect } from 'react'
import { StyleSheet, View, Alert, FlatList } from 'react-native'
import { Layout, Button } from '@ui-kitten/components'
import GradientHeader from '~/components/presentational/GradientHeader'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import {
  useFirestoreConnect,
  isEmpty,
  useFirestore,
} from 'react-redux-firebase'
import ReviewCard from '~/components/MeetDay/ReviewCard'
import { createFinalVolume } from '~/reduxStore/actions/powerlifting/cycleAdjustments/endOfCycleActions'
import { convertToKG, convertToLB } from '~/helpers/Calculations'
import moment from 'moment'
import { dateToDate } from '~/helpers/Dates'

const MeetDayReview = ({ navigation, route }) => {
  const { userUnits } = route.params || { userUnits: 0 }
  const meetDay = useTypedSelector(({ firestore: { data } }) => data.meetDay)
  const userProgram = useTypedSelector(
    ({ firestore: { data } }) => data.userProgram
  )

  const userID = useTypedSelector(({ firebase: { auth } }) => auth.uid)

  const programID = moment(
    dateToDate(userProgram?.programDetails?.userProgramData.startDate)
  ).format('YYYYMMDD')
  // const userUnits = useTypedSelector(({firebase: {profile}}) => profile.units)

  const dispatch = useDispatch()
  const firestore = useFirestore()

  useFirestoreConnect([
    {
      collection: `users/${userID}/program`,
      doc: 'meetDay',
      storeAs: 'meetDay',
    },
  ])
  const [performance, setPerformance] = useState({
    squat: {
      weight: '',
      units: 'kg',
    },
    bench: {
      weight: '',
      units: 'kg',
    },
    deadlift: {
      weight: '',
      units: 'kg',
    },
  })

  const [feedback, setFeedback] = useState({
    squat: 0,
    bench: 0,
    deadlift: 0,
  })

  const [updateMax, setUpdateMax] = useState({
    squat: true,
    bench: true,
    deadlift: true,
  })

  const handleVolumeChangeOnly = async () => {
    await dispatch(createFinalVolume())
    return navigation.navigate('Dashboard')
  }
  const handleCompleteProgram = async () => {
    await dispatch(createFinalVolume())
    return navigation.navigate('End of program')
  }

  const postFeedback = async () => {
    const { squat, bench, deadlift } = performance

    if (!squat.weight || !bench.weight || !deadlift.weight) {
      return Alert.alert(
        'Check New Maxes',
        'Please check that all maxes are filled out before completing your meet'
      )
    }
    const benchPerformance = {
      amount: Number(bench.weight),
      date: new Date(),
      type: 'meet',
      units: bench.units,
    }
    const squatPerformance = {
      amount:
        squat.units === 'kg' ? Number(squat.weight) : convertToKG(squat.weight),
      date: new Date(),
      type: 'meet',
      units: squat.units,
    }
    const deadliftPerformance = {
      amount: Number(deadlift.weight),
      date: new Date(),
      type: 'meet',
      units: deadlift.units,
    }

    const batch = firestore.batch()

    const meetDayDoc = firestore.doc(`users/${userID}/program/meetDay`)
    const benchDoc = firestore.doc(`users/${userID}/exercises/BN0`)
    const benchHistory = firestore.collection(
      `users/${userID}/exercises/BN0/history`
    )
    const squatDoc = firestore.doc(`users/${userID}/exercises/SQ0`)
    const squatHistory = firestore.collection(
      `users/${userID}/exercises/SQ0/history`
    )
    const deadliftDoc = firestore.doc(`users/${userID}/exercises/DL0`)
    const deadliftHistory = firestore.collection(
      `users/${userID}/exercises/DL0/history`
    )

    const programDoc = firestore.doc(`users/${userID}/program/programDetails`)

    const meetDoc = `${programID}_meet`

    batch.update(meetDayDoc, {
      feedback,
      performance,
      status: 'completed',
    })
    if (updateMax.bench) {
      batch.update(benchDoc, {
        max: benchPerformance,
      })

      batch.update(programDoc, {
        'userLiftingData.bench.max':
          bench.units === 'kg'
            ? Number(bench.weight)
            : convertToKG(bench.weight),
      })
    }

    batch.set(benchHistory.doc(meetDoc), benchPerformance)

    batch.set(squatHistory.doc(meetDoc), squatPerformance)
    if (updateMax.squat) {
      batch.update(squatDoc, {
        max: squatPerformance,
      })
      batch.update(programDoc, {
        'userLiftingData.squat.max':
          squat.units === 'kg'
            ? Number(squat.weight)
            : convertToKG(squat.weight),
      })
    }

    batch.set(deadliftHistory.doc(meetDoc), deadliftPerformance)

    if (updateMax.deadlift) {
      batch.update(deadliftDoc, {
        max: deadliftPerformance,
      }),
        batch.update(programDoc, {
          'userLiftingData.deadlift.max':
            deadlift.units === 'kg'
              ? Number(deadlift.weight)
              : convertToKG(deadlift.weight),
        })
    }

    await batch.commit()

    return Alert.alert(
      'All done!',
      'Congratulations on finishing your first program. Would you like to plan your next program? This will clear your current training cycle and start fresh',
      [
        {
          text: 'Yes, plan my next program',
          onPress: () => handleCompleteProgram(),

          style: 'destructive',
        },
        {
          text: 'Later',
          onPress: () => handleVolumeChangeOnly(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    )
  }
  useEffect(() => {
    if (!isEmpty(meetDay)) {
      const bestSquat = Object.values(meetDay.squat)
        .filter((val) => val.status === 'pass')
        .sort((valA, valB) => valB.attempt?.weight - valA.attempt?.weight)[0]

      const bestBench = Object.values(meetDay.bench)
        .filter((val) => val.status === 'pass')
        .sort((valA, valB) => valB.attempt?.weight - valA.attempt?.weight)[0]
      const bestDeadlift = Object.values(meetDay.deadlift)
        .filter((val) => val.status === 'pass')
        .sort((valA, valB) => valB.attempt?.weight - valA.attempt?.weight)[0]

      const convertedWeight = (weight) =>
        userUnits === 0 ? String(convertToLB(weight)) : String(weight)
      const finalDeadlift = bestDeadlift && {
        deadlift: {
          weight: convertedWeight(bestDeadlift.attempt.weight),
          units: userUnits === 0 ? 'lb' : 'kg',
        },
      }
      const finalBench = bestBench && {
        bench: {
          weight: convertedWeight(bestBench.attempt.weight),
          units: userUnits === 0 ? 'lb' : 'kg',
        },
      }
      const finalSquat = bestSquat && {
        squat: {
          weight: convertedWeight(bestSquat.attempt.weight),
          units: userUnits === 0 ? 'lb' : 'kg',
        },
      }
      const finalPerformance = {
        ...finalSquat,
        ...finalBench,
        ...finalDeadlift,
      }
      setPerformance({ ...performance, ...finalPerformance })
    }
  }, [meetDay])

  const lifts = [
    { type: 'Squat', attempts: meetDay?.squat },
    { type: 'Bench', attempts: meetDay?.bench },
    { type: 'Deadlift', attempts: meetDay?.deadlift },
  ]
  return (
    <Layout style={{ flex: 1 }}>
      <FlatList
        data={lifts}
        ListHeaderComponent={() => (
          <GradientHeader
            title='Meet Day Review'
            subheading={`Congratulations on completing your meet! ${'\n'}Let's review how your test day went.`}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        ListFooterComponentStyle={{ marginBottom: 15 }}
        renderItem={({ item }) => (
          <ReviewCard
            liftType={item.type}
            feedback={feedback[item.type.toLowerCase()]}
            setFeedback={(next) =>
              setFeedback({ ...feedback, [item.type.toLowerCase()]: next })
            }
            updateMax={updateMax[item.type.toLowerCase()]}
            setUpdateMax={(next) =>
              setUpdateMax({ ...updateMax, [item.type.toLowerCase()]: next })
            }
            performance={performance[item.type.toLowerCase()]}
            setPerformance={(next) =>
              setPerformance({
                ...performance,
                [item.type.toLowerCase()]: next,
              })
            }
          />
        )}
        ListFooterComponent={() => (
          <Button size='large' onPress={() => postFeedback()}>
            Finish Review
          </Button>
        )}
        keyExtractor={(item) => item.type}
      />
    </Layout>
  )
}

export default MeetDayReview

const styles = StyleSheet.create({})
