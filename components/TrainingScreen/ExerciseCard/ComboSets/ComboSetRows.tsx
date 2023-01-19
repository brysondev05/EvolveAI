import { useState } from 'react';
import { View } from 'react-native'
import {Text} from '@ui-kitten/components'
import ComboSetRow from './ComboSetRow'
import Svg, { Line } from 'react-native-svg'


const ComboSetRows = ({styles, setsIndex, sets, primaryColor,currentDay, currentWeek, dispatch, theme, exercises, dayStatus, isComboSet}) => {
    const [cardHeight, setCardHeight] = useState(0)

                  
                    return (
                        <View style={{ marginBottom: 15, paddingLeft: 15 }}>
                            <View onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}>
                                {isComboSet && (
                                    <>
                                <Svg height="100%" width="25" style={[styles.sideLine, {
                                    height: cardHeight, transform: [{ translateX: -20 }, {translateY: -10}]
                                }]}>
                                    <Line x1="0" y1="0" x2="0" y2={cardHeight - 5} strokeLinecap="butt" stroke={primaryColor} strokeWidth="3" />
                                </Svg>
                            <Text category="h6">Set {setsIndex + 1}</Text>
                            </>
                                )}
                                {sets.map((set, index, arr) => <ComboSetRow 
                                isComboSet={isComboSet}
                                key={`${setsIndex}${index}`}
                                setsIndex={setsIndex} 
                                set={set} 
                                index={index} 
                                currentDay={currentDay} 
                                dispatch={dispatch} currentWeek={currentWeek} 
                                theme={theme} 
                                primaryColor={primaryColor} 
                                exercises={exercises}
                                dayStatus={dayStatus}
                                />)}
                            </View></View>
                    )
}

export default ComboSetRows
