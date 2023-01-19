import {Text, Icon} from '@ui-kitten/components'
import { StyleSheet, View } from 'react-native'

const LargeButtonItem = ({title, description = '', descriptionColor, thisBlock = '', nextBlock = ''}) => {
    return (
        <View key={title} style={styles.itemContainer}>
            {description !== '' && (
       <Text style={styles.buttonText} category="h6">{description}</Text>
            )}
            {thisBlock !== '' && thisBlock !== nextBlock && (
                <>
        
                       <Text appearance="hint" style={[styles.buttonText, {transform: [{translateX: -15}] }]} category="s2">{thisBlock}</Text>
                       </>
            )}
             {nextBlock !== '' && (


                 <View style={{ flexDirection: 'row', justifyContent: 'center'}}>

{thisBlock !== '' && thisBlock !== nextBlock && 
                    <Icon name="undo-outline" fill="#999" style={{ width: 20, height: 20, transform: [{rotateX: "180deg"}, {rotateY: "180deg"},]}} /> }
                       <Text style={styles.buttonText} category="h6">
                                   
                           {nextBlock}</Text>
                           </View>
            )}
     
            <Text style={[styles.buttonText, {color: descriptionColor}]} category="s1"> {title}</Text>
        </View>
    )
}

export default LargeButtonItem

const styles = StyleSheet.create({
    itemContainer: {
        width: '33%',
        justifyContent: 'flex-end'
    },
    buttonText: {
        textAlign: 'center'
    }
})
