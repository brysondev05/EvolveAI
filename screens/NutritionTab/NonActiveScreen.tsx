import { StyleSheet, View, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Layout, Text, useTheme, Button } from '@ui-kitten/components'
import ThemeColor from '~/constants/color'
import NuutritionTabHeader from '~/components/NuutritionTabHeader'
import { NutritionTabReferences } from '~/navigators/NutritionTabStack'

export default function NonActiveScreen({navigation}) {
    const [heading, setHeading] = useState('Elevate your performance')
    const [description, setDescription] = useState('Nutrition tracking will improve the overall program that is recommended and designed for you.')

    const ifUpdateData = async () => {
        //  Update heading and description if necessary
    }

    useEffect(()=> {
        ifUpdateData()
    }, [])

    return (
        
        <Layout style={styles.container}>
            <Layout style={styles.logoContainer}>
                <Image
                    style={styles.logoStyle}
                    resizeMode={'contain'}
                    source={require('~/assets/images/logo.png')}
                />
            </Layout>
            <Layout style={styles.imageContainer}>
                <Image
                    style={styles.imageStyle}
                    resizeMode={'contain'}
                    source={require('~/assets/images/nutritionImage.png')}
                />
            </Layout>
            <Layout style={styles.textContainer}>
                <Text style={styles.heading}>{heading}</Text>
                <Text style={styles.description}>{description}</Text>
            </Layout>
            <Button
                style={styles.buttonStyle}
                status='secondary'
                size='large'
                onPress={() => {navigation.navigate(NutritionTabReferences.NutritionMain)
                }}>
                START TRACKING NUTRITION
            </Button>
        </Layout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ThemeColor.primary
    },
    logoContainer: {
        // height: 50,
        marginTop: 30,
        borderBottomWidth: 1,
        borderBottomColor: ThemeColor.borderColor,
        alignItems: "center"
    },
    logoStyle: {
        width: 130,
        height: 30,
        marginTop: 16,
        marginBottom: 16
    },
    imageContainer: {
        alignItems: "center",
        marginTop: 76,
        marginBottom: 30
    },
    imageStyle: {
        height: 234,
        width: 234,
    },
    buttonStyle: {
        position: 'absolute',
        bottom: 15,
        width: '90%',
        alignSelf: 'center'
    },
    buttonText: {
        color: "#000000"
    },
    textContainer: {
        marginLeft: 31,
        marginRight: 24,
        //marginBottom: 129,
    },
    heading: {
        color: "#fff",
        fontSize: 27,
        fontWeight: "700",
        textAlign: "left"
    },
    description: {
        color: "#fff",
        fontSize: 20,
        textAlign: "left",
        marginTop: 30
    },
})