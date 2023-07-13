#import <React/RCTBridgeModule.h>
#import "SodiumObjc.h"

@interface ReactNativeLibsodiumSdk : NSObject <RCTBridgeModule>
@property (atomic, strong) NACLAsymmetricKeyPair *myKeyPair;
@end


