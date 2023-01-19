import { View, Alert, } from 'react-native'
import { useTypedSelector } from '~/reduxStore/reducers';
import { FormWrapper } from '~/components/FormWrapper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Layout, CheckBox, Text, useStyleSheet } from '@ui-kitten/components';
import FormControl from '~/components/presentational/FormComponents';
import SubmitSection from '~/components/SignUp/SubmitSection';
import { useDispatch } from 'react-redux';
import GradientHeader from '~/components/presentational/GradientHeader';
import { useActionSheet } from '@expo/react-native-action-sheet'
import { handleTrainingDayChange } from '~/reduxStore/actions/programModifierActions';
import { SignUpStyles } from '~/styles/SignUpStyle';

const trainingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];



export default function TrainingDaySettings({ navigation, route }) {

    const dispatch = useDispatch()
    const formStyles = useStyleSheet(SignUpStyles)
    const { showActionSheetWithOptions } = useActionSheet();


    const userProgramData = useTypedSelector(({ firestore: { data } }) => data.userProgram && data.userProgram?.programDetails?.userProgramData)

    const currentWeek = useTypedSelector(({firebase: {profile}}) => profile.currentWeek)
    const thisWeek = useTypedSelector(({firestore: {data}}) => data.programWeeks?.[`week${currentWeek}`])
    const nextWeek = useTypedSelector(({firestore: {data}}) => data.programWeeks?.[`week${currentWeek + 1}`])

    
    if(thisWeek?.blockType === 'FinalPhase'){
        return (
            <Layout style={{ flex: 1 }}>
                            <GradientHeader title="Training Days" />

                <Text category="h1">Disabled</Text>
                <Text>As you are in the final phase of training, we have disabled the ability to change your training days. Please try to follow your plan as closely as possible.</Text>
            </Layout>
        )
    }

    const warnTrainingWeekChange = (trainingDays) => Alert.alert("Warning", `Doing this will remove any progress from this week (week ${thisWeek?.startingWeek}) and regenerate the week using your new choice in training days`, [
        {
            style: 'destructive',
            text: 'Re-calculate this week',
            onPress: () => dispatch(handleTrainingDayChange({ trainingDays, resetCurrentWeek: true }))
            
        },
        {
            text: 'Cancel',
            style: 'cancel'
        }
    ])


    

    return (
        <Layout style={{ flex: 1, paddingBottom: 30 }}>

            <GradientHeader title="Training Days" />
            <FormWrapper>
                <Formik
                    initialValues={userProgramData}
                    validationSchema={Yup.object({
                        trainingDays: Yup.object().test('min-max-days', 'Please pick a minimum of 3 days and a maximum of 6 days', (value) => {
                            const daysLength = Object.values(value).filter(day => day)?.length;
                            return daysLength >= 3 && daysLength < 7 ? true : false
                        })
                            .required('Required'),
                        // meetIndex: Yup.number()
                        // .required('Required'),

                    })}
                    onSubmit={(values, formikActions) => {
                        // dispatch({ type: "UPDATE_PROGRAM_DATA", payload: values });
                        if(nextWeek?.blockType === 'FinalPhase'){

                            showActionSheetWithOptions({
                                options:['OK, change this week', 'Cancel'],
                                cancelButtonIndex: 1,
                                destructiveButtonIndex: 0,
                                message: 'As next week is the start of your final phase of training you may only change this current week. Doing this will result losing any progress this week and selected exercises will be reset',
                                title: 'Confirm Change'
                                
                            },
                            buttonIndex => {
                                if(buttonIndex === 0) {
                                        return dispatch(handleTrainingDayChange({ trainingDays: values?.trainingDays, resetCurrentWeek: true, thisWeekOnly: true }))
                                }
                            })


                            // Alert.alert(
                            //     "Confirm Change",
                            //     "As next week is the start of your final phase of training you may only change this current week. Doing this will result losing any progress this week and selected exercises will be reset", [{
                            //         text: "OK",
                            //         onPress: () => dispatch(handleTrainingDayChange({ trainingDays: values.trainingDays, resetCurrentWeek: true, thisWeekOnly: true })),
                            //         style: 'destructive'
                            //     },
                            //     {
                            //         text: "Cancel",
                            //         style: "cancel"
                            //     },
                            // ],
                            //     { cancelable: true }
                            // )
                        } else {
                            showActionSheetWithOptions({
                                options:['Change from this week', 'Change from next week', 'Cancel'],
                                cancelButtonIndex: 2,
                                destructiveButtonIndex: 0,
                                message: 'Do you want to change this week? Changing training days will result in losing any progress this week and selected exercises will be reset',
                                title: 'Confirm Change'
                                
                            },
                            buttonIndex => {
                                if(buttonIndex === 0) {
                                        return warnTrainingWeekChange(values?.trainingDays)
                                }
                                if(buttonIndex === 1) {
                                        return dispatch(handleTrainingDayChange({ trainingDays: values?.trainingDays, resetCurrentWeek: false }))
                                }
                            })

                            // Alert.alert(
                            //     "Confirm Change",
                            //     "Do you want to change this week? Changing training days will result in losing any progress this week and selected exercises will be reset", [{
                            //         text: "Change from this week",
                            //         onPress: () => dispatch(handleTrainingDayChange({ trainingDays: values.trainingDays, resetCurrentWeek: true })),
                            //         style: 'destructive'
                            //     },
                            //     {
                            //         text: "Change from next week",
                            //         onPress: () => dispatch(handleTrainingDayChange({ trainingDays: values.trainingDays, resetCurrentWeek: false })),
                            //     },
                            //     {
                            //         text: "Cancel",
                            //         style: "cancel"
                            //     },
                            // ],
                            //     { cancelable: true }
                            // )
    
                            // navigation.navigate('UserMeetDay');
                            formikActions.setSubmitting(false);
                        }
                        
                    }}>
                    {(props) => (

                        <Layout>

                            <FormControl label="What days would you like to workout?">
                        <Text>Pick between 3 - 6 days of training</Text>
                            <View style={{ justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'wrap' }}>
                            {trainingDays.map(day => (
                                <CheckBox key={day}
                                    style={formStyles.checkboxButton}
                                        checked={props.values?.trainingDays[day.toLowerCase()]} onChange={nextChecked => {

                                            props.setFieldValue(`trainingDays.${day.toLowerCase()}`, nextChecked, false);

                                            const trainingDaysPerWeek = Object.values(props.values?.trainingDays).filter(day => day)?.length + (nextChecked ? 1 : -1);

                                            props.setFieldValue('trainingDaysPerWeek', trainingDaysPerWeek);
                                            props.validateForm({ ...props.values, trainingDays: { ...props.values?.trainingDays, [day.toLowerCase()]: nextChecked } })
                                        }}
                                    >
                                        {day}
                                    </CheckBox>
                                ))}
                                </View>
                            </FormControl>
                            <SubmitSection
                                errors={props.errors}
                                touched={props.touched}
                                submitting={props.isSubmitting}
                                submitLabel="UPDATE PROGRAM"
                                handleSubmit={() => props.handleSubmit()}
                                showBack={false} />
                        </Layout>
                    )}
                </Formik>
            </FormWrapper>

        </Layout>
    )
}
