import { useState, useEffect, useCallback, useMemo } from 'react'
import { StyleSheet, View, Keyboard } from 'react-native'
import {
  Text,
  Layout,
  Input,
  RadioGroup,
  Radio,
  CheckBox,
  useTheme,
  Button,
} from '@ui-kitten/components'
import FormControl from '~/components/presentational/FormComponents'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { useDispatch } from 'react-redux'
import SubmitSection from '~/components/SignUp/SubmitSection'
import { FormWrapper } from '~/components/FormWrapper'
import { useFirestore } from 'react-redux-firebase'
import { useTypedSelector } from '~/reduxStore/reducers'
import * as Sentry from 'sentry-expo'

import { ButtonSwitch } from '~/components/presentational/buttons/ButtonSwitch'
import { customLog } from '~/helpers/CustomLog'
import { showErrorNotification } from '~/reduxStore/reducers/notifications'

const repTypes = [
  { display: 'Low', code: 'LR' },
  { display: 'Med', code: 'MR' },
  { display: 'High', code: 'HR' },
]
const unitTypes = ['LB', 'KG']
const weightIncrementTypes = [0.25, 1, 2.5, 5, 10]
const exerciseTypes = ['Reps', 'Timed']

const CreateExercise = ({ navigation, route }) => {
  const exerciseCategories = useMemo(
    () => [
      { shortCode: 'SQ', isActive: false, name: 'Squat' },
      { shortCode: 'BN', isActive: false, name: 'Bench' },
      { shortCode: 'DL', isActive: false, name: 'Deadlift' },
      { shortCode: 'AB', isActive: false, name: 'Abs' },
      { shortCode: 'BI', isActive: false, name: 'Biceps' },
      { shortCode: 'CF', isActive: false, name: 'Calves' },
      { shortCode: 'CE', isActive: false, name: 'Carrying' },
      { shortCode: 'CH', isActive: false, name: 'Chest' },
      { shortCode: 'GL', isActive: false, name: 'Glutes' },
      { shortCode: 'HM', isActive: false, name: 'Hamstrings' },
      { shortCode: 'JP', isActive: false, name: 'Jumping' },
      { shortCode: 'LT', isActive: false, name: 'Lats' },
      { shortCode: 'PC', isActive: false, name: 'Posterior Chain' },
      { shortCode: 'QD', isActive: false, name: 'Quads' },
      { shortCode: 'SH', isActive: false, name: 'Shoulders' },
      { shortCode: 'TR', isActive: false, name: 'Triceps' },
      { shortCode: 'UL', isActive: false, name: 'Unilateral' },
      { shortCode: 'MO', isActive: false, name: 'Mobility' },
    ],
    []
  )
  const { exercise, handleGoBack } = route.params || {
    exercise: { exerciseName: '', categories: [] },
    handleGoBack: () => {},
  }

  const programDetails = useTypedSelector(
    ({ firestore: { data } }) => data?.userProgram?.programDetails
  )
  const dispatch = useDispatch()
  const userID = useTypedSelector(({ firebase: { auth } }) => auth.uid)
  const [categories, setCategories] = useState(exerciseCategories)
  const [exerciseName, setExerciseName] = useState('')
  const [units, setUnits] = useState(programDetails?.userBioData?.unitsIndex)
  const [weightIncrements, setWeightIncrements] = useState(2)
  const [exerciseType, setExerciseType] = useState(0)
  const [repType, setRepType] = useState(0)
  const firestore = useFirestore()
  const theme = useTheme()

  useEffect(() => {
    if (exercise && exercise?.exerciseName !== '') {
      setExerciseName(exercise?.exerciseName)

      const defaultCategories = [...exerciseCategories]
      exercise.categories.forEach((cat) => {
        const catIndex = defaultCategories.findIndex(
          (item) => item.shortCode === cat
        )

        defaultCategories[catIndex].isActive = true
      })
      setCategories(defaultCategories)
    } else {
      setCategories(exerciseCategories)
    }
  }, [exercise])

  const handleNewUserExercise = useCallback(
    async (details) => {
      try {
        const shortCode = exercise
          ? exercise.exerciseShortcode
          : `_${details.exerciseName.replace(/[^a-zA-Z0-9]/gi, '')}`
        const activeCategories = details.categories.filter(
          (cat) => cat.isActive
        )
        const newExercise = {
          categories: activeCategories.map((cat) => cat.shortCode),
          exerciseName: details.exerciseName,
          exerciseShortcode: shortCode,
          primaryCategory: activeCategories.map((cat) => cat.shortCode)[0],
          max: {
            date: new Date(),
            amount: details?.max || null,
            units: unitTypes[units].toLowerCase(),
          },
          repType: repTypes[repType].code,
          style:
            exerciseTypes[exerciseType] === 'Reps' ? 'Periodization' : 'TUT',
          isUserExercise: true,
          weightIncrement: weightIncrementTypes[weightIncrements],
          units: unitTypes[units].toLowerCase(),
        }
        customLog(newExercise, 'New Exercise Data')
        await firestore
          .collection(`users/${userID}/exercises`)
          .doc(shortCode)
          .set(newExercise)

        // return exercise ? navigation.goBack() : navigation.navigate("IndividualExercise", { exerciseID: shortCode })
        if (handleGoBack) {
          handleGoBack()
        }
        return navigation.goBack()
      } catch (e) {
        Sentry.Native.captureException(e)
        return dispatch(
          showErrorNotification({
            title: 'Error',
            description: e.message,
          })
        )
      }
    },
    [exercise, repType, exerciseType, weightIncrements, units]
  )

  return (
    <View style={{ flex: 1 }}>
      {/* <GradientHeader paddedTop title={exercise ? "Edit Exercise" : "Create Exercise"} /> */}

      <FormWrapper>
        <View style={{ padding: 10 }} />
        <Formik
          initialValues={{ categories, exerciseName }}
          enableReinitialize={true}
          validationSchema={Yup.object({
            exerciseName: Yup.string()
              .matches(/[a-zA-Z]/, {
                message: 'Must contain at least one letter from the alphabet',
              })
              .min(3, 'Must be at least 3 characters long')
              .required('Required'),

            categories: Yup.mixed()
              .test(
                'min-max-days',
                'Please pick at least one category',
                (value) => {
                  const daysLength = value.filter((day) => day.isActive)?.length
                  return daysLength >= 1 ? true : false
                }
              )
              .required('Required'),
          })}
          onSubmit={async (values, formikActions) => {
            await handleNewUserExercise(values)
            formikActions.setSubmitting(false)
          }}>
          {(props) => (
            <Layout>
              <FormControl>
                <Input
                  // style={styles.formInput}
                  size='large'
                  placeholder='Exercise Name'
                  label='Enter Name'
                  value={props.values.exerciseName}
                  onBlur={props.handleBlur('exerciseName')}
                  onChangeText={props.handleChange('exerciseName')}
                  caption={
                    props.touched.exerciseName && props.errors.exerciseName
                      ? props.errors.exerciseName
                      : ''
                  }
                  status={
                    props.touched.exerciseName && props.errors.exerciseName
                      ? 'warning'
                      : 'basic'
                  }
                />
              </FormControl>

              <View style={styles.exerciseRow}>
                <Text category='label'>Preferred Rep Style</Text>
                <ButtonSwitch onSelect={setRepType} selectedIndex={repType}>
                  {repTypes.map((inc) => (
                    <Button key={inc.code} size='small'>
                      {inc.display}
                    </Button>
                  ))}
                </ButtonSwitch>
              </View>
              <View style={styles.exerciseRow}>
                <Text category='label'>Exercise Style</Text>
                <ButtonSwitch
                  onSelect={setExerciseType}
                  selectedIndex={exerciseType}>
                  {exerciseTypes.map((inc) => (
                    <Button key={inc} size='small'>
                      {inc}
                    </Button>
                  ))}
                </ButtonSwitch>
              </View>

              <View style={styles.exerciseRow}>
                <Text category='label'>Units</Text>
                <ButtonSwitch onSelect={setUnits} selectedIndex={units}>
                  {unitTypes.map((inc) => (
                    <Button key={inc} size='small'>
                      {inc}
                    </Button>
                  ))}
                </ButtonSwitch>
              </View>

              <View
                style={[
                  styles.exerciseRow,
                  {
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    flexDirection: 'column',
                  },
                ]}>
                <Text category='label' style={{}}>
                  Weight Increments
                </Text>
                <ButtonSwitch
                  style={{ alignSelf: 'flex-end', flex: 1, marginTop: 5 }}
                  onSelect={setWeightIncrements}
                  selectedIndex={weightIncrements}>
                  {weightIncrementTypes.map((inc) => (
                    <Button key={inc} size='small'>
                      {inc}
                    </Button>
                  ))}
                </ButtonSwitch>
              </View>

              <FormControl label='Categories'>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                  }}>
                  {props.values.categories.map((day, index) => (
                    <CheckBox
                      key={day.name}
                      style={[
                        styles.checkbox,
                        { backgroundColor: theme['background-basic-color-3'] },
                      ]}
                      checked={props.values.categories[index].isActive}
                      onChange={(nextChecked) => {
                        props.setFieldValue(
                          `categories[${index}].isActive`,
                          nextChecked,
                          false
                        )

                        props.validateForm({
                          ...props.values,
                          categories: [
                            ...props.values.categories.slice(0, index),
                            {
                              ...props.values.categories[index],
                              isActive: nextChecked,
                            },
                            ...props.values.categories.slice(index + 1),
                          ],
                        })
                      }}>
                      {day.name}
                    </CheckBox>
                  ))}
                  {props.touched.categories && props.errors.categories ? (
                    <Text status='warning'>{props.errors.categories}</Text>
                  ) : null}
                </View>
              </FormControl>

              <SubmitSection
                errors={props.errors}
                touched={props.touched}
                submitting={props.isSubmitting}
                submitLabel={exercise ? 'UPDATE' : 'CREATE EXERCISE'}
                handleSubmit={() => props.handleSubmit()}
                goBack={() => navigation.goBack()}
              />
            </Layout>
          )}
        </Formik>
      </FormWrapper>
    </View>
  )
}

export default CreateExercise

const styles = StyleSheet.create({
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    alignItems: 'center',
  },
  checkbox: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    width: '48%',
    // shadowColor: "#000",
    // shadowOffset: {
    //     width: 0,
    //     height: 2,
    // },
    // shadowOpacity: 0.23,
    // shadowRadius: 2.62,

    // elevation: 4,
  },
})
