import { useTheme, Text, } from '@ui-kitten/components'
import { StyleSheet, View } from 'react-native'
import Shimmer from 'react-native-shimmer'
import Svg, { Rect } from 'react-native-svg'
import * as Animatable from "react-native-animatable";

const HoldingItem = ({ index }) => {
    const theme = useTheme()
    return (

        <Animatable.View animation="fadeOut" style={{
            marginVertical: 5, marginHorizontal: 15, borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.23,
            shadowRadius: 1.62,

            elevation: 4,
        }}>
            <Shimmer duration={800} pauseDuration={400}>
                <Svg width="200" height="70">
                    <Rect
                        rx="14" ry="14"
                        x="0"
                        y="0"
                        width="100%"
                        height="65"
                        strokeLinecap="round"
                        fill={theme['background-basic-color-4']}
                    />
                </Svg>


            </Shimmer>


        </Animatable.View>
    )
}

export default HoldingItem

const styles = StyleSheet.create({
    exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    mainIcons: {
        width: 20,
        height: 20,
        marginBottom: 2.5
    },
    cardContainer: {
        marginTop: 30, borderRadius: 16, padding: 15, paddingLeft: 30, minHeight: 150, width: "95%", alignSelf: "center",
        // shadowColor: "#000",
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.23,
        // shadowRadius: 2.62,

        // elevation: 4,
    },
    sideLine: {
        position: "absolute",
        left: 5,
        top: 10,
        zIndex: 1000
    },
    mainCardContent: {
        flexDirection: 'row', justifyContent: 'space-between', flex: 1, paddingRight: 5
    },
})
