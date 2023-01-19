import { useState, useContext } from 'react'

import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'

import { Formik } from 'formik'
import * as Yup from 'yup'

import {
  Layout,
  CheckBox,
  Icon,
  Text,
  useStyleSheet,
} from '@ui-kitten/components'

import { ProgramSelectionProps } from '~/screens/types/signup'
import SubmitSection from '~/components/SignUp/SubmitSection'
import FormControl from '~/components/presentational/FormComponents'
import DateTimePickerModal from 'react-native-modal-datetime-picker'

import { FormWrapper } from '~/components/FormWrapper'
import { FlowContext } from '~/context/signUpFlow-context'
import { SignUpStyles } from '~/styles/SignUpStyle'
import { Pressable, View, Platform } from 'react-native'
import * as Localization from 'expo-localization'
import moment from 'moment-timezone'

export const TrainingDays = ({ navigation, route }: ProgramSelectionProps) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

  const showDatePicker = () => {
    setDatePickerVisibility(true)
  }

  const hideDatePicker = () => {
    setDatePickerVisibility(false)
  }

  const dispatch = useDispatch()

  const timezone = Localization.timezone

  const userProgramData = useTypedSelector(
    (state) => state.signUp?.userProgramData
  )

  const trainingDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]

  const futureMeetDate = new Date()
  futureMeetDate.setDate(futureMeetDate.getDate() + 7)

  const { name } = route
  const { screens } = useContext(FlowContext)
  const screenIndex = screens.findIndex((e) => e.name === name)
  const nextScreen = screens[screenIndex + 1]
  const formStyles = useStyleSheet(SignUpStyles)

  // const maxDate = new Date()
  const maxDate = moment.tz(timezone).add(2, 'weeks').toDate()
  // maxDate.setDate(maxDate.getDate() + 7 *2 -1)

  return (
    <FormWrapper>
      <Formik
        initialValues={userProgramData}
        validationSchema={Yup.object({
          trainingDays: Yup.object()
            .test(
              'min-max-days',
              'Please pick a minimum of 3 days and a maximum of 6 days',
              (value) => {
                const daysLength = Object.values(value).filter(
                  (day) => day
                )?.length
                return daysLength >= 3 && daysLength < 7 ? true : false
              }
            )
            .required('Required'),
          // meetIndex: Yup.number()
          // .required('Required'),
        })}
        onSubmit={(values, formikActions) => {
          dispatch({ type: 'UPDATE_PROGRAM_DATA', payload: values })
          navigation.navigate(nextScreen.name)
          formikActions.setSubmitting(false)
        }}>
        {(props) => (
          <Layout>
            <FormControl label='What days would you like to workout?'>
              <View
                style={{
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}>
                {trainingDays.map((day) => (
                  <CheckBox
                    key={day}
                    style={formStyles.checkboxButton}
                    checked={props.values.trainingDays[day.toLowerCase()]}
                    onChange={(nextChecked) => {
                      const trainingDaysPerWeek =
                        Object.values(props.values.trainingDays).filter(
                          (day) => day
                        )?.length + (nextChecked ? 1 : -1)

                      props.setFieldValue(
                        'trainingDaysPerWeek',
                        trainingDaysPerWeek
                      )
                      props.setFieldTouched('trainingDays', true)
                      props.setFieldValue(
                        `trainingDays.${day.toLowerCase()}`,
                        nextChecked
                      )
                      // props.validateForm({ ...props.values, trainingDays: { ...props.values.trainingDays, [day.toLowerCase()]: nextChecked } })
                    }}>
                    {day}
                  </CheckBox>
                ))}
              </View>
            </FormControl>

            <FormControl label='When would you like to start?'>
              {/* <TouchableWithoutFeedback onPress={showDatePicker}>
                                <Input
                                    value={moment(props.values.startDate).format('MMMM Do YYYY')}
                                    accessoryRight={CalendarIcon}
                                    onFocus={showDatePicker}
                                    disabled
                                    status="basic"
                                    size="large"
                                    style={{ textAlign: "right" }}
                                    // textAlign="right"
                                     />
                            </TouchableWithoutFeedback> */}
              <Pressable
                onPress={showDatePicker}
                style={[
                  formStyles.radioButton,
                  { justifyContent: 'space-between', flexDirection: 'row' },
                ]}>
                <Text>
                  {moment(props.values.startDate).format('MMMM Do YYYY')}
                </Text>
                <Icon
                  name='calendar'
                  fill='white'
                  style={{ width: 20, height: 20 }}
                />
              </Pressable>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode='date'
                minimumDate={moment.tz(timezone).startOf('day').toDate()}
                date={moment.tz(timezone).startOf('day').toDate()}
                maximumDate={maxDate}
                onConfirm={(newDate) => {
                  hideDatePicker()
                  props.setFieldValue('startDate', newDate, false)
                }}
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onCancel={hideDatePicker}
              />
            </FormControl>

            <SubmitSection
              errors={props.errors}
              touched={props.touched}
              submitting={props.isSubmitting}
              handleSubmit={() => props.handleSubmit()}
              goBack={() => navigation.goBack()}
              items
            />
          </Layout>
        )}
      </Formik>
    </FormWrapper>
  )
}
