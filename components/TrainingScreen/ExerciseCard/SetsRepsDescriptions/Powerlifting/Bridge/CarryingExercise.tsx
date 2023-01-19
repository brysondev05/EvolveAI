import { View} from 'react-native'
import {Text} from '@ui-kitten/components'


export default function CarryingExerciseHeader({lift, set, exerciseDetails, setValues, isPerSide}) {

    let repType =  'yards'

    // if(exerciseDetails.style === 'TUT' ) {
    //     repType = 'seconds' 
    // }

    return (
        <View>
             <Text category="h6">
             {set.reps.map((rep, index) => `${rep}${index < set.reps?.length - 1 ? '-' : ''}`)} {repType} {isPerSide ? 'per side' : ''}
            </Text>
            <Text category="h6">
            {setValues?.length} x {lift.time} min {lift.timing}
            </Text>
            </View>
    )
}
