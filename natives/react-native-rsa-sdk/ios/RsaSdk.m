//
//  RsaSdk.m
//
//  Created by Idraki
//  Copyright (c) 2021 PaddlePop Corporation
//
#import "RsaSdk.h"
#import <React/RCTLog.h>
#import "MobileAPI.h"

@implementation RsaSdk
@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getRSAMobileSDK:(RCTResponseSenderBlock)callback)
{
    __block NSDictionary *jsonObj;

    MobileAPI *mMobileAPI;
    NSString *mJSONInfoString;
    int mConfiguration = 2;


    NSNumber *configuration = [[NSNumber alloc]initWithInt: mConfiguration];
    NSNumber *timeout = [[NSNumber alloc]initWithInt:TIMEOUT_DEFAULT_VALUE];
    NSNumber *silencePeriod = [[NSNumber alloc]initWithInt:SILENT_PERIOD_DEFAULT_VALUE];
    NSNumber *bestAge = [[NSNumber alloc]initWithInt:BEST_LOCATION_AGE_MINUTES_DEFAULT_VALUE];
    NSNumber *maxAge = [[NSNumber alloc]initWithInt:MAX_LOCATION_AGE_DAYS_DEFAULT_VALUE];

    // override default accuracy in order to force GPS collection
    NSNumber *maxAccuracy = [[NSNumber alloc]initWithInt: 50];
    NSDictionary *properties;
    
    #if TARGET_IPHONE_SIMULATOR

    properties = [[NSDictionary alloc] initWithObjectsAndKeys:
                                configuration, @"Configuration-key",
                                timeout, timeout,
                                silencePeriod, silencePeriod,
                                bestAge, bestAge,
                                maxAge, maxAge,
                                maxAccuracy, maxAccuracy,
                                @"1", @"Add-timestamp-key",
                                nil];

    #else

    //Patch
    NSString *enableSensors = @"1";
    NSString *promptForPermission = @"true";
    NSString *promptFullAccuracyPermission = @"true";
    properties = [[NSDictionary alloc] initWithObjectsAndKeys:
                    configuration, CONFIGURATION_KEY,
                    timeout, TIMEOUT_MINUTES_KEY,
                    silencePeriod, SILENT_PERIOD_MINUTES_KEY,
                    bestAge, BEST_LOCATION_AGE_MINUTES_KEY,
                    maxAge, MAX_LOCATION_AGE_DAYS_KEY,
                    maxAccuracy, MAX_ACCURACY_KEY,
                    promptForPermission, PROMPT_FOR_PERMISSION_KEY,
                    promptFullAccuracyPermission, PROMPT_TMP_LOCATION_FULLACCURACY_KEY,
                    @"1", ADD_TIMESTAMP_KEY,
                    enableSensors, ENABLE_SENSOR_DATA,
                    nil];

    #endif
    
    mMobileAPI = [[MobileAPI alloc]init];
    [mMobileAPI initSDK: properties];
    
    // #if !(TARGET_IPHONE_SIMULATOR)
    
    //Patch
    [mMobileAPI addCustomElement:CUSTOM_ELEMENT_TYPE_STRING elementName:@"KeyChainErrorOnRetrieve" elementValue:@"Success"];
    [mMobileAPI addCustomElement:CUSTOM_ELEMENT_TYPE_STRING elementName:@"KeychainErrorOnStoring" elementValue:@"Success"];
    // #endif

    // Get the JSON string
    mJSONInfoString = [mMobileAPI collectInfo]; //Null
    //Store info in userdefaults
    //destroy
    [mMobileAPI destroy];

    // Create an object that will be serialized into a JSON object.
    // This object contains the date String contents and a success property.
    jsonObj = [ [NSDictionary alloc]
               initWithObjectsAndKeys :
               @"true", @"success",
               mJSONInfoString, @"result",
               nil
               ];

    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:jsonObj
                                                       options:NSJSONReadingAllowFragments // Pass 0 if you don't care about the readability of the generated string
     
                                                         error:&error];

    NSString *jsonString;

    if (! jsonData) {
        NSLog(@"Got an error: %@", error);
        
        callback(@[error, [NSNull null]]);
    } else {
        jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        callback(@[[NSNull null], jsonString]);
    }
}

@end
