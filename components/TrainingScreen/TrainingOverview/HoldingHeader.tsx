import { StyleSheet, View } from 'react-native'
import { Layout, Text } from '@ui-kitten/components/ui'
import { LinearGradient } from 'expo-linear-gradient'

const HoldingHeader = ({gradientColors}) => {
    return (
        <Layout level="1" style={{ flex: 1}}>
        <Layout level="2" style={{
          paddingBottom: 20,
          paddingTop: 20, 
          minHeight: 165
        }}>
  
          <LinearGradient
            colors={gradientColors}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
  
            }}
          />
{/* 
          <Animatable.View animation="fadeOut" style={{ paddingHorizontal: 15, }}>
  
          <Shimmer duration={800} pauseDuration={400}>

            <Svg width="200" height="20">
  <Rect
     x="0"
    y="5"
    width="120"
    height="20"
    fill="rgba(255, 255, 255, 0.1)"
  />
</Svg>
</Shimmer>

<Shimmer duration={800} pauseDuration={400}>

<Svg width="200" height="30">
  <Rect
    x="0"
    y="5"
    width="150"
    height="30"
    fill="rgba(255, 255, 255, 0.1)"
  />
</Svg>
</Shimmer>

<Shimmer duration={800} pauseDuration={400}>

              <Svg width="200" height="65">
  <Rect
       x="0"
    y="5"
    width="200"
    height="65"
    fill="rgba(255, 255, 255, 0.1)"

  />
</Svg>
</Shimmer>
         
  
          </Animatable.View> */}
        </Layout>
        <View style={{ marginTop: 20, paddingHorizontal: 15 }}>
  
          <Text category="h2">Overview</Text>
{/*   
          {activeDay?.status === 'complete' && (
            <View>
              <SmallButtonGroup items={smallButtonItems} />
            </View>
          )} */}
  
        </View>
      </Layout>
    )
}

export default HoldingHeader

const styles = StyleSheet.create({})
