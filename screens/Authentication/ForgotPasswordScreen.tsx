import { useState } from 'react'
import {
  StyleSheet,
  StatusBar,
  Alert,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native'
import { useDispatch } from 'react-redux'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { Formik } from 'formik'
import * as Yup from 'yup'

import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Layout,
  Text,
  useTheme,
  Button,
  Input,
  Icon,
} from '@ui-kitten/components'
import { SignUpStyles } from '~/styles/SignUpStyle'

import { StackNavigationProp } from '@react-navigation/stack'
import { AuthStackParamList } from '~/screens/types/navigation'

import auth from '@react-native-firebase/auth'
import Intercom from '@intercom/intercom-react-native'

import { Notifier, Easing, NotifierComponents } from 'react-native-notifier'
import { LoadingSplash } from '~/components/LoadingSplash'
import FormControl from '~/components/presentational/FormComponents'
import { LogoHeader } from '~/components/SignUp/LogoHeader'
import SubmitSection from '~/components/SignUp/SubmitSection'

type SignUpScreenProp = StackNavigationProp<AuthStackParamList, 'Reset'>

type Props = {
  navigation: SignUpScreenProp
}

interface ResetAccountFormValues {
  email: string
}

export default function SignUpScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()

  const dispatch = useDispatch()

  const theme = useTheme()

  const [isLoading, setIsLoading] = useState(false)

  const resetAccountFormValues: ResetAccountFormValues = { email: '' }

  const handleSignUp = async ({ email }: ResetAccountFormValues) => {
    let errorMessage = ''
    setIsLoading(true)
    try {
      await auth().sendPasswordResetEmail(email)

      // Intercom.displayMessageComposer();
      navigation.navigate('SignIn')
      Notifier.showNotification({
        title: 'Success',
        description:
          'Your password has successfully be reset, please check your email',
        duration: 5000,
        showAnimationDuration: 200,
        Component: NotifierComponents.Alert,
        showEasing: Easing.bounce,
        componentProps: {
          alertType: 'success',
        },
      })
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
        { paddingTop: insets.top + 10, paddingBottom: insets.bottom },
      ]}>
      <StatusBar barStyle='light-content' />

      <LogoHeader
        noProgress
        description="Enter your email below and we'll send you an email to get you back on track"
      />
      <KeyboardAwareScrollView
        style={{ backgroundColor: theme['background-basic-color-1'] }}
        contentContainerStyle={{
          alignItems: 'flex-end',
          flexDirection: 'row',
          flex: 1,
          height: '100%',
        }}>
        <Layout style={SignUpStyles.innerSwipe}>
          <Formik
            initialValues={resetAccountFormValues}
            validationSchema={Yup.object({
              email: Yup.string().email('Invalid Email').required('Required'),
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
                    size='large'
                    autoCorrect={false}
                  />
                </FormControl>

                <SubmitSection
                  submitLabel='RESET PASSWORD'
                  errors={props.errors}
                  touched={props.touched}
                  submitting={props.isSubmitting}
                  handleSubmit={() => props.handleSubmit()}
                  goBack={() => navigation.goBack()}
                />
              </Layout>
            )}
          </Formik>
        </Layout>
      </KeyboardAwareScrollView>
      {isLoading && <LoadingSplash />}
    </Layout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },

  formInput: {
    marginBottom: 10,
  },
})
