// ReactNativeEkyc.m
#import "ReactNativeEkyc.h"
#import "eKYCViewController.h"
//#import "SelfieViewController.h"
//#import "React/RCTEventDispatcher.h"

@implementation ReactNativeEkyc
@synthesize bridge = _bridge;
static RCTResponseSenderBlock eKYCCallback=nil;

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(startKYC:(NSDictionary *)ocrJSON :(RCTResponseSenderBlock)callback)
{
    eKYCCallback = callback;
    //IDP SDK
    dispatch_sync(dispatch_get_main_queue(), ^{
    eKYCViewController *eKYC = [[eKYCViewController alloc]init];
    eKYC.ocrInitData = ocrJSON;
    eKYC.modalPresentationStyle = UIModalPresentationFullScreen;
    [[UIApplication sharedApplication].delegate.window.rootViewController presentViewController:eKYC animated:NO completion:nil];
    });
}

+(void)hologramFail: (NSString *_Nullable)result {
    NSDictionary *json;
    json = [NSDictionary dictionaryWithObjectsAndKeys: result, @"result", nil];

    eKYCCallback(@[[NSNull null], json]);
}

+(void)backButton: (NSString *_Nullable)result {
    NSDictionary *json;
    json = [NSDictionary dictionaryWithObjectsAndKeys: result, @"result", nil];

    eKYCCallback(@[[NSNull null], json]);
}

+(void)scanResult:(NSMutableArray*)images DETAILS_DOC:(NSString *) details ocrRequestPayload:(NSString *_Nullable)reqPayload RESULT:(nonnull NSString *)status {
    NSDictionary *json;
    json = [NSDictionary dictionaryWithObjectsAndKeys: details, @"result", images, @"images",status, @"status",reqPayload, @"ocrReqPayload", nil];

    eKYCCallback(@[[NSNull null], json]);
}

+(id)jsonData: (NSString*) details {
    NSData *data = [details dataUsingEncoding:NSUTF8StringEncoding];
    id jsonDetails = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
    id response_model = [jsonDetails objectForKey:@"response_model"];
    NSString *ocrInfo = [response_model objectForKey:@"mrz"];//ocr //mrz
    
    if(ocrInfo == nil) {
        ocrInfo = [response_model objectForKey:@"ocr"];
    }
    
    NSLog(@"ocr result :: %@",ocrInfo);

    return response_model;
}

@end
