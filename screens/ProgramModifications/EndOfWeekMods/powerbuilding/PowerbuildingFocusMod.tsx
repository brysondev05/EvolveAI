import { useContext } from 'react'

import { Formik } from 'formik'
import * as Yup from 'yup'

import { SignUpStyles } from '~/styles/SignUpStyle'
import { Layout, Radio, RadioGroup, useStyleSheet } from '@ui-kitten/components'
import {
  RadioDescription,
  FormControl,
} from '~/components/presentational/FormComponents'

import { ProgramSelectionProps } from '~/screens/types/signup'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import SubmitSection from '~/components/SignUp/SubmitSection'
import { FormWrapper } from '~/components/FormWrapper'
import { FlowContext } from '~/context/signUpFlow-context'
import { endOfWeekCheckin } from '~/reduxStore/actions/powerlifting/cycleAdjustments/endOfWeekCheckinAction'
import GradientHeader from '~/components/presentational/GradientHeader'
import { showLoading } from '~/reduxStore/reducers/globalUI'

const programFocusOptions = ['70% PL', '60% PL', '50% PL', '40% PL', '30% PL']
const upperFocus = ['Back', 'Biceps', 'Chest', 'Shoulders', 'Triceps']
const lowerFocus = ['Calves', 'Glutes', 'Hamstrings', 'Quads']
const UserProgramFocus = ({ navigation, route }) => {
  const userProgramData = useTypedSelector(
    ({ firestore: { data } }) =>
      data.userProgram && data.userProgram?.programDetails?.userProgramData
  )
  const dispatch = useDispatch()

  const { name } = route
  const { screens } = useContext(FlowContext)
  const screenIndex = screens.findIndex((e) => e.name === name)
  const nextScreen = screens[screenIndex + 1]

  const formStyles = useStyleSheet(SignUpStyles)
  const {
    squatReport,
    benchReport,
    deadliftReport,
    programModifiers,
    blockType,
    week,
    blockVolume,
    cycleID,
  } = useTypedSelector((state) => state.endOfWeekSheet)

  const radioItem = (item) => (
    <Radio key={item} style={formStyles.radioButton}>
      {item}
    </Radio>
  )

  return (
    <Layout style={{ flex: 1 }}>
      <GradientHeader
        title='Training Focus'
        subheading='Changing these values will reset selected exercises for future weeks'
      />
      <FormWrapper>
        <Formik
          initialValues={userProgramData}
          validationSchema={Yup.object({
            programIndex: Yup.number().required('Required'),
          })}
          onSubmit={(values, formikActions) => {
            // dispatch({ type: "UPDATE_PROGRAM_DATA", payload:  values  });
            // navigation.navigate(nextScreen.name);

            dispatch({
              type: 'MODIFY_POWERBUILDING_FOCUS',
              newPBFocuses: values.powerbuilding,
            })
            dispatch(showLoading(''))
            dispatch(endOfWeekCheckin({ withProgramModifications: true }))
            formikActions.setSubmitting(false)
          }}>
          {(props) => (
            <Layout style={{ marginTop: 30, paddingBottom: 30 }}>
              <FormControl label='How do you want to focus you powerbuilding program?'>
                <RadioGroup
                  selectedIndex={props.values.powerbuilding.plFocus}
                  onChange={(index) => {
                    props.setFieldValue('powerbuilding.plFocus', index)
                  }}>
                  {programFocusOptions.map(radioItem)}
                </RadioGroup>
              </FormControl>
              <FormControl label='What upper body part do you want to improve?'>
                <RadioGroup
                  selectedIndex={props.values.powerbuilding.upperFocus}
                  onChange={(index) => {
                    props.setFieldValue('powerbuilding.upperFocus', index)
                  }}>
                  {upperFocus.map(radioItem)}
                </RadioGroup>
              </FormControl>
              <FormControl label='What lower body part do you want to improve?'>
                <RadioGroup
                  selectedIndex={props.values.powerbuilding.lowerFocus}
                  onChange={(index) => {
                    props.setFieldValue('powerbuilding.lowerFocus', index)
                  }}>
                  {lowerFocus.map(radioItem)}
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
    </Layout>
  )
}

export default UserProgramFocus
