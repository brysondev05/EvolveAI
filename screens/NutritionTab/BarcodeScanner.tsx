import { View, Text, TouchableOpacity, StyleSheet, Alert, StatusBar, Dimensions, Image, Modal, TextInput } from 'react-native'
import React from 'react'
import { Layout } from '@ui-kitten/components'
// import { useCameraDevices, Camera } from 'react-native-vision-camera';
// import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { RNHoleView } from 'react-native-hole-view';
import 'react-native-reanimated'
import { useEffect } from 'react';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';

const Flashlight = {
  ON: 'on',
  OFF: 'off'
}

const BarcodeScan = ({ navigation }) => {

  // inside your component
  // const devices = useCameraDevices();
  // const device = devices.back;

  // const [frameProcessor, barcodes] = useScanBarcodes([
  //   BarcodeFormat.ALL_FORMATS,
  // ]);

  const [barcode, setBarcode] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanned, setIsScanned] = useState(false);
  const [isOnScanning, setIsOnScanning] = useState(true)
  const [writtenCode, setWrittenCode] = useState('')
  // const [flashlight, setFlashlight] = useState<FlashlightType>(Flashlight.OFF)

  const isFocused = useIsFocused()

  // useEffect(() => {
  //   checkCameraPermission();
  // }, []);

  // useEffect(() => {
  //   toggleActiveState();
  //   return () => {
  //     barcodes;
  //   };
  // }, [barcodes]);

  // useEffect(() => {
  //   if (!isFocused) {
  //     setFlashlight(Flashlight.OFF)
  //   }
  // }, [isFocused])

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

  // const checkCameraPermission = async () => {
  //   const cameraPermission = await Camera.requestCameraPermission()
  //   console.log({ cameraPermission });

  //   setHasPermission(cameraPermission === 'authorized');
  // };

  // const toggleActiveState = async () => {
  //   if (barcodes && barcodes.length > 0 && isScanned === false) {
  //     // setIsScanned(true);
  //     // setBarcode('');
  //     barcodes.forEach(async (scannedBarcode: any) => {
  //       if (scannedBarcode.rawValue !== '') {
  //         setBarcode(scannedBarcode.rawValue);
  //         Alert.alert(barcode);
  //         console.log({ barcode });
  //       }
  //     });
  //   }
  // };

  // const widthToDp = (p) => {
  //   return Dimensions.get('window').width * parseFloat(p)
  // }

  // const heightToDp = (p) => {
  //   return Dimensions.get('window').width * parseFloat(p)
  // }

  return (
    // device != null &&
    // hasPermission && (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        {/* {isOnScanning && */}
          {/* <Camera
            style={[StyleSheet.absoluteFill, {
              opacity: isOnScanning ? 1: 0.5
            }]}
            device={device}
            isActive={!isScanned && isOnScanning}
            frameProcessor={frameProcessor}
            frameProcessorFps={5}
            audio={false} 
            torch={flashlight}
          /> */}
        {/* } */}

        <SafeAreaView style={{
          flex: 1,
        }}>

          {/* {isOnScanning &&
            <View style={{
              flexDirection: 'row',
              padding: 8,
              position: 'absolute',
              top: 32
            }}>
              <View style={{
                flex: 1,
                padding: 8
              }}>
                <TouchableOpacity onPress={() => {
                  setFlashlight((flashlight === Flashlight.ON) ? Flashlight.OFF : Flashlight.ON)
                }} style={{
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  height: 40,
                  width: 40
                }}>
                  <Image source={require('../../assets/icons/nutrition/flashlight.png')}
                    resizeMethod='scale' resizeMode='contain'
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: (flashlight === Flashlight.ON) ? 'yellow' : 'white'
                    }} />
                </TouchableOpacity>
              </View>

              <View style={{
                flex: 1,
                padding: 8,
                alignItems: 'flex-end',
                paddingHorizontal: 16
              }}>
                <TouchableOpacity onPress={() => {
                  setFlashlight(Flashlight.OFF)
                  navigation.goBack()
                }} style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 28,
                  width: 28,
                  borderRadius: 28,
                  backgroundColor: 'white'
                }}>
                  <Image source={require('../../assets/icons/x.png')}
                    resizeMethod='scale' resizeMode='contain'
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: 'black'
                    }} />
                </TouchableOpacity>
              </View>
            </View>
          } 
          
          {
            !isOnScanning && 
            <Layout style={{
              position: 'absolute',
              top: Dimensions.get('window').height / 3.5,
              bottom: Dimensions.get('window').height / 3.5,
              right: Dimensions.get('window').width / 20,
              left: Dimensions.get('window').width / 20,
              borderRadius: 16

            }}>
              <TextInput placeholder='Barcode' />
            </Layout>
          }

          <View style={{
            flexDirection: 'row',
            padding: 8,
            position: 'absolute',
            bottom: 8,
            height: 48,
            borderRadius: 100,
            alignSelf: 'center',
            backgroundColor: '#060C21',
            alignItems: 'center'
          }}>
            <TouchableOpacity onPress={() => {
              setIsOnScanning(true)
              setIsScanned(false)
            }} style={{
              borderRadius: 100,
              backgroundColor: isOnScanning ? '#20273E' : '#060C21',
              padding: 8,
              paddingHorizontal: 16,
              justifyContent: 'center'
            }}>
              <Text style={{
                color: isOnScanning ? 'white' : '#04E2E7'
              }}>
                Scan Code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setFlashlight(Flashlight.OFF)
              setIsOnScanning(false)
              setWrittenCode('')
            }} style={{
              borderRadius: 100,
              backgroundColor: !isOnScanning ? '#20273E' : '#060C21',
              padding: 8,
              paddingHorizontal: 16,
              justifyContent: 'center'
            }}>
              <Text style={{
                color: !isOnScanning ? 'white' : '#04E2E7'
              }}>
                Enter Code
              </Text>
            </TouchableOpacity>
          </View> */}

        </SafeAreaView>

        {/* <RNHoleView
          holes={[
            {
              x: widthToDp('8.5%'),
              y: heightToDp('36%'),
              width: widthToDp('83%'),
              height: heightToDp('20%'),
              borderRadius: 10,
            },
          ]}
          style={styles.rnholeView}
        /> */}
      </>
    )
  // );

}


export default BarcodeScan