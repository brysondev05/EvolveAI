import { useMemo, useEffect } from 'react'
import { View } from 'react-native'
import { Divider, Text } from '@ui-kitten/components'
import { useTypedSelector } from '~/reduxStore/reducers'
import { convertToKG, convertToLB, round } from '~/helpers/Calculations'
import NumberInput from '../../presentational/NumberInput'
import useBlockTypeInfo from '~/hooks/programInfo/useBlockTypeInfo'
import useExercises from '~/hooks/programInfo/useExercises'
import { customLog } from '~/helpers/CustomLog'

const findCeilAvg = (items, key, increment) =>
  round(
    Math.ceil(
      items.reduce((total, score) => total + Number(score?.[key]), 0) /
        items?.length
    ),
    increment
  )

const findAverage = (items, key, increment) =>
  round(
    items.reduce((total, score) => total + Number(score?.[key]), 0) /
      items?.length,
    increment
  )

const getMaxReps = (blockPeriodization, blockVersion, type) => {
  if (type === 'TUT') {
    return 60
  }
  if (blockPeriodization === 'P') {
    return 10000
  }
  if (!blockPeriodization || !blockVersion) {
    customLog('no block info', 'update10RM')
    return 16
  }
  return maxReps[blockPeriodization][blockVersion]
}
const maxReps = {
  H: {
    1: 16,
    2: 14,
    3: 12,
    4: 10,
  },
  S: {
    1: 12,
    2: 10,
    3: 8,
    4: 8,
  },
}
const Update10RM = ({
  dayInfo,
  performance,
  lift,
  performanceSheet,
  max10Update,
  setMax10Update,
}) => {
  // const exercise = useTypedSelector(({firestore: {data}}) => data?.exercises?.[lift?.exercise?.exerciseShortcode])
  const { exercises, allExercisesLoaded } = useExercises()
  const exercise =
    (allExercisesLoaded && exercises?.[lift?.exercise?.exerciseShortcode]) ||
    null
  // const [max10Update, setMax10Update] = React.useState(performanceSheet?.weightIncrement)

  const previousPerformance = useMemo(
    () =>
      lift?.performance &&
      Object.entries(lift?.performance)
        .filter(([key]) => Number(key) !== performanceSheet?.setIndex)
        .map(([key, perf]) => perf),
    [lift, lift?.performance, performanceSheet?.setIndex]
  )

  const { blockPeriodization, blockVersion } = useBlockTypeInfo(
    dayInfo?.blockType
  )
  const rm10 = exercise?.rm10

  useEffect(() => {
    const finalPerformance = [...(previousPerformance || []), performance]

    const avgReps = findCeilAvg(finalPerformance, 'reps', 1)
    const avgRIR = findAverage(finalPerformance, 'rpe', 1)
    let avgWeight = findAverage(
      finalPerformance,
      'weight',
      performanceSheet.weightIncrement
    )

    const maxReps = getMaxReps(
      blockPeriodization,
      blockVersion,
      exercise?.style
    )

    const workingWeight = round(
      exercise?.rm10?.amount * (blockPeriodization === 'H' ? 0.7 : 0.8),
      performanceSheet.weightIncrement
    )

    customLog(
      {
        avgRIR,
        avgReps,
        avgWeight,
        maxReps,
        workingWeight,
        blockPeriodization,
        blockVersion,
      },
      'Performance'
    )

    if (
      rm10 &&
      performance?.units?.toLowerCase() !== rm10?.units?.toLowerCase()
    ) {
      avgWeight =
        rm10?.units?.toLowerCase() === 'kg'
          ? convertToKG(avgWeight, performanceSheet?.weightIncrement)
          : convertToLB(avgWeight, performanceSheet?.weightIncrement)
    }
    if (blockPeriodization && blockVersion) {
      if (Number(avgReps) >= maxReps && Number(avgWeight) >= workingWeight) {
        setMax10Update(performanceSheet?.weightIncrement)
      } else {
        setMax10Update(null)
      }
    } else {
      setMax10Update(null)
    }
  }, [previousPerformance, performance, blockPeriodization, blockVersion])

  const handleMaxChange = (change) => {
    if (change === 'increase') {
      setMax10Update(Number(max10Update) + performanceSheet.weightIncrement)
    }
    if (change === 'decrease' && Number(max10Update) > 0) {
      setMax10Update(Number(max10Update) - performanceSheet.weightIncrement)
    }
  }

  if (max10Update !== null) {
    return (
      <View>
        <Divider style={{ marginBottom: 10 }} />

        <NumberInput
          level='2'
          units={exercise?.units}
          value={String(max10Update)}
          onChangeText={(nextText: string) => setMax10Update(nextText)}
          handleChange={handleMaxChange}
          canEdit={false}
          placeholder='weight'
          label='Increase Estimated 10 Rep Max'
          subLabel='We recommend increasing by the next weight up available to you (e.g. 5lb/2.5kg). If you are using only bands, set this value to zero (0) and adjust band tension to make the exercise more challenging. Once you complete this workout, we will increase the max for you.
              '
          prefix={Number(max10Update) !== 0 && '+'}
        />
      </View>
    )
  }

  return null
}

export default Update10RM
