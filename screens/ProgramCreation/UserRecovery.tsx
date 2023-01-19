import { useContext } from 'react'

import { Formik } from 'formik'
import * as Yup from 'yup'

import { SignUpStyles } from '~/styles/SignUpStyle'
import { Layout, RadioGroup, Radio, useStyleSheet } from '@ui-kitten/components'

import { BioDataProps } from '~/screens/types/signup'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import SubmitSection from '~/components/SignUp/SubmitSection'
import FormControl from '~/components/presentational/FormComponents'
import { FormWrapper } from '~/components/FormWrapper'
import { FlowContext } from '~/context/signUpFlow-context'

export const UserRecovery = ({ navigation, route }: BioDataProps) => {
  const userBioData = useTypedSelector((state) => state.signUp.userBioData)
  const dispatch = useDispatch()

  const trainingRecovery = [
    'I recover very slowly, take it easy on me!',
    'I recover slower than most people',
    'I recover at a normal pace',
    'I recover quicker than most people',
    'I recover very quickly, give me all you got!',
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
          historicRecovery: Yup.number().required('Required'),
        })}
        onSubmit={(values, formikActions) => {
          dispatch({ type: 'UPDATE_BIO_DATA', payload: values })
          navigation.navigate(nextScreen.name)
          formikActions.setSubmitting(false)
        }}>
        {(props) => (
          <Layout>
            <FormControl label='How quickly do you recover from a workout?'>
              <RadioGroup
                selectedIndex={props.values.historicRecovery}
                onChange={(index) => {
                  props.setFieldTouched('historicRecovery', true)
                  props.setFieldValue('historicRecovery', index, true)
                }}>
                {trainingRecovery.map(renderRadio)}
              </RadioGroup>
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
