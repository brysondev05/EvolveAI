import { View, Text, TouchableOpacity, StyleSheet, Alert, StatusBar, Dimensions, Image, Modal, TextInput, Platform } from 'react-native'
import React from 'react'
import { Layout } from '@ui-kitten/components'
import { RNHoleView } from 'react-native-hole-view';
import 'react-native-reanimated'
import { useEffect } from 'react';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import Animated, { useAnimatedStyle, useSharedValue, useValue, withTiming } from 'react-native-reanimated';
import Voice, { SpeechErrorEvent, SpeechResultsEvent } from '@react-native-voice/voice';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import SimpleToast from 'react-native-simple-toast'

const Flashlight = {
  ON: 'on',
  OFF: 'off'
}

/*
Voice to Text & Nutrition Algorithm
Step 01: Check Microphone Permissions on Mic clicked
Step 02: Toggle between Microphone Animating or Not if permission granted
Step 03: Add Listeners to Voice in useEffect of isOnListening and cancel subscriptions
Step 04: On Voice Listener triggered and got with response, put it in the state
*/

const VoiceInputAiAdd = ({ navigation }) => {

  const [isOnListeningMode, setIsOnListeningMode] = useState(false)
  const [beenListened, setBeenListened] = useState(false)
  const [textToAPI, setTextToAPI] = useState('')
  const [isTIFocused, setIsTIFocused] = useState(false)
  const [isPermissionEnabled, setIsPermissionEnabled] = useState(false)

  const effect = useSharedValue(28)

  useEffect(() => {
    function onSpeechResults(e: SpeechResultsEvent) {
      console.log({ value: e });
      setTextToAPI(e.value[0])
      setIsOnListeningMode(false)
      setBeenListened(true)
    }
    function onSpeechError(e: SpeechErrorEvent) {
      console.log({ err: e });
    }
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    return function cleanup() {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);


  const askForMicrophonePermission = async () => {
    const hasPermission = await check(
      (Platform.OS === 'ios') ?
        PERMISSIONS.IOS.MICROPHONE :
        PERMISSIONS.ANDROID.RECORD_AUDIO
    )

    console.log({ hasPermission });


    if (hasPermission === RESULTS.DENIED) {
      SimpleToast.show('Please allow microphone permissions to continue')
      setIsPermissionEnabled(false)
      setIsOnListeningMode(false)
      await request(
        (Platform.OS === 'ios') ?
          PERMISSIONS.IOS.MICROPHONE :
          PERMISSIONS.ANDROID.RECORD_AUDIO
      )
    } else if (hasPermission === RESULTS.BLOCKED) {
      setIsPermissionEnabled(false)
      setIsOnListeningMode(false)
      SimpleToast.show('Please enable microphone permissions from device settings')
    } else if (hasPermission === RESULTS.UNAVAILABLE) {
      setIsPermissionEnabled(false)
      setIsOnListeningMode(false)
      SimpleToast.show('Please change device or enable microphone')
    } else if (hasPermission === RESULTS.GRANTED) {
      console.log('Mic is Allowed');
      setIsPermissionEnabled(true)
      setIsOnListeningMode(true)
    }
  }

  const onMicrophoneClicked = async () => {
    if (isOnListeningMode) {
      setIsOnListeningMode(false)
      setBeenListened(true)
      await Voice.stop()
    }
    else {
      askForMicrophonePermission().then(async () => {
        if (isPermissionEnabled) {
          setIsTIFocused(false)
          if (!isOnListeningMode) {
            await Voice.start('en-US');
          }
        }
      })
    }

  }


  // Styles:
  const styles = StyleSheet.create({
    rnholeView: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <Layout style={{
        flex: 1,
      }}>
        <SafeAreaView>
          <Layout style={{
            padding: 8,
            paddingHorizontal: 16,
            flexDirection: 'row'
          }}>
            <Layout style={{
              flex: 1
            }}>

            </Layout>
            <Layout style={{
              flex: 4,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row'
            }}>
              <Image source={require('../../assets/icons/nutrition/microphone.png')}
                resizeMethod='scale' resizeMode='contain'
                style={{
                  width: 20,
                  height: 20,
                  tintColor: 'white'
                }} />
              <Text style={{
                paddingHorizontal: 16,
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold'
              }}>
                {'AI to add'}
              </Text>
            </Layout>
            <TouchableOpacity onPress={() => {
              navigation.goBack()
            }} style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}>
              <Image source={require('../../assets/icons/x.png')}
                resizeMethod='scale' resizeMode='contain'
                style={{
                  width: 20,
                  height: 20,
                }} />
            </TouchableOpacity>
          </Layout>
          <Layout style={{
            height: '100%',
            // justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
            marginVertical: '10%'
          }}>

            {!isTIFocused &&
              <>
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  {'Use voice to enter what you ate.'}
                </Text>
                <Text style={{
                  color: '#9C9FAE',
                  fontSize: 16,
                  fontWeight: '300',
                  textAlign: 'center',
                  paddingVertical: 8,
                }}>
                  {'For example: “7oz of steak and a handful of walnuts.” and Evolve Ai will transcribe it automatically!'}
                </Text>
              </>
            }


            <TouchableOpacity onPress={onMicrophoneClicked}>
              {
                isOnListeningMode ?
                  <Animatable.View style={[{
                    marginVertical: '16%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#F322D6',
                    height: effect.value + 38,
                    width: effect.value + 38,
                    borderRadius: effect.value + 38,
                    borderWidth: 2.5,
                    borderColor: 'white',
                  }]} animation="pulse" easing="ease-in-out-back" iterationCount="infinite">

                    <Animatable.Image source={require('../../assets/icons/nutrition/microphone.png')}
                      resizeMethod='scale' resizeMode='contain'
                      style={{
                        width: effect.value,
                        height: effect.value,
                        tintColor: 'white'
                      }} animation="tada" easing="ease-in-out-back" iterationCount="infinite" />
                  </Animatable.View> :
                  <View style={[{
                    marginVertical: '16%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#F322D6',
                    height: effect.value + 28,
                    width: effect.value + 28,
                    borderRadius: effect.value + 28,
                    borderWidth: 1.5,
                    borderColor: 'white',
                  }]}>

                    <Image source={require('../../assets/icons/nutrition/microphone.png')}
                      resizeMethod='scale' resizeMode='contain'
                      style={{
                        width: effect.value,
                        height: effect.value,
                        tintColor: 'white'
                      }} />
                  </View>
              }

            </TouchableOpacity>

            {/* <TouchableOpacity onPress={onMicrophoneClicked}>
              <Animated.View style={[effectStyle, {
                marginVertical: '16%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#F322D6',
                height: effect.value + 32,
                width: effect.value + 32,
                borderRadius: effect.value + 32,
                borderWidth: 2,
                borderColor: 'white',
              }]}>

                <Animated.Image source={require('../../assets/icons/nutrition/microphone.png')}
                  resizeMethod='scale' resizeMode='contain'
                  style={{
                    width: effect.value,
                    height: effect.value,
                    tintColor: 'white'
                  }} />
              </Animated.View>
            </TouchableOpacity> */}

            <Text style={{
              paddingHorizontal: 16,
              color: '#9C9FAE',
              fontSize: 18,
              fontWeight: '300',
              alignSelf: 'flex-start'
            }}>
              {'Type in your intake'}
            </Text>

            <TextInput style={{
              backgroundColor: 'black',
              width: '100%',
              minHeight: 56,
              color: 'white',
              marginVertical: 8,
              borderRadius: 10,
              padding: 16,
              borderColor: isTIFocused ? '#04E2E7' : 'xblack',
              borderWidth: isTIFocused ? 2 : 0,

            }} value={textToAPI} onChangeText={(t) => {
              setTextToAPI(t)
            }} focusable={true} onFocus={(r) => {
              setIsTIFocused(true)
            }} onBlur={() => {
              setIsTIFocused(false)
            }}
              onSubmitEditing={() => {
                setIsTIFocused(false)
              }}
              selectionColor='#04E2E7'
              autoCorrect
              blurOnSubmit
              caretHidden
              contextMenuHidden
            />

          </Layout>

        </SafeAreaView>

      </Layout>
    </>
  );

}
export default VoiceInputAiAdd