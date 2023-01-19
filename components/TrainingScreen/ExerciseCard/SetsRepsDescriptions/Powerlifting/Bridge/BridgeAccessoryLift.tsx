import { View} from 'react-native'
import {Text} from '@ui-kitten/components'


export default function BridgeAccessoryLiftHeader({lift, set, exerciseDetails, isPerSide}) {

    let repType =  'reps'

    if(exerciseDetails.style === 'TUT' ) {
        repType = 'seconds' 
    }

    return (
        <View>
             <Text category="h6">
            {set.reps.map((rep, index, arr) => `${rep}${index < arr?.length - 1 ? '-' : ''}`)} total {repType} {isPerSide ? 'per side' : ''}
            </Text>
            <Text category="h6">
            {lift.repsPerSet.map((rep, index,arr) => `${rep}${index < arr?.length - 1 ? '-' : ''}`)} {repType} per set
            </Text>
            </View>
    )
}
