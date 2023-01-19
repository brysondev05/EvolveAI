import { View, Text, Modal, Image, TouchableOpacity } from 'react-native'
import React from 'react'

type GoalPopupType = {
    visible: boolean,
    setVisible: Function,
    // onDismiss: Function,
    // onResetGoal: Function,
}

const GoalPopup = ({
    visible = false,
    //setVisible = () => {},
    onDismiss = () => {},
    onResetGoal = () => {},
    resetAvailable = false,
    heighted = true, 
    image = require('../../assets/images/nutrition/finished_goal.png'),
    title = "Congrats,\nYou've reached your diet goal!",
    subtitle = "Please select your next diet goal, if you just finished gaining or losing weight we recommend maintaining for a few weeks."
}) => {
    return (
        <Modal visible={visible} transparent style={{

        }} animationType='slide'>

            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.4)',
                padding: 8,
                justifyContent: 'center'
            }}>
                <View style={{
                    // alignSelf: 'center',
                    height: heighted ? '45%' : '40%',
                    width: '100%',
                    borderRadius: 16,
                    backgroundColor: '#2D385A',
                    // padding: 12,
                    alignItems: 'center',
                    flexDirection: 'column'
                }}>
                    <Image source={image} style={{
                        width: 100,
                        height: 100,
                        marginTop: 28
                    }} resizeMethod='resize' resizeMode='contain' />

                    <Text style={{
                        color: 'white',
                        textAlign: 'center',
                        fontSize: 20,
                        fontWeight: '500',
                        marginTop: 16,
                        paddingHorizontal: 12,
                        lineHeight: 24
                    }}>{title}</Text>

                    <Text style={{
                        color: 'white',
                        textAlign: 'center',
                        fontSize: 16,
                        marginBottom: 16,
                        marginTop: 16,
                        paddingHorizontal: 8,
                        lineHeight: 20,
                        fontWeight: '400'
                    }}>{subtitle}</Text>

                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        height: '13%',
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16,
                        flexDirection: 'row'
                    }}>

                        <TouchableOpacity style={{
                            flex: 1,
                            borderTopWidth: 1,
                            borderRightWidth: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderColor: 'black'
                        }} onPress={()=> {
                            onDismiss()
                        }}>

                            <Text style={{
                                color: '#04E2E7',
                                textAlign: 'center',
                                fontSize: 16,
                                paddingHorizontal: 12,
                            }}>{"Dismiss"}</Text>
                            
                        </TouchableOpacity>


                        <TouchableOpacity style={{
                            flex: 1,
                            borderTopWidth: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderColor: 'black'

                        }} onPress={onResetGoal} disabled={resetAvailable}>

                            <Text style={{
                                color: !resetAvailable ? '#04E2E7' : '#9C9FAE',
                                textAlign: 'center',
                                fontSize: 16,
                                paddingHorizontal: 12,
                                

                            }}>

                                {"Reset Goal"}

                            </Text>
                        </TouchableOpacity>


                    </View>

                </View>

            </View>

        </Modal >
    )
}

export default GoalPopup