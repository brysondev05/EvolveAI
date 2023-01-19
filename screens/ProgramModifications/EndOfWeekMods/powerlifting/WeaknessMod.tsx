import { Formik } from 'formik'
import * as Yup from 'yup'

import { SignUpStyles } from '~/styles/SignUpStyle'
import { Layout, RadioGroup, Radio, useStyleSheet } from '@ui-kitten/components'
import FormControl from '~/components/presentational/FormComponents'

import { LiftingDataProps } from '~/screens/types/signup'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import SubmitSection from '~/components/SignUp/SubmitSection'
import { FormWrapper } from '~/components/FormWrapper'

import { submitSignUp } from '~/reduxStore/actions'
import { endOfWeekCheckin } from '~/reduxStore/actions/powerlifting/cycleAdjustments/endOfWeekCheckinAction'
import GradientHeader from '~/components/presentational/GradientHeader'
import { showLoading } from '~/reduxStore/reducers/globalUI'

export const WeaknessMod = ({ navigation }: LiftingDataProps) => {
  const userLiftingData = useTypedSelector(
    ({ firestore: { data } }) =>
      data.userProgram && data.userProgram?.programDetails?.userLiftingData
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

  const formStyles = useStyleSheet(SignUpStyles)

  const handleSignUp = async () => {
    //dispatch(submitSignUp())
    dispatch(showLoading('Creating your account...'))
    dispatch(endOfWeekCheckin({ withProgramModifications: true }))
  }

  return (
    <Layout style={{ flex: 1, paddingBottom: 30 }}>
      <GradientHeader title='Weaknesses' />
      <FormWrapper>
        <Formik
          initialValues={userLiftingData}
          validationSchema={weaknessSchema}
          onSubmit={async (values, formikActions) => {
            dispatch({
              type: 'MODIFY_WEAKNESSES',
              newWeaknesses: {
                squat: values.squat.weakness,
                bench: values.bench.weakness,
                deadlift: values.deadlift.weakness,
              },
            })

            handleSignUp()
            formikActions.setSubmitting(false)
          }}>
          {(props) => (
            <Layout style={{ marginTop: 30 }}>
              <FormControl label='Squat'>
                <RadioGroup
                  selectedIndex={props.values.squat.weakness}
                  onChange={(index) => {
                    props.setFieldTouched('squat.weakness')
                    props.setFieldValue('squat.weakness', index, false)
                    props.validateForm({
                      ...props.values,
                      squat: { weakness: index },
                    })
                  }}>
                  <Radio style={formStyles.radioButton}>Rounding Over</Radio>
                  <Radio style={formStyles.radioButton}>In the hole</Radio>
                  <Radio style={formStyles.radioButton}>Above parallel</Radio>
                </RadioGroup>
              </FormControl>
              <FormControl label='Bench'>
                <RadioGroup
                  selectedIndex={props.values.bench.weakness}
                  onChange={(index) => {
                    props.setFieldTouched('bench.weakness')
                    props.setFieldValue('bench.weakness', index, false)
                    props.validateForm({
                      ...props.values,
                      bench: { weakness: index },
                    })
                  }}>
                  <Radio style={formStyles.radioButton}>Off the chest</Radio>
                  <Radio style={formStyles.radioButton}>Midrange</Radio>
                  <Radio style={formStyles.radioButton}>Lockout</Radio>
                </RadioGroup>
              </FormControl>
              <FormControl label='Deadlift'>
                <RadioGroup
                  selectedIndex={props.values.deadlift.weakness}
                  onChange={(index) => {
                    props.setFieldTouched('deadlift.weakness')
                    props.setFieldValue('deadlift.weakness', index, false)
                    props.validateForm({
                      ...props.values,
                      deadlift: { weakness: index },
                    })
                  }}>
                  <Radio style={formStyles.radioButton}>Off the floor</Radio>
                  <Radio style={formStyles.radioButton}>Midrange</Radio>
                  <Radio style={formStyles.radioButton}>Lockout</Radio>
                </RadioGroup>
              </FormControl>
              <SubmitSection
                submitLabel='COMPLETE WEEK'
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
    </Layout>
  )
}
export default WeaknessMod
