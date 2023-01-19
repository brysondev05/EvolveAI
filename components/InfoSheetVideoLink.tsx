import { Pressable, StyleSheet, Dimensions, View } from 'react-native'
import { Text, useTheme, Icon } from '@ui-kitten/components'
import { useDispatch } from 'react-redux'
import { Video } from 'expo-av'
import { useCallback, useEffect, useRef, useState } from 'react'
import YoutubePlayer from 'react-native-youtube-iframe'
const { width, height } = Dimensions.get('window')
const InfoSheetVideoLink = ({ videoID, title, videoDescription }) => {
  const dispatch = useDispatch()
  const theme = useTheme()
  const videoRef = useRef(null)

  const [videoStatus, setVideoStatus] = useState({})

  const openVideo = useCallback(async () => {
    if (videoRef.current) {
      await videoRef.current.presentFullscreenPlayer()
      videoRef.current.playAsync()
    }
  }, [videoRef])

  const closeVideo = useCallback(async () => {
    if (videoRef.current) {
      videoRef.current.stopAsync()

      await videoRef.current.dismissFullscreenPlayer()
    }
  }, [videoRef])

  const handleFullScreenUpdate = useCallback(
    async (update) => {
      if (
        update.fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_DID_DISMISS
      ) {
        videoRef.current.stopAsync()
      }
    },
    [videoRef]
  )
  useEffect(() => {
    if (videoStatus.didJustFinish) {
      closeVideo()
    }
  }, [videoStatus])
  const [playing, setPlaying] = useState(false)
  const onStateChange = useCallback((state) => {
    //console.log(state);
    if (state === 'ended') {
      setPlaying(false)
      //Alert.alert("video has finished playing!");
    }
  }, [])
  return (
    // <Pressable onPress={openVideo} style={styles.playButton}>
    //   <View style={styles.videoThumb}>
    //     <Video
    //       source={{
    //         uri: `https://www.youtube.com/watch?v=ysz5S6PUM-U`,
    //       }} // Can be a URL or a local file.
    //       ref={videoRef}
    //       style={[StyleSheet.absoluteFill]}
    //       resizeMode='contain'
    //       usePoster
    //       shouldPlay={false}
    //       useNativeControls={false}
    //       posterSource={{
    //         uri: `https://videodelivery.net/${videoID}/thumbnails/thumbnail.jpg?time=35s`,
    //       }}
    //       onError={closeVideo}
    //       onFullscreenUpdate={handleFullScreenUpdate}
    //       onPlaybackStatusUpdate={setVideoStatus}
    //     />
    //     <Icon
    //       fill={theme['text-basic-color']}
    //       name='play-circle-outline'
    //       style={styles.playIcon}
    //     />
    //   </View>

    //   <Text category='h6'>{videoDescription}</Text>
    // </Pressable>

    //Youtube Player iFrame Library is used to play the exercise video for each exercise.
    //Video Id: Every id is different for each exercise and passed in exercise database.
    //If video is DATA_HERE no need to show that particular video.
    videoID !== 'DATA_HERE' && (
      <View
        style={{
          paddingHorizontal: 3,
          position: 'relative',
          marginTop: 30,
        }}>
        <View>
          <YoutubePlayer
            height={width * 0.55} //based on the youtube aspect ratio
            play={playing} //based on weather it's playing or not
            videoId={videoID}
            webViewProps={{
              androidLayerType: 'hardware',
            }}
            onChangeState={onStateChange}
            initialPlayerParams={{ controls: false, modestbranding: true,}}
          />
        </View>
        <Text category='h6'>{title}</Text>
      </View>
    )
  )
}

export default InfoSheetVideoLink

const styles = StyleSheet.create({
  playButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  videoThumb: {
    position: 'relative',
    width: 50,
    height: 50,
    // justifyContent: 'center',
    // alignItems: 'center',
    marginRight: 5,
  },
  playIcon: { width: 25, height: 25 },
})
