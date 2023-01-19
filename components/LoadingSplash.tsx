import { useRef } from 'react';
import {StyleSheet, View} from 'react-native';

import { Layout, Text, useTheme, Button, Input, Icon } from '@ui-kitten/components';
import LottieView from 'lottie-react-native';
import { useTypedSelector } from '~/reduxStore/reducers';


export const LoadingSplash = ({level = '1', title = ''}) => {

    const loadingTitle = useTypedSelector(state => state.globalUI.loadingTitle)
    const loadingRef = useRef();
    const theme = useTheme()
    const backgroundColor = theme[`background-basic-color-${level}`]
    //'#191a1f'
    return (
        <View style={[StyleSheet.absoluteFill, {alignItems: 'center', justifyContent: 'center', backgroundColor}]}>
            <LottieView source={require('../assets/animations/loading.json')}    autoPlay loop autoSize/>
            <Text>{loadingTitle || title}</Text>
        </View>
    )
}