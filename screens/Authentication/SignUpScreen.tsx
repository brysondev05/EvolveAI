import { useState } from 'react'
import {
  StyleSheet,
  StatusBar,
  TouchableWithoutFeedback,
  View,
  Pressable,
  Linking,
} from 'react-native'
import { useDispatch } from 'react-redux'

import { Formik } from 'formik'
import * as Yup from 'yup'

import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Layout, Text, Input, Icon, Toggle } from '@ui-kitten/components'

import { StackNavigationProp } from '@react-navigation/stack'
import { AuthStackParamList } from '~/screens/types/navigation'

import auth from '@react-native-firebase/auth'
import Intercom from '@intercom/intercom-react-native'

import { Notifier, Easing, NotifierComponents } from 'react-native-notifier'
import { LoadingSplash } from '~/components/LoadingSplash'
import FormControl from '~/components/presentational/FormComponents'
import { LogoHeader } from '~/components/SignUp/LogoHeader'
import SubmitSection from '~/components/SignUp/SubmitSection'
import { useFirestore } from 'react-redux-firebase'
import { FormWrapper } from '~/components/FormWrapper'
import analytics from '@react-native-firebase/analytics'
import {
  getIAPProducts,
  setIAPUserID,
} from '~/reduxStore/actions/subscriptionActions'
import { AppEventsLogger } from 'react-native-fbsdk-next'
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions'
import ThemeColor from '~/constants/color'

type SignUpScreenProp = StackNavigationProp<AuthStackParamList, 'SignUp'>

type Props = {
  navigation: SignUpScreenProp
}

interface AccountFormValues {
  email: string
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
  terms: boolean
}

export default function SignUpScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  // const token = useTypedSelector(state => state.auth.userToken);

  const dispatch = useDispatch()
  const firestore = useFirestore()

  const [isLoading, setIsLoading] = useState(false)

  const [secureTextEntry, setSecureTextEntry] = useState(true)

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry)
  }

  //password display icon
  const renderIcon = (props: any) => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  )

  const accountFormValues: AccountFormValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  }

  const handleSignUp = async ({
    email,
    firstName,
    lastName,
    password,
  }: AccountFormValues) => {
    let errorMessage = ''
    setIsLoading(true)

    try {
      const newUser = await auth().createUserWithEmailAndPassword(
        email,
        password
      )
      const id = newUser.user.uid

      await newUser.user.sendEmailVerification()

      // Intercom.registerIdentifiedUser({ email });

      Intercom.updateUser({
        name: `${firstName} ${lastName}`,
        customAttributes: {
          app_started_signup: 'true',
          has_app_subscription: 'false',
        },
      })

      AppEventsLogger.logEvent('createdAccount')
      await analytics().logSignUp({
        method: 'email',
      })
      await analytics().setUserId(id)

      Intercom.logEvent('viewed_screen', { extra: 'App SignUp Screen' })

      // await setIAPUserID(id)
      // await dispatch(getIAPProducts())

      await firestore.doc(`users/${id}`).set(
        {
          name: `${firstName} ${lastName}`,
          role: 'user',
          passedSignUp: false,
          lastSeen: firestore.Timestamp.now(),
        },
        { merge: true }
      )

      setIsLoading(false)

      return navigation.navigate('ProgramCreation')
    } catch (error) {
      setIsLoading(false)
      if (error.code === 'auth/email-already-in-use') {
        errorMessage +=
          'Email address is already in use \n Please go back and log in to your account'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage += 'Invalid email'
      } else if (error.code === 'auth/weak-password') {
        errorMessage += 'Please enter a stronger password'
      } else {
        errorMessage += error.message
      }

      Notifier.showNotification({
        title: 'Error',
        description: errorMessage,
        duration: 5000,
        showAnimationDuration: 200,
        Component: NotifierComponents.Alert,
        showEasing: Easing.bounce,
        componentProps: {
          alertType: 'error',
        },
      })
    }
  }

  return (
    <Layout
      style={[
        styles.container,
        { paddingTop: insets.top + 10, paddingBottom: insets.bottom, flex: 1 },
      ]}>
      <StatusBar barStyle='light-content' />

      <LogoHeader
        progress={0}
        description="Let's get to know you! First, we'll create an account so we can save your program"
      />
      <FormWrapper>
        <Formik
          initialValues={accountFormValues}
          validationSchema={Yup.object({
            firstName: Yup.string().required('Required'),
            lastName: Yup.string().required('Required'),
            email: Yup.string().email('Invalid Email').required('Required'),
            password: Yup.string().min(8, 'Password is too short'),
            terms: Yup.boolean().oneOf(
              [true],
              'You must agree to our privacy policy and terms of use'
            ),
            confirmPassword: Yup.string()
              .oneOf([Yup.ref('password')], 'Passwords must match')
              .required('Password confirm is required'),
          })}
          onSubmit={(values, formikActions) => {
            setTimeout(() => {
              handleSignUp(values)
              // Alert.alert(JSON.stringify(values));
              // Important: Make sure to setSubmitting to false so our loading indicator
              // goes away.
              formikActions.setSubmitting(false)
            }, 500)
          }}>
          {(props) => (
            <Layout>
              <FormControl>
                <Input
                  style={styles.formInput}
                  placeholder='First Name'
                  label='First Name'
                  value={props.values.firstName}
                  onBlur={props.handleBlur('firstName')}
                  onChangeText={props.handleChange('firstName')}
                  caption={
                    props.touched.firstName && props.errors.firstName
                      ? props.errors.firstName
                      : ''
                  }
                  status={
                    props.touched.firstName && props.errors.firstName
                      ? 'warning'
                      : 'basic'
                  }
                  textContentType='givenName'
                />

                <Input
                  style={styles.formInput}
                  label='Last Name'
                  placeholder='Last Name'
                  value={props.values.lastName}
                  onBlur={props.handleBlur('lastName')}
                  onChangeText={props.handleChange('lastName')}
                  caption={
                    props.touched.lastName && props.errors.lastName
                      ? props.errors.lastName
                      : ''
                  }
                  status={
                    props.touched.lastName && props.errors.lastName
                      ? 'warning'
                      : 'basic'
                  }
                  textContentType='familyName'
                />
              </FormControl>
              <FormControl>
                <Input
                  style={styles.formInput}
                  autoComplete='email'
                  label='Email'
                  keyboardType='email-address'
                  textContentType='emailAddress'
                  placeholder='Your Email'
                  value={props.values.email}
                  onBlur={props.handleBlur('email')}
                  onChangeText={props.handleChange('email')}
                  caption={
                    props.touched.email && props.errors.email
                      ? props.errors.email
                      : ''
                  }
                  status={
                    props.touched.email && props.errors.email
                      ? 'warning'
                      : 'basic'
                  }
                />
              </FormControl>
              <FormControl>
                <Input
                  style={styles.formInput}
                  autoComplete='password'
                  value={props.values.password}
                  label='Password'
                  placeholder='Enter password'
                  caption={
                    props.touched.password && props.errors.password
                      ? props.errors.password
                      : ''
                  }
                  accessoryRight={renderIcon}
                  secureTextEntry={secureTextEntry}
                  onBlur={props.handleBlur('password')}
                  onChangeText={props.handleChange('password')}
                  status={
                    props.touched.password && props.errors.password
                      ? 'warning'
                      : 'basic'
                  }
                  textContentType='newPassword'
                  // blurOnSubmit={false}
                />

                <Input
                  autoComplete='password'
                  style={[styles.formInput, { marginBottom: 10 }]}
                  value={props.values.confirmPassword}
                  label='Confirm Password'
                  placeholder='Confirm password'
                  accessoryRight={renderIcon}
                  secureTextEntry={secureTextEntry}
                  onBlur={props.handleBlur('confirmPassword')}
                  onChangeText={props.handleChange('confirmPassword')}
                  caption={
                    props.touched.confirmPassword &&
                    props.errors.confirmPassword
                      ? props.errors.confirmPassword
                      : ''
                  }
                  status={
                    props.touched.confirmPassword &&
                    props.errors.confirmPassword
                      ? 'warning'
                      : 'basic'
                  }
                  textContentType='newPassword'
                  // blurOnSubmit={false}
                />
              </FormControl>
              <FormControl>
                <View style={{ flexDirection: 'row' }}>
                  <Toggle
                    status='control'
                    checked={props.values.terms}
                    onChange={(next) => props.setFieldValue('terms', next)}
                  />
                  <View
                    style={{
                      marginLeft: 15,
                      flex: 1,
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                    }}>
                    <Text>I agree to the </Text>
                    <Pressable
                      onPress={() =>
                        Linking.openURL(
                          'https://www.evolveai.app/privacy-policy'
                        )
                      }>
                      <Text status='primary'>Privacy Policy</Text>
                    </Pressable>
                    <Text> and </Text>
                    <Pressable
                      onPress={() =>
                        Linking.openURL('https://www.evolveai.app/terms-of-use')
                      }>
                      <Text status='primary'>Terms of Use</Text>
                    </Pressable>
                  </View>
                </View>
                {props.errors.terms && (
                  <Text
                    status='warning'
                    category='c1'
                    style={{ marginTop: 15 }}>
                    {props.errors.terms}{' '}
                  </Text>
                )}
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
      </FormWrapper>
      {isLoading && <LoadingSplash />}
    </Layout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    // paddingBottom: 0,
    marginBottom: 30,
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
  pageContainer: {
    position: 'absolute',
    bottom: 0,
  },
  logoHeader: {
    flexDirection: 'row',
  },
  formInput: {
    marginBottom: 10,
    backgroundColor: ThemeColor.secondary,
  },
  inputGroup: {
    marginBottom: 10,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 20,
    padding: 20,
    zIndex: 100,
    width: '100%',
    backgroundColor: 'transparent',
  },
  tab: {
    // height: 800,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  wrapper: {
    height: '100%',
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
})
