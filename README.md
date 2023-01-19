# Skynet Expert System App

The Expert System app is a structured, interactive coaching system for powerlifting and powerbuilding. It utilizes a sophisticated approach to track and update exercise routines. The app is built in React Native on top of Expo and supports both iOS and Android versions.

A [glossary of terms](https://github.com/substantial/pl-app/blob/main/GLOSSARY.md) are provided. The app has it's origins in a previous coaching app.

## Development Dependencies

- Xcode (via App Store) and Command Line Tools
- Node.js 14.x or later
- Yarn 1 (Classic) `$ npm install -g yarn`
- Expo tooling: `$ npm install -g expo-cli eas-cli`

## Running the app

Install dependencies with `$ yarn install`.

The iOS app can be run by running `$ yarn ios` and pressing `i` to launch in the simulator.

Sometimes you may need to run `$ npx pod-install` because Expo didn't reliably install Cocoapods dependencies.

Note: Cocoapods dependencies installation for the iOS app may take a long time.

## Distributing the app (TestFlight)

To kick off a build and [automatically submit](https://docs.expo.dev/build/automating-submissions/) it to TestFlight:

`$ eas build --platform ios --auto-submit`

EAS will guide you through logging into App Store Connect.

## Firebase Cloud Functions

The app utilizes Firebase Cloud Functions as a backend. The Skynet Cloud Functions are provided in a [separate repo](https://github.com/substantial/pl-cloud-functions).

### Run functions locally

You are able to [run these functions locally](https://firebase.google.com/docs/functions/local-emulator). These functions still use production data and users, so be careful!

In `pl-cloud-functions/functions`, run. Note there are additional setup steps in that repositories README:

```bash
# After running any setup instructions from the `pl-cloud-functions` repo README
$ npm run serve
```

Now, tell the app to connect to the emulator for functions. In `pl-app/.env.development`, set:

`USE_FIREBASE_FUNCTIONS_EMULATOR=true`

And then run the app as normal, for example:

`$ yarn ios`

## Other dependencies

The app additionally uses Intercom for customer support messaging and Sentry for error monitoring. Ask Garrett to be invited to those tools.
