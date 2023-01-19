import { useState, useEffect } from 'react'
import { View, Pressable } from 'react-native'
import { convertToLB, convertToKG, round } from '~/helpers/Calculations'
import { Text } from '@ui-kitten/components'
import { useNavigation } from '@react-navigation/native'

const ComboSetRow = ({
  set,
  exercises,
  setsIndex,
  index,
  currentWeek,
  currentDay,
  theme,
  primaryColor,
  dispatch,
  dayStatus,
  isComboSet,
}) => {
  const { lift } = set
  const exerciseDetails = exercises?.[lift?.exercise?.exerciseShortcode]
  const { rm10, units } = exerciseDetails || { rm10: null, units: 'kg' }
  const navigation = useNavigation()

  let weightToUse =
    units !== rm10?.units
      ? units === 'lb'
        ? convertToLB(rm10?.amount)
        : convertToKG(rm10?.amount)
      : rm10?.amount

  let unitsToUse = units

  if (dayStatus === 'complete' && lift?.results?.usedWeights?.rm10?.amount) {
    weightToUse = Number(
      Number(lift?.results?.usedWeights?.rm10?.amount).toFixed(20)
    )
    unitsToUse = lift?.results?.usedWeights?.rm10?.units
  }

  const [expectedPerformance, setExpectedPerformance] = useState({
    reps: set.reps,
    rpe: set.rpe,
    weight: [weightToUse],
    units: exerciseDetails?.units ? exerciseDetails?.units : 'kg',
  })

  useEffect(() => {
    const roundedWeight = round(
      weightToUse * set.percentage[0],
      set.weightIncrement
    )
    const expectedWeight = isNaN(roundedWeight) ? 0 : roundedWeight
    setExpectedPerformance({
      reps: [10],
      rpe: set.rpe,
      units: unitsToUse,
      weight: [expectedWeight],
    })
  }, [exerciseDetails, set])

  const performance = () => {
    let performanceToUse = null

    if (lift?.performance?.[setsIndex]) {
      performanceToUse = lift?.performance?.[setsIndex]
    }
    // } else if(lift?.performance?.[setsIndex -1]){
    //     performanceToUse = lift?.performance?.[setsIndex -1]

    // }
    if (performanceToUse) {
      const {
        weight,
        reps,
        rpe,
        units = 'kg',
        usingBodyweight = false,
        bands = false,
      } = performanceToUse
      let actualWeight = weight
      if (units !== exerciseDetails?.units) {
        actualWeight =
          units === 'kg' ? convertToLB(weight) : convertToKG(weight)
      }
      let output = usingBodyweight ? 'BW' : actualWeight
      if (reps) {
        output += ` x ${reps}`
      }

      if (rpe) {
        if (lift.isAccessory) {
          output += ` @ ${rpe} RIR`
        } else {
          output += ` @ ${rpe} RPE`
        }
      }
      if (bands) {
        output += '\n' + '+ Bands'
      }
      return output
    }
    return 'Performance'
  }

  const dispatchSheet = () => {
    const previousPerformance = lift?.performance?.[setsIndex - 1]

    return navigation.navigate('Performance Screen', {
      expectedPerformance,
      actualPerformance: lift?.performance?.[setsIndex],
      previousPerformance: previousPerformance,
      ignorePreviousPerformance: false,
      isAccessory: lift?.isAccessory,
      exerciseIndex: index,
      setIndex: setsIndex,
      currentWeek,
      currentDay,
      exerciseType: 'regularAccessory',
      exerciseID: lift?.exercise?.exerciseShortcode,
      lift,
      exerciseStyle: exerciseDetails?.style,
      is10RMTest: set.is10RMTest,
      weightIncrement: set.weightIncrement,
      isLastSet: set.isLastSet,
      isPerSide: set.isPerSide,
      restTime: lift.restTime,
      isComboSet: true,
    })
  }

  const WeightDisplay = () => {
    const roundedWeight = round(
      weightToUse * set.percentage[0],
      set.weightIncrement
    )

    if (set.reps[0] !== 0) {
      return (
        <Text category='s1' style={{ fontSize: 17, textAlign: 'left' }}>
          {`${set.reps.join('-')} Reps`} {set.isPerSide && 'Per Side'}
        </Text>
      )
    }

    if (!isNaN(roundedWeight) && !set.isBandsOnly && !set.isBodyweightOnly) {
      return (
        <Text category='s1' style={{ fontSize: 17, textAlign: 'left' }}>
          {`${roundedWeight}${unitsToUse}`}
        </Text>
      )
    }

    if (set.isBandsOnly) {
      return (
        <Text category='s1' style={{ fontSize: 17, textAlign: 'left' }}>
          Banded
          {/* {'\n'} {`${set.percentage * 100}% of 10 rep max`} */}
        </Text>
      )
    }
    if (set.isBodyweightOnly) {
      return (
        <Text category='s1' style={{ fontSize: 17, textAlign: 'left' }}>
          Bodyweight
        </Text>
      )
    }

    return null
  }
  return (
    <View key={`${setsIndex}_${index}`}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginVertical: 10,
        }}>
        <Pressable
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme['background-basic-color-1'],
            width: 45,
            height: 45,
            borderRadius: 45,
          }}>
          <Text
            category='s1'
            style={{ fontSize: 17, color: theme[set?.color] }}>
            {isComboSet ? set.liftLetter : setsIndex + 1}
          </Text>
        </Pressable>
        {lift?.exercise?.exerciseShortcode ? (
          <>
            <View style={{ flex: 1, paddingLeft: 10, paddingRight: 5 }}>
              <WeightDisplay />

              <Text category='s1' style={{ fontSize: 17, textAlign: 'left' }}>
                {set?.intensity?.join('-')} RiR{' '}
              </Text>
            </View>
            <Pressable
              style={{
                paddingVertical: 10,
                paddingHorizontal: 15,
                backgroundColor: theme['background-basic-color-1'],
                borderRadius: 20,
              }}
              onPress={() => dispatchSheet()}>
              <Text category='s1' style={{ color: theme[set?.color] }}>
                {performance()}
              </Text>
            </Pressable>
          </>
        ) : (
          <View>
            <Text> </Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default ComboSetRow
