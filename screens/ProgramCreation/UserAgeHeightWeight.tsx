import { useContext, useState } from 'react'

import { Formik } from 'formik'
import * as Yup from 'yup'

import moment from 'moment'

import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { Layout, Icon, Input, Text, useStyleSheet } from '@ui-kitten/components'
import {
  SuffixInput,
  FormControl,
} from '~/components/presentational/FormComponents'
import SubmitSection from '~/components/SignUp/SubmitSection'

import { BioDataProps } from '~/screens/types/signup'

import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import { FormWrapper } from '~/components/FormWrapper'
import { Keyboard, Platform, Pressable } from 'react-native'
import { FlowContext } from '~/context/signUpFlow-context'
import { SignUpStyles } from '~/styles/SignUpStyle'
import { convertDecimal } from '~/helpers/Calculations'
import { dateToDate } from '~/helpers/Dates'

const CalendarIcon = (props: any) => <Icon {...props} name='calendar' />

export const UserAgeHeightWeight = ({ navigation }: BioDataProps) => {
  const userBioData = useTypedSelector((state) => state.signUp.userBioData)

  const { screens } = useContext(FlowContext)
  const screenIndex = screens.findIndex((e) => e.name === 'UserAgeHeightWeight')
  const nextScreen = screens[screenIndex + 1]

  const dispatch = useDispatch()

  let birthdayMin = new Date()

  birthdayMin.setFullYear(birthdayMin.getFullYear() - 16)

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

  const showDatePicker = () => {
    setDatePickerVisibility(true)
  }

  const hideDatePicker = () => {
    setDatePickerVisibility(false)
  }

  const formStyles = useStyleSheet(SignUpStyles)

  return (
    <FormWrapper>
      <Formik
        initialValues={userBioData}
        validationSchema={Yup.object({
          birthday: Yup.date().required('Required'),
          // bodyweight: Yup.string()
          //     .required('Required'),
          height: Yup.mixed()
            .test('bodyweight-number', 'Please check height', (value) => {
              return (
                !isNaN(Number(value)) &&
                Number(value) < 300 &&
                Number(value) > 30
              )
            })
            .required('Required'),
          bodyweight: Yup.mixed()
            .test('bodyweight-number', 'Please check bodyweight', (value) => {
              return (
                !isNaN(Number(value)) &&
                Number(value) < 500 &&
                Number(value) > 30
              )
            })
            .required('Required'),
        })}
        onSubmit={(values, formikActions) => {
          dispatch({ type: 'UPDATE_BIO_DATA', payload: values })

          navigation.navigate(nextScreen.name)
          formikActions.setSubmitting(false)
        }}>
        {(props) => (
          <Layout>
            <FormControl label='Birthday'>
              {/* <TouchableWithoutFeedback onPress={showDatePicker}>
                            <Input
                            value={moment(props.values.birthday).format('MMMM Do YYYY')}
                            accessoryRight={CalendarIcon}
                            onFocus={showDatePicker}
                            disabled
                            status="basic"
                            style={{ textAlign: "right" }}
                            size="large"
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
                  {moment(dateToDate(props.values.birthday)).format(
                    'MMMM Do YYYY'
                  )}
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
                maximumDate={birthdayMin}
                date={
                  dateToDate(props.values.birthday) ||
                  moment().subtract(21, 'years').toDate()
                }
                onConfirm={(newDate) => {
                  hideDatePicker()

                  props.setFieldTouched('birthday', true)
                  props.setFieldValue('birthday', newDate, false)
                  props.validateForm({ ...props.values, birthday: newDate })
                }}
                display='spinner'
                onCancel={hideDatePicker}
              />
            </FormControl>

            <FormControl>
              <SuffixInput
                value={props.values.bodyweight}
                label='Body weight'
                placeholder='Your body weight'
                onBlur={props.handleBlur('bodyweight')}
                onChangeText={(change) =>
                  props.handleChange('bodyweight')(convertDecimal(change))
                }
                caption={
                  props.touched.bodyweight && props.errors.bodyweight
                    ? props.errors.bodyweight
                    : ''
                }
                status={
                  props.touched.bodyweight && props.errors.bodyweight
                    ? 'warning'
                    : 'basic'
                }
                keyboardType='decimal-pad'
                returnKeyLabel='Done'
                returnKeyType='done'
                onSubmitEditing={Keyboard.dismiss}
                suffix={props.values.units === 'standard' ? 'lb' : 'kg'}
                size='large'
                textAlign='right'
              />
            </FormControl>
            <FormControl>
              <SuffixInput
                value={props.values.height}
                label='Height'
                placeholder={`Your height`}
                onBlur={props.handleBlur('height')}
                onChangeText={(change) =>
                  props.handleChange('height')(convertDecimal(change))
                }
                caption={
                  props.touched.height && props.errors.height
                    ? props.errors.height
                    : ''
                }
                status={
                  props.touched.height && props.errors.height
                    ? 'warning'
                    : 'basic'
                }
                keyboardType='decimal-pad'
                returnKeyLabel='Done'
                returnKeyType='done'
                onSubmitEditing={Keyboard.dismiss}
                suffix={props.values.units === 'standard' ? 'in' : 'cm'}
                size='large'
                textAlign='right'
              />
            </FormControl>

            <SubmitSection
              errors={props.errors}
              touched={props.touched}
              submitting={props.isSubmitting}
              handleSubmit={() => props.handleSubmit()}
              goBack={() => navigation.goBack()}
              items={3}
            />
          </Layout>
        )}
      </Formik>
    </FormWrapper>
  )
}
