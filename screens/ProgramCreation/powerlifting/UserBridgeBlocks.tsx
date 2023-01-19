import { useContext } from 'react'

import { Formik } from 'formik'
import * as Yup from 'yup'

import {
  Layout,
  Text,
  RadioGroup,
  Radio,
  useStyleSheet,
} from '@ui-kitten/components'

import { ProgramSelectionProps } from '~/screens/types/signup'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import SubmitSection from '~/components/SignUp/SubmitSection'
import FormControl from '~/components/presentational/FormComponents'
import { FormWrapper } from '~/components/FormWrapper'
import { FlowContext } from '~/context/signUpFlow-context'
import { SignUpStyles } from '~/styles/SignUpStyle'
import moment from 'moment'
import InfoSheetVideoLink from '~/components/InfoSheetVideoLink'

export const UserBridgeBlocks = ({
  navigation,
  route,
}: ProgramSelectionProps) => {
  const userProgramData = useTypedSelector(
    (state) => state.signUp.userProgramData
  )

  const dispatch = useDispatch()

  const bridgeWeeks = [
    '2 Weeks',
    '3 Weeks',
    '4 Weeks',
    '5 Weeks',
    '6 Weeks',
    '7 Weeks',
    '8 Weeks',
  ]

  const { name } = route
  const { screens } = useContext(FlowContext)
  const screenIndex = screens.findIndex((e) => e.name === name)
  const nextScreen = screens[screenIndex + 1]

  const formStyles = useStyleSheet(SignUpStyles)

  const renderRadio = (title: string, index: number) => (
    <Radio key={index} style={formStyles.radioButton}>
      {title}
    </Radio>
  )

  const meetDate = moment(userProgramData.meetDate).diff(moment(), 'weeks')

  const canHaveBridge =
    userProgramData.meetIndex === 0 ||
    (userProgramData.meetIndex === 1 && meetDate > 12)

  const DisabledBridgeBlocks = () =>
    !canHaveBridge && (
      <Text category='s1' status='warning' style={{ marginBottom: 20 }}>
        Due to your meet being so close you cannot select any bridge blocks
      </Text>
    )
  if (!canHaveBridge) {
    userProgramData.bridgeBlocksYN = 0
  }
  return (
    <FormWrapper>
      <Formik
        initialValues={userProgramData}
        validationSchema={Yup.object({
          bridgeBlocksYN: Yup.number().required('Required'),
          bridgeBlocks: Yup.number().when('bridgeBlocksYN', {
            is: 1,
            then: Yup.number().required('required'),
            otherwise: Yup.number().nullable(),
          }),
        })}
        onSubmit={(values, formikActions) => {
          dispatch({ type: 'UPDATE_PROGRAM_DATA', payload: values })
          navigation.navigate(nextScreen.name)

          formikActions.setSubmitting(false)
        }}>
        {(props) => (
          <Layout>
            <Layout style={{ paddingRight: 20 }}>
              <InfoSheetVideoLink
                videoDescription='All About Bridge Blocks'
                videoID='HKilN_WI-ws'
                title='Bridge Blocks'
              />
            </Layout>

            <DisabledBridgeBlocks />

            <FormControl label='Do you want to start with a bridge block?'>
              <RadioGroup
                selectedIndex={props.values.bridgeBlocksYN}
                onChange={(index) => {
                  props.setFieldValue('bridgeBlocksYN', index, true)
                  props.setFieldTouched('bridgeBlocksYN', true)
                }}>
                <Radio style={formStyles.radioButton}>No</Radio>
                <Radio disabled={!canHaveBridge} style={formStyles.radioButton}>
                  Yes{' '}
                </Radio>
              </RadioGroup>
            </FormControl>

            {props.values.bridgeBlocksYN === 1 && (
              <FormControl label='How many bridge weeks would you like?'>
                <RadioGroup
                  selectedIndex={props.values.bridgeBlocks}
                  onChange={(index) => {
                    props.setFieldTouched('bridgeBlocks')

                    props.setFieldValue('bridgeBlocks', index)
                  }}>
                  {bridgeWeeks.map(renderRadio)}
                </RadioGroup>
              </FormControl>
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
