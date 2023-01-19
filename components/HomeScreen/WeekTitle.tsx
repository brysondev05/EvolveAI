import { memo, useState, useMemo, useEffect, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native'
import { Layout, Text, Icon, useTheme } from '@ui-kitten/components'
import moment from 'moment'

const WeekTitleButtons = memo<{handleBackChange: any, handleLongBackChange: any, handleBackPressOut: any, handleForwardChange: any, handleLongForwardChange: any, handleForwardPressOut: any, theme: any}>(({handleBackChange, handleLongBackChange, handleBackPressOut, handleForwardChange, handleLongForwardChange, handleForwardPressOut, theme}) => (
    <Layout level="2" style={{ flexDirection: 'row', justifyContent: 'flex-end', flexGrow: 1}}>

    <Pressable style={styles.navButtons}
        onPress={handleBackChange}
        onLongPress={handleLongBackChange}
        onPressOut={handleBackPressOut}
    >
        <Icon name='arrow-ios-back' fill={theme['text-hint-color']} style={{ width: 20, height: 20, marginTop: 2, marginLeft: 5 }} />
    </Pressable>
    <Pressable style={styles.navButtons}
        onPress={handleForwardChange}
        onLongPress={handleLongForwardChange}
        onPressOut={handleForwardPressOut}
    >
        <Icon name='arrow-ios-forward' fill={theme['text-hint-color']} style={{ width: 20, height: 20, marginTop: 2, marginLeft: 5 }} />
    </Pressable>

</Layout>
))

const WeekTitleContent = ({ activeWeek, colors, handleWeekChange, blockColor, blockName }) => {

    const theme = useTheme()
    const [timer, setTimer] = useState(false)
    const [timerType, setTimerType] = useState('forward')

    const expectedDate = useMemo(() => moment(activeWeek?.expectedDate, 'MM/DD/YY').format('MMMM Do'), [activeWeek?.expectedDate])

    useEffect(() => {
        const activeTimer = timer && setInterval(() => {
            handleWeekChange(timerType)
        }, 75)
        return () => clearInterval(activeTimer)

    }, [timer, activeWeek])

    const handleBackChange = useCallback(() => handleWeekChange('back'),[activeWeek])
    const handleLongBackChange = useCallback(() => { setTimerType('back')
    setTimer(true)},[activeWeek])
    const handleBackPressOut = useCallback(() => timer && setTimer(false),[timer, activeWeek])
    const handleForwardChange = useCallback(() => handleWeekChange('forward'),[activeWeek])
    const handleLongForwardChange =useCallback( () => {  setTimerType('forward')
    setTimer(true)},[activeWeek])
    const handleForwardPressOut = useCallback(() => timer && setTimer(false),[timer, activeWeek])

    return (
        <Layout level="2" style={styles.weekTitleContainer}>

            {activeWeek?.blockType === 'FinalPhase' ? (
                <View style={{ marginBottom: 5 }}>

                    <Text style={{ color: colors.peakingOn, fontSize: 18 }} category="p1">Peaking</Text>
                    <Text category="p1" style={{ fontSize: 18, color: blockColor, }}>{expectedDate}</Text>
                    <Text style={{ color: colors.peakingOn }} category="h2">Final Phase </Text>
                </View>
            ) : (
                    <View style={{ marginBottom: 5 }}>

                        <Text style={{ color: blockColor, fontSize: 18 }} category="p1">{blockName}</Text>
                        <Text category="p1" style={{ fontSize: 18, color: blockColor, }}>{expectedDate}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: blockColor }} category="h2">Week {activeWeek?.startingWeek} {activeWeek?.blockType.includes('T') && <Text style={{ color: blockColor }}>Transition</Text>}
                                {activeWeek?.blockType[0] !== 'B' && activeWeek?.blockType[1] === activeWeek?.blockType[2] && <Text style={{ color: blockColor }}>Deload</Text>}
                            </Text>

                            {activeWeek?.status === 'complete' && (
                                <Icon style={{ marginLeft: 10, width: 30, height: 30 }} fill="white" name="checkmark-circle-outline" />
                            )}

                            {activeWeek?.status === 'skipped' && (
                                <Icon style={{ marginLeft: 10, width: 30, height: 30 }} fill="white" name="close-circle-outline" />
                            )}
                        </View>

                    </View>
                )}
     <WeekTitleButtons handleBackChange={handleBackChange} handleLongBackChange={handleLongBackChange} handleBackPressOut={handleBackPressOut} handleForwardChange={handleForwardChange} handleLongForwardChange={handleLongForwardChange} handleForwardPressOut={handleForwardPressOut} theme={theme} />
        </Layout>
    )
}

export default memo(WeekTitleContent)

const styles = StyleSheet.create({
    weekTitleContainer: { 
        alignItems: "center", 
    marginTop: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: "100%", 
    flexWrap: 'wrap',
    paddingLeft: 15 },
    navButtons: {
        padding: 20
    }
})
