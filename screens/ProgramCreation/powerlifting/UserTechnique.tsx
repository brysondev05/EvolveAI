import { useRef, useState, useContext } from 'react'
import { StyleSheet, Dimensions } from 'react-native'

import { Formik } from 'formik'
import * as Yup from 'yup'

import {
  Layout,
  RadioGroup,
  Radio,
  Modal,
  useStyleSheet,
  StyleService,
} from '@ui-kitten/components'

import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'

import SubmitSection from '~/components/SignUp/SubmitSection'
import { FormWrapper } from '~/components/FormWrapper'
import FormControl from '~/components/presentational/FormComponents'

import { Video } from 'expo-av'
import { FlowContext } from '~/context/signUpFlow-context'
import { SignUpStyles } from '~/styles/SignUpStyle'
import InfoSheetVideoLink from '~/components/InfoSheetVideoLink'

const windowWidth = Dimensions.get('window').width
export const UserTechnique = ({ navigation, route }) => {
  const userLiftingData = useTypedSelector(
    (state) => state.signUp.userLiftingData
  )
  const videoRef = useRef()

  const dispatch = useDispatch()

  const techniqueSchema = Yup.object().shape({
    squat: Yup.object().shape({
      style: Yup.number().required('Required'),
    }),
    bench: Yup.object().shape({
      style: Yup.number().required('Required'),
    }),
    deadlift: Yup.object().shape({
      style: Yup.number().required('Required'),
    }),
  })

  const [visible, setVisible] = useState(false)

  const { name } = route
  const { screens } = useContext(FlowContext)
  const screenIndex = screens.findIndex((e) => e.name === name)
  const nextScreen = screens[screenIndex + 1]
  const formStyles = useStyleSheet(SignUpStyles)
  const styles = useStyleSheet(themedStyles)

  return (
    <FormWrapper>
      <Formik
        initialValues={userLiftingData}
        validationSchema={techniqueSchema}
        onSubmit={(values, formikActions) => {
          dispatch({ type: 'UPDATE_LIFTING_DATA', payload: values })
          navigation.navigate(nextScreen.name)

          formikActions.setSubmitting(false)
        }}>
        {(props) => (
          <Layout>
            <InfoSheetVideoLink
              videoDescription='Your Technique'
              videoID='DATA_HERE'
              title='Technique'
            />
            <FormControl label='Squat style'>
              <RadioGroup
                selectedIndex={props.values.squat.style}
                onChange={(index) => {
                  props.setFieldTouched('squat.style')
                  props.setFieldValue('squat.style', index)
                }}>
                <Radio style={formStyles.radioButton}>High bar </Radio>
                <Radio style={formStyles.radioButton}>Low bar</Radio>
              </RadioGroup>
            </FormControl>
            <FormControl label='Bench style'>
              <RadioGroup
                selectedIndex={props.values.bench.style}
                onChange={(index) => {
                  props.setFieldTouched('bench.style')
                  props.setFieldValue('bench.style', index)
                }}>
                <Radio style={formStyles.radioButton}>Narrow grip</Radio>
                <Radio style={formStyles.radioButton}>Standard grip </Radio>
                <Radio style={formStyles.radioButton}>Wide grip</Radio>
              </RadioGroup>
            </FormControl>

            <FormControl label='Deadlift style'>
              <RadioGroup
                selectedIndex={props.values.deadlift.style}
                onChange={(index) => {
                  props.setFieldTouched('deadlift.style')
                  props.setFieldValue('deadlift.style', index)
                }}>
                <Radio style={formStyles.radioButton}>Conventional</Radio>
                <Radio style={formStyles.radioButton}>Sumo</Radio>
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

      <Modal
        visible={visible}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setVisible(false)}>
        <Layout>
          <Video
            source={{
              uri: 'DATA_HERE',
            }} // Can be a URL or a local file.
            // showOnStart={false}
            useNativeControls
            ref={videoRef} // Store reference
            // vidtyle={{ height: windowWidth, width: windowWidth }}
            style={{ height: windowWidth, width: windowWidth }}
            // disableFullScreen
            // disableBack
            // tapAnywhereToPause
          />
        </Layout>
      </Modal>
    </FormWrapper>
  )
}

const themedStyles = StyleService.create({
  //   panelContainer: {
  //     position: 'absolute',
  //     top: 0,
  //     bottom: 0,
  //     left: 0,
  //     right: 0,
  //   },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  panel: {
    height: 500,
    paddingTop: 20,

    width: '100%',
  },
  header: {
    width: '100%',
    height: 10,
  },
  panelHeader: {
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'color-primary-100',
    marginBottom: 10,
  },
  backgroundVideo: {
    width: 300,
    height: 300,
  },
})
