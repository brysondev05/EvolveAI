import { View} from 'react-native'
import {Text} from '@ui-kitten/components'


export default function BridgeMainLiftHeader({lift, set, exerciseDetails, isPerSide}) {

    let repType =  'reps'

    if(exerciseDetails.style === 'TUT' ) {
        repType = 'seconds' 
    }

    return (
        <View>
        <Text category="c1" style={{ fontSize: 18 }}>
           {lift.totalReps} total reps {isPerSide ? 'per side' : ''}
            </Text>
                     <Text category="c1" style={{ fontSize: 18 }}>
            {set.reps.map((rep, index, arr) => `${rep}${index < arr?.length - 1 ? '-' : ''}`)} {repType} per set
            </Text>
            <Text category="c1" style={{ fontSize: 18 }}>
           {lift.restTime} seconds rest
            </Text>
            </View>
    )
}
