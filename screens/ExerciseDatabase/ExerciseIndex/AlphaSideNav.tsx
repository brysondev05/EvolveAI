import { Text } from '@ui-kitten/components'
import { View, Dimensions, PixelRatio } from 'react-native'
import useScaledFontSize from '~/hooks/utilities/useScaledFontSize'

const AlphaNavItem = ({ alpha, fontSize }) => (
  <View
    style={{ paddingVertical: 0, paddingLeft: 30, paddingRight: 2 }}
    key={alpha}>
    <Text status='primary' style={{ textAlign: 'center', fontSize }}>
      {alpha}
    </Text>
  </View>
)

const AlphaSideNav = ({
  viewContainer,
  setAlphaContainer,
  scrollToSection,
  data,
  headerHeight,
}) => {
  const fontSize = useScaledFontSize(13)

  return (
    <View
      style={{
        position: 'absolute',
        right: 5,
        top: headerHeight,
        bottom: 0,
        width: 50,
        // backgroundColor: 'blue',
        // top: screen.height /2,
        zIndex: 1,
        // height: screen.height - 350,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
      }}>
      <View
        ref={viewContainer}
        onLayout={(e) => setAlphaContainer(e.nativeEvent.layout)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => scrollToSection(e)}
        onResponderMove={(e) => scrollToSection(e)}
        // onResponderRelease={this.resetSection}
      >
        {data.map((item) => (
          <AlphaNavItem key={item} alpha={item} fontSize={fontSize} />
        ))}
      </View>
    </View>
  )
}

export default AlphaSideNav
