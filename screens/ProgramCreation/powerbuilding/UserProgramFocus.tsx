import { useContext } from 'react';

import { Formik } from 'formik';
import * as Yup from 'yup';

import {SignUpStyles} from '~/styles/SignUpStyle';
import { Layout, Radio, RadioGroup, useStyleSheet, } from '@ui-kitten/components';
import { RadioDescription, FormControl } from '../../../components/presentational/FormComponents';

import { ProgramSelectionProps } from '~/screens/types/signup';
import { useTypedSelector } from '~/reduxStore/reducers';
import { useDispatch } from 'react-redux';
import SubmitSection from '~/components/SignUp/SubmitSection';
import { FormWrapper } from '~/components/FormWrapper';
import { FlowContext } from '~/context/signUpFlow-context';

const programFocusOptions = ['70% Powerlifting / 30% Bodybuilding ', '60% / 40% ', '50% / 50%', '40% / 60%', '30% Powerlifting / 70% Bodybuilding']
const upperFocus = ['Back', 'Biceps', 'Chest', 'Shoulders', 'Triceps' ]
const lowerFocus = ['Calves', 'Glutes', 'Hamstrings', 'Quads']
const UserProgramFocus = ({navigation, route}) => {
    const userProgramData = useTypedSelector(state => state.signUp?.userProgramData);
    const dispatch = useDispatch();

    const {name} = route
    const {screens} = useContext(FlowContext)
    const screenIndex = screens.findIndex(e => e.name === name)
    const nextScreen = screens[screenIndex + 1]

    const formStyles = useStyleSheet(SignUpStyles)

    const radioItem = item => (
        <Radio key={item} style={formStyles.radioButton}>{item}</Radio>
    )
    return (
        <FormWrapper>
        <Formik
            initialValues={userProgramData}
            validationSchema={Yup.object({
                programIndex: Yup.number()
                    .required('Required')
            })}
            onSubmit={(values, formikActions) => {
                
                dispatch({ type: "UPDATE_PROGRAM_DATA", payload:  values  });
                navigation.navigate(nextScreen.name);



                formikActions.setSubmitting(false);
            }}>
            {(props) => (
                <Layout>
                    <FormControl label="How do you want to focus you powerbuilding program?">
                        <RadioGroup
                            selectedIndex={props.values?.powerbuilding?.plFocus || 0}
                            onChange={index => {
                                props.setFieldValue('powerbuilding.plFocus', index)
                            }}>
                                {programFocusOptions.map(radioItem)}
                        </RadioGroup>
                    </FormControl>
                    <FormControl label="What upper body part do you want to improve?">
                        <RadioGroup
                            selectedIndex={props.values?.powerbuilding?.upperFocus || 0}
                            onChange={index => {
                                props.setFieldValue('powerbuilding.upperFocus', index)
                            }}>
                                {upperFocus.map(radioItem)}
                        </RadioGroup>
                    </FormControl>
                    <FormControl label="What lower body part do you want to improve?">
                        <RadioGroup
                            selectedIndex={props?.values?.powerbuilding?.lowerFocus || 0}
                            onChange={index => {
                                props.setFieldValue('powerbuilding.lowerFocus', index)
                            }}>
                                {lowerFocus.map(radioItem)}
                        </RadioGroup>
                    </FormControl>
                    <SubmitSection 
                errors={{  }}
                touched={{ true: true }}
                submitting={props.isSubmitting} 
                handleSubmit={() => props.handleSubmit()} 
                goBack={() => navigation.goBack()} />
                </Layout>
            )}
        </Formik>
   </FormWrapper>
    )
}

export default UserProgramFocus

