import { useState } from 'react'

import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'

import { Formik } from 'formik'
import * as Yup from 'yup'

import { Layout, Input, Icon, Text } from '@ui-kitten/components'
import DateTimePickerModal from 'react-native-modal-datetime-picker'

import { ProgramSelectionProps } from '~/screens/types/signup'
import SubmitSection from '~/components/SignUp/SubmitSection'
import FormControl from '~/components/presentational/FormComponents'
import { FormWrapper } from '~/components/FormWrapper'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import moment from 'moment'
import { updateMeetDate } from '~/reduxStore/actions/signUpActions'

const CalendarIcon = (props: any) => <Icon {...props} name='calendar' />

export const ModifyMeetDate = ({ navigation }: ProgramSelectionProps) => {
  const dispatch = useDispatch()

  const userProgramData = useTypedSelector(
    ({ firestore: { data } }) =>
      data.userProgram && data.userProgram?.programDetails
  )

  const futureMeetDate = new Date()
  futureMeetDate.setDate(futureMeetDate.getDate() + 7)

  const [isMeetDatePickerVisible, setMeetDatePickerVisibility] = useState(false)

  const showMeetDatePicker = () => {
    setMeetDatePickerVisibility(true)
  }

  const hideMeetDatePicker = () => {
    setMeetDatePickerVisibility(false)
  }

  return (
    <FormWrapper>
      <Formik
        initialValues={userProgramData}
        validationSchema={Yup.object({
          meetDate: Yup.date().required('Required'),
        })}
        onSubmit={(values, formikActions) => {
          dispatch(updateMeetDate({ newMeetDate: values.meetDate }))
          formikActions.setSubmitting(false)
        }}>
        {(props) => (
          <Layout>
            <Layout style={{ marginBottom: 30, paddingRight: 20 }}>
              <Text category='h2'>Change Meet Date</Text>
              <Text category='p1'>
                Change your meet date here. Warning: doing this will re-start
                your program and you will lose any previous weeks.
              </Text>
            </Layout>

            <FormControl label='When is your meet or test day?'>
              <TouchableWithoutFeedback onPress={showMeetDatePicker}>
                <Input
                  value={moment(props.values.meetDate).format('MMMM Do YYYY')}
                  accessoryRight={CalendarIcon}
                  onFocus={showMeetDatePicker}
                  disabled
                  status='basic'
                  style={{ textAlign: 'right' }}
                />
              </TouchableWithoutFeedback>

              <DateTimePickerModal
                isVisible={isMeetDatePickerVisible}
                mode='date'
                date={props.values.meetDate}
                minimumDate={futureMeetDate}
                onConfirm={(newDate) => {
                  props.setFieldTouched('meetDate', true)
                  props.setFieldValue('meetDate', newDate, false)
                  props.validateForm({ ...props.values, meetDate: newDate })
                  hideMeetDatePicker()
                }}
                onCancel={hideMeetDatePicker}
              />
            </FormControl>

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
