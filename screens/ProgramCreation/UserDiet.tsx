import { useContext, useRef } from 'react'

import { useDispatch } from 'react-redux'
import { useTypedSelector } from '~/reduxStore/reducers'

import { Formik } from 'formik'
import * as Yup from 'yup'

import {
  Layout,
  RadioGroup,
  Radio,
  Text,
  useStyleSheet,
  Icon,
  useTheme,
} from '@ui-kitten/components'
import FormControl from '~/components/presentational/FormComponents'
import SubmitSection from '~/components/SignUp/SubmitSection'
import { SignUpStyles } from '~/styles/SignUpStyle'

import { FormWrapper } from '~/components/FormWrapper'
import { FlowContext } from '~/context/signUpFlow-context'
import InfoSheetVideoLink from '~/components/InfoSheetVideoLink'

import * as Sentry from 'sentry-expo'

export const UserDiet = ({ navigation, route }) => {
  const userBioData = useTypedSelector((state) => state.signUp.userBioData)
  const dispatch = useDispatch()
  const { name } = route
  const { screens } = useContext(FlowContext)
  const screenIndex = screens.findIndex((e) => e.name === name)
  const nextScreen = screens[screenIndex + 1]

  const formStyles = useStyleSheet(SignUpStyles)

  return (
    <FormWrapper>
      <Formik
        initialValues={userBioData}
        validationSchema={Yup.object({
          dietGoal: Yup.number().required('Required'),
          dietType: Yup.number().required('Required'),
        })}
        onSubmit={(values, formikActions) => {
          Sentry.Native.setContext('Update Bio Data', {
            formValues: values,
            userBioData,
          })
          Sentry.Native.addBreadcrumb({
            category: 'questionnaire',
            message: 'updating bio data',
            level: 'info',
          })
          dispatch({ type: 'UPDATE_BIO_DATA', payload: values })
          navigation.navigate(nextScreen.name)
          formikActions.setSubmitting(false)
        }}>
        {(props) => (
          <Layout>
            <InfoSheetVideoLink
              videoDescription='Your Weight Goals'
              videoID='UTytzEvr6PA'
              title='Weight Goals'
            />
            <FormControl label='Nutritional tracking'>
              <RadioGroup
                selectedIndex={props.values.dietType}
                onChange={(index) => {
                  props.setFieldTouched('dietType')

                  props.setFieldValue('dietType', index)
                  // props.validateForm({...props.values, dietType: index})
                }}>
                <Radio style={formStyles.radioButton}>
                  I track my macros and plan my meals around training
                </Radio>
                <Radio style={formStyles.radioButton}>
                  I don't pay attention to macros or meal timing
                </Radio>
              </RadioGroup>
            </FormControl>
            <FormControl label='Diet goals'>
              <RadioGroup
                selectedIndex={props.values.dietGoal}
                onChange={(index) => {
                  props.setFieldTouched('dietGoal')

                  props.setFieldValue('dietGoal', index)

                  // props.validateForm({...props.values, dietGoal: index})
                }}>
                <Radio style={formStyles.radioButton}>
                  I plan on losing weight
                </Radio>
                <Radio style={formStyles.radioButton}>
                  I plan on maintaining weight
                </Radio>
                <Radio style={formStyles.radioButton}>
                  I plan on gaining weight
                </Radio>
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
