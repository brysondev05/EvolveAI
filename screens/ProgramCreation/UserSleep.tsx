import { useContext } from 'react';

import { Formik } from 'formik';
import * as Yup from 'yup';

import { SignUpStyles } from '~/styles/SignUpStyle';
import { Layout, RadioGroup, Radio, useStyleSheet } from '@ui-kitten/components';
import FormControl from '~/components/presentational/FormComponents';

import { BioDataProps } from '~/screens/types/signup';
import { useTypedSelector } from '~/reduxStore/reducers';
import { useDispatch } from 'react-redux';
import SubmitSection from '~/components/SignUp/SubmitSection';
import { FormWrapper } from '~/components/FormWrapper';
import { FlowContext } from '~/context/signUpFlow-context';


export const UserSleep = ({ navigation, route }: BioDataProps) => {


    const userBioData = useTypedSelector(state => state.signUp.userBioData);
    const dispatch = useDispatch();

    const sleepOptions = [
        'Less than 5 hours',
        'Between 5 and 7 hours',
        'More than 7 hours',
    ]
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
                    sleep: Yup.number()
                        .required('Required'),
                })}
                onSubmit={(values, formikActions) => {
                    dispatch({ type: "UPDATE_BIO_DATA", payload:  values });
                    navigation.navigate(nextScreen.name);

                    formikActions.setSubmitting(false);
                }}>
                {(props) => (

                    <Layout>

                        <FormControl label="How much sleep do you get?">
                            <RadioGroup
                                selectedIndex={props.values.sleep}
                                onChange={index => {
                                    props.setFieldTouched('sleep')
                                    props.setFieldValue('sleep', index);
                                 
                                }}>
                                {sleepOptions.map(renderRadio)}
                            </RadioGroup>
                        </FormControl>

                        <SubmitSection 
                    errors={props.errors}
                    touched={props.touched}
                    submitting={props.isSubmitting} 
                    handleSubmit={() => props.handleSubmit()} 
                    goBack={() => navigation.goBack()} />
                    </Layout>
                )}
            </Formik>
      </FormWrapper>
    )
}
