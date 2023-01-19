import { useContext } from 'react';

import { Formik } from 'formik';
import * as Yup from 'yup';

import { SignUpStyles } from '../../styles/SignUpStyle';
import { Layout, Text, useTheme, IndexPath, SelectItem, RadioGroup, Radio, useStyleSheet } from '@ui-kitten/components';
import SubmitSection from '~/components/SignUp/SubmitSection';

import { BioDataProps } from '~/screens/types/signup';
import { useTypedSelector } from '~/reduxStore/reducers';
import { useDispatch } from 'react-redux';
import FormControl from '~/components/presentational/FormComponents';
import { FormWrapper } from '~/components/FormWrapper';
import { FlowContext } from '~/context/signUpFlow-context';


export const UserTrainingHistory = ({ navigation, route }: BioDataProps) => {

    const userBioData = useTypedSelector(state => state.signUp.userBioData);

    const dispatch = useDispatch();

    const trainingYears = [
        'Less than 4 Years',
        '4-8 Years',
        '8-12 Years',
        '12+ Years'
    ]

    const trainingFrequency = [
        'Very Low Volume (1x per week, per lift) ',
        'Low Volume (1-2x per week, plus accessories)',
        'Medium Volume (2-3x per week, per lift)',
        'Medium-High Volume (2-3x per week, per lift, plus accessories)',
        'High Volume (4x or more per week)'
    ];
    const formStyles = useStyleSheet(SignUpStyles)


    const renderRadio = (title: string, index: number) => (
        <Radio key={index} style={formStyles.radioButton}>{title}</Radio>
    )
    const {name} = route
    const {screens} = useContext(FlowContext)
    const screenIndex = screens.findIndex(e => e.name === name)
    const nextScreen = screens[screenIndex + 1]

    

    return (
        <FormWrapper>
            <Formik
                initialValues={userBioData}
                validationSchema={Yup.object({
                    trainingHistory: Yup.number()
                        .required('Required'),
                })}
                onSubmit={(values, formikActions) => {
                    
                    dispatch({ type: "UPDATE_BIO_DATA", payload: values });
                    navigation.navigate(nextScreen.name);

                    formikActions.setSubmitting(false);
                }}>
                {({handleChange, setFieldValue, validateField, setFieldTouched, values, errors, touched, isSubmitting, handleSubmit, validateForm}) => (
                    <Layout>
                        <FormControl label="How long have you been lifting?">
                            <RadioGroup
                                selectedIndex={values.trainingHistory}
                                onChange={index => {
                                    setFieldTouched('trainingHistory', true);

                                  setFieldValue('trainingHistory', index, true);  
                                }}>
                                {trainingYears.map(renderRadio)}
                            </RadioGroup>
                        </FormControl>
                     
                        <SubmitSection 
                    errors={errors}
                    touched={touched}
                    submitting={isSubmitting} 
                    handleSubmit={handleSubmit} 
                    goBack={() => navigation.goBack()}
                    items={1}
                    />
                    </Layout>
                )}
            </Formik>
            </FormWrapper>
    )
}
