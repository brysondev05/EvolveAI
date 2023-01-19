import { useMemo, useCallback } from 'react';
import { Text, Card, Button, useTheme } from '@ui-kitten/components'
import { ScrollView, StyleSheet, View } from 'react-native'
import BlockOverview from '~/components/BlockOverview'
import GradientHeader from '~/components/presentational/GradientHeader'
import LargeButtonGroup from '~/components/ProgramReview/LargeButtonGroup'
import { round } from '~/helpers/Calculations'
import { useTypedSelector } from '~/reduxStore/reducers'


const hypToHypSameRep =
    'It’s time to head into another Hypertrophy Block. You’ll notice that you are doing the same reps per set on your main exercises as you were last block but don’t worry, you are still satisfying the Principle of Overload because the total number of sets is higher. The system decided this was the best route for you based on your experience, strength levels and bodyweight goals.'


const hypToHyp = 'It’s time to head into another Hypertrophy Block. This block, you are moving to a bit lower reps than the previous block, while the goal is still hypertrophy, we are moving you to lower reps now to help support your bodyweight goals and to create a smoother transition into your upcoming Strength Block.'

const hypToStr = 'Congrats on finishing up your Hypertrophy Block, we know those can be grueling but they’re an important part of the long term process. As you enter this Strength Block, don’t be shocked if the weights feel a bit heavy the first week, trust the process and know that your body will adapt quickly and be teaching that new muscle you just built in Hypertrophy to produce more force soon.'

const strToStr = 'Nice work! One strength block down and another coming up. Your reps will be dropping a bit as we continue to apply the Principle of Overload and increase your intensity for Strength adaptations. Total number of sets will be flat or decreasing now based upon your Readiness Ratings.'

const strToPeak = 'Let’s go! We are entering your Peaking Block. Remember the goals of Peaking are to hone your technique, manage fitness/fatigue and help your body/nervous system develop the skill of the 1 rep max. You’re not going to feel great during this block, that’s fine and all part of the process to set you up to feel great at the end of your taper, when it matters most. Good luck!'

const peakToBridge = 'Congrats on wrapping up your program with a successful peak and good job on making the wise decision to begin your new program with a few weeks of a Bridge Block. The Bridge Block is designed to help you smoothly build back fitness after the lower volumes of peaking, expose you to more variety and new movements to avoid adaptive resistance and give your body a break from heavier weights. Much of the training effect from the Bridge Block will come through frequency and controlled rest periods so don’t worry if you are feeling very out of breath or if the weights on some days seem too light, it is all by design.'

const peakToHyp = 'Congrats on wrapping up your program with a successful peak. As you jump back into a Hypertrophy Block there are a few things to be aware of. First, you’re going to feel out of shape, you just finished training mostly in the 1-3 rep range and now are training with 6-10 reps/set so it should come as no surprise that for the first week or two, your lungs are feeling as taxed as your muscles, that’s fine, you’ll get back in shape quickly. Next, you’re likely to get VERY sore during the first week of training, you’ll survive, you just need to push through this first week or two and you’ll get acclimated to where you can handle the higher volumes without debilitating soreness. Finally, you may feel weaker in terms of maximal strength during Hypertrophy, that is fine. Hypertrophy is building the foundation for your next peak to be built upon, you don’t need to be at your strongest during Hypertrophy, so don’t fret that you can’t hit new 1rm PRs straight out of a block of 8-10 reps, instead, know that this work is setting you up for greater success down the road through proper Phase Potentiation. '


const bridgeToHyp = 'Transitioning from a Bridge Block into a Hypertrophy Block is our most preferred setup for long term success. Your body and mind should be ready to dive into more focused Powerlifting training, this should allow for a smooth transition into your new block.'

const bridgeToStr = 'Moving from a Bridge Block into a Strength Block could present some challenges as the weights will be quite a bit heavier. For this reason, be conservative in your weight selection for the first few weeks of your Strength Block and focus on getting quality volume in with moderate loads. Trust that your force production qualities will come along later in the block and put you in the position you need to be.'

const strToHyp = 'In your next phase of training, you will transition back to Hypertrophy training. As part of your goal in Powerbuilding, to simultaneously build strength and muscle, this transition will help us avoid adaptive resistance that could come with staying in a specific phase too long. Also, the Strength Block you just finished will help potentiate. more muscle growth in this upcoming Hypertrophy Block since you are now stronger and will be able to handle heavier weights, creating more stimulus for muscle growth. Good luck!'


const BlockReviewScreen = ({ navigation, route }) => {

    const programBlocks = useTypedSelector(({ firestore: { data } }) => data?.programBlocks)
    const programWeeks = useTypedSelector(({ firestore: { data } }) => data?.programWeeks)
    const userProgram = useTypedSelector(({ firestore: { data } }) => data.userProgram)
    const theme = useTheme()

    const { programDetails: { userLiftingData, userProgramData }, volumeData: programVolumeData, cycleStructure: programCycle } = userProgram

    const { currentBlock, isNewBlockScreen } = route.params || { currentBlock: 0, isNewBlockScreen: false }

    const thisBlockWeeks = useMemo(() => programWeeks && Object.values(programWeeks).filter(week => week.cycleID === currentBlock), [programWeeks])

    const thisBlockType = thisBlockWeeks?.[0]?.blockType

    const lastBlockWeek = thisBlockWeeks?.[thisBlockWeeks.length - 1]?.startingWeek

    const nextBlockType = programWeeks[`week${lastBlockWeek + 1}`]?.blockType

    const programIndex = userProgramData?.programIndex

    const thisBlockPeriodization = thisBlockType?.[0]
    const nextBlockPeriodization = nextBlockType?.[0]
    const thisBlockVersion = thisBlockType?.[thisBlockType.length - 1]
    const nextBlockVersion = nextBlockType?.[nextBlockType.length - 1]



    const thisBlockReadiness = thisBlockWeeks.reduce((arr, week) => {

        week?.readinessScores?.forEach(score => {
            arr.squat += score.squat
            arr.bench += score.bench
            arr.deadlift += score.deadlift,
                arr.days += 1
        })


        return arr
    }, { squat: 0, bench: 0, deadlift: 0, days: 0 })



    // const avgReadiness = useCallback((type) => {
    //     return round(thisBlockReadiness[type] / thisBlockReadiness.days, 0.01)
    // }, [thisBlockReadiness])

    //Changes provided by Prince
    const avgReadiness = useCallback((type) => {
        //console.warn(thisBlockReadiness.days)
        if(thisBlockReadiness.days==0){
          return 0;
        }else{
          return round(thisBlockReadiness[type] / thisBlockReadiness.days, 0.01)
        }
    }, [thisBlockReadiness])

    const readinessRatings = [{
        title: 'Squat',
        description: avgReadiness('squat'),
        descriptionColor: theme['text-basic-color']
    },
    {
        title: 'Bench',
        description: avgReadiness('bench'),
        descriptionColor: theme['text-basic-color']
    },
    {
        title: 'Deadlift',
        description: avgReadiness('deadlift'),
        descriptionColor: theme['text-basic-color']
    },
    ]

    const getOverviewDescription = useCallback(() => {
        if (thisBlockPeriodization === nextBlockPeriodization) {

            if(nextBlockPeriodization === 'H'){
                if(Number(thisBlockVersion) === 1 && Number(nextBlockVersion) === 2 || Number(thisBlockVersion) === 3 && Number(nextBlockVersion) === 4){
                    return hypToHypSameRep
                }
            }
        
            if (thisBlockPeriodization === 'H') {
                return hypToHyp
            }
            if (thisBlockPeriodization === 'S') {
                return strToStr
            }
        }
        if (thisBlockPeriodization === 'H' && nextBlockPeriodization === 'S') {
            return hypToStr
        }
        if(thisBlockPeriodization === 'S' && nextBlockPeriodization === 'H'){
            return strToHyp
        }
        if (thisBlockPeriodization === 'S' && nextBlockPeriodization === 'P') {
            return strToPeak
        }
        if (thisBlockPeriodization === 'B' && nextBlockPeriodization === 'H') {
            return bridgeToHyp
        }
        if (thisBlockPeriodization === 'B' && nextBlockPeriodization === 'S') {
            return bridgeToStr
        }
        if (thisBlockPeriodization === 'P') {
            return ''
        }
        return ''
    }, [thisBlockType, nextBlockType])

    // const prevBlockVolume = programBlocks[`Block${currentBlock}`]?.volumeData?.programVolume
    // const nextBlockVolume = programBlocks[`Block${Number(currentBlock) + 1}`]?.volumeData?.programVolume
    const plPrevBlockVolume = programBlocks[`Block${currentBlock}`]?.volumeData
    const plNextBlockVolume = programBlocks[`Block${Number(currentBlock) + 1}`]?.volumeData

    const prevBlock = programBlocks[`Block${currentBlock}`]?.volumeData
    const nextBlock = programBlocks[`Block${Number(currentBlock) + 1}`]?.volumeData

    const prevBlockVolume = programIndex === 1 ? prevBlock?.programVolume : prevBlock

    const nextBlockVolume = programIndex === 1 ? nextBlock?.programVolume: nextBlock
    return (
        <View>
            <ScrollView>
                <GradientHeader title="Block Review" subheading="Welcome to your end of block review. Here you'll see your planned volume profile for your next block and any adjustments made based on this block's performance." />

                <View style={{ paddingHorizontal: 15, marginTop: 30 }}>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                        <Text category="h4">Readiness</Text>

                    </View>

                    <LargeButtonGroup title="Average Readiness" items={readinessRatings} />

                </View>
        {nextBlockVolume && (
            <>
       
                <BlockOverview type="Squat" thisBlockVolumeData={prevBlockVolume?.squat} nextBlockVolumeData={nextBlockVolume?.squat} navigation={navigation} />

                {/* <BlockOverview type="Squat" thisBlockVolumeData={plPrevBlockVolume?.squat} nextBlockVolumeData={plNextBlockVolume?.squat} navigation={navigation} /> */}
                <BlockOverview type="Bench" thisBlockVolumeData={prevBlockVolume?.bench} nextBlockVolumeData={nextBlockVolume?.bench} navigation={navigation} />
                {/* <BlockOverview type="Bench" thisBlockVolumeData={plPrevBlockVolume?.bench} nextBlockVolumeData={plNextBlockVolume?.bench} navigation={navigation} /> */}
                <BlockOverview type="Deadlift" thisBlockVolumeData={prevBlockVolume?.deadlift}
                    nextBlockVolumeData={nextBlockVolume?.deadlift} navigation={navigation} />
     {/* <BlockOverview type="Deadlift" thisBlockVolumeData={plPrevBlockVolume?.deadlift}
                    nextBlockVolumeData={plNextBlockVolume?.deadlift} navigation={navigation} /> */}

</>
        ) }
                {userProgramData?.programIndex === 1 && (
                    <>
                        <BlockOverview type="Upper Pulling" thisBlockVolumeData={prevBlockVolume?.upperPull}
                            nextBlockVolumeData={nextBlockVolume?.upperPull} navigation={navigation} />


                        {Object.entries(programVolumeData.programVolume.accessories).map(([key, val]) => <BlockOverview key={key} type={key} thisBlockVolumeData={prevBlockVolume?.accessories?.[key]}
                            nextBlockVolumeData={nextBlockVolume?.accessories?.[key]} navigation={navigation} isAccessory />)}
                    </>
                )}

                <View style={{ padding: 20 }}>
                    <Text category='h4'>Your Next Block</Text>

                    <Text category="s1">{getOverviewDescription()}</Text>

                    <Button style={{ marginTop: 20 }} onPress={() => navigation.navigate('Dashboard')} size="giant" status="secondary">
                        Let's go!
                </Button>
                </View>

            </ScrollView>
        </View>
    )
}

export default BlockReviewScreen

const styles = StyleSheet.create({})
