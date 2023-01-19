import {StyleSheet, Animated,View} from 'react-native';

import { Layout, Text, useTheme, Button, Input, Icon } from '@ui-kitten/components';
import LottieView from 'lottie-react-native';


export const CompleteSplash = ({onFinish}) => {

    
    return (
        <Layout level="2" style={[StyleSheet.absoluteFill, {alignItems: 'center', justifyContent: 'center'}]}>
            <LottieView 
            source={require('../assets/animations/complete.json')}  
            autoPlay 
            loop={false} 
            style={{ maxHeight: 200 }}
            onAnimationFinish={() => onFinish()}  
            autoSize 	/>
        </Layout>
    )
}