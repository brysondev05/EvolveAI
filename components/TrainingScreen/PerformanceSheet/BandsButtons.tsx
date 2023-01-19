import { View } from 'react-native'
import { Divider, Button } from '@ui-kitten/components'
import produce from 'immer'

const bandNamesLB = [['micro', 'Micro \n(15lb)', 'orange'],['mini',"Mini \n(30lb)", 'red'], ['monsterMini', "MonsterMini \n(50lb)", 'green'], ["light", "Light \n(65lb)", 'orange'] , ['average', 'Average \n(100lb)', 'black'], ["strong", 'Strong \n(140lb)']]
const bandNamesKG = [['micro', 'Micro \n(7kg)', 'orange'],['mini',"Mini \n(16kg)", 'red'], ['monsterMini', "Monster Mini \n(23kg)", 'green'], ["light", "Light \n(30kg)"],['average', 'Average \n(45kg)', 'black'], ["strong", 'Strong \n(63kg)']]

const BandButton =  ({setBands, bands, bandNames, index, handleBandChange, band}) => 
{
    const bandAmount = bands[bandNames[index][0]] 
    
    return (
    <Button onLongPress={() => setBands({...bands, [bandNames[index][0]]: 0})} appearance={bandAmount > 0 ? 'filled' : 'outline'} style={{ marginBottom: 15, width: '32%'}} size="tiny" key={index} onPress={() => handleBandChange(index)}>{band[1]} {bandAmount > 0 &&`x${bandAmount}`}</Button>
    )
}
const BandsButtons = ({setBands, bands, units}) => {

    const handleBandChange = (index) => {
        const band = bandNames[index][0]
        const newBands = produce(bands, newDraft => {
    
          if(bands[band] === 5) {
            newDraft[band] = 0
          } else {
            newDraft[band] = bands[band] + 1
          }
     
        })
        
        setBands(newBands)
      }
    const bandNames = units === 'kg' ? bandNamesKG : bandNamesLB
    
    return (
        <View style={{ marginTop: 15}}>
        <Divider style={{marginBottom: 15}}/>

    <View style={{ flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', alignContent: 'center' }}>

    {bandNames.map((band, index) => <BandButton key={index} setBands={setBands} bands={bands} bandNames={bandNames} index={index} handleBandChange={handleBandChange} band={band}/> )}
    </View>
    </View>

    )
}

export default BandsButtons
