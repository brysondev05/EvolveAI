import { useContext } from 'react'

import { Formik } from 'formik'
import * as Yup from 'yup'

import {
  Layout,
  RadioGroup,
  Radio,
  Text,
  Divider,
  useStyleSheet,
} from '@ui-kitten/components'
import FormControl from '~/components/presentational/FormComponents'

import { LiftingDataProps } from '~/screens/types/signup'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import SubmitSection from '~/components/SignUp/SubmitSection'
import { FormWrapper } from '~/components/FormWrapper'
import { FlowContext } from '~/context/signUpFlow-context'
import { SignUpStyles } from '~/styles/SignUpStyle'
import InfoSheetVideoLink from '~/components/InfoSheetVideoLink'

export const UserPeriodization = ({ navigation, route }: LiftingDataProps) => {
  const userProgramData = useTypedSelector(
    (state) => state.signUp.userProgramData
  )

  const dispatch = useDispatch()
  const { name } = route
  const { screens } = useContext(FlowContext)
  const screenIndex = screens.findIndex((e) => e.name === name)
  const nextScreen = screens[screenIndex + 1]
  const formStyles = useStyleSheet(SignUpStyles)

  const techniqueSchema = Yup.object().shape({
    periodizationYN: Yup.number().required('Required'),

    periodization: Yup.object().when('periodizationYN', {
      is: 1,
      then: Yup.object().shape({
        squat: Yup.object().shape({
          hypertrophy: Yup.number().required('Required'),
          strength: Yup.number().required('Required'),
          peaking: Yup.number().required('Required'),
        }),
        bench: Yup.object().shape({
          hypertrophy: Yup.number().required('Required'),
          strength: Yup.number().required('Required'),
          peaking: Yup.number().required('Required'),
        }),
        deadlift: Yup.object().shape({
          hypertrophy: Yup.number().required('Required'),
          strength: Yup.number().required('Required'),
          peaking: Yup.number().required('Required'),
        }),
      }),
      otherwise: Yup.object(),
    }),
  })

  const periodizationOptions = [
    'Linear',
    'Alternating',
    'Undulating',
    'Let  Decide',
  ]
  const renderRadio = (title: string, index: number) => (
    <Radio key={index} style={formStyles.radioButton}>
      {title}
    </Radio>
  )

  return (
    <FormWrapper>
      <Formik
        initialValues={userProgramData}
        validationSchema={techniqueSchema}
        onSubmit={(values, formikActions) => {
          dispatch({ type: 'UPDATE_PROGRAM_DATA', payload: values })
          navigation.navigate(nextScreen.name)
          formikActions.setSubmitting(false)
        }}>
        {(props) => (
          <Layout>
            <InfoSheetVideoLink
              videoDescription='All About Periodization'
              videoID='Z3XltQ6_OLw'
              title='Periodization'
            />
            <FormControl label='Do you want to pick your own periodization styles?'>
              <RadioGroup
                selectedIndex={props.values.periodizationYN}
                onChange={(index) => {
                  props.setFieldTouched('periodizationYN', true)
                  props.setFieldValue('periodizationYN', index)
                }}>
                <Radio style={formStyles.radioButton}>
                  No (highly recommended)
                </Radio>
                <Radio style={formStyles.radioButton}>Yes</Radio>
              </RadioGroup>
            </FormControl>

            {props.values.periodizationYN === 1 && (
              <Layout>
                <Text category='h3'>Squat</Text>
                <FormControl label='Hypertrophy Periodization'>
                  <RadioGroup
                    selectedIndex={props.values.periodization.squat.hypertrophy}
                    onChange={(index) => {
                      props.setFieldValue(
                        'periodization.squat.hypertrophy',
                        index
                      )
                    }}>
                    {periodizationOptions.map(renderRadio)}
                  </RadioGroup>
                </FormControl>
                <FormControl label='Strength Periodization'>
                  <RadioGroup
                    selectedIndex={props.values.periodization.squat.strength}
                    onChange={(index) => {
                      props.setFieldValue('periodization.squat.strength', index)
                    }}>
                    {periodizationOptions.map(renderRadio)}
                  </RadioGroup>
                </FormControl>
                <FormControl label='Peaking Periodization'>
                  <RadioGroup
                    selectedIndex={props.values.periodization.squat.peaking}
                    onChange={(index) => {
                      props.setFieldValue('periodization.squat.peaking', index)
                    }}>
                    {periodizationOptions.map(renderRadio)}
                  </RadioGroup>
                </FormControl>
                <Divider style={{ marginVertical: 10 }} />
                <Text category='h3'>Bench</Text>
                <FormControl label='Hypertrophy Periodization'>
                  <RadioGroup
                    selectedIndex={props.values.periodization.bench.hypertrophy}
                    onChange={(index) => {
                      props.setFieldValue(
                        'periodization.bench.hypertrophy',
                        index
                      )
                    }}>
                    {periodizationOptions.map(renderRadio)}
                  </RadioGroup>
                </FormControl>
                <FormControl label='Strength Periodization'>
                  <RadioGroup
                    selectedIndex={props.values.periodization.bench.strength}
                    onChange={(index) => {
                      props.setFieldValue('periodization.bench.strength', index)
                    }}>
                    {periodizationOptions.map(renderRadio)}
                  </RadioGroup>
                </FormControl>
                <FormControl label='Peaking Periodization'>
                  <RadioGroup
                    selectedIndex={props.values.periodization.bench.peaking}
                    onChange={(index) => {
                      props.setFieldValue('periodization.bench.peaking', index)
                    }}>
                    {periodizationOptions.map(renderRadio)}
                  </RadioGroup>
                </FormControl>

                <Divider style={{ marginVertical: 10 }} />
                <Text category='h3'>Deadlift</Text>
                <FormControl label='Hypertrophy Periodization'>
                  <RadioGroup
                    selectedIndex={
                      props.values.periodization.deadlift.hypertrophy
                    }
                    onChange={(index) => {
                      props.setFieldValue(
                        'periodization.deadlift.hypertrophy',
                        index
                      )
                    }}>
                    {periodizationOptions.map(renderRadio)}
                  </RadioGroup>
                </FormControl>
                <FormControl label='Strength Periodization'>
                  <RadioGroup
                    selectedIndex={props.values.periodization.deadlift.strength}
                    onChange={(index) => {
                      props.setFieldValue(
                        'periodization.deadlift.strength',
                        index
                      )
                    }}>
                    {periodizationOptions.map(renderRadio)}
                  </RadioGroup>
                </FormControl>
                <FormControl label='Peaking Periodization'>
                  <RadioGroup
                    selectedIndex={props.values.periodization.deadlift.peaking}
                    onChange={(index) => {
                      props.setFieldValue(
                        'periodization.deadlift.peaking',
                        index
                      )
                    }}>
                    {periodizationOptions.map(renderRadio)}
                  </RadioGroup>
                </FormControl>
              </Layout>
            )}

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
