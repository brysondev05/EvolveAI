import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Divider, Layout, Text, useTheme } from '@ui-kitten/components'
import { ScrollView } from 'react-native-gesture-handler'
import { useFirestore } from 'react-redux-firebase'
import LayoutCard from '~/components/presentational/containers/LayoutCard'
import { useProgramInfo } from '~/hooks/programInfo/useProgramInfo'
import { useDispatch } from 'react-redux'
import RNPickerSelect from 'react-native-picker-select'
import { handleError } from '~/errorReporting'
import { customLog } from '~/helpers/CustomLog'
const pickerOptions = [
  {
    label: 'Disabled',
    value: 0,
  },
  {
    label: '30 Seconds',
    value: 0.5,
  },
  {
    label: '1 Minute',
    value: 1,
  },
  {
    label: '1.5 Minutes',
    value: 1.5,
  },
  {
    label: '2 Minutes',
    value: 2,
  },
  {
    label: '2.5 Minutes',
    value: 2.5,
  },
  {
    label: '3 Minutes',
    value: 3,
  },
  {
    label: '3.5 Minutes',
    value: 3.5,
  },
  {
    label: '4 Minutes',
    value: 4,
  },
  {
    label: '4.5 Minutes',
    value: 4.5,
  },
  {
    label: '5 Minutes',
    value: 5,
  },
  {
    label: '5.5 Minutes',
    value: 5.5,
  },
  {
    label: '6 Minutes',
    value: 6,
  },
  {
    label: '6.5 Minutes',
    value: 6.5,
  },
  {
    label: '7 Minutes',
    value: 7,
  },
]

const rpeOptions = [
  {
    rpe: '6.5 or Less',
    rir: '4 or More',
    value: 6,
  },
  {
    rpe: '7-7.5',
    rir: '3',
    value: 7,
  },
  {
    rpe: '8-8.5',
    rir: '2',
    value: 8,
  },
  {
    rpe: '9+',
    rir: '1-0',
    value: 9,
  },
]

const PickerContent = ({ timers, setTimers }) => {
  const theme = useTheme()
  
  return (
    <Layout style={{ flex: 1, paddingHorizontal: 15 }}>
      <View style={{ marginVertical: 15, paddingHorizontal: 10 }}>
        <Text>
          Select the rest times you would like your auto timer for this exercise
          to start at based on what your RPE/RIR was for that given set. Each
          exercise has their own timer.
        </Text>
        <Text>
          {'\n'}
          For compound exercises, most lifters should aim for 2-5 minutes during
          Hypertrophy, 3-6 minutes during Strength and 4-7 minutes during
          Peaking.
        </Text>
      </View>

      <LayoutCard level='3'>
        {rpeOptions.map((item, index) => (
          <View key={item.value}>
            {index !== 0 && (
              <Divider
                style={{
                  marginVertical: 15,
                  borderColor: theme['border-alternative-color-1'],
                  backgroundColor: theme['border-alternative-color-1'],
                  opacity: 0.2,
                }}
              />
            )}
            <View
              style={{
                justifyContent: 'space-between',
                flex: 1,
                flexDirection: 'row',
                alignContent: 'center',
                alignItems: 'center',
              }}>
              <View>
                <Text category='s1'>RPE {item.rpe}</Text>
                <Text category='s1' appearance='hint'>
                  {item.rir} RIR
                </Text>
              </View>
              <RNPickerSelect
                placeholder={{ label: 'Select Reps', value: '' }}
                items={pickerOptions}
                value={timers[item.value]}
                useNativeAndroidPickerStyle={false}
                fixAndroidTouchableBug={true}
                style={{
                  inputIOS: {
                    color: theme['text-primary-color'],

                    // textAlign: 'right',
                    fontSize: 16,
                  },
                  viewContainer: {
                    // flex: 1,
                    alignContent: 'center',
                    justifyContent: 'center',
                  },
                  chevronDown: {
                    display: 'none',
                  },
                  chevronUp: {
                    display: 'none',
                  },
                  inputAndroid: {
                    color: theme['text-primary-color'],

                    // textAlign: 'right',
                    fontSize: 16,
                  },
                  inputAndroidContainer: {
                    // flex: 1,
                    alignContent: 'center',
                    justifyContent: 'center',
                  },
                }}
                onValueChange={(newReps) => {
                  setTimers({
                    ...timers,
                    [item.value]: newReps,
                  })
                }}
                // onDownArrow={() => rpeRef.current.togglePicker()}
                // onUpArrow={() => weightRef.current.focus()}
              />
              {/* <Picker
            selectedValue={timers[item.value]}
            style={{
              height: 100,
              overflow: 'hidden',
              width: 250,
              alignSelf: 'center',
            }}
            // style={{ flex: 1, justifyContent: 'center' }}
            itemStyle={{
              color: 'white',
              flex: 1,
              fontSize: 14,
            }}
            prompt='Auto Timer Length'
            onValueChange={(itemValue, itemIndex) =>
              setTimers({ ...timers, [item.value]: itemValue })
            }>
            {pickerOptions.map((item) => (
              <Picker.Item
                label={item.label}
                value={item.value}
                key={item.value}
              />
            ))}
          </Picker> */}
            </View>
          </View>
        ))}
      </LayoutCard>
    </Layout>
  )
}
const AutoTimerPicker = ({
  navigation = null,
  route = null,
  exercise: propExercise,
  onGoBack = () => null,
}) => {
  const { userID } = useProgramInfo()
  const { exercise, shouldOpenPerformanceSheet = false } = route?.params || {
    exercise: propExercise,
  }

  const [timers, setTimers] = useState({
    6: 2,
    7: 3,
    8: 3,
    9: 4,
  })
  const firestore = useFirestore()
  useEffect(() => {
    if (exercise?.autoTimer) {
      setTimers(exercise?.autoTimer)
    }
  }, [exercise?.autoTimer])

  useEffect(
    () =>
      navigation.addListener('beforeRemove', async (e) => {
        // Prevent default behavior of leaving the screen
        e.preventDefault()
        try {
          firestore
            .collection(`users/${userID}/exercises`)
            .doc(exercise?.exerciseShortcode)
            .update({ autoTimer: timers })
        } catch (e) {
          handleError(e)
        } finally {
          navigation.dispatch(e.data?.action)
        }
      }),
    [navigation, timers, userID]
  )
  return (
    <Layout style={{ flexGrow: 1 }}>
      {navigation ? (
        <ScrollView>
          <PickerContent setTimers={setTimers} timers={timers} />
        </ScrollView>
      ) : (
        <PickerContent setTimers={setTimers} timers={timers} />
      )}
    </Layout>
  )
}

export default AutoTimerPicker

const styles = StyleSheet.create({})
