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

interface ChangePasswordFormValues {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function PasswordSettings({ navigation }) {
  const insets = useSafeAreaInsets()
  // const token = useTypedSelector(state => state.auth.userToken);

  const dispatch = useDispatch()

  const theme = useTheme()

  const [isLoading, setIsLoading] = useState(false)

  const changePasswordFormValues: ChangePasswordFormValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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

  const handleChangePassword = async ({
    currentPassword,
    newPassword,
    confirmPassword,
  }: ChangePasswordFormValues) => {
    let errorMessage = ''
    setIsLoading(true)
    try {
      const { currentUser } = auth()

      await reauthenticate(currentPassword)

      await currentUser.updatePassword(newPassword)
      setIsLoading(false)

      // Intercom.displayMessageComposer();
      Notifier.showNotification({
        title: 'Success',
        description: 'Your password has been updated',
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

      <GradientHeader title='Change your password' />

      <Layout style={[SignUpStyles.innerSwipe, { marginTop: 30 }]}>
        <Formik
          initialValues={changePasswordFormValues}
          validationSchema={Yup.object({
            currentPassword: Yup.string().min(8, 'Password is too short'),
            newPassword: Yup.string().min(8, 'Password is too short'),
            confirmPassword: Yup.string()
              .oneOf([Yup.ref('newPassword')], 'Passwords must match')
              .required('Password confirm is required'),
          })}
          onSubmit={async (values, formikActions) => {
            await handleChangePassword(values)

            formikActions.resetForm()
            formikActions.setSubmitting(false)
          }}>
          {(props) => (
            <Layout>
              <FormControl>
                <Input
                  style={styles.formInput}
                  autoComplete='password'
                  value={props.values.currentPassword}
                  label='Current Password'
                  placeholder='Enter current password'
                  caption={
                    props.touched.currentPassword &&
                    props.errors.currentPassword
                      ? props.errors.currentPassword
                      : ''
                  }
                  accessoryRight={renderIcon}
                  secureTextEntry={secureTextEntry}
                  onBlur={props.handleBlur('currentPassword')}
                  onChangeText={props.handleChange('currentPassword')}
                  status={
                    props.touched.currentPassword &&
                    props.errors.currentPassword
                      ? 'warning'
                      : 'basic'
                  }
                  textContentType='password'
                />
              </FormControl>
              <FormControl>
                <Input
                  style={styles.formInput}
                  autoComplete='password'
                  value={props.values.newPassword}
                  label='New Password'
                  placeholder='Enter new password'
                  caption={
                    props.touched.newPassword && props.errors.newPassword
                      ? props.errors.newPassword
                      : ''
                  }
                  accessoryRight={renderIcon}
                  secureTextEntry={secureTextEntry}
                  onBlur={props.handleBlur('newPassword')}
                  onChangeText={props.handleChange('newPassword')}
                  status={
                    props.touched.newPassword && props.errors.newPassword
                      ? 'warning'
                      : 'basic'
                  }
                  textContentType='newPassword'
                />
              </FormControl>
              <FormControl>
                <Input
                  style={styles.formInput}
                  autoComplete='password'
                  value={props.values.confirmPassword}
                  label='Confirm Password'
                  placeholder='Enter password again'
                  caption={
                    props.touched.confirmPassword &&
                    props.errors.confirmPassword
                      ? props.errors.confirmPassword
                      : ''
                  }
                  accessoryRight={renderIcon}
                  secureTextEntry={secureTextEntry}
                  onBlur={props.handleBlur('confirmPassword')}
                  onChangeText={props.handleChange('confirmPassword')}
                  status={
                    props.touched.confirmPassword &&
                    props.errors.confirmPassword
                      ? 'warning'
                      : 'basic'
                  }
                  textContentType='newPassword'
                />
              </FormControl>

              <SubmitSection
                submitLabel='CHANGE PASSWORD'
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
