// ReactNativeEzBio.m
#import <UIKit/UIKit.h>
#import "ReactNativeEzBio.h"
#import "SelfieViewController.h"
#import "React/RCTEventDispatcher.h"


/**
 Actual start of ReactNativeEzBio
 */
@implementation ReactNativeEzBio
@synthesize bridge = _bridge;
static RCTResponseSenderBlock eKYCCallback=nil;

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(startSelfie:(NSDictionary *)ocrJSON :(RCTResponseSenderBlock)callback)
{
    eKYCCallback = callback;
    dispatch_sync(dispatch_get_main_queue(), ^{
        SelfieViewController *selfie = [[SelfieViewController alloc]initWithNibName:@"SelfieViewController" bundle:nil];
        selfie.modalPresentationStyle = UIModalPresentationFullScreen;
        selfie.selfieData = ocrJSON;
        [[UIApplication sharedApplication].delegate.window.rootViewController presentViewController:selfie animated:NO completion:nil];
    });
}

+(void)selfieResult: (NSString *_Nullable) images RESULT:(NSInteger)status Message:(NSString *_Nullable)message{
    NSDictionary *json = nil;
    NSNumber *statusCode = [NSNumber numberWithInteger:status];
    
    if (images != nil) {
        json = [NSDictionary dictionaryWithObjectsAndKeys: images, @"images",[NSNumber numberWithInteger:status], @"status", message, @"message", nil];
    } else if (images == nil) {
        json = [NSDictionary dictionaryWithObjectsAndKeys: statusCode, @"status",@"", @"images", message, @"message", nil];
    }

    eKYCCallback(@[[NSNull null], json]);
}

RCT_EXPORT_METHOD(verifySelfieWithDoc:(NSDictionary *)verifyJSON :(RCTResponseSenderBlock)callback)
{
    //  ocrFrrData
    eKYCCallback = callback;
    dispatch_sync(dispatch_get_main_queue(), ^{
        SelfieViewController *selfie = [[SelfieViewController alloc]initWithNibName:@"SelfieViewController" bundle:nil];
        [selfie verifySelfieWithImageData:verifyJSON];
    });
}

+(void)verifySelfieResult: (NSInteger) result Message:(NSString *)details {
    NSString *status = nil;
    NSString *reason = nil;
    
//    0 - Authentication successful
//   -1 - Authentication failed - no face match
//   -2 - Authentication aborted
//   -3 - SDK not initialized / Invalid parameters
//   -4 - User not enrolled
//   -5 - Multiple faces detected
//   -6 - No face detected
//   -8 - Decryption error
//  -10 - Model not found
//  -11 - TensorFlow initialization error
//  -13 - Image read error
//  -16 - Error thrown by SVM during prediction
    
    if (result == 0) {
        status = @"success";
        reason = @"Authentication Completed";
    } else if(result == -1) {
        status = @"unsuccessful";
        reason = @"Authentication not successful";
    } else if(result == -2) {
        status = @"unsuccessful";
        reason = @"Authentication timeout";
    } else if(result == -4) {
        status = @"unsuccessful";
        reason = @"No user enrolled";
    }
    
    NSDictionary *json = [NSDictionary dictionaryWithObjectsAndKeys: reason,@"message", status, @"status", details, @"details", nil];
    eKYCCallback(@[[NSNull null], json]);
}

+(void)backButton: (NSString *_Nullable)result {
    NSDictionary *json;
    json = [NSDictionary dictionaryWithObjectsAndKeys: result, @"result", nil];

    eKYCCallback(@[[NSNull null]]);
}

@end
