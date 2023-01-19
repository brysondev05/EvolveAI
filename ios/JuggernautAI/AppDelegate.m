#import <Firebase.h>
#import "AppDelegate.h"
#import <UserNotifications/UserNotifications.h>

#if RCT_DEV
#import <React/RCTDevLoadingView.h>
#endif

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>
#import <React/RCTConvert.h>

#import <AVFoundation/AVFoundation.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import <IntercomModule.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [[FBSDKApplicationDelegate sharedInstance] application:application
                           didFinishLaunchingWithOptions:launchOptions];

  // Force DatePicker locale to current language (for: 24h or 12h format, full day names etc...)
NSString *currentLanguage = [[NSLocale preferredLanguages] firstObject];
[[UIDatePicker appearance] setLocale:[[NSLocale alloc]initWithLocaleIdentifier:currentLanguage]];

  [FIRApp configure];

  // Intercom
  [IntercomModule initialize:@"ios_sdk-d15850fa735dc764425bff12051c339e329e6049" withAppId:@"wc7znzbf"];

 [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryPlayback error:nil];  // allow audio to play
  RCTBridge *bridge = [self.reactDelegate createBridgeWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [self.reactDelegate createRootViewWithBridge:bridge moduleName:@"main" initialProperties:nil];
   id rootViewBackgroundColor = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"RCTRootViewBackgroundColor"];
   if (rootViewBackgroundColor != nil) {
     rootView.backgroundColor = [RCTConvert UIColor:rootViewBackgroundColor];
  } else {
     rootView.backgroundColor = [UIColor colorWithRed: 0.07 green: 0.07 blue: 0.09 alpha: 1.00];
   }

   self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
   UIViewController *rootViewController = [self.reactDelegate createRootViewController];
  rootViewController.view = rootView;
   self.window.rootViewController = rootViewController;
   [self.window makeKeyAndVisible];

  [super application:application didFinishLaunchingWithOptions:launchOptions];

  return YES;
}


- (NSArray<id<RCTBridgeModule>> *)extraModulesForBridge:(RCTBridge *)bridge
{
  // You can inject any extra modules that you would like here, more information at:
  // https://facebook.github.io/react-native/docs/native-modules-ios.html#dependency-injection
  return @[];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
#ifdef DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}


- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    // Intercom
    [IntercomModule setDeviceToken:deviceToken];
}

@end
