import { useContext } from 'react'

import { Formik } from 'formik'
import * as Yup from 'yup'

import { SignUpStyles } from '~/styles/SignUpStyle'
import {
  Layout,
  RadioGroup,
  Radio,
  useStyleSheet,
  Text,
} from '@ui-kitten/components'
import FormControl from '~/components/presentational/FormComponents'

import { LiftingDataProps } from '~/screens/types/signup'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import SubmitSection from '~/components/SignUp/SubmitSection'
import { FormWrapper } from '~/components/FormWrapper'

import { submitSignUp } from '~/reduxStore/actions'
import { FlowContext } from '~/context/signUpFlow-context'
import { Pressable } from 'react-native'
import InfoSheetVideoLink from '~/components/InfoSheetVideoLink'
import { showLoading } from '~/reduxStore/reducers/globalUI'

export const UserWeaknesses = ({ navigation }: LiftingDataProps) => {
  const userLiftingData = useTypedSelector(
    (state) => state.signUp.userLiftingData
  )

  const signUpData = useTypedSelector((state) => state.signUp)

  const dispatch = useDispatch()

  const weaknessSchema = Yup.object().shape({
    squat: Yup.object().shape({
      weakness: Yup.string().required('Required'),
    }),
    bench: Yup.object().shape({
      weakness: Yup.string().required('Required'),
    }),
    deadlift: Yup.object().shape({
      weakness: Yup.string().required('Required'),
    }),
  })
  const { type } = useContext(FlowContext)

  const formStyles = useStyleSheet(SignUpStyles)

  const squatWeakness = ['Rounding Over', 'In the hole', 'Above parallel']
  const benchWeakness = ['Off the chest', 'Midrange', 'Lockout']
  const deadliftWeakness = ['Off the floor', 'Midrange', 'Lockout']
  const renderRadio = (title: string, index: number) => (
    <Radio key={index} style={formStyles.radioButton}>
      {title}
    </Radio>
  )
  return (
    <FormWrapper>
      <InfoSheetVideoLink
        videoDescription='Your Weak Points'
        videoID='DATA_HERE'
        title='Weak Points'
      />
      <Formik
        initialValues={userLiftingData}
        validationSchema={weaknessSchema}
        onSubmit={async (values, formikActions) => {
          dispatch(showLoading(''))

          dispatch({ type: 'UPDATE_LIFTING_DATA', payload: values })
          dispatch(submitSignUp(type))
          formikActions.setSubmitting(false)
        }}>
        {(props) => (
          <Layout>
            <FormControl label='Squat weakness'>
              <RadioGroup
                selectedIndex={props.values.squat.weakness}
                onChange={(index) => {
                  props.setFieldTouched('squat.weakness')
                  props.setFieldValue('squat.weakness', index)
                }}>
                {squatWeakness.map(renderRadio)}
              </RadioGroup>
            </FormControl>
            <FormControl label='Bench weakness'>
              <RadioGroup
                selectedIndex={props.values.bench.weakness}
                onChange={(index) => {
                  props.setFieldTouched('bench.weakness')
                  props.setFieldValue('bench.weakness', index)
                }}>
                {benchWeakness.map(renderRadio)}
              </RadioGroup>
            </FormControl>
            <FormControl label='Deadlift weakness'>
              <RadioGroup
                selectedIndex={props.values.deadlift.weakness}
                onChange={(index) => {
                  props.setFieldTouched('deadlift.weakness')
                  props.setFieldValue('deadlift.weakness', index)
                }}>
                {deadliftWeakness.map(renderRadio)}
              </RadioGroup>
            </FormControl>
            <SubmitSection
              submitLabel='GET YOUR PROGRAM'
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
