import { Pressable, StyleSheet, View } from 'react-native'
import {Text} from '@ui-kitten/components'
const ReadinessButton = ({type, theme, onPress, value}) => {
    
    return (
        <View style={{ flex: 1, marginHorizontal: 7.5, }}>
        <Text style={{ textAlign: 'center', marginBottom: 5 }}>{type}</Text>
        <Pressable style={{ paddingVertical: 10, paddingHorizontal: 15, backgroundColor: theme['background-basic-color-1'], borderRadius: 20 }} onPress={onPress}>


<Text category="s1" style={{ color: theme['text-primary-color'], textAlign: 'center' }}>
{value+1}
</Text>
</Pressable>
      </View>
    )
}

export default ReadinessButton

const styles = StyleSheet.create({})
