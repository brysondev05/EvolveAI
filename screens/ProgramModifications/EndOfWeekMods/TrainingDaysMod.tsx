import { View, Alert } from 'react-native'
import { useTypedSelector } from '~/reduxStore/reducers'
import { FormWrapper } from '~/components/FormWrapper'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { Layout, CheckBox, Text, useStyleSheet } from '@ui-kitten/components'
import FormControl from '~/components/presentational/FormComponents'
import SubmitSection from '~/components/SignUp/SubmitSection'
import { useDispatch } from 'react-redux'
import GradientHeader from '~/components/presentational/GradientHeader'
import { SafeAreaView } from 'react-native-safe-area-context'
import { handleTrainingDayChange } from '~/reduxStore/actions/programModifierActions'
import { endOfWeekCheckin } from '~/reduxStore/actions/powerlifting/cycleAdjustments/endOfWeekCheckinAction'
import { SignUpStyles } from '~/styles/SignUpStyle'
import { showLoading } from '~/reduxStore/reducers/globalUI'

const trainingDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export default function TrainingDaysMod({ navigation, route }) {
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

  const { userProgramData } = useTypedSelector(
    ({ firestore: { data } }) =>
      data.userProgram && data.userProgram?.programDetails
  )
  const dispatch = useDispatch()

  const formStyles = useStyleSheet(SignUpStyles)
  return (
    <Layout style={{ flex: 1, paddingBottom: 30 }}>
      <GradientHeader title='Training Days' />
      <FormWrapper>
        <Formik
          initialValues={userProgramData}
          validationSchema={Yup.object({
            trainingDays: Yup.object()
              .test(
                'min-max-days',
                'Please pick a minimum of 3 days and a maximum of 6 days',
                (value) => {
                  const daysLength = Object.values(value).filter(
                    (day) => day
                  )?.length
                  return daysLength >= 3 && daysLength < 7 ? true : false
                }
              )
              .required('Required'),
            // meetIndex: Yup.number()
            // .required('Required'),
          })}
          onSubmit={(values, formikActions) => {
            // dispatch({ type: "UPDATE_PROGRAM_DATA", payload: values });
            dispatch({
              type: 'MODIFY_TRAINING_DAYS',
              newTrainingDays: values.trainingDays,
            })
            if (programModifiers.weaknesses) {
              navigation.navigate('Weakness Modifications')
            } else if (programModifiers.pbFocuses) {
              navigation.navigate('Powerbuilding Modifications')
            } else {
              dispatch(showLoading(''))
              dispatch(endOfWeekCheckin({ withProgramModifications: true }))
            }

            // navigation.navigate('UserMeetDay');
            formikActions.setSubmitting(false)
          }}>
          {(props) => (
            <Layout>
              <FormControl label='What days would you like to workout?'>
                <View
                  style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                  }}>
                  {trainingDays.map((day) => (
                    <CheckBox
                      key={day}
                      style={formStyles.checkboxButton}
                      checked={props.values.trainingDays[day.toLowerCase()]}
                      onChange={(nextChecked) => {
                        props.setFieldValue(
                          `trainingDays.${day.toLowerCase()}`,
                          nextChecked,
                          false
                        )

                        const trainingDaysPerWeek =
                          Object.values(props.values?.trainingDays).filter(
                            (day) => day
                          )?.length + (nextChecked ? 1 : -1)

                        props.setFieldValue(
                          'trainingDaysPerWeek',
                          trainingDaysPerWeek
                        )
                        props.validateForm({
                          ...props.values,
                          trainingDays: {
                            ...props.values?.trainingDays,
                            [day.toLowerCase()]: nextChecked,
                          },
                        })
                      }}>
                      {day}
                    </CheckBox>
                  ))}
                </View>
              </FormControl>
              <SubmitSection
                errors={props.errors}
                touched={props.touched}
                submitting={props.isSubmitting}
                submitLabel='NEXT'
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
