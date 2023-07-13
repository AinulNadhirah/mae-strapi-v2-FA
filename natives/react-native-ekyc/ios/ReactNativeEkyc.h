// ReactNativeEkyc.h
#import <React/RCTBridgeModule.h>
//#import <React/RCTEventEmitter.h>

@interface ReactNativeEkyc : NSObject <RCTBridgeModule>
    +(void)scanResult: (NSMutableArray *_Nullable) images DETAILS_DOC:(NSString *_Nullable) details ocrRequestPayload:(NSString *_Nullable)reqPayload RESULT:(nonnull NSString *)status;
    +(void)hologramFail: (NSString *_Nullable)result;
    +(void)backButton: (NSString *_Nullable)result;
@end
