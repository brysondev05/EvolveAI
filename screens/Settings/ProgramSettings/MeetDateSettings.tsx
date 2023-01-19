import { useState } from 'react'

import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'

import { Formik } from 'formik'
import * as Yup from 'yup'

import { Layout, Calendar, Icon, Text, Toggle } from '@ui-kitten/components'

import { ProgramSelectionProps } from '~/screens/types/signup'
import SubmitSection from '~/components/SignUp/SubmitSection'
import FormControl from '~/components/presentational/FormComponents'
import { FormWrapper } from '~/components/FormWrapper'
import { updateMeetDate } from '~/reduxStore/actions/signUpActions'
import produce from 'immer'
import { isEmpty, isLoaded } from 'react-redux-firebase'
import moment from 'moment-timezone'
import * as Localization from 'expo-localization'
import { useActionSheet } from '@expo/react-native-action-sheet'
import GradientHeader from '~/components/presentational/GradientHeader'
import { View } from 'react-native'
import { customLog } from '~/helpers/CustomLog'
import { dateToDate } from '~/helpers/Dates'

export const MeetDateSettings = ({ navigation }: ProgramSelectionProps) => {
  const userProgramData = useTypedSelector(
    ({ firestore: { data } }) =>
      data.userProgram && data.userProgram?.programDetails?.userProgramData
  )

  const timezone = userProgramData?.timezone || Localization.timezone

  const now = moment.tz(timezone)

  const thisDay = moment.tz(timezone).isoWeekday()
  const minProgramLength =
    thisDay > 1
      ? now.clone().add(5, 'weeks').isoWeekday(1).toDate()
      : now.clone().add(4, 'weeks').toDate()

  const maxProgramLength = now.clone().add('30', 'weeks').toDate()

  const [checked, setChecked] = useState(false)

  const dispatch = useDispatch()
  const { showActionSheetWithOptions } = useActionSheet()

  const futureMeetDate = new Date()
  futureMeetDate.setDate(futureMeetDate.getDate() + 7)

  const parsedDates =
    userProgramData &&
    produce(userProgramData, (next) => {
      next.meetDate = moment
        .tz(dateToDate(userProgramData?.meetDate), userProgramData.timezone)
        .toDate()
    })

  const handleNewMeetDate = async (meetDate) => {
    await showActionSheetWithOptions(
      {
        options: ['Change meet date', 'Cancel'],
        cancelButtonIndex: 1,
        destructiveButtonIndex: 0,
        message:
          'Changing your meet date will clear your previously completed workouts but your current metrics will remain. We advise doing this at the end of your next deload unless you are less than 6 weeks out.',
        title: 'Warning',
      },
      async (buttonIndex) => {
        if (buttonIndex === 0) {
          await dispatch(
            updateMeetDate({
              newMeetDate: moment
                .tz(meetDate, userProgramData.timezone)
                .toDate(),
              keepBridge: checked,
            })
          )
          navigation.navigate('HomeScreen')
        }
      }
    )
  }

  const onCheckedChange = (isChecked) => {
    setChecked(isChecked)
  }
  if (isEmpty(userProgramData) || !isLoaded(userProgramData)) {
    return null
  }
  return (
    <View>
      <FormWrapper
        header={
          <GradientHeader
            title='Change Meet Date'
            subheading='Warning: changing your meet date will clear your previously completed workouts but your current metrics will remain'
          />
        }>
        <Formik
          initialValues={parsedDates}
          validationSchema={Yup.object({
            meetDate: Yup.date().required('Required'),
          })}
          onSubmit={(values, formikActions) => {
            handleNewMeetDate(values.meetDate)
            formikActions.setSubmitting(false)
          }}>
          {(props) => (
            <Layout style={{ paddingBottom: 50, marginTop: 30 }}>
              <FormControl>
                <Calendar
                  min={minProgramLength}
                  max={maxProgramLength}
                  date={props.values.meetDate}
                  boundingMonth={false}
                  style={{ flex: 1, width: '100%' }}
                  onSelect={(newDate) => {
                    props.setFieldTouched('meetDate', true)
                    props.setFieldValue('meetDate', newDate, false)
                    props.validateForm({ ...props.values, meetDate: newDate })
                  }}
                />
              </FormControl>
              {userProgramData.bridgeBlocksYN === 1 && (
                <FormControl label='Keep Bridge Blocks'>
                  <Text>
                    You selected to start with bridge blocks in your initial
                    questionnaire. Would you like to keep them in?
                  </Text>
                  <Toggle
                    status='control'
                    checked={checked}
                    onChange={onCheckedChange}>
                    {' '}
                    Keep Bridge Blocks
                  </Toggle>
                </FormControl>
              )}

              <SubmitSection
                errors={props.errors}
                touched={props.touched}
                submitLabel='CHANGE MEET DATE'
                showBack={false}
                submitting={props.isSubmitting}
                handleSubmit={() => props.handleSubmit()}
                goBack={() => navigation.goBack()}
              />
            </Layout>
          )}
        </Formik>
      </FormWrapper>
    </View>
  )
}

export default MeetDateSettings
