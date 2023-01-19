import { useContext } from 'react'

import { Formik } from 'formik'
import * as Yup from 'yup'

import { SignUpStyles } from '~/styles/SignUpStyle'
import { Layout, RadioGroup, useStyleSheet } from '@ui-kitten/components'
import {
  RadioDescription,
  FormControl,
} from '../../components/presentational/FormComponents'

import { ProgramSelectionProps } from '~/screens/types/signup'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import SubmitSection from '~/components/SignUp/SubmitSection'
import { FormWrapper } from '~/components/FormWrapper'
import { FlowContext } from '~/context/signUpFlow-context'

export const ProgramSelection = ({
  navigation,
  route,
}: ProgramSelectionProps) => {
  const userProgramData = useTypedSelector(
    (state) => state.signUp?.userProgramData
  )
  const dispatch = useDispatch()

  const { name } = route
  const { screens } = useContext(FlowContext)
  const screenIndex = screens.findIndex((e) => e.name === name)
  const nextPLScreen = screens[screenIndex + 2]
  const nextPBScreen = screens[screenIndex + 1]
  const formStyles = useStyleSheet(SignUpStyles)

  return (
    <FormWrapper>
      <Formik
        initialValues={userProgramData}
        validationSchema={Yup.object({
          programIndex: Yup.number().required('Required'),
        })}
        onSubmit={(values, formikActions) => {
          dispatch({ type: 'UPDATE_PROGRAM_DATA', payload: values })
          if (values?.programIndex === 0) {
            navigation.navigate(nextPLScreen.name)
          }
          if (values?.programIndex === 1) {
            navigation.navigate(nextPBScreen.name)
          }

          formikActions.setSubmitting(false)
        }}>
        {(props) => (
          <Layout>
            <FormControl label='Which program would you like to follow?'>
              <RadioGroup
                selectedIndex={props.values?.programIndex}
                onChange={(index) => {
                  props.setFieldValue('programIndex', index)
                  props.setFieldValue(
                    'program',
                    index == 0 ? 'powerlifting' : 'powerbuilding'
                  )
                }}>
                <RadioDescription
                  title='Powerlifting'
                  description='Get stronger in Squat, Bench and Deadlift'
                  points={[
                    'Ideal for preparing for a meet or mock meet',
                    'Focuses your training on getting stronger in Squat, Bench and Deadlift',
                    'Less focus on accessories',
                    'Better for those restricted by time',
                  ]}
                  formStyles={formStyles}
                />
                <RadioDescription
                  title='Powerbuilding'
                  description='Combine powerlifting and bodybuilding'
                  points={[
                    'Ideal for general strength & physique development, as well as off-season powerlifting training',
                    'Focuses your training on building muscle while improving your Squat, Bench, Deadlift.',
                    'Much greater focus on accessories',
                    'Better for those who are more flexible with time',
                  ]}
                  formStyles={formStyles}
                />
              </RadioGroup>
            </FormControl>

            <SubmitSection
              errors={{}}
              touched={{ true: true }}
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
