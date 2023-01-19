import { useState, useContext } from 'react'

import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'

import { Formik } from 'formik'
import * as Yup from 'yup'

import {
  Layout,
  RadioGroup,
  Radio,
  Input,
  Icon,
  Text,
  useStyleSheet,
} from '@ui-kitten/components'

import { ProgramSelectionProps } from '~/screens/types/signup'
import SubmitSection from '~/components/SignUp/SubmitSection'
import FormControl from '~/components/presentational/FormComponents'
import { FormWrapper } from '~/components/FormWrapper'

import { FlowContext } from '~/context/signUpFlow-context'
import { SignUpStyles } from '~/styles/SignUpStyle'
import { Alert, Platform, Pressable } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'

import moment from 'moment-timezone'
import * as Localization from 'expo-localization'
import { dateToDate } from '~/helpers/Dates'

const timezone = Localization.timezone

export const UserMeetDay = ({ navigation, route }: ProgramSelectionProps) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

  const showDatePicker = () => {
    setDatePickerVisibility(true)
  }

  const hideDatePicker = () => {
    setDatePickerVisibility(false)
  }

  const dispatch = useDispatch()

  const userProgramData = useTypedSelector(
    (state) => state.signUp?.userProgramData
  )

  const now = moment.tz(timezone)

  const thisDay = moment.tz(timezone).isoWeekday()
  const futureMeetDate =
    thisDay > 1
      ? now.clone().add(5, 'weeks').isoWeekday(1).toDate()
      : now.clone().add(4, 'weeks').toDate()

  const maxMeetDate = now.clone().add(32, 'weeks').isoWeekday(1).toDate()
  const { name } = route
  const { screens } = useContext(FlowContext)
  const screenIndex = screens.findIndex((e) => e.name === name)
  const nextScreen = screens[screenIndex + 1]
  const formStyles = useStyleSheet(SignUpStyles)

  return (
    <FormWrapper>
      <Formik
        initialValues={userProgramData}
        validationSchema={Yup.object({
          meetIndex: Yup.number().required('Required'),
        })}
        onSubmit={async (values, formikActions) => {
          const completeForm = () => {
            dispatch({ type: 'UPDATE_PROGRAM_DATA', payload: values })
            navigation.navigate(nextScreen.name)
            formikActions.setSubmitting(false)
          }
          if (values.meetIndex === 1) {
            Alert.alert(
              'Confirm Meet Date',
              `Please confirm that your meet will be ${moment(
                values.meetDate
              ).format('dddd, MMMM Do, YYYY')}`,
              [
                {
                  text: 'Confirm',
                  onPress: () => completeForm(),
                },
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
              ]
            )
            //    const isCorrectDate =  await handleMeetDayCheck
            //    if(!isCorrectDate) {
            //        return false
            //    }
          } else {
            completeForm()
          }
        }}>
        {(props) => (
          <Layout>
            <Layout style={{ marginBottom: 30, paddingRight: 20 }}>
              <Text category='h2'>Testing your strength</Text>
              <Text category='p1'>
                EvolveAI will take you through various phases of training and
                work towards a day where we will test your true strength,
                usually on a Saturday, to give you plenty of time to perform
                your test. You can either let EvolveAI decide on your test day
                or set your own.{' '}
              </Text>
            </Layout>
            <FormControl label='Do you want to set your own meet/test date?'>
              <RadioGroup
                selectedIndex={props.values.meetIndex}
                onChange={(index) => {
                  props.setFieldTouched('meetIndex', true)

                  props.setFieldValue('meetIndex', index)
                }}>
                <Radio style={formStyles.radioButton}>No (recommended)</Radio>
                <Radio style={formStyles.radioButton}>Yes </Radio>
              </RadioGroup>
            </FormControl>

            {props.values.meetIndex === 1 && (
              <FormControl label='When is your meet or test day?'>
                <Text appearance='hint' style={{ marginBottom: 15 }}>
                  If your meet is more than 32 weeks away we suggest having a
                  mock meet sometime between now and your actual meet, leaving
                  at least 16 weeks to start your full meet prep.
                </Text>

                <Pressable
                  onPress={showDatePicker}
                  style={[
                    formStyles.radioButton,
                    { justifyContent: 'space-between', flexDirection: 'row' },
                  ]}>
                  <Text>
                    {moment(props.values.meetDate).format('MMMM Do YYYY')}
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
                  date={
                    dateToDate(props.values.meetDate) ||
                    moment().add(4, 'months').isoWeekday(6).toDate()
                  }
                  minimumDate={futureMeetDate}
                  maximumDate={maxMeetDate}
                  onConfirm={(newDate) => {
                    hideDatePicker()
                    props.setFieldTouched('meetDate', true)
                    props.setFieldValue('meetDate', newDate, false)
                    props.validateForm({ ...props.values, meetDate: newDate })
                  }}
                  onCancel={hideDatePicker}
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                />
              </FormControl>
            )}

            <SubmitSection
              errors={props.errors}
              touched={props.touched}
              submitting={props.isSubmitting}
              handleSubmit={() => props.handleSubmit()}
              goBack={() => navigation.goBack()}
            />
          </Layout>
        )}
      </Formik>
    </FormWrapper>
  )
}
