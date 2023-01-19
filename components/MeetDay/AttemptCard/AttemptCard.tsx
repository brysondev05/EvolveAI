import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native'
import { useTheme, Text, Icon, Button, Divider } from '@ui-kitten/components'
import { round, convertToLB, convertToKG } from '~/helpers/Calculations'
import LowHighAttempt from './LowHighAttempt'
import { useFirestore } from 'react-redux-firebase'
import { useTypedSelector } from '~/reduxStore/reducers'

const PlusIcon = props => (
    <Icon {...props} name="plus-outline" />
)
const MinusIcon = props => (
    <Icon {...props} name="minus-outline" />
)
const MissIcon = props => (
    <Icon {...props} name="close-outline" />
)
const PassIcon = props => (
    <Icon {...props} name="checkmark-outline" />
)


export default function AttemptCard({ lift, type, details, max, isLast, units }) {

    const theme = useTheme()
    const userID = useTypedSelector(({ firebase: { auth } }) => auth?.uid)

    const { attempt, status } = details
    const unitChangeAmount = 2.5

    const lowAttempt = round(attempt.weight * 0.98, unitChangeAmount)
    const highAttempt = round(attempt.weight * 1.02, unitChangeAmount)
    const attemptPercentage = round(attempt.weight / max * 100, 1)
    const attemptLB = convertToLB(attempt.weight, 1)

    const firestore = useFirestore()
    const meetDayDoc = firestore.doc(`users/${userID}/program/meetDay`)
    const attemptObj = `${lift}.${type}.attempt.weight`
    const statusObj = `${lift}.${type}.status`
    const handleAttemptChange = (type: 'increase' | 'decrease') => {
        const change = type === 'increase' ? unitChangeAmount : -unitChangeAmount;
        return meetDayDoc.update({
         
            [attemptObj]: firestore.FieldValue.increment(change)
        })
    }
    const toggleStatusButton = (type: 'miss' | 'pass' | 'pending') => {
        
        if(details.status !== type) {
            return meetDayDoc.update({
                [statusObj]: type 
             })
        }
      
    }
    const [passStatus, setPassStatus] = useState(details.status === 'pass')
    const [missStatus, setMissStatus] = useState(details.status === 'miss')
 
    const toggleMissStatus = () => {
 
        setMissStatus(prev => !prev)
     
        setPassStatus(false)
    }
    const togglePassStatus = () => {
        setPassStatus(prev => !prev)
     
        setMissStatus(false)
    }
    useEffect(() =>{
        if(passStatus) {
            toggleStatusButton('pass')
        } else if(missStatus) {
            toggleStatusButton('miss')
        } else{
            toggleStatusButton('pending')
        }
    }, [passStatus, missStatus])

    const actualAttempt = units === 'kg' ? `${attempt.weight}${attempt.units}` : `${convertToLB(attempt.weight)}${units}`

    const convertedAttempt = units === 'kg' ? `${convertToLB(attempt.weight, 1)}lb` : `${convertToKG(convertToLB(attempt.weight), 1)}kg`
    return (
        <View style={{ flex: 1 }}>
            <Text style={[styles.attemptTitle, { color: theme['color-primary-500'] }]} category="h6">{type} Attempt</Text>
            <View style={styles.attemptContainer}>

                <LowHighAttempt type="Low" attempt={lowAttempt} units={units}/>

                <View>
                    <View style={styles.actualAttemptWrapper}>
                        <Button status="basic" appearance="ghost"
                            accessoryLeft={MinusIcon}
                            onPress={() => handleAttemptChange('decrease')}

                        />
                        <View style={{ alignItems: 'center' }}>
                            <Text category="s1" appearance="hint">{`${attemptPercentage}%`}</Text>
                            <Text category="h5">{actualAttempt}</Text>
                            <Text category="s1" appearance="hint">{convertedAttempt}</Text>
                        </View>
                        <Button 
                        onPress={() => handleAttemptChange('increase')}
                        status="basic" appearance="ghost"
                            accessoryLeft={PlusIcon}
                        />
                    </View>
                    <View style={styles.liftStatusWrapper}>
                        <Button status="danger" appearance={missStatus ? 'filled' : 'outline'} onPress={() => toggleMissStatus()}
                            accessoryLeft={MissIcon}
                        />
                        <Button status="success" appearance={passStatus ? 'filled' : 'outline'} onPress={() => togglePassStatus()}
                        accessoryLeft={PassIcon}
                        />

                    </View>
                </View>
                <LowHighAttempt type="High" attempt={highAttempt} units={units} />

            </View>
            {/* {!isLast && <Divider style={{ marginVertical: 20 }} />} */}

        </View>
    )
}

const styles = StyleSheet.create({
    attemptTitle: {
        textTransform: 'capitalize'
    },
    attemptContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        alignItems: 'center',
    },
    actualAttemptWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    liftStatusWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 20
    }


})
