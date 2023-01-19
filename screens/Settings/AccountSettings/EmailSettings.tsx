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
import GradientHeader from '~/components/presentational/GradientHeader'
import ThemeColor from '~/constants/color'

type SignUpScreenProp = StackNavigationProp<AuthStackParamList, 'Reset'>

type Props = {
  navigation: SignUpScreenProp
}

interface ChangeEmailFormValues {
  password: string
  newEmail: string
}

export default function EmailSettings({ navigation }) {
  const insets = useSafeAreaInsets()
  // const token = useTypedSelector(state => state.auth.userToken);

  const dispatch = useDispatch()

  const theme = useTheme()

  const [isLoading, setIsLoading] = useState(false)
  const { currentUser } = auth()

  const changePasswordFormValues: ChangeEmailFormValues = {
    password: '',
    newEmail: '',
  }

  const [secureTextEntry, setSecureTextEntry] = useState(true)

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry)
  }

  const renderIcon = (props: any) => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  )

  const reauthenticate = (currentPassword) => {
    const { currentUser } = auth()
    var cred = auth.EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    )
    return currentUser.reauthenticateWithCredential(cred)
  }

  const handleEmailChange = async ({
    password,
    newEmail,
  }: ChangeEmailFormValues) => {
    let errorMessage = ''
    setIsLoading(true)
    try {
      const { currentUser } = auth()

      await reauthenticate(password)

      await currentUser.updateEmail(newEmail)
      setIsLoading(false)

      // Intercom.displayMessageComposer();
      Notifier.showNotification({
        title: 'Success',
        description: 'Your email has been updated',
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
      if (error.code === 'auth/wrong-password') {
        errorMessage += 'Your current password is incorrect, please try again'
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
    <Layout style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle='light-content' />

      <GradientHeader title='Change your email' />

      <Layout style={[SignUpStyles.innerSwipe, { marginTop: 30 }]}>
        <Formik
          initialValues={changePasswordFormValues}
          validationSchema={Yup.object({
            password: Yup.string().min(8, 'Password is too short'),
            newEmail: Yup.string().email('Invalid Email').required('Required'),
          })}
          onSubmit={async (values, formikActions) => {
            await handleEmailChange(values)

            formikActions.resetForm()
            formikActions.setSubmitting(false)
          }}>
          {(props) => (
            <Layout>
              <FormControl>
                <Input
                  style={styles.formInput}
                  autoComplete='email'
                  label='New Email'
                  keyboardType='email-address'
                  textContentType='emailAddress'
                  placeholder={currentUser.email}
                  value={props.values.newEmail}
                  onBlur={props.handleBlur('newEmail')}
                  onChangeText={props.handleChange('newEmail')}
                  caption={
                    props.touched.newEmail && props.errors.newEmail
                      ? props.errors.newEmail
                      : ''
                  }
                  status={
                    props.touched.newEmail && props.errors.newEmail
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
                  textContentType='password'
                />
              </FormControl>

              <SubmitSection
                submitLabel='CHANGE EMAIL'
                errors={props.errors}
                touched={props.touched}
                submitting={props.isSubmitting}
                handleSubmit={() => props.handleSubmit()}
                showBack={false}
              />
            </Layout>
          )}
        </Formik>
      </Layout>
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
    backgroundColor: ThemeColor.secondary,
  },
})
