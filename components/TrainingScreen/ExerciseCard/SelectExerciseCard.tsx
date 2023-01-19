import { memo } from 'react';
import { StyleSheet, Pressable, View } from 'react-native'
import { Layout, Text, } from '@ui-kitten/components'
import {exerciseNiceNames} from '~/components/TrainingScreen/ExerciseCard/ExerciseCardData'

const SelectExerciseCard = ({lift, setCardHeight, swapExercise}) => {

        return (
            <Layout level="3" style={styles.cardContainer}
                onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
            >
                <Pressable onPress={swapExercise} style={ styles.cardButton}>

                    <Text category="h5" appearance="hint">Select {exerciseNiceNames[lift.exercise.category]} Exercise</Text>
                </Pressable>

            </Layout>
        )
}

export default memo(SelectExerciseCard)

const styles = StyleSheet.create({

        cardContainer: {
           borderRadius: 16, padding: 15, paddingLeft: 30, minHeight: 100, width: "95%", alignSelf: "center",
           marginTop: 15
            // shadowColor: "#000",
            // shadowOffset: {
            //     width: 0,
            //     height: 2,
            // },
            // shadowOpacity: 0.23,
            // shadowRadius: 2.62,
            
            // elevation: 4,
        },
        cardButton: {
            ...StyleSheet.absoluteFillObject,
            alignItems: 'center',
            justifyContent: 'center'
        }
})
