import { useState, useEffect } from 'react';
import BandsButtons from '~/components/TrainingScreen/PerformanceSheet/BandsButtons'


const initialBandState = { micro: 0,
    mini: 0,
    monsterMini: 0,
    light: 0,
    average: 0,
    strong: 0,
    
  }

const useBands = ({units}) => {
    const [usesBands, setUsesBands] = useState(false)
    const [bands, setBands] = useState(initialBandState)
    useEffect(() => {
        if(!usesBands){
          setBands(initialBandState)
        }
      }, [usesBands])

      
    return {
        usesBands, setUsesBands, bands, setBands, bandsButtons: usesBands &&<BandsButtons setBands={setBands} bands={bands} units={units} />
    }
}

export default useBands
