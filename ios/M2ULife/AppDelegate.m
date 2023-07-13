//#import <Bugsnag/Bugsnag.h>
#import "AppDelegate.h"
#import <React/RCTBridge.h>
#import <React/RCTUtils.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>
#import "RNBootSplash.h"
#import <Firebase.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import <TrustKit/TrustKit.h>
#import <TrustKit/TSKPinningValidator.h>
#import <TrustKit/TSKPinningValidatorCallback.h>
#import "ReactNativeConfig.h"

#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>

static void InitializeFlipper(UIApplication *application) {

    FlipperClient *client = [FlipperClient sharedClient];
    SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
    [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
    [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
    [client addPlugin:[FlipperKitReactPlugin new]];
    [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
    [client start];
}

#endif

// deadlock shit this
#if RCT_DEV
#import <React/RCTDevLoadingView.h>
#endif

@import UserNotifications;
@implementation AppDelegate
    - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    //[Bugsnag start];
  
    //GA Debug Start
    //To get the Bundle ID
    NSString *bundleIdentifier = [[NSBundle mainBundle] bundleIdentifier];
    NSLog(@"Bundle Identifier ::: %@", bundleIdentifier);
    //Condition to work only for UAT env later can add if require for other test envronments
    if([bundleIdentifier isEqualToString:@"com.maybank2u.life-uatent"] || [bundleIdentifier isEqualToString:@"com.maybank2u.life-uat"]) {
      NSMutableArray *newArguments = [NSMutableArray arrayWithArray:[[NSProcessInfo processInfo] arguments]];
        [newArguments addObject:@"-FIRDebugEnabled"];
        [[NSProcessInfo processInfo] setValue:[newArguments copy] forKey:@"arguments"];
    }
    //GA Debug End
    
    // FB SDK Implementation
    [[FBSDKApplicationDelegate sharedInstance] application:application
    didFinishLaunchingWithOptions:launchOptions];

    RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];

    // deadlock shit this
    #if RCT_DEV
    [bridge moduleForClass:[RCTDevLoadingView class]];
    #endif
    
    RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
            moduleName:@"M2ULife"
            initialProperties:nil];
    rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UIViewController *rootViewController = [UIViewController new];
    rootViewController.view = rootView;
    self.window.rootViewController = rootViewController;
    [self.window makeKeyAndVisible];


    #ifdef FB_SONARKIT_ENABLED
    InitializeFlipper(application);
    #endif
 
    // SSL Pinning Feature
    NSString *sslPinningEnable = [ReactNativeConfig envFor:@"SSLPINNING_ENABLE"];
    // NSLog(@"sslPinningEnable log: %@", [ReactNativeConfig env]);
    if([sslPinningEnable isEqualToString:@"true"]) {

        // Override TrustKit's logger method
        void (^loggerBlock)(NSString *) = ^void(NSString *message)
        {
            NSLog(@"TrustKit log: %@", message);
        };
        [TrustKit setLoggerBlock:loggerBlock];

        // Initialize TrustKit
        NSDictionary *trustKitConfig =
        @{
            // Auto-swizzle NSURLSession delegates
            kTSKSwizzleNetworkDelegates: @YES,
            // The list of domains we want to pin and their configuration
            kTSKPinnedDomains: @{
                @"maya.maybank2u.com.my" : @{
                    // Pin all subdomains of maybank2u.com.my
                    kTSKIncludeSubdomains:@YES,
                    // Block connections if pinning validation failed
                    kTSKEnforcePinning:@YES,
                    // The pinned public keys' Subject Public Key Info hashes (Must have at least 2)
                    kTSKPublicKeyHashes: @[
                        // Production - ExprDate: Saturday, 22 July 2023 at 07:59:59
                        @"8cPMxWaFJTOJc8860p/MPxhj7TxTiwz0gclT/MFhYBE=",
                        // Production - ExprDate: Thrusday, 23 May 2024 at 23:59:59 
                        @"i4IwjXFdqW/zKUF4DoiXo+D8pSOzajTY1sElV/OZJlI=",
                        //Production - Intermediate As Backup - ExprDate: Sunday, 22 October 2028 at 8:00:00 PM Malaysia Time
                        @"RRM1dGqnDFsCJXBTHky16vi1obOlCgFFn/yOhI/y+ho=",
                        // Staging - ExprDate: Wednesday, 3 January 2024 at 01:06:01
                        @"JmuvBLD5Oet1rpurn/7K7KWUeNjjO7R6pVGN88fKuZ4=",
                        // Staging - Intermediate As BackUp - ExprDate: Tuesday, 21 November 2028 at 8:00:00 AM Malaysia Time
                        @"hETpgVvaLC0bvcGG3t0cuqiHvr4XyP2MTwCiqhgRWwU=",
                    ],
                    kTSKPublicKeyAlgorithms: @[kTSKAlgorithmRsa2048]
                    },
                @"maybank.com.my" : @{
                    // Pin all subdomains of maybank2u.com.my
                    kTSKIncludeSubdomains:@YES,
                    // Block connections if pinning validation failed
                    kTSKEnforcePinning:@YES,
                    // The pinned public keys' Subject Public Key Info hashes (Must have at least 2)
                    kTSKPublicKeyHashes: @[
                        // Direct From OpenSSL Command for SIT AND UAT (Share the Same SSL Cert) - ExprDate: Sunday, 19 March 2023 at 17:24:28
                        @"evDQ82lYadH5cu0MxzqsdOf0d/CfBFEKQ0xkOhjC2uc=",
                        // SIT
                        @"D7ce8tvKuSYinPu3zO8Wz6Gc74UWa2MK7AsJMTMM7jU=",
                        // UAT
                        @"2OndsS/gLTqD58um4iHo2BQ4yVNL+Rz7sgMriyclar0=",
                    ],
                    kTSKPublicKeyAlgorithms: @[kTSKAlgorithmRsa2048]
                    }
                }
            };

        [TrustKit initSharedInstanceWithConfiguration:trustKitConfig];
    }
    
    [FIRApp configure];
    [RNBootSplash initWithStoryboard:@"Launch Screen" rootView:rootView];

    [self setLocationManager];

    return YES;
}
-(void)setLocationManager{
    if(self.locationManager == nil)
    {
        self.locationManager = [[CLLocationManager alloc] init];
        self.locationManager.delegate = self;
        self.locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters;
        [self.locationManager startUpdatingLocation];
        [self.locationManager requestAlwaysAuthorization];
        if ([CLLocationManager locationServicesEnabled]){
            NSLog(@"Location Services Enabled");
            if ([CLLocationManager authorizationStatus]==kCLAuthorizationStatusDenied){
                NSLog(@"no authorization for location");
            }
        }
    }

}
-(void)locationManager:(CLLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)status {
    switch ([CLLocationManager authorizationStatus]) {
        case kCLAuthorizationStatusNotDetermined:
            NSLog(@"kCLAuthorizationStatusNotDetermined");
            break;
        case kCLAuthorizationStatusAuthorizedWhenInUse:
            NSLog(@"kCLAuthorizationStatusAuthorizedWhenInUse");
            break;
        case kCLAuthorizationStatusAuthorizedAlways:
            NSLog(@"kCLAuthorizationStatusAuthorizedAlways");
            break;
        case kCLAuthorizationStatusDenied:
            NSLog(@"kCLAuthorizationStatusDenied");
            break;
        case kCLAuthorizationStatusRestricted:
            NSLog(@"no authorization for location");
    }

}
-(void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
    NSLog(@"Did fail error : %@",error);
}
- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
    #if DEBUG
    return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
    #else
    return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
    #endif
}

// - (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
//   [[RNFirebaseNotifications instance] didReceiveLocalNotification:notification];
// }

// - (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo
// fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{
//   [[RNFirebaseNotifications instance] didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
// }

// - (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
//   [[RNFirebaseMessaging instance] didRegisterUserNotificationSettings:notificationSettings];
// }

// // Called when a notification is delivered to a foreground app.
// -(void)userNotificationCenter:(UNUserNotificationCenter *)center
//       willPresentNotification:(UNNotification *)notification
//         withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
// {
//   // allow showing foreground notifications
//   completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
// }

- (void)applicationDidEnterBackground:(UIApplication *)application {
  NSLog(@"application did enter background %ld", (long)RCTSharedApplication().applicationState);
  UIVisualEffect *blurEffect;

  switch (UIScreen.mainScreen.traitCollection.userInterfaceStyle) {
        case UIUserInterfaceStyleDark:
            // put your dark mode code here
            blurEffect = [UIBlurEffect effectWithStyle:UIBlurEffectStyleDark];
            break;
        case UIUserInterfaceStyleLight:
        case UIUserInterfaceStyleUnspecified:
            blurEffect = [UIBlurEffect effectWithStyle:UIBlurEffectStyleLight];
            break;
        default:
            break;
    }

  UIVisualEffectView *visualEffectView;
  visualEffectView = [[UIVisualEffectView alloc] initWithEffect:blurEffect];
  visualEffectView.tag = 1234;
  visualEffectView.frame = UIScreen.mainScreen.bounds;
  [self.window addSubview:visualEffectView];
  [self.window bringSubviewToFront:visualEffectView];
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
  UIVisualEffectView *colourView = [self.window viewWithTag:1234];
    // fade away colour view from main view
    if(colourView) {
      [UIVisualEffectView animateWithDuration:0.0 animations:^{
          colourView.alpha = 0;
      } completion:^(BOOL finished) {
          // remove when finished fading
          [colourView removeFromSuperview];
      }];
    }
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
  NSLog(@"applicationDidBecomeActive");
  UIVisualEffectView *colourView = [self.window viewWithTag:1234];
  // fade away colour view from main view
  if(colourView) {
    [UIVisualEffectView animateWithDuration:0.0 animations:^{
        colourView.alpha = 0;
    } completion:^(BOOL finished) {
        // remove when finished fading
        [colourView removeFromSuperview];
    }];
  }
  
  // FB SDK Implementation
  [FBSDKAppEvents activateApp];
}

-(BOOL)application:(UIApplication *)application shouldAllowExtensionPointIdentifier:(NSString *)extensionPointIdentifier
{
    if (extensionPointIdentifier == UIApplicationKeyboardExtensionPointIdentifier)
    {
        return NO;
    }

    return YES;
}

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<NSString *, id> *)options {
  // FB SDK Implementation
  if ([[FBSDKApplicationDelegate sharedInstance] application:application openURL:url options:options]) {
    return YES;
  }
  
  // if([[RNFirebaseLinks instance] application:application openURL:url options:options]) {
  //   return YES;
  // }
  
  if ([RCTLinkingManager application:application openURL:url options:options]){
    return YES;
  }
  
  return NO;
}

// - (BOOL)application:(UIApplication *)application
// continueUserActivity:(NSUserActivity *)userActivity
//  restorationHandler:(void (^)(NSArray *))restorationHandler {
//      return [[RNFirebaseLinks instance] application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
// }

@end

