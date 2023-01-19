import { useContext, useState, useRef, useCallback } from 'react'

import { Formik } from 'formik'
import * as Yup from 'yup'

import moment from 'moment'

import DateTimePickerModal from 'react-native-modal-datetime-picker'
import {
  Layout,
  Icon,
  RadioGroup,
  Radio,
  Input,
  useTheme,
  useStyleSheet,
} from '@ui-kitten/components'
import {
  SuffixInput,
  FormControl,
} from '~/components/presentational/FormComponents'
import SubmitSection from '~/components/SignUp/SubmitSection'

import { BioDataProps } from '~/screens/types/signup'

import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import { FormWrapper } from '~/components/FormWrapper'
import { Keyboard, Pressable, StyleSheet, View } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { FlowContext } from '~/context/signUpFlow-context'
import { SignUpStyles } from '~/styles/SignUpStyle'
import Video from 'expo-av'
import InfoSheetVideoLink from '~/components/InfoSheetVideoLink'

const CalendarIcon = (props: any) => <Icon {...props} name='calendar' />

export const UserBioData = ({ navigation }: BioDataProps) => {
  const userBioData = useTypedSelector((state) => state.signUp.userBioData)

  const theme = useTheme()
  const { screens } = useContext(FlowContext)
  const screenIndex = screens.findIndex((e) => e.name === 'UserBioData')
  const nextScreen = screens[screenIndex + 1]
  const [pauseVideo, setPauseVideo] = useState(true)
  const videoRef = useRef()

  const dispatch = useDispatch()

  let birthdayMin = new Date()

  birthdayMin.setFullYear(birthdayMin.getFullYear() - 100)

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
          unitsIndex: Yup.number().required('Required'),
          genderIndex: Yup.number().required('Required'),
        })}
        onSubmit={(values, formikActions) => {
          dispatch({ type: 'UPDATE_BIO_DATA', payload: values })

          navigation.navigate(nextScreen.name)
          formikActions.setSubmitting(false)
        }}>
        {(props) => (
          <Layout>
            <InfoSheetVideoLink
              videoID='NnX2VnShrWQ'
              title='Intro'
              videoDescription='Welcome'
            />

            <FormControl label='Preferred Units'>
              <RadioGroup
                selectedIndex={props.values.unitsIndex}
                onChange={(NewIndex) => {
                  props.setFieldTouched('unitsIndex', true)

                  props.setFieldValue('unitsIndex', NewIndex, false)
                  props.setFieldValue(
                    'units',
                    NewIndex == 0 ? 'standard' : 'metric'
                  )
                  // props.validateForm({...props.values, unitsIndex: NewIndex})
                }}>
                <Radio style={formStyles.radioButton}>
                  Standard (Pounds, Inches)
                </Radio>
                <Radio style={formStyles.radioButton}>
                  Metric (Kilograms, Centimeters)
                </Radio>
              </RadioGroup>
            </FormControl>

            <FormControl label='Gender'>
              <RadioGroup
                selectedIndex={props.values.genderIndex}
                onChange={(NewIndex) => {
                  props.setFieldTouched('genderIndex', true)
                  props.setFieldValue('genderIndex', NewIndex, true)
                  // props.validateForm({...props.values, genderIndex: NewIndex})
                }}>
                <Radio style={formStyles.radioButton}>Male</Radio>
                <Radio style={formStyles.radioButton}>Female</Radio>
              </RadioGroup>
            </FormControl>

            <SubmitSection
              errors={props.errors}
              touched={props.touched}
              submitting={props.isSubmitting}
              handleSubmit={() => props.handleSubmit()}
              goBack={() => navigation.goBack()}
              items={2}
            />
          </Layout>
        )}
      </Formik>
    </FormWrapper>
  )
}

const styles = StyleSheet.create({
  playButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  videoThumb: {
    position: 'relative',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  playIcon: { width: 25, height: 25 },
})
