import { useState } from 'react'
import { TouchableHighlight, View } from 'react-native'
import { Input, Text, Layout, Button, Divider } from '@ui-kitten/components'
import FormControl, {
  SuffixInput,
} from '~/components/presentational/FormComponents'
import { updateUserMax } from '~/reduxStore/actions/programActions'
import { useDispatch } from 'react-redux'
import GradientHeader from '~/components/presentational/GradientHeader'
import { convertDecimal } from '~/helpers/Calculations'
import useBands from '~/hooks/workout/useBands'
import Modifiers from '~/components/TrainingScreen/PerformanceSheet/Modifiers'

export default function RecordMaxScreen({ navigation, route }) {
  const { exerciseID, initialUnits, type = '1RM', previousMax } = route.params
  const [units, setUnits] = useState(initialUnits)
  const [max, setMax] = useState(String(previousMax || ''))

  const { bands, usesBands, setUsesBands, bandsButtons } = useBands({ units })

  const [usingBodyweight, setUsingBodyweight] = useState(false)
  const dispatch = useDispatch()
  const handleMaxChange = async () => {
    try {
      await dispatch(
        updateUserMax({
          exerciseID,
          units,
          max: Number(max),
          type,
          bands,
          usingBodyweight,
        })
      )
      navigation.goBack()
    } catch (e) {
      // console.log(e)
    }
  }
  const unitTypeButton = (type) => (
    <Button
      key={type}
      size='small'
      style={{ borderRadius: 0 }}
      onPress={() => setUnits(type)}
      appearance={units === type ? 'filled' : 'outline'}>
      {type}
    </Button>
  )
  const unitTypes = ['lb', 'kg']

  return (
    <Layout style={{ flex: 1 }}>
      <GradientHeader
        title={`Update ${type === '1RM' ? '1 Rep' : '10 Rep'} Max`}
      />
      <Layout level='2'>
        <View
          style={{
            justifyContent: 'space-between',
            padding: 20,
            alignItems: 'center',
            flexDirection: 'row',
          }}>
          <Text appearance='hint' category='label'>
            Units
          </Text>
          <View style={{ flexDirection: 'row' }}>
            {unitTypes.map(unitTypeButton)}
          </View>
        </View>
        <Divider style={{ marginTop: 15 }} />
      </Layout>
      <Layout level='2'>
        <View
          style={{
            justifyContent: 'space-between',
            padding: 20,
            alignItems: 'center',
            flexDirection: 'row',
          }}>
          <Text appearance='hint' category='label'>
            Max
          </Text>
          <SuffixInput
            placeholder={`Enter Max`}
            onChangeText={(nextValue) => setMax(convertDecimal(nextValue))}
            status='basic'
            value={max}
            style={{
              flex: 1,
              marginLeft: 20,
              borderColor: 'transparent',
              backgroundColor: 'transparent',
            }}
            keyboardType='decimal-pad'
            suffix={units}
            textAlign='right'
            returnKeyType='done'
          />
        </View>
      </Layout>
      <Layout level='2'>
        {usesBands && max !== null && max !== '0' && (
          <Text
            category='s1'
            style={{ paddingHorizontal: 20, marginBottom: 15 }}
            status='danger'>
            Note: Band tension will not be accounted for in your prescribed
            weights.
          </Text>
        )}
        <Modifiers
          usingBodyweight={usingBodyweight}
          setUsingBodyweight={setUsingBodyweight}
          usesBands={usesBands}
          setUsesBands={setUsesBands}
          bandsButtons={bandsButtons}
        />

        <Divider style={{ marginBottom: 25 }} />
      </Layout>
      <View style={{ paddingHorizontal: 20 }}>
        <Button onPress={() => handleMaxChange()}>
          Update {type === '1RM' ? '1 Rep ' : '10 Rep '}Max
        </Button>
      </View>
    </Layout>
  )
}
