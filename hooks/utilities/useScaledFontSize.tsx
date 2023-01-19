import {PixelRatio, Dimensions } from 'react-native'

const useScaledFontSize = (size) => {
    const {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      } = Dimensions.get('window');
    
    
      const guidelineBaseWidth = 350;
    const guidelineBaseHeight = 680;
    const scale = size => SCREEN_WIDTH / guidelineBaseWidth * size;
    const verticalScale = size => SCREEN_HEIGHT / guidelineBaseHeight * size;
    const moderateScale = (size, factor = 0.5) => size + ( scale(size) - size ) * factor;
    
    
    return Math.round(PixelRatio.roundToNearestPixel(verticalScale(size)))
}

export default useScaledFontSize
