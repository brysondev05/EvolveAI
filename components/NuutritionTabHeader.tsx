import { View, Text, Touchable, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { Layout } from '@ui-kitten/components'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NutritionIcons } from '~/assets/icons'
import { TextInput } from 'react-native-gesture-handler'
import { NutritionTabReferences } from '~/navigators/NutritionTabStack'

/**
 * @param {object} navigation object of each navigator part. 
 */

type NutritionParams = {
    navigate: any,
    replace: any,
    goBack: any,
    canGoBack: any
}

type NuutritionTabHeaderProps = {
    navigation: NutritionParams,
    inputPlaceholder?: string,
    overrideBarcodeScannerActionClick?: any,
    overrideVoiceActionClick?: any,
    overrideOnSearch?: any,
    overrideBackActionPressed?: any,
    shouldShowBack?: boolean,
}

const NuutritionTabHeader = (params: NuutritionTabHeaderProps) => {
    const [searchT, setSearchT] = useState('')
    var {
        navigation,
        shouldShowBack = true,
        inputPlaceholder = 'Search for a food',
        overrideBackActionPressed = () => { },
        overrideBarcodeScannerActionClick = () => { navigation.navigate(NutritionTabReferences.BarcodeScanning) },
        overrideOnSearch = () => { },
        overrideVoiceActionClick = () => { navigation.navigate(NutritionTabReferences.VoiceInputAiAdd) },

    } = params
    shouldShowBack = shouldShowBack && navigation.canGoBack()
    overrideBackActionPressed = () => {
        navigation.goBack()
    }
    return (
        <SafeAreaView>
            <Layout style={{
                flexDirection: 'row',
                width: shouldShowBack ? '98%' :'96%',
                alignSelf: 'center'
            }}>

                <Layout style={{
                    flex: 3,
                    height: 56,
                    flexDirection: 'row'
                }}>

                    {shouldShowBack &&
                        <Layout style={{
                            flex: 1,
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <TouchableOpacity activeOpacity={0.8} onPress={overrideBackActionPressed}>
                                <Image source={NutritionIcons.BackButton} style={{
                                    width: 2.5 * 9,
                                    height: 2.5 * 7
                                }} resizeMethod='resize' resizeMode='contain' />
                            </TouchableOpacity>
                        </Layout>
                    }

                    <Layout style={{
                        flex: 4,
                        height: '100%',
                        justifyContent: 'center',
                    }}>
                        <View style={{
                            width: '98%',
                            height: '90%',
                            flexDirection: 'row',
                            backgroundColor: '#20273E',
                            borderRadius: 10,
                            alignItems: 'center',
                            padding: 8,
                            paddingLeft: 12
                        }}>
                            <Image source={NutritionIcons.Search} style={{
                                width: 24,
                                height: 24,
                                margin: 2
                            }} resizeMethod='resize' resizeMode='contain' />
                            <TextInput value={searchT} onChangeText={t => {
                                setSearchT(t)
                                overrideOnSearch(t)
                            }} 
                            onPressIn={()=> navigation.navigate(NutritionTabReferences.FoodScreen)}
                            placeholder={inputPlaceholder} placeholderTextColor='#9C9FAE' style={{
                                paddingHorizontal: 8,
                                color: 'white',
                                fontSize: 16,
                                letterSpacing: 0.5
                            }}
                             />
                        </View>
                    </Layout>
                </Layout>

                <Layout style={{
                    flex: 1,
                    height: 56,
                    //backgroundColor: 'red',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row'
                }}>

                    <Layout style={{
                        flex: 1,
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <TouchableOpacity activeOpacity={0.8} onPress={overrideBarcodeScannerActionClick}>
                            <Image source={NutritionIcons.Barcode} style={{
                                width: 24,
                                height: 24
                            }} resizeMethod='resize' resizeMode='contain' />
                        </TouchableOpacity>
                    </Layout>

                    <Layout style={{
                        flex: 1,
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <TouchableOpacity activeOpacity={0.8} onPress={overrideVoiceActionClick}>
                            <Image source={NutritionIcons.Microphone} style={{
                                width: 24,
                                height: 24
                            }} resizeMethod='resize' resizeMode='contain' />
                        </TouchableOpacity>
                    </Layout>

                </Layout>

            </Layout>
        </SafeAreaView>
    )
}

export default NuutritionTabHeader