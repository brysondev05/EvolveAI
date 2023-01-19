import {  View } from 'react-native'
import { Button } from '@ui-kitten/components'

const Modifiers = ({usingBodyweight, setUsingBodyweight, usesBands, setUsesBands, bandsButtons}) => {
    return (
        <View style={{ marginBottom: 15  }}>          
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', }}>
        
        <Button size="small" style={{width: '48%',  }} appearance={usingBodyweight ? 'filled' : 'outline'} onPress={() => setUsingBodyweight(!usingBodyweight)}>Bodyweight</Button>

        <Button size="small" style={{ width: '48%', }} appearance={usesBands ? 'filled' : 'outline'} onPress={() => setUsesBands(!usesBands)}>Bands</Button>
        
        </View>
        {bandsButtons}</View>
    )
}

export default Modifiers

