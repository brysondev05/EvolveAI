import { View } from 'react-native'
import { Text } from '@ui-kitten/components'

export default function TopSetHeader({ set, exerciseDetails, isPerSide }) {
  let repType = 'reps'

  if (set.reps?.[0] === 1) {
    repType = 'rep'
  }

  if (set.reps?.[0] === -1) {
    repType = ''
  }

  if (exerciseDetails.style === 'TUT') {
    repType = 'seconds'
  }

  const setDisplay = set.reps
    ? set.reps[0] === -1
      ? 'AMRAP'
      : set.reps.map(
          (rep, index) => `${rep}${index < set.reps.length - 1 ? '-' : ''}`
        )
    : null

  return (
    <View>
      <Text category='c1' style={{ fontSize: 18 }}>
        1 set x {setDisplay} {repType} {isPerSide ? 'per side' : ''}
      </Text>
    </View>
  )
}
