//
//  MobileSDK version 5.0_Patch
//  MobileSDK.h
//
//  Created by UpOnTek User on 6/10/11.
//  Copyright (c) 2013 Outseer™ An RSA Company. All rights reserved.
//

#import <Foundation/Foundation.h>

/**
 * configuration values for CONFIGURATION_KEY
 * mode 0 : collect only basic device information and nothing else.
 * The information collected here is simple, can be collected
 * quickly and requires minimal permissions.
 * This mode is not recommended as it does not collect enough information
 * for a good risk assessment score.
 *
 * mode 1: collect all the fields of mode 0 and some additional fields.
 * This mode collects the bare minimum for a risk assessment score,
 * while still collecting it quickly and requires minimal permissions.
 *
 * mode 2: collect all the fields of mode 1, and additional fields
 * such as location, wifi data and more device information.
 * This mode gives the best information for risk assessment score, but
 * requires more permissions, and some fields may take more time to
 * collect good values (such as location).
 */
enum{
    COLLECT_BASIC_DEVICE_DATA_ONLY = 0,
    COLLECT_DEVICE_DATA_ONLY = 1,
    COLLECT_ALL_DEVICE_DATA_AND_LOCATION = 2
};

/**
 * Properties keys
 */

/**
 * Controls the amount of information to be collected by the mobile SDK.
 * Can be one of the modes: COLLECT_BASIC_DEVICE_DATA_ONLY(mode 0),
 * COLLECT_DEVICE_DATA_ONLY(mode 1) and
 * COLLECT_ALL_DEVICE_DATA_AND_LOCATION(mode 2).
 * mode 0 : collect only basic device information and nothing else.
 * The information collected here is simple, can be collected
 * quickly and requires minimal permissions.
 * This mode is not recommended as it does not collect enough information
 * for a good risk assessment score.
 * mode 1: collect all the fields of mode 0 and some additional fields.
 * This mode collects the bare minimum for a risk assessment score,
 * while still collecting it quickly and requires minimal permissions.
 * mode 2: collect all the fields of mode 1, and additional fields
 * such as location, wifi data and more device information.
 * This mode gives the best information for risk assessment score, but
 * requires more permissions, and some fields may take more time to
 * collect good values (such as location).
 */
extern const id CONFIGURATION_KEY;// = @"Configuration-key";

/**
 * When collecting location information, specify the maximum time,
 * in minutes, to wait for a good location information.
 * When the mobile SDK starts collecting location information, it will
 * attempt to get a good location fix until the timeout elapses.
 * When timeout elapses, it will stop any location collection process,
 * and use the best location collected so far.
 * Minimum value is 1 minutes. Maximum value is 60 minutes.
 */
extern const id TIMEOUT_MINUTES_KEY;// = @"Timeout-key";

/**
 * Time to wait, in minutes, between location collection attempts.
 * The mobile SDK will repeat location collections regularly, to make
 * sure location stays updated over time, when device is moving.
 * When location collection attempt is finished for any reason
 * (either because a good enough location was collected, timeout value
 * reached or other reason), the mobile SDK will wait this
 * silent period, before trying to collect another location.
 * Minimum value is 1 minutes, Maximum value is 60 minutes.
 */
extern const id SILENT_PERIOD_MINUTES_KEY;// = @"Silent-period-key";

/**
 * The maximum age that a collected location can have, while still considered
 * a candidate for "best" location.
 * The age of a location is the difference between current time and the time when
 * the location was originally collected.
 * A best location is a location which is good enough to stop the location
 * collection attempt.
 * A collected location can be a candidate for a best location, as long as
 * its age is below this configuration value.
 * When one or more candidates for best location
 * are available, location collection will stop, and the location with the
 * highest accuracy among the best location candidates will be used.
 * Minimum value is 1 minutes, Maximum value is 60 minutes.
 */
extern const id BEST_LOCATION_AGE_MINUTES_KEY;// = @"Best-location-age-key";

/**
 * The maximum age a collected location can have, in days, to be even
 * considered for a collected location.
 * This is mainly used in cases where the device did not have GPS access
 * for a long time, but it still remembers a location from a last collection.
 * This location can have age of a few hours and even a few days.
 * As long as the location age is below this configuration value, it can still
 * be used provided the location collection timeout has passed, and no better
 * location candidate was found.
 * Minimum value is 1 day, maximum value is 30 days.
 */
extern const id MAX_LOCATION_AGE_DAYS_KEY;// = @"Max-location-age-key";

/**
 * The minimum accuracy (maximum distance deviation) that a location
 * can have, in meters, to be even considered for a collected location.
 * This is mainly used when device is in an environment where GPS is
 * not working so well, and received locations can have very large
 * distance deviation.
 * As long as the location accuracy is higher than this configuration
 * value, it can be used provided the location collection timeout has passed,
 * and no better location candidate was found.
 * Minimum value is 1 meters, maximum value is 5000 meters.
 */
extern const id MAX_ACCURACY_KEY;// = @"Max-accuracy-key";

/**
 TO-DO Add a description for this value
 */
extern const id PROMPT_FOR_PERMISSION_KEY;// = @"Prompt-for-permission-key";

/**
 TO-DO Add a description for this value for iOS 14.x +
 */
extern const id PROMPT_TMP_LOCATION_FULLACCURACY_KEY;// = @"Prompt-for-tmp-locn-accuracypermission-key";

/**
 * if true add a string date/time to result JSON string
 */
extern const id ADD_TIMESTAMP_KEY; // =@"Add-timestamp-key";

/**
 *If TRUE, JSON Payload output should be encrypted
 */
extern const id ENABLE_PAYLOAD_ENCRYPTION; // =@"Enable-payload-encryption";

/**
 *public key for json payload encryption
 */
extern const id PUBLIC_KEY; // =@"Public-key";
/**
 * Key for  RSA public key size
 */
extern const id PUBLIC_KEY_SIZE; // =@"Public-key-size";

/**
 * Key for  RSA public key transformation
 */
extern const id PUBLIC_KEY_TRANSFORMATION; // =@"Public-key-transformation";

/**
 * Key for  secret key transformation
 */
extern const id SECRET_KEY_TRANSFORMATION; // =@"Secret-key-transformation";

/**
 Key for enabling the sensor data collection
 if true sensor data is captured for the specified sampling intervall
 */
extern const id ENABLE_SENSOR_DATA; // =@"Enable-Sensor-Data";

/**
 Key for specifiying the sensor data sampling frequency time
 The default value is 200000 microseconds
 */
extern const id SENSOR_SAMPLING_INTERVAL; //=@"Sensor-Sampling-Interval"

/**
 *If TRUE, hardware Id will return null
 */
//extern const id DISABLE_HARDWARE_ID; // =@"Disable-hardwareID";

enum {
    /**
     * the default value of the configuration property CONFIGURATION_KEY
     */
    CONFIGURATION_DEFAULT_VALUE = COLLECT_BASIC_DEVICE_DATA_ONLY,
    
    /**
     * the default value of the configuration property TIMEOUT_MINUTES_KEY
     */
    TIMEOUT_DEFAULT_VALUE = 2,
    
    /**
     * the default value of the configuration property SILENT_PERIOD_MINUTES_KEY
     */
    SILENT_PERIOD_DEFAULT_VALUE = 3,
    
    /**
     * the default value of the configuration property BEST_LOCATION_AGE_MINUTES_KEY
     */
    BEST_LOCATION_AGE_MINUTES_DEFAULT_VALUE = 3,
    
    /**
     * the default value of the configuration property MAX_LOCATION_AGE_DAYS_KEY
     */
    MAX_LOCATION_AGE_DAYS_DEFAULT_VALUE = 2,
    
    /**
     * the default value of the configuration property MAX_ACCURACY_KEY
     */
    MAX_ACCURACY_DEFAULT_VALUE = 100,
    
    /**
     * the default value of the configuration property ENABLE_PAYLOAD_ENCRYPTION
     */
    ENABLE_PAYLOAD_ENCRYPTION_DEFAULT_VALUE = 0,
    
    //    /**
    //     * the default value of the configuration property PUBLIC_KEY
    //     */
    //    PUBLIC_KEY_DEFAULT_VALUE = @"",
    
    /**
     * the default value of the configuration property PUBLIC_KEY_SIZE
     */
    PUBLIC_KEY_SIZE_DEFAULT_VALUE = 0,
    
    //    /**
    //     * the default value of the configuration property PUBLIC_KEY_TRANSFORMATION
    //     */
    //    PUBLIC_KEY_TRANSFORMATION_DEFAULT_VALUE = 1,
    //
    //    /**
    //     * the default value of the configuration property SECRET_KEY_TRANSFORMATION
    //     */
    //    SECRET_KEY_TRANSFORMATION_DEFAULT_VALUE =
    DISABLE_HARDWARE_ID_DEFAULT_VALUE = 0,
    
    /**
     The default value for the enabling the sensor data collection configuration property
     */
    ENABLE_SENSORS_DATA_DEFAULT_VALUE = 1,
    
    /**
     the default value for sensors data sampling frequency in micro seconds
     */
    SENSORS_SAMPLING_INTERVAL_DEFAULT_VALUE = 200000,
};

typedef enum _CUSTOM_ELEMENT_TYPE
{
    CUSTOM_ELEMENT_TYPE_BOOL,
    CUSTOM_ELEMENT_TYPE_INTEGER,
    CUSTOM_ELEMENT_TYPE_DECIMAL,
    CUSTOM_ELEMENT_TYPE_STRING
} CUSTOM_ELEMENT_TYPE;

@class CollectionModuleResponse;

@protocol CollectionModuleCallback <NSObject>

-(void)onSuccess:(CollectionModuleResponse *)collectionModuleResponse;
-(void)onFailure:(NSException *)exception;

@end

@interface MobileAPI : NSObject

/**
 Main api methods
 */
-(BOOL)initSDK:(NSDictionary *)properties;
-(NSString *)collectInfo;
-(void) collectInfo:(id<CollectionModuleCallback>)delegate;
-(BOOL)addCustomElement:(CUSTOM_ELEMENT_TYPE)type elementName:(NSString*)name elementValue:(id)value;
-(void)destroy;
@property (nonatomic, weak) id<CollectionModuleCallback> delegate;
//+(id)getSDKVERSION;
//@property (nonatomic) NSString* SDK_BUILD_VERSION;

@end


@interface CollectionModuleResponse : NSObject
{
}
@property NSString *encryptedAesKey;
@property NSString *iv;
@property NSString *payload;
@end



