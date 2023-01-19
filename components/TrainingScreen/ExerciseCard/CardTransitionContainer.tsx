import { View, Text } from 'react-native'
import * as Animatable from "react-native-animatable";

export default function CardTransitionContainer({index, props}) {
    return (
        <Animatable.View
        animation="fadeIn"
        duration={500}
        delay={index ? (index * 500) / 5 : 0}
        useNativeDriver
        {...props}
      />
    )
}
