// ReactNativeEzBio.h
#import <React/RCTBridgeModule.h>
//#import <React/RCTEventEmitter.h>

@interface ReactNativeEzBio : NSObject <RCTBridgeModule>
    +(void)selfieResult: (NSString *_Nullable) images RESULT:(NSInteger)status Message:(NSString *_Nullable)message;
    +(void)verifySelfieResult: (NSInteger) result Message:(NSString *_Nullable)message;
    +(void)backButton: (NSString *_Nullable)result;
@end
