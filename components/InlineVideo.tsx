import { Icon, useTheme } from '@ui-kitten/components'
import { useState, useRef, useEffect } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { Video } from 'expo-av'
import VideoPlayer from 'expo-video-player'
import * as ScreenOrientation from 'expo-screen-orientation'
import { setStatusBarHidden } from 'expo-status-bar'

import { useDimensions } from '~/hooks/utilities/useDimensions'

const InlineVideo = ({ videoID, thumbTime = '0' }) => {
  const [pauseVideo, setPauseVideo] = useState(true)
  const [showThumb, setShowThumb] = useState(true)
  const [status, setStatus] = useState({})
  const videoRef = useRef(null)
  const theme = useTheme()
  const dimensions = useDimensions()

  const [inFullscreen, setInFullsreen] = useState(false)
  const [inFullscreen2, setInFullscreen2] = useState(false)
  const refVideo = useRef(null)
  const refVideo2 = useRef(null)
  const refScrollView = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.presentFullscreenPlayer()
    }
  }, [videoRef])
  return (
    <View
      style={{
        position: 'relative',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        height: dimensions.window.width,
        width: dimensions.window.width,
      }}>
      <Video
        source={{
          uri: `https://videodelivery.net/${videoID}/manifest/video.m3u8`,
        }} // Can be a URL or a local file.
        ref={videoRef}
        style={[StyleSheet.absoluteFill]}
        // disableFocus={true}
        // controls={false}
        // muted={false}
        // paused={false}
        // shouldPlay={pauseVideo}
        resizeMode='contain'
        // usePoster
        useNativeControls
        posterSource={{
          uri: `https://videodelivery.net/${videoID}/thumbnails/thumbnail.jpg?time=35s`,
        }}
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
        // onEnd={() => {
        // setPauseVideo(true)
        // setShowThumb(true)
        // // videoRef.current.seek(0)
        // }}
        // repeat={false}
        // ignoreSilentSwitch='ignore'
        //    onBuffer={this.onBuffer}                // Callback when remote video is buffering
        //    onError={this.videoError}               // Callback when video cannot be loaded
      />
      {/* <VideoPlayer
        videoProps={{
          shouldPlay: true,
          isLooping: false,
          resizeMode: Video.RESIZE_MODE_CONTAIN,
          // ❗ source is required https://docs.expo.io/versions/latest/sdk/video/#props
          source: {
            uri: `https://videodelivery.net/${videoID}/manifest/video.m3u8`,
          },
          usePoster: true,
          posterSource: {
            uri: `https://videodelivery.net/${videoID}/thumbnails/thumbnail.jpg?time=35s`,
          },
          ref: refVideo,
        }}
        fullscreen={{
          visible: false,
        }}
        style={{
          height: Dimensions.get('screen').width - 50,
          width: Dimensions.get('screen').width - 50,
        }}
      /> */}
    </View>
  )
}

export default InlineVideo

const styles = StyleSheet.create({})
