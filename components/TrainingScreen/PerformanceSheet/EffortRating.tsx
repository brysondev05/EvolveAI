import { View } from 'react-native'
import { Divider, Text } from '@ui-kitten/components'
import NumberInput from '~/components/presentational/NumberInput'

const rpeValues = {
  5: 'Very easy, felt like a warmup',
  5.5: 'Very easy, felt like a warmup',
  6: 'Could confidently do 4 more reps',
  6.5: 'Could maybe do 4 more reps',
  7: 'Could confidently do 3 more reps',
  7.5: 'Could maybe do 3 more reps',
  8: 'Could confidently do 2 more reps',
  8.5: 'Could maybe do 2 more reps',
  9: 'Could confidently do 1 more rep',
  9.5: 'Could maybe do 1 more rep',
  10: 'Maximum effort',
}

export const EffortRating = ({
  exerciseType,
  setPerformance,
  handleWeightRepsRPEChange,
  movementType,
  isAccessory,
  performance,
}) => {
  if (
    ['bridgeMainLift', 'regularMainLift'].includes(exerciseType) ||
    (exerciseType === 'setProgram' && !isAccessory)
  ) {
    return (
      <View>
        <NumberInput
          value={performance.rpe}
          onChangeText={(nextText: string) =>
            setPerformance({ ...performance, rpe: nextText })
          }
          handleChange={(change: 'increase' | 'decrease') =>
            handleWeightRepsRPEChange({
              type: 'rpe',
              change,
              max: 10,
              min: 5,
            })
          }
          canEdit={false}
          placeholder='RPE'
          level='2'
          label='Rate of Perceived Exertion'
        />

        <Text category='label' style={{ textAlign: 'center' }}>
          {rpeValues[performance.rpe]}
        </Text>
      </View>
    )
  }
  if (
    ['bridgeAccessory', 'regularAccessory'].includes(exerciseType) ||
    movementType === 'JP' ||
    (exerciseType === 'setProgram' && isAccessory)
  ) {
    return (
      <View>
        <NumberInput
          value={performance.rpe}
          onChangeText={(nextText: string) =>
            setPerformance({ ...performance, rpe: nextText })
          }
          handleChange={(change: 'increase' | 'decrease') =>
            handleWeightRepsRPEChange({ type: 'rir', change, max: 5, min: 0 })
          }
          canEdit={false}
          placeholder='RiR'
          level='2'
          label='Reps In Reserve'
        />
        {/* 
          <Text category="label" style={{ textAlign: 'center' }}>{rirValues[performance.rpe]}</Text> */}
      </View>
    )
  }
  return null
}
