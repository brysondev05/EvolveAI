import thunk from "redux-thunk";
import reducer from "./reducers";
import { getFirebase } from "react-redux-firebase";
import { getFirestore, reduxFirestore, actionTypes } from "redux-firestore";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/auth";
import "@react-native-firebase/firestore";
import * as Sentry from "sentry-expo";

import { persistStore } from "redux-persist";
import { configureStore } from "@reduxjs/toolkit";
import {
  cancelledExerciseListener,
  startedExerciseListener,
} from "./reducers/userProgram";

const rrfConfig = {
  userProfile: "users",
  useFirestoreForProfile: true,
  enableClaims: true,
  logListenerError: __DEV__ ? true : false,
  oneListenerPerPath: true,
};
const sentryReduxEnhancer = Sentry.Native.createReduxEnhancer();

function handleListenerResponse(action, store) {
  if (["exercises", "exercises2"].includes(action.meta.storeAs)) {
    store.dispatch(startedExerciseListener());
  }
  if (action.payload.data === null) {
  }
}

const handleListenerUnset = (action, store) => {
  if (["exercises", "exercises2"].includes(action.payload.name)) {
    store.dispatch(cancelledExerciseListener());
  }
};

function handleAction(action: any, store) {
  switch (action.type) {
    case actionTypes.LISTENER_RESPONSE: {
      handleListenerResponse(action, store);
      break;
    }
    case actionTypes.UNSET_LISTENER: {
      handleListenerUnset(action, store);
      break;
    }
    default:
      break;
  }
}

const observeActions = (store) => (next) => (action) => {
  next(action);
  handleAction(action, store);
};

const middlewares = [observeActions];

// export const Store = createStore(
//   reducer,
//   composeWithDevTools(
//     applyMiddleware(...middlewares),
//     sentryReduxEnhancer,
//     reduxFirestore(firebase, rrfConfig)
//   )
// )

export const Store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,

      thunk: {
        extraArgument: { getFirebase, getFirestore },
      },
      serializableCheck: false,
      // serializableCheck: {
      //   ignoredActions: [
      //     FLUSH,
      //     REHYDRATE,
      //     PAUSE,
      //     PERSIST,
      //     PURGE,
      //     REGISTER, // just ignore every redux-firebase and react-redux-firebase action type
      //     ...Object.keys(rfConstants.actionTypes).map(
      //       (type) => `${rfConstants.actionsPrefix}/${type}`
      //     ),
      //     ...Object.keys(rrfActionTypes).map(
      //       (type) => `@@reactReduxFirebase/${type}`
      //     ),
      //   ],
      //   ignoredPaths: ['firebase', 'firestore'],
      // },
    }).concat(middlewares),
  enhancers: [sentryReduxEnhancer, reduxFirestore(firebase, rrfConfig)],
});

export const persistor = persistStore(Store);

export type AppDispatch = typeof Store.dispatch;
