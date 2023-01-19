import { View } from 'react-native'
import { Text } from '@ui-kitten/components'

export default function DropSetHeader({
  set,
  exerciseDetails,
  setValues,
  isPerSide,
}) {
  let repType = 'reps'

  if (exerciseDetails.style === 'TUT') {
    repType = 'seconds'
  }

  const sets = setValues.filter((set) => set.type === 'dropSet').length

  return (
    <View>
      <Text category='c1' style={{ fontSize: 18 }}>
        {sets} {sets > 1 ? 'sets' : 'set'} x{' '}
        {set?.reps.map(
          (rep, index) => `${rep}${index < set.reps.length - 1 ? '-' : ''}`
        )}{' '}
        {repType} {isPerSide ? 'per side' : ''}
      </Text>
    </View>
  )
}
