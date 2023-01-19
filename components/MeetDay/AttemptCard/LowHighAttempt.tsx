import { View } from 'react-native'
import {Text, useTheme } from '@ui-kitten/components'
import { convertToKG, convertToLB } from '~/helpers/Calculations'

const LowHighAttempt = ({type = 'Low', attempt = 0, units}) => {
const theme = useTheme()
const color = type === 'Low' ? theme['color-success-500'] : theme['color-warning-500']

const actualAttempt = units.toLowerCase() === 'lb' ? `${convertToLB(attempt)}lb` : `${attempt}kg`

const convertedAttempt = units.toLowerCase() === 'kg' ? `${convertToLB(attempt, 1)}lb` : `${convertToKG(convertToLB(attempt), 1)}kg`
return (
        <View style={{ alignItems: 'center', flex: 1}}>
        <Text category="s2" appearance="hint">
                {type}
            </Text>
            <Text category="s1" style={{ color }}>
            {actualAttempt}
            </Text>
            <Text category="s2" appearance="hint">
            {convertedAttempt}
            </Text>
        </View>
   
    )
}

export default LowHighAttempt


