
const initialState = {
    activeProducts: [],
    IAPProducts: [],
    skuProcessing: [],
    subscriptionsLoaded: false,
    subscriptionStatus: 'pending',

}


export default function subscription(state = initialState, action) {

        switch(action.type) {
    
            case "START_SUBSCRIPTION_LOADING":
                return{...state, subscriptionStatus: 'loading'}
            case "SET_IAP_PRODUCTS":
            return {...state, IAPProducts: action.products}
            case "SET_ACTIVE_PRODUCTS":
                return {...state, activeProducts: action.products, subscriptionsLoaded: true}
            case "SET_SKU_PROCESSING": 
            return {...state, skuProcessing: action.productSku}
            case "END_SUBSCRIPTION_LOADING":
                return{...state, subscriptionStatus: 'pending'}
                case "EMULATE_SUBSCRIPTION":
                    return {...state, subscriptionsLoaded: true} 
                case "SIGN_OUT":

        return initialState
            default:
                return state
        }
}