import { useEffect } from 'react'
import { View } from 'react-native'
import { Text, Toggle } from '@ui-kitten/components'
import CalculateMax from '~/helpers/Calculations'

export default function MaxCalculation({
  weight,
  reps,
  rpe,
  units = 'kg',
  max,
  setMax,
  maxUpdate,
  setMaxUpdate,
}) {
  useEffect(() => {
    if (reps > 0 && reps <= 12 && rpe > 0 && Number(weight) > 0) {
      setMax(CalculateMax({ weight, reps, rpe, units }))
    } else {
      setMax([0, 0])
    }
  }, [reps, rpe, weight, units, maxUpdate])

  return (
    <View style={{ marginTop: 20 }}>
      <Text category='label' appearance='hint'>
        Estimated Max
      </Text>
      <View style={{ alignItems: 'center', marginVertical: 10 }}>
        <Text category='h2'>
          {max[0] > 0 ? `${max.join(' - ')}${units}` : '-'}
        </Text>
      </View>

      {max[0] > 0 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}>
          <Text>Update Max?</Text>
          <Toggle
            status='control'
            style={{
              marginVertical: 20,
              paddingLeft: 20,
              justifyContent: 'flex-end',
            }}
            checked={maxUpdate}
            onChange={setMaxUpdate}
          />
        </View>
      )}
    </View>
  )
}
