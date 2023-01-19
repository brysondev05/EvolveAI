import { useRef, useState } from 'react'
import { StyleSheet, Image, StatusBar, View, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Layout, Text, useTheme, Button } from '@ui-kitten/components'
import { LinearGradient } from 'expo-linear-gradient'

import { useTypedSelector } from '~/reduxStore/reducers'

import { StackNavigationProp } from '@react-navigation/stack'
import { AuthStackParamList } from '~/screens/types/navigation'

import { useDimensions } from '~/hooks/utilities/useDimensions'
import Carousel, { ParallaxImage, Pagination } from 'react-native-snap-carousel'
import useScaledFontSize from '~/hooks/utilities/useScaledFontSize'
import { LogoPlaceholder } from '~/components/LogoPlaceholder'

type OnBoardingScreenProp = StackNavigationProp<
  AuthStackParamList,
  'OnBoarding'
>

type Props = {
  navigation: OnBoardingScreenProp
}

const IS_IOS = Platform.OS === 'ios'
const entryBorderRadius = 8

export default function OnBoardingScreen({ navigation }: Props) {
  const token = useTypedSelector((state) => state.auth.userToken)
  const theme = useTheme()

  const insets = useSafeAreaInsets()

  const carouselEntries = [
    // {
    //   title: 'DATA_HERE',
    //   image: require(''),
    //   description: 'DATA_HERE',
    // },
  ]
  const carousel = useRef(null)

  const { screen } = useDimensions()
  const fontSize = useScaledFontSize(18)

  const [activeSlide, setActiveSlide] = useState(0)

  return (
    <Layout style={[styles.container]}>
      <StatusBar barStyle='light-content' />

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <LogoPlaceholder scaledFontSize={72} />
      </View>

      <Carousel
        ref={carousel}
        data={carouselEntries}
        onSnapToItem={setActiveSlide}
        layout={'stack'}
        renderItem={({ item, index }, parallaxProps) => (
          <Layout style={{ flex: 1, width: '100%', position: 'relative' }}>
            <ParallaxImage
              source={item.image}
              containerStyle={[styles.imageContainer]}
              style={styles.image}
              parallaxFactor={0.35}
              showSpinner={true}
              {...parallaxProps}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.53)', 'rgba(0,0,0,0.95)']}
              style={[
                styles.imageContainer,
                { ...StyleSheet.absoluteFillObject },
              ]}>
              {index === 0 && (
                <View
                  style={{
                    paddingBottom: 10,
                    paddingHorizontal: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    position: 'absolute',
                    top: 80,
                  }}>
                  <Text category='h2' style={{ fontSize }}>
                    DATA_HERE
                  </Text>
                </View>
              )}

              <View
                style={{
                  justifyContent: 'center',
                  //   marginTop: 100,
                  marginHorizontal: 15,
                  //   alignItems: 'center',
                  flex: 1,
                }}>
                <Text category='h1' style={{ marginBottom: 15 }}>
                  {item.title}
                </Text>
                <Text category='h6'>{item.description}</Text>
              </View>
            </LinearGradient>
          </Layout>
        )}
        hasParallaxImages={true}
        sliderWidth={screen.width}
        itemWidth={screen.width}
      />

      <LinearGradient
        colors={['transparent', theme['background-basic-color-1']]}
        style={[styles.bottomContainer, { paddingBottom: insets.bottom }]}>
        <Pagination
          dotsLength={carouselEntries.length}
          activeDotIndex={activeSlide}
          //   containerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
          dotStyle={{
            width: 10,
            height: 10,
            borderRadius: 5,
            marginHorizontal: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
          }}
          inactiveDotStyle={
            {
              // Define styles for inactive dots here
            }
          }
          inactiveDotOpacity={0.4}
          inactiveDotScale={0.6}
        />
        <Button
          style={{ marginBottom: 15 }}
          status='secondary'
          size='large'
          onPress={() => {
            if (token) {
              navigation.navigate('ProgramCreation')
            } else {
              navigation.navigate('SignUp')
            }
          }}>
          CREATE YOUR PROGRAM
        </Button>
        <Button
          status='primary'
          appearance='outline'
          size='large'
          onPress={() => navigation.navigate('SignIn')}>
          SIGN IN
        </Button>
      </LinearGradient>
    </Layout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'flex-end',
  },
  pageContainer: {
    position: 'absolute',
    bottom: 0,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 15,
    padding: 20,
    paddingTop: 50,
    zIndex: 100,
    width: '100%',
    backgroundColor: 'transparent',
  },
  tab: {
    // height: 800,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  tabTitle: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 60,
    minHeight: 185,

    alignSelf: 'flex-start',
  },
  sliderImage: {
    width: '100%',
    // height: 600,
    resizeMode: 'cover',
  },
  wrapper: {
    alignContent: 'stretch',
    backgroundColor: 'green',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    marginBottom: IS_IOS ? 0 : -1, // Prevent a random Android rendering issue
    // backgroundColor: 'white',
    // borderTopLeftRadius: entryBorderRadius,
    // borderTopRightRadius: entryBorderRadius,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
    borderRadius: IS_IOS ? entryBorderRadius : 0,
    // borderTopLeftRadius: entryBorderRadius,
    // borderTopRightRadius: entryBorderRadius,
  },
})
