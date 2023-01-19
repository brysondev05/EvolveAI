import { View } from 'react-native'
import { Text } from '@ui-kitten/components'

export default function StraightSetHeader({
  set,
  exerciseDetails,
  setValues,
  isPerSide,
}) {
  let repType = set.reps && set.reps[0] === -1 ? '' : 'reps'

  const setDisplay = set.reps
    ? set.reps[0] === -1
      ? 'AMRAP'
      : set.reps.map(
          (rep, index) => `${rep}${index < set.reps.length - 1 ? '-' : ''}`
        )
    : null

  let sets =
    set.setRange && setValues
      ? set?.setRange?.map(
          (set, index, arr) => `${set}${index < arr.length - 1 ? '-' : ''}`
        )
      : Number(setValues?.length)

  if (exerciseDetails.style === 'TUT') {
    repType = 'seconds'
  }
  return (
    <View>
      <Text category='c1' style={{ fontSize: 18 }}>
        {sets} sets x {setDisplay} {repType} {isPerSide ? 'per side' : ''}
      </Text>
    </View>
  )
}
