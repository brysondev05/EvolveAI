import { memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native'
import { Icon, Text, useTheme } from '@ui-kitten/components'

const AddSetButton = memo<{setUserAddedSets: any}>(({ setUserAddedSets }) => {
    const theme = useTheme();

    const handleAddSet = () => {
        setUserAddedSets(prev => {
            console.log(prev);
            return prev + 1            
        })
    }
    return (
        <View style={styles.buttonContainer}>
            <Pressable onPress={handleAddSet}>
                <View style={[styles.button, { backgroundColor: theme['background-basic-color-1'], flexDirection: 'row' }]}>
                <Icon style={styles.addSetIcon} fill={theme['color-primary-500']} name="plus-outline" />
                 <Text style={styles.addSetText}>Add Set</Text>
                </View>
            </Pressable>
        </View>
    )
})

export default AddSetButton

const styles = StyleSheet.create({
    addSetIcon: { width: 25, height: 25 },
    addSetText: { marginLeft: 5 },
    buttonContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 5
    },
    button: { justifyContent: 'center', alignItems: 'center', width: 'auto', height: 50, borderRadius: 50, paddingHorizontal: 15},

})
