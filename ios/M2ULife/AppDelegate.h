#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>
#import <UserNotifications/UserNotifications.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, CLLocationManagerDelegate,UNUserNotificationCenterDelegate>

@property (nonatomic, strong) UIWindow *window;
@property (nonatomic,retain) CLLocationManager *locationManager;
@end
