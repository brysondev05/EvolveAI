import { useEffect } from 'react';
import { View } from 'react-native'
import { Text, Toggle } from '@ui-kitten/components'
import CalculateMax from '~/helpers/Calculations';



export default function MaxCalculation10({ weight, reps, rpe, units = 'kg', max, setMax, maxUpdate, usingBodyweight = false, usesBands = false, weightIncrement }) {



  useEffect(() => {

    if (reps > 0 && reps <= 15 && rpe <5 && Number(weight) > 0) {

      const newMax = CalculateMax({ weight, reps, rpe: +(10 - Number(rpe)), units: 'lb', isAccessory: true, weightIncrement })

      const percentage = 0.739
      const estimatedMax = Math.floor(Math.floor(newMax[1] * percentage) / weightIncrement) * weightIncrement

      
      if(reps === '10' && ['0','1'].includes(rpe) || reps === '10' && weight > estimatedMax)  {
        setMax(weight)
        
      } else {
        setMax(estimatedMax)
    
      }
    } else {
      setMax(0);
    }
  }, [reps, rpe, weight, units, maxUpdate]);

  const isBanded = max === 0 && usesBands

  const maxDisplay = usingBodyweight ? `Bodyweight ${isBanded ? '\n+ Bands' : ''}` : isBanded? 'Banded' : max > 0 ? `${max}${units}` : '-'

  return (
    <View style={{ marginTop: 20 }}>
      <Text category="label" appearance="hint">
        Estimated 10 Rep Max
         </Text>
      <View style={{ alignItems: 'center', marginVertical: 10 }}>
        <Text category="h2">
          {maxDisplay}
        </Text>

      </View>


      {/* {max > 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Text>Update 10 Rep Max?</Text>
          <Toggle
            style={{ marginVertical: 20, paddingLeft: 20, justifyContent: 'flex-end' }}
            checked={maxUpdate}
            onChange={setMaxUpdate} />
        </View>
      )} */}

    </View>
  )
} 