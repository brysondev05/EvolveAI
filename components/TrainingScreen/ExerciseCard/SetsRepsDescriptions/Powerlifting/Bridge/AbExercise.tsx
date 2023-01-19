import { View} from 'react-native'
import {Text} from '@ui-kitten/components'


export default function AbExerciseHeader({lift, set, exerciseDetails, setValues, isPerSide}) {

    let repType =  'reps'

    if(exerciseDetails.style === 'TUT' ) {
        repType = 'seconds' 
    }
    

    return (
        <View>
          
            <Text category="h6">
            {set?.setRange?.map((rep, index, arr) => `${rep}${index < arr?.length - 1 ? '-' : ''}`)} sets
            </Text>
            <Text category="h6">
            {set?.reps?.map((rep, index) => `${rep}${index < set.reps?.length - 1 ? '-' : ''}`)} {repType} {isPerSide ? 'per side' : ''}
            </Text>
            </View>
    )
}
