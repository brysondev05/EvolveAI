import { View} from 'react-native'
import {Text} from '@ui-kitten/components'


export default function JumpingExerciseHeader({lift, set, exerciseDetails, setValues, isPerSide}) {

    let repType =  'yards'

    // if(exerciseDetails.style === 'TUT' ) {
    //     repType = 'seconds' 
    // }

    return (
        <View>
       
            <Text category="h6">
            {setValues?.length} x {set?.reps.map((rep, index) => `${rep}${index < set?.reps?.length - 1 ? '-' : ''}`)} {isPerSide ? 'per side' : ''} ({lift?.intensity*100}% of max)
            </Text>
        
            </View>
    )
}
