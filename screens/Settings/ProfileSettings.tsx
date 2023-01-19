import { useState, useEffect } from 'react'
import { View, Alert, StyleSheet } from 'react-native'
import { Layout, Text, Divider } from '@ui-kitten/components'
import GradientHeader from '~/components/presentational/GradientHeader'
import { TouchableHighlight } from 'react-native-gesture-handler'
import { useFirestore, useFirebase } from 'react-redux-firebase'
import { useTypedSelector } from '~/reduxStore/reducers'
import Intercom from '@intercom/intercom-react-native'
import { Notifier, Easing, NotifierComponents } from 'react-native-notifier'
import moment from 'moment'
import { capitalizeFullString } from '~/helpers/Strings'
import { convertToKG, convertToLB, round } from '~/helpers/Calculations'
import GeneralInputField from '~/components/GeneralInputField'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { dateToDate } from '~/helpers/Dates'
import { handleError } from '~/errorReporting'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '~/reduxStore/store'
import {
  handleLogout,
  handleDeleteAccount,
} from '~/reduxStore/actions/authActions'
import { useNavigation } from '@react-navigation/native'
import auth from '@react-native-firebase/auth'
import mainFirestore from '@react-native-firebase/firestore'
import { Input, Modal, Card, Button } from '@ui-kitten/components'
import { showErrorNotification } from '~/reduxStore/reducers/notifications'

export default function ProfileSettings() {
  const { name, height, bodyweight, genderIndex, birthday, units } =
    useTypedSelector(({ firebase: { profile } }) => profile)
  const userID = useTypedSelector(({ firebase: { auth } }) => auth.uid)

  const firebase = useFirebase()
  const firestore = useFirestore()
  const navigation = useNavigation()
  const dispatch = useDispatch<AppDispatch>()
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const showDatePicker = () => {
    setDatePickerVisibility(true)
  }

  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const hideDatePicker = () => {
    setDatePickerVisibility(false)
  }

  const birthdayDate = dateToDate(birthday)
  const birthdayFormatted = moment(birthdayDate).format('MMMM DD, YYYY')

  const gender = genderIndex === 0 ? 'Male' : 'Female'

  const unitsName =
    units === 0 ? 'Standard (pounds/inches)' : 'Metric (kilograms, centimeters)'

  const bodyweightUnits =
    bodyweight?.units === 1 || bodyweight?.units == 'kg' ? 'kg' : 'lb'
  const heightUnits = height?.units === 1 || height?.units == 'cm' ? 'cm' : 'in'
  const bodyWeightConverted =
    units === 0 && bodyweightUnits === 'kg'
      ? {
          value: convertToLB(bodyweight?.value),
          units: 'lb',
        }
      : bodyweight

  const heightConverted =
    units === 0 && heightUnits === 'cm'
      ? {
          value: round(height?.value / 2.54, 0.5),
          units: 'in',
        }
      : height

  const updateName = async (name) => {
    try {
      const pattern = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/

      const capitalizedName = capitalizeFullString(name)

      const nameSplit = name.trim()?.split(' ')

      if (nameSplit?.length < 2) {
        return Alert.alert(
          'Change Name',
          'Please enter your first and last name'
        )
      }
      if (!pattern.test(name)) {
        return Alert.alert(
          'Change Name',
          'Please do not use any numbers or special characters'
        )
      }
      const [firstName, lastName] = nameSplit
      Intercom.updateUser({
        name: `${firstName} ${lastName}`,
      })

      return firebase.updateProfile({ name: capitalizedName })
    } catch (e) {
      const errorMessage = 'Unable to update, please try later'
      handleError(e)

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

  console.log('userID', userID)
  const updateBodyweight = async (weight) => {
    try {
      const pattern = /^[1-9][\.\d]*(,\d+)?$/

      if (!pattern.test(weight)) {
        return Alert.alert(
          'Change bodyweight',
          'Please use only numbers and decimal places'
        )
      }

      const newBodyweight =
        units === 0 ? convertToKG(Number(weight)) : Number(weight)
      firestore.doc(`users/${userID}/program/programDetails`).update({
        'userBioData.bodyweight': newBodyweight,
      })
      return firebase.updateProfile({
        bodyweight: { value: Number(weight), units },
      })
    } catch (e) {
      const errorMessage = 'Unable to update, please try later'
      handleError(e)
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
  const updateHeight = async (height) => {
    try {
      const pattern = /^[1-9][\.\d]*(,\d+)?$/

      if (!pattern.test(height)) {
        return Alert.alert(
          'Change height',
          'Please use only numbers and decimal places'
        )
      }

      const newHeight =
        units === 0 ? round(Number(height) * 2.54, 1) : Number(height)
      firestore.doc(`users/${userID}/program/programDetails`).update({
        'userBioData.height': newHeight,
      })
      return firebase.updateProfile({
        height: { value: Number(height), units: units },
      })
    } catch (e) {
      const errorMessage = 'Unable to update, please try later'
      handleError(e)
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
  const toggleGender = async () => {
    const nextGender = genderIndex === 0 ? 1 : 0
    firestore.doc(`users/${userID}/program/programDetails`).update({
      'userBioData.genderIndex': nextGender,
    })
    firebase.updateProfile({ genderIndex: nextGender })
  }

  const handleBirthdayChange = async (newBirthday) => {
    firestore.doc(`users/${userID}/program/programDetails`).update({
      'userBioData.birthday': newBirthday,
    })
    firebase.updateProfile({ birthday: newBirthday })
  }

  const toggleUnits = async () => {
    const nextUnits = units === 0 ? 1 : 0
    firestore.doc(`users/${userID}/program/programDetails`).update({
      'userBioData.unitsIndex': nextUnits,
    })
    firebase.updateProfile({ units: nextUnits })
  }

  const [localBodyweight, setBodyweight] = useState(
    String(bodyWeightConverted?.value)
  )
  const [localHeight, setHeight] = useState(String(heightConverted?.value))
  const [localName, setName] = useState(name)

  useEffect(() => {
    if (units === 0) {
      if (heightUnits === 'cm') {
        setHeight(String(round(height?.value / 2.54, 0.5)))
      } else {
        setHeight(String(height?.value))
      }

      if (bodyweightUnits === 'kg') {
        setBodyweight(String(convertToLB(bodyweight?.value)))
      } else {
        setBodyweight(String(bodyweight?.value))
      }
    }
    if (units === 1) {
      if (heightUnits === 'in') {
        setHeight(String(round(height?.value * 2.54, 0.5)))
      } else {
        setHeight(String(height?.value))
      }
      if (bodyweightUnits === 'lb') {
        setBodyweight(String(convertToKG(bodyweight?.value)))
      } else {
        setBodyweight(String(bodyweight?.value))
      }
    }
  }, [units])

  const profileTextFields = [
    {
      title: 'Name',
      value: localName,
      onChange: (next) => setName(next),
      onSubmit: () => updateName(localName),
      suffix: '',
    },
    {
      title: 'Height',
      value: localHeight,
      suffix: units === 0 ? 'in' : 'cm',
      keyboard: 'decimal-pad',
      onChange: (next) => setHeight(next),
      onSubmit: () => updateHeight(localHeight),
    },
    {
      title: 'Bodyweight',
      value: localBodyweight,
      suffix: units === 0 ? 'lb' : 'kg',
      keyboard: 'decimal-pad',
      onChange: (next) => setBodyweight(next),
      onSubmit: () => updateBodyweight(localBodyweight),
    },
  ]

  const renderConfirmationModal = () => {
    return (
      <Modal
        visible={visible}
        backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
        onBackdropPress={() => setVisible(false)}>
        <Card style={{ padding: '2%' }} disabled={true}>
          <Text category='h5'>Delete Account</Text>
          <Text style={{ marginTop: '2%' }} category='p2'>
            Are you sure you want to delete your EvolveAI account permanently?
            This action will delete everything.
          </Text>

          <Input
            style={styles.formInput}
            autoComplete='password'
            value={password}
            label='Enter current password'
            placeholder='Enter password'
            secureTextEntry={true}
            onChangeText={(value) => {
              setPassword(value)
            }}
            textContentType='password'
            size='large'
          />
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              style={{
                marginTop: 20,
                flex: 0.47,
                backgroundColor: 'transparent',
              }}
              onPress={() => setVisible(false)}>
              No
            </Button>
            <Button
              style={{ marginTop: 20, flex: 0.47 }}
              disabled={isDeletingAccount}
              onPress={() => {
                if (password.length == 0) {
                  alert('Please enter your current password')
                } else if (password.length < 8) {
                  alert('Please enter valid password')
                } else {
                  reAuthenticateUser()
                }
              }}>
              Yes
            </Button>
          </View>
        </Card>
      </Modal>
    )
  }

  const reAuthenticateUser = () => {
    setIsDeletingAccount(true)
    const provider = auth.EmailAuthProvider
    const authCredential = provider.credential(
      auth().currentUser.email,
      password
    )
    auth()
      .currentUser.reauthenticateWithCredential(authCredential)
      .then((result) => {
        setIsDeletingAccount(false)
        if (result) {
          deleteAccountPermantely()
        }
      })
      .catch((error) => {
        setIsDeletingAccount(false)
        console.log('error', error)
        alert(error.message)
      })
  }

  const deleteAccountPermantely = async () => {
    dispatch(handleDeleteAccount())
    mainFirestore()
      .doc(`users/${userID}`)
      .delete()
      .then(async () => {
        let user = auth().currentUser
        user
          .delete()
          .then(async () => {
            navigation.navigate('OnBoarding')
          })
          .catch((error) =>
            dispatch(
              showErrorNotification({
                title: 'Error',
                description: error.message,
              })
            )
          )
      })
      .catch((error) =>
        dispatch(
          showErrorNotification({
            title: 'Error',
            description: error.message,
          })
        )
      )
  }

  const deleteAccount = () => {
    Alert.alert(
      '',
      'Are you sure you want to delete your EvolveAI account permanently? This action will delete everything.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          style: 'destructive',
          text: 'Yes',
          onPress: () => {
            deleteAccountPermantely()
          },
        },
      ],
      { cancelable: false }
    )
  }

  return (
    <Layout style={{ flex: 1 }}>
      <GradientHeader
        title='Profile'
        subheading='Edit your profile below, please note that this will have no effect unless you create a new program.'
      />
      <Layout level='2'>
        <TouchableHighlight onPress={toggleUnits}>
          <View
            style={{
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 35,
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <Text appearance='hint' category='label'>
              Units
            </Text>
            <Text category='s2'>{unitsName}</Text>
          </View>
        </TouchableHighlight>
        <Divider />
      </Layout>
      {profileTextFields.map((item) => {
        return (
          <GeneralInputField
            level='2'
            key={item.title}
            title={item.title}
            value={item?.value}
            suffix={item.suffix}
            keyboard={item.keyboard}
            onSubmit={item.onSubmit}
            onChange={(next) => item.onChange(next)}
          />
        )
      })}

      <Layout level='2'>
        <TouchableHighlight onPress={toggleGender}>
          <View
            style={{
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 35,
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <Text appearance='hint' category='label'>
              Gender
            </Text>
            <Text category='s2'>{gender}</Text>
          </View>
        </TouchableHighlight>
        <Divider />
      </Layout>
      <Layout level='2'>
        <TouchableHighlight onPress={showDatePicker}>
          <View
            style={{
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 35,
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <Text appearance='hint' category='label'>
              Birthday
            </Text>
            <Text category='s2'>{birthdayFormatted}</Text>
          </View>
        </TouchableHighlight>
        <Divider />
      </Layout>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode='date'
        date={birthdayDate}
        onConfirm={(newDate) => {
          handleBirthdayChange(newDate)
          hideDatePicker()
        }}
        onCancel={hideDatePicker}
      />

      <Layout level='2'>
        <TouchableHighlight
          onPress={() => {
            setVisible(true)
          }}>
          <View
            style={{
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 35,
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <Text style={{ color: 'red' }} appearance='hint' category='label'>
              Delete Account
            </Text>
          </View>
        </TouchableHighlight>
        <Divider />
        {renderConfirmationModal()}
      </Layout>
    </Layout>
  )
}

const styles = StyleSheet.create({
  formInput: {
    marginBottom: 10,
    marginTop: '2%',
  },
})
