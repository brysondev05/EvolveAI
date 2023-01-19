import { useRef, useState } from 'react'
import { StyleSheet, View, Dimensions } from 'react-native'

import { Formik } from 'formik'
import * as Yup from 'yup'

import {
  Layout,
  RadioGroup,
  Radio,
  Text,
  useTheme,
  Modal,
  useStyleSheet,
  StyleService,
} from '@ui-kitten/components'

import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'

import SubmitSection from '~/components/SignUp/SubmitSection'
import { FormWrapper } from '~/components/FormWrapper'
import FormControl from '~/components/presentational/FormComponents'
import Video from 'expo-av'
import { endOfWeekCheckin } from '~/reduxStore/actions/powerlifting/cycleAdjustments/endOfWeekCheckinAction'
import { SignUpStyles } from '~/styles/SignUpStyle'
import GradientHeader from '~/components/presentational/GradientHeader'
import { showLoading } from '~/reduxStore/reducers/globalUI'

const windowWidth = Dimensions.get('window').width
export const TechniqueMod = ({ navigation }) => {
  const theme = useTheme()
  const { programModifiers } = useTypedSelector((state) => state.endOfWeekSheet)

  const { userLiftingData } = useTypedSelector(
    ({ firestore: { data } }) =>
      data.userProgram && data.userProgram.programDetails
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
  const formStyles = useStyleSheet(SignUpStyles)
  const styles = useStyleSheet(themedStyles)

  return (
    <Layout style={{ flex: 1, paddingBottom: 30 }}>
      <GradientHeader
        title='Technique'
        subheading='If you change these technique styles and your max is different, remember to update each comp lift in your exercise database'
      />
      <FormWrapper style={{ paddingHorizontal: 0 }}>
        <Formik
          initialValues={userLiftingData}
          validationSchema={techniqueSchema}
          onSubmit={(values, formikActions) => {
            dispatch({
              type: 'MODIFY_TECHNIQUE',
              newTechnique: {
                squat: values.squat.style,
                bench: values.bench.style,
                deadlift: values.deadlift.style,
              },
            })
            if (programModifiers.trainingDays) {
              navigation.navigate('Training Days Modifications')
            } else if (programModifiers.pbFocus) {
              navigation.navigate('Powerbuilding Focus')
            } else if (programModifiers.weaknesses) {
              navigation.navigate('Weakness Modifications')
            } else {
              dispatch(showLoading(''))
              dispatch(endOfWeekCheckin({ withProgramModifications: true }))
            }
            // dispatch({ type: "UPDATE_LIFTING_DATA", payload: values })
            // navigation.navigate("UserWeaknesses");
            formikActions.setSubmitting(false)
          }}>
          {(props) => (
            <Layout style={{ marginTop: 30 }}>
              <FormControl label='Squat style'>
                <RadioGroup
                  selectedIndex={props.values.squat.style}
                  onChange={(index) => {
                    props.setFieldTouched('squat.style')
                    props.setFieldValue('squat.style', index, false)
                    props.validateForm({
                      ...props.values,
                      squat: { style: index },
                    })
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
                    props.setFieldValue('bench.style', index, false)
                    props.validateForm({
                      ...props.values,
                      bench: { style: index },
                    })
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
                    props.setFieldValue('deadlift.style', index, false)
                    props.validateForm({
                      ...props.values,
                      deadlift: { style: index },
                    })
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
              showOnStart={false}
              ref={videoRef} // Store reference
              videoStyle={{ height: windowWidth, width: windowWidth }}
              style={{ height: windowWidth, width: windowWidth }}
              disableFullScreen
              disableBack
              tapAnywhereToPause
            />
          </Layout>
        </Modal>
      </FormWrapper>
    </Layout>
  )
}

export default TechniqueMod

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
