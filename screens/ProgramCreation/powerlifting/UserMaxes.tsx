import { useContext } from 'react'

import { Formik } from 'formik'
import * as Yup from 'yup'

import { Layout, Text } from '@ui-kitten/components'
import FormControl, {
  SuffixInput,
} from '~/components/presentational/FormComponents'

import { LiftingDataProps } from '~/screens/types/signup'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import SubmitSection from '~/components/SignUp/SubmitSection'
import { FormWrapper } from '~/components/FormWrapper'
import { Keyboard } from 'react-native'
import { FlowContext } from '~/context/signUpFlow-context'
import { convertDecimal } from '~/helpers/Calculations'

export function UserMaxes({ navigation, route }: LiftingDataProps) {
  let userLiftingData = useTypedSelector(
    (state) => state.signUp.userLiftingData
  )

  let units = useTypedSelector((state) => state.signUp.userBioData.units)
  const currentLiftingData = useTypedSelector(
    ({ firestore: { data } }) =>
      data.userProgram?.programDetails?.userLiftingData
  )
  const currentUnits = useTypedSelector(
    ({ firestore: { data } }) =>
      data.userProgram?.programDetails?.userBioData.units
  )
  const dispatch = useDispatch()

  const { name } = route
  const { screens, type } = useContext(FlowContext)
  const screenIndex = screens.findIndex((e) => e.name === name)
  const nextScreen = screens[screenIndex + 1]

  // if(type === 'existingUserProgram') {
  //     units = currentUnits
  // }

  const maxesSchema = Yup.object().shape({
    squat: Yup.object().shape({
      max: Yup.string().required('Required'),
    }),
    bench: Yup.object().shape({
      max: Yup.string().required('Required'),
    }),
    deadlift: Yup.object().shape({
      max: Yup.string().required('Required'),
    }),
  })
  return (
    <FormWrapper>
      <Formik
        initialValues={userLiftingData}
        validationSchema={maxesSchema}
        onSubmit={(values, formikActions) => {
          dispatch({ type: 'UPDATE_LIFTING_DATA', payload: values })
          navigation.navigate('UserTechnique')
          formikActions.setSubmitting(false)
        }}>
        {(props) => (
          <Layout>
            <Layout style={{ marginBottom: 30, paddingRight: 20 }}>
              <Text category='h2'>Your Maxes</Text>
              <Text category='p1'>
                If you aren't sure of your maxes you can estimate from recent
                workouts. A good rule of thumb is{' '}
                <Text category='s2'>weight x reps x 0.0333 + weight</Text>{' '}
              </Text>
            </Layout>

            <FormControl>
              <SuffixInput
                value={props.values.squat.max}
                label='Squat 1 Rep Max'
                placeholder={`Squat max`}
                onBlur={props.handleBlur('squat.max')}
                onChangeText={(change) => {
                  props.handleChange('squat.max')(convertDecimal(change))
                }}
                caption={
                  props.touched.squat && props.errors.squat
                    ? props.errors.squat['max']
                    : ''
                }
                status={
                  props.touched.squat && props.errors.squat
                    ? 'warning'
                    : 'basic'
                }
                size='large'
                keyboardType='decimal-pad'
                suffix={units === 'metric' ? 'kg' : 'lb'}
                textAlign='right'
                returnKeyLabel='Done'
                returnKeyType='done'
                onSubmitEditing={Keyboard.dismiss}
              />
            </FormControl>
            <FormControl>
              <SuffixInput
                value={props.values.bench.max}
                label='Bench 1 Rep Max'
                placeholder={`Bench max`}
                onBlur={props.handleBlur('bench.max')}
                onChangeText={(change) => {
                  props.handleChange('bench.max')(convertDecimal(change))
                }}
                caption={
                  props.touched.bench && props.errors.bench
                    ? props.errors.bench['max']
                    : ''
                }
                status={
                  props.touched.bench && props.errors.bench
                    ? 'warning'
                    : 'basic'
                }
                size='large'
                keyboardType='decimal-pad'
                suffix={units === 'metric' ? 'kg' : 'lb'}
                textAlign='right'
                returnKeyLabel='Done'
                returnKeyType='done'
                onSubmitEditing={Keyboard.dismiss}
              />
            </FormControl>
            <FormControl>
              <SuffixInput
                value={props.values.deadlift.max}
                label='Deadlift 1 Rep Max'
                placeholder={`Deadlift max`}
                onBlur={props.handleBlur('deadlift.max')}
                onChangeText={(change) => {
                  props.handleChange('deadlift.max')(convertDecimal(change))
                }}
                caption={
                  props.touched.deadlift && props.errors.deadlift
                    ? props.errors.deadlift['max']
                    : ''
                }
                status={
                  props.touched.deadlift && props.errors.deadlift
                    ? 'warning'
                    : 'basic'
                }
                size='large'
                keyboardType='decimal-pad'
                suffix={units === 'metric' ? 'kg' : 'lb'}
                textAlign='right'
                returnKeyLabel='Done'
                returnKeyType='done'
                onSubmitEditing={Keyboard.dismiss}
              />
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
