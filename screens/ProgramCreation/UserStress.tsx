import { useContext } from 'react'

import { Formik } from 'formik'
import * as Yup from 'yup'

import { SignUpStyles } from '~/styles/SignUpStyle'
import { Layout, RadioGroup, Radio, useStyleSheet } from '@ui-kitten/components'
import FormControl from '~/components/presentational/FormComponents'

import { BioDataProps } from '~/screens/types/signup'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import SubmitSection from '~/components/SignUp/SubmitSection'
import { FormWrapper } from '~/components/FormWrapper'
import { FlowContext } from '~/context/signUpFlow-context'
import InfoSheetVideoLink from '~/components/InfoSheetVideoLink'

export const UserStress = ({ navigation, route }: BioDataProps) => {
  const userBioData = useTypedSelector((state) => state.signUp.userBioData)
  const dispatch = useDispatch()

  const lifeStressOptions = [
    'Low stress job/low activity lifestyle',
    'Low stress job/high activity lifestyle',
    'Moderate stress job/moderate activity',
    'High stress job/low activity lifestyle',
    'High stress job/high activity lifestyle',
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
          lifeStress: Yup.number().required('Required'),
        })}
        onSubmit={(values, formikActions) => {
          dispatch({ type: 'UPDATE_BIO_DATA', payload: values })
          navigation.navigate(nextScreen.name)

          formikActions.setSubmitting(false)
        }}>
        {(props) => (
          <Layout>
            <InfoSheetVideoLink
              videoDescription='Your Life Stress'
              videoID='KPyW1pyuQzk'
              title='Life Stress'
            />

            <FormControl label='What is your life stress like?'>
              <RadioGroup
                selectedIndex={props.values.lifeStress}
                onChange={(index) => {
                  props.setFieldTouched('lifeStress')

                  props.setFieldValue('lifeStress', index)
                }}>
                {lifeStressOptions.map(renderRadio)}
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
