import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import FormControl from '../presentational/FormComponents'
import { Layout, Text, RadioGroup, Radio, Toggle } from '@ui-kitten/components'
import NumberInput from '../presentational/NumberInput'
import Haptics from 'expo-haptics'

const ReviewCard = ({
  liftType,
  performance,
  setPerformance,
  feedback,
  setFeedback,
  setUpdateMax,
  updateMax,
}) => {
  // const [performance, setPerformance] = React.useState( {weight: '', units: 'kg'})
  const [selectedIndex, setSelectedIndex] = useState(0)

  const lowerType = liftType.toLowerCase()

  // const handleWeightChange = (type: 'weight' | 'reps' | 'rpe' | 'rir', change: 'increase' | 'decrease') => {
  //     Haptics.selectionAsync()
  //     let unitIncrease = 1
  //     let dataType = 'weight'
  //     // const parsedPerformance = parseFloat(performance.weight)

  //     // const startingNumber = !isNaN(parsedPerformance) ? parsedPerformance : 0
  //     // unitIncrease = performance.units === 'kg'  ? 2.5 : 5
  //     // const newValue = change === 'increase' ? String(startingNumber + unitIncrease) : String(startingNumber - unitIncrease)
  //     // setPerformance({...performance, weight: newValue })
  //     }

  const handleChange = (change) => {
    const unitChange = performance?.units?.toLowerCase() === 'kg' ? 2.5 : 5
    const parseWeight = parseFloat(performance.weight)
    const startingPoint = !isNaN(parseWeight) ? parseWeight : 20
    const newVal =
      change === 'increase'
        ? startingPoint + unitChange
        : parseWeight - unitChange
    setPerformance({ ...performance, weight: String(newVal) })
  }

  return (
    <Layout
      level='3'
      style={{ padding: 15, borderRadius: 14, marginVertical: 10 }}>
      <Text category='h2'>{liftType}</Text>

      <FormControl level='3' title='Heaviest Squat'>
        <NumberInput
          level='3'
          value={performance.weight}
          units={performance.units}
          onChangeText={(nextText: string) =>
            setPerformance({ ...performance, weight: nextText })
          }
          handleChange={(type: 'increase' | 'decrease') => handleChange(type)}
          canEdit={true}
          placeholder='weight'
          label={`Best ${liftType}`}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}>
          <Text>Update Max?</Text>
          <Toggle
            status='control'
            style={{
              marginVertical: 20,
              paddingLeft: 20,
              justifyContent: 'flex-end',
            }}
            onChange={(index) => setUpdateMax(index)}
            checked={updateMax}
          />
        </View>
      </FormControl>
      <FormControl level='3' title={`${liftType} Ratings`}>
        <RadioGroup
          selectedIndex={feedback}
          onChange={(index) => setFeedback(index)}>
          <Radio>Today was a PR, let's keep going!</Radio>
          <Radio>
            I didn't make a PR but training overall was great and just had a bad
            meet/day
          </Radio>
          <Radio>I didn't make a PR but coming back from injury/hiatus</Radio>
          <Radio>I felt overtrained by the program</Radio>
          <Radio>I felt that the program didn't have enough volume</Radio>
        </RadioGroup>
      </FormControl>
    </Layout>
  )
}

export default ReviewCard

const styles = StyleSheet.create({})
