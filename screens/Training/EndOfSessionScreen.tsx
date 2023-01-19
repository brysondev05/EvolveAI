import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import {
  useTheme,
  Layout,
  Toggle,
  RadioGroup,
  Radio,
  Text,
  Button,
  Icon,
  Input,
} from '@ui-kitten/components'
import { useDispatch } from 'react-redux'
import { CompleteSplash } from '~/components/CompleteSplash'
import { LoadingSplash } from '~/components/LoadingSplash'
import { postFinishWorkout } from '~/reduxStore/actions/readinessActions'
import { useTypedSelector } from '~/reduxStore/reducers'
import { dateToDate } from '~/helpers/Dates'
import moment from 'moment'
import RNPickerSelect from 'react-native-picker-select'
import { Controller, useForm } from 'react-hook-form'
import ReadinessButtonSwitch from '~/components/Readiness/ReadinessButtonSwitch'
import LayoutCard from '~/components/presentational/containers/LayoutCard'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { stopTimer } from '~/reduxStore/reducers/timerUpdate'

const sessionRPEValues = {
  5: 'Very easy, did not take much work',
  6: 'Easy, felt good and left with plenty of energy',
  7: 'Average, felt good and left with more in the tank',
  8: 'Moderate, everything felt doable and I could have done more ',
  9: 'Hard, the workout was challenging but I was able to complete',
  10: 'Very Hard, I had to use everything I could to complete the workout',
}

const sessionRPEs = [
  ['5', 'Very easy, did not take much work'],
  ['6', 'Easy, felt good and left with plenty of energy'],
  ['7', 'Average, felt good and left with more in the tank'],
  ['8', 'Moderate, everything felt doable and I could have done more '],
  ['9', 'Hard, the workout was challenging but I was able to complete'],
  ['10', 'Very Hard, I had to use everything I could to complete the workout'],
]
const hourItems = [
  { label: '0 hours', value: 0, key: 0 },
  { label: '1 hour', value: 1, key: 1 },
  { label: '2 hours', value: 2, key: 2 },
  { label: '3 hours', value: 3, key: 3 },
  { label: '4 hours', value: 4, key: 4 },
]

const minuteItems = [{ label: '0 mins', value: 0, key: 0 }]

for (let i = 1; i <= 60; i++) {
  minuteItems.push({
    label: `${i} ${i === 1 ? 'min' : 'mins'}`,
    value: i,
    key: i,
  })
}

const nextIcon = (props) => <Icon {...props} name='arrow-forward-outline' />

const EndOfSessionScreen = ({ navigation, route }) => {
  const { readinessScores, adjustmentValues } = route.params

  const dayInfo = useTypedSelector(({ firestore }) => firestore.data.dayInfo)

  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const theme = useTheme()
  const dispatch = useDispatch()
  const minRef = useRef(null)
  const hourRef = useRef(null)

  const handleCompleteChange = () => {
    setIsCompleted(false)
    navigation.navigate('TrainingOverview', { showReview: true })
  }

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      sessionLength: {
        hours: 0,
        minutes: 0,
      },
      sessionRPE: 3,
      ableToComplete: true,
      unableReason: 0,
      sessionPositive: '',
      sessionNegative: '',
    },
  })

  const ableToComplete = watch('ableToComplete', true)

  const unableReason = watch('unableReason')

  useEffect(() => {
    if (!ableToComplete && unableReason === 0) {
      setValue('sessionRPE', 5)
    }
  }, [unableReason, ableToComplete])

  useEffect(() => {
    const getLastSeen = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@sessionTimer')
        return jsonValue != null ? JSON.parse(jsonValue) : null
      } catch (e) {
        // error reading value
      }
    }

    const start = moment(dateToDate(dayInfo?.sessionStart))
    const end = moment()
    const hours = end.diff(start, 'hours')
    const minutes = end.diff(start, 'minutes') % 60
    const lastSeen = getLastSeen()

    if (hours > 4 && lastSeen) {
      const newEnd = moment(dateToDate(lastSeen))
      const hours = newEnd.diff(start, 'hours')
      const minutes = newEnd.diff(start, 'minutes') % 60
      setValue('sessionLength', { hours, minutes })
    } else if (hours <= 4 && (hours > 0 || minutes > 0)) {
      setValue('sessionLength', { hours, minutes })
    } else if (hours > 4) {
      setValue('sessionLength', { hours: 2, minutes: 0 })
    }
  }, [route.params, dayInfo?.sessionStart])

  const postEndOfSession = async (data) => {
    setIsLoading(true)
    dispatch(stopTimer())

    await dispatch(
      postFinishWorkout({ ...data, readinessScores, adjustmentValues })
    )
    setIsCompleted(true)
    setIsLoading(false)
  }
  const onSubmitError = (errors, e) => {
    Alert.alert('Checkin not complete, please make sure all fields are entered')
  }
  return (
    <Layout style={{ flexGrow: 1, paddingBottom: 30 }}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        extraHeight={30}
        enableOnAndroid
        contentContainerStyle={{
          flexGrow: 1,
        }}>
        <Layout
          style={{
            padding: 20,
            paddingBottom: 50,
            flex: 1,
            justifyContent: 'space-around',
          }}>
          <LayoutCard status=''>
            <Text category='h6'>Session Length</Text>
            <View
              style={{
                marginTop: 15,
                flexDirection: 'row',
                justifyContent: 'center',
                alignContent: 'center',
              }}>
              <Controller
                control={control}
                name='sessionLength.hours'
                render={({ field: { onChange, onBlur, value } }) => (
                  <RNPickerSelect
                    value={value}
                    onValueChange={onChange}
                    onDownArrow={() => minRef.current?.togglePicker(true)}
                    ref={hourRef}
                    items={hourItems}
                    useNativeAndroidPickerStyle={false}
                    fixAndroidTouchableBug={true}
                    placeholder={{ label: 'Hours', value: 0 }}
                    style={{
                      inputIOS: {
                        color: theme['text-primary-color'],

                        // textAlign: 'right',
                        fontSize: 26,
                      },
                      viewContainer: {
                        // flex: 1,
                        alignContent: 'center',
                        justifyContent: 'center',
                      },
                      inputAndroid: {
                        color: theme['text-primary-color'],

                        // textAlign: 'right',
                        fontSize: 26,
                      },
                      inputAndroidContainer: {
                        // flex: 1,
                        alignContent: 'center',
                        justifyContent: 'center',
                      },
                    }}
                  />
                )}
              />
              <Text> </Text>
              <Controller
                control={control}
                name='sessionLength.minutes'
                render={({ field: { onChange, onBlur, value } }) => (
                  <RNPickerSelect
                    value={value}
                    onValueChange={onChange}
                    items={minuteItems}
                    ref={minRef}
                    onUpArrow={() => hourRef.current.togglePicker(true)}
                    useNativeAndroidPickerStyle={false}
                    fixAndroidTouchableBug={true}
                    placeholder={{ label: 'Mins', value: 0 }}
                    style={{
                      inputIOS: {
                        color: theme['text-primary-color'],

                        // textAlign: 'right',
                        fontSize: 26,
                      },
                      viewContainer: {
                        // flex: 1,
                        alignContent: 'center',
                        justifyContent: 'center',
                      },
                      inputAndroid: {
                        color: theme['text-primary-color'],

                        // textAlign: 'right',
                        fontSize: 26,
                      },
                      inputAndroidContainer: {
                        // flex: 1,
                        alignContent: 'center',
                        justifyContent: 'center',
                      },
                    }}
                  />
                )}
              />
            </View>
          </LayoutCard>

          <LayoutCard>
            <Controller
              control={control}
              name='ableToComplete'
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <Text category='h6'>Session complete?</Text>
                  <Toggle
                    status='control'
                    style={{ marginVertical: 10 }}
                    checked={value}
                    onChange={onChange}></Toggle>
                </View>
              )}
            />

            {!ableToComplete && (
              <Controller
                control={control}
                name='unableReason'
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ paddingVertical: 15 }}>
                    <Text category='label'>
                      Why were you unable to complete the session today?
                    </Text>
                    <RadioGroup selectedIndex={value} onChange={onChange}>
                      <Radio>
                        The session was too difficult to complete as written
                      </Radio>
                      <Radio>I ran out of time</Radio>
                      <Radio>Other</Radio>
                    </RadioGroup>
                  </View>
                )}
              />
            )}
          </LayoutCard>

          <Controller
            control={control}
            rules={{
              required: true,
            }}
            name='sessionRPE'
            render={({ field: { onChange, onBlur, value } }) => (
              <ReadinessButtonSwitch
                title='Session Difficulty'
                onChange={onChange}
                value={value}
                options={sessionRPEs}
                errors={errors && errors.sessionRPE}
              />
            )}
          />
          <Controller
            control={control}
            name='sessionPositive'
            render={({ field: { onChange, onBlur, value } }) => (
              <LayoutCard>
                <Text category='h6'>What is something you achieved today?</Text>
                <Text category='c1' appearance='hint'>
                  This could be something a simple as just turning up and trying
                  your best to reaching that new PR
                </Text>
                <Input
                  returnKeyType='done'
                  multiline
                  blurOnSubmit
                  status='primary'
                  onChangeText={onChange}
                  value={value}
                  style={{ marginVertical: 15 }}
                  textStyle={{ minHeight: 60 }}
                  placeholder='Today was...'
                />
              </LayoutCard>
            )}
          />
          <Controller
            control={control}
            name='sessionNegative'
            render={({ field: { onChange, onBlur, value } }) => (
              <LayoutCard>
                <Text category='h6'>
                  What is something you could have done better?
                </Text>
                <Text category='c1' appearance='hint'>
                  Be it doing all your mobility/warmup exercises or staying
                  focused on technique
                </Text>
                <Input
                  returnKeyType='done'
                  multiline
                  blurOnSubmit
                  status='primary'
                  onChangeText={onChange}
                  value={value}
                  style={{ marginVertical: 15 }}
                  textStyle={{ minHeight: 60 }}
                  placeholder='I need to...'
                />
              </LayoutCard>
            )}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 15,
            }}>
            <Button
              size='large'
              status='secondary'
              style={{ flex: 1 }}
              accessoryRight={nextIcon}
              onPress={handleSubmit(postEndOfSession, onSubmitError)}>
              Complete Workout
            </Button>
          </View>

          {isCompleted && (
            <View
              style={[
                StyleSheet.absoluteFill,
                { alignItems: 'center', justifyContent: 'center' },
              ]}>
              <CompleteSplash onFinish={handleCompleteChange} />
            </View>
          )}

          {isLoading && (
            <View
              style={[
                StyleSheet.absoluteFill,
                { alignItems: 'center', justifyContent: 'center' },
              ]}>
              <LoadingSplash level='2' />
            </View>
          )}
        </Layout>
      </KeyboardAwareScrollView>
    </Layout>
  )
}

export default EndOfSessionScreen

const styles = StyleSheet.create({
  divider: {
    marginVertical: 10,
  },
  timerSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerSettingsIcon: {
    width: 18,
    height: 18,
  },
})
