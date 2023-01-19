export const customLog = (item:any, type ='Custom Log') => {
    if(__DEV__){
        return console.log(`[${type}]`, item)
    }
    return null
}