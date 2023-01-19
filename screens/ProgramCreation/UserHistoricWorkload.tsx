import { useContext } from 'react'

import { Formik } from 'formik'
import * as Yup from 'yup'

import { SignUpStyles } from '../../styles/SignUpStyle'
import {
  Layout,
  Text,
  useTheme,
  IndexPath,
  SelectItem,
  RadioGroup,
  Radio,
  useStyleSheet,
} from '@ui-kitten/components'
import SubmitSection from '~/components/SignUp/SubmitSection'

import { BioDataProps } from '~/screens/types/signup'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import FormControl from '~/components/presentational/FormComponents'
import { FormWrapper } from '~/components/FormWrapper'
import { FlowContext } from '~/context/signUpFlow-context'
import InfoSheetVideoLink from '~/components/InfoSheetVideoLink'

export const UserHistoricWorkload = ({ navigation, route }: BioDataProps) => {
  const userBioData = useTypedSelector((state) => state.signUp.userBioData)

  const dispatch = useDispatch()

  //   const trainingFrequency = [
  //     'Very Low Volume \n(1x per week, per lift) ',
  //     'Low Volume \n(1-2x per week, plus accessories)',
  //     'Medium Volume \n(2-3x per week, per lift)',
  //     'Medium-High Volume \n(2-3x per week, per lift, plus accessories)',
  //     'High Volume \n(4x or more per week)',
  //   ]
  const trainingFrequency = [
    'I respond better to low frequency/volume',
    'I respond better to medium to low frequency/volume',
    'I respond better to medium frequency/volume',
    'I respond better to medium to high frequency/volume',
    'I respond better to high frequency/volume',
  ]
  const formStyles = useStyleSheet(SignUpStyles)

  const renderRadio = (title: string, index: number) => (
    <Radio key={index} style={formStyles.radioButton}>
      {title}
    </Radio>
  )
  const { name } = route
  const { screens } = useContext(FlowContext)
  const screenIndex = screens.findIndex((e) => e.name === name)
  const nextScreen = screens[screenIndex + 1]

  return (
    <FormWrapper>
      <Formik
        initialValues={userBioData}
        validationSchema={Yup.object({
          historicWorkload: Yup.number().required('Required'),
        })}
        onSubmit={(values, formikActions) => {
          dispatch({ type: 'UPDATE_BIO_DATA', payload: values })
          navigation.navigate(nextScreen.name)

          formikActions.setSubmitting(false)
        }}>
        {(props) => (
          <Layout>
            <InfoSheetVideoLink
              videoDescription='Historic Workload & Recovery'
              videoID='-zjaQwEiss4'
              title='Training History'
            />
            <FormControl label='What kind of training do you prefer?'>
              <RadioGroup
                selectedIndex={props.values.historicWorkload}
                onChange={(index) => {
                  props.setFieldTouched('historicWorkload')
                  props.setFieldValue('historicWorkload', index, true)
                }}>
                {trainingFrequency.map(renderRadio)}
              </RadioGroup>
            </FormControl>
            <SubmitSection
              errors={props.errors}
              touched={props.touched}
              submitting={props.isSubmitting}
              handleSubmit={() => props.handleSubmit()}
              goBack={() => navigation.goBack()}
              items={1}
            />
          </Layout>
        )}
      </Formik>
    </FormWrapper>
  )
}
