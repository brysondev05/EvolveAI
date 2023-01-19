import { useRef, useState, useEffect } from 'react';
import { Button, Divider, Layout, Text, Icon } from '@ui-kitten/components'
import { Animated, FlatList, Pressable, StyleSheet, View } from 'react-native'
import { ExerciseItem } from './ListItem';

const ForwardIcon = (props) => (
    <Icon {...props} name='plus-circle-outline' />
);

export const List = ({ exerciseNiceName, navigation, type, val, isExerciseSwap, theme }) => {
    const fadeAnim = useRef(new Animated.Value(0.75)).current
    


    const [isShown, setIsShow] = useState(false)
    useEffect(() => {
        if(isShown){

        Animated.timing(
          fadeAnim,
          {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
          }
        ).start();
        } else {
            Animated.timing(
                fadeAnim,
                {
                  toValue: 0.75,
                  duration: 400,
                  useNativeDriver: true
                }
              ).start();  
        }
      }, [isShown])

    return (
        <View style={{ marginTop: 5 }}>
            <Layout level="4" style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginHorizontal: 15, borderRadius: 14, paddingVertical: 15, marginBottom: 5 }}>
                <Pressable onPress={() => setIsShow(prev => !prev)} style={{ justifyContent: 'space-between', flexDirection: 'row', flex: 1, alignItems: 'center'}}>
                    <Text category="h2" style={{ }}>{exerciseNiceName}</Text>
                    <Animated.View style={{backgroundColor: theme['background-basic-color-3'], borderRadius: 20, padding: 5,
                    opacity: fadeAnim, 
                transform: [{
                    rotate: fadeAnim.interpolate({
                      inputRange: [0.75, 1],
                      outputRange: ['0deg', '90deg']  // 0 : 150, 0.5 : 75, 1 : 0
                    }),
                  }], }}>
                    <Icon name='arrow-ios-forward' style={{ width: 30, height: 30}} fill="white" />
                    </Animated.View>
           
                </Pressable>
                {/* <Button
                    status="primary"
                    appearance="ghost"
                    accessoryRight={ForwardIcon}
                    size="small"

                    onPress={() => navigation.navigate("Create Exercise", { category: type })}>
                    Add Exercise
</Button> */}
            </Layout>
            {isShown && (

                <FlatList
                    initialNumToRender={5}
                    data={val}
                    renderItem={({ item, index }) => (
                        <ExerciseItem exercise={item} navigation={navigation} key={item.exerciseShortcode} isExerciseSwap={isExerciseSwap} theme={theme} index={index} listLength={val?.length} />
                    )}
                    keyExtractor={item => item.exerciseShortcode}
                />

            )}

        </View>
    )
}

export default List

const styles = StyleSheet.create({
    cardList: {
        marginHorizontal: 10,
        padding: 20, marginBottom: 10, borderRadius: 14,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 5,
    }
})
