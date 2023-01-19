import { Button, Divider, Layout, Text } from '@ui-kitten/components'
import { useState } from 'react';
import { View} from 'react-native'
import { useDispatch } from 'react-redux'
import { useFirestore } from 'react-redux-firebase'
import { SuffixInput } from '~/components/presentational/FormComponents'
import GradientHeader from '~/components/presentational/GradientHeader'
import { convertDecimal, convertToKG, round } from '~/helpers/Calculations'
import { useTypedSelector } from '~/reduxStore/reducers'
import auth from '~/reduxStore/reducers/auth'

const initialProps = {
    max: '',
    lift: '',
    units: ''
}

const createNewAttempts = (max, units) => {

    const thirdAttempt = units.toLowerCase() === 'lb' ? convertToKG(Number(max)) : Number(max)
    
    return {
        third: {
            attempt: {
                weight: round(thirdAttempt, 2.5),
                units: 'kg'
            },
            status: 'pending',
        },
        second: {
            attempt: {
                weight: round(thirdAttempt * 0.96, 2.5),
                units: 'kg'
            },
            status: 'pending'
        },
        first: {
            attempt: {
                weight: round(thirdAttempt * 0.92, 2.5),
                units: 'kg'
            },
            status: 'pending'
        }
    }
}

const MeetDayMax = ({navigation, route}) => {
    const userID = useTypedSelector(({ firebase: { auth } }) => auth.uid)

    const {lift, units: initialUnits, max: initialMax} = route.params || initialProps
    const [units, setUnits] = useState(initialUnits)
    const [max, setMax] = useState(String(initialMax))
    const firestore = useFirestore()

    const handleMaxChange = async () => {
        try {
  
            await firestore.doc(`users/${userID}/program/meetDay`).update({
                [lift]: createNewAttempts(max, units)
            })
            // await dispatch(updateUserMax({ exerciseID, units, max }))
            navigation.goBack()
        } catch (e) {
            console.log(e);
            
        }

    }
    const unitTypeButton = type => (
        <Button key={type} size="small" style={{ borderRadius: 0 }} onPress={() => setUnits(type)} appearance={units === type ? 'filled' : 'outline'} >
            {type}</Button>
    )
    const unitTypes = ['lb', 'kg']

    return (
        <Layout style={{ flex: 1 }}>
            <GradientHeader title="Update Max" />
            <Layout level="2">
                <View style={{ justifyContent: 'space-between', padding: 20, alignItems: 'center', flexDirection: 'row' }}>

                    <Text appearance="hint" category="label">Units</Text>
                    <View style={{ flexDirection: 'row' }}>
                        {unitTypes.map(unitTypeButton)}
                    </View>

                </View>
                <Divider />
            </Layout>
            <Layout level="2">
                <View style={{ justifyContent: 'space-between', padding: 20, alignItems: 'center', flexDirection: 'row' }}>



                    <Text appearance="hint" category="label">Max</Text>
                    <SuffixInput

                        placeholder={`enter max`}
                        onChangeText={nextValue => setMax(convertDecimal(nextValue))}
                        status="basic"
                        value={max}
                        style={{ flex: 1, marginLeft: 20, borderColor: 'transparent', backgroundColor: 'transparent' }}
                        keyboardType="decimal-pad"
                        suffix={units}
                        textAlign="right"
                        returnKeyType='done'

                    />
                </View>
                <Divider />
            </Layout>
           
            <View style={{ paddingHorizontal: 20 }}>
                <Button onPress={() => handleMaxChange()}>Update Max</Button></View>
        </Layout>
    )
}


export default MeetDayMax
