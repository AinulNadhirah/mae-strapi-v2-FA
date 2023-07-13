/**
****************************************************************************
**
**   This material is the confidential, proprietary, unpublished property
**   of Fair Isaac Corporation.  Receipt or possession of this material
**   does not convey rights to divulge, reproduce, use, or allow others
**   to use it without the specific written authorization of Fair Isaac
**   Corporation and use must conform strictly to the license agreement.
**
**   Copyright (c) 2020-2021 Fair Isaac Corporation.  All rights reserved.
**
****************************************************************************
**/
#import <UIKit/UIKit.h>
#define SDK_VERSION @"5.1.6.15_A"
    
NS_ASSUME_NONNULL_BEGIN

@class EzBioRecognizer;

typedef NS_ENUM (NSInteger,STRICTNESS_LEVEL){
    STRICTNESS_LEVEL_LOW = 1,
    STRICTNESS_LEVEL_MEDIUM,
    STRICTNESS_LEVEL_HIGH
};

typedef NS_ENUM (NSInteger,LOG_MODE){
    MODE_INFO = 1,
    MODE_DEBUG = 2,
    MODE_CONSOLE = 3
};


@protocol IImageProcessor <NSObject>
@required
-(void )onImagesProcessed:(NSArray *) imageResults;
@end


@protocol IEnroller <NSObject>
@required
-(void)onEnrollmentStatusUpdate:(NSInteger) faceStatus livenessCommand:(NSInteger) livenessCommand livenessCommandMessage:(NSString *) livenessCommandMessage livenessCommandResult:(NSInteger) livenessCommandResult enrollmentPercentage :(float) enrollmentPercentage;
-(void)onEnrollmentCompleted:(int) resultCode resultMessage:(NSString *) resultMessage  enrollmentSignature:(NSString *) enrollmentSignature imagePath :(NSArray *) imagePath;
@end

@protocol IAuthenticator <NSObject>
@required
-(void)onAuthenticationStatusUpdate:(NSInteger) faceStatus livenessCommand:(NSInteger) livenessCommand livenessCommandMessage:(NSString *) livenessCommandMessage livenessCommandResult:(NSInteger) livenessCommandResult authenticationPercentage :(float) authenticationPercentage;
-(void)onAuthenticationCompleted:(int) resultCode resultMessage:(NSString *) resultMessage  authenticationSignature:(NSString *) authenticationSignature imagePath :(NSArray *) imagePath;
@end


@interface EzBioClientRecognizer : UIViewController
@property (nonatomic,strong) EzBioRecognizer* ezbioRecognizer;
@property (nonatomic,strong) UIView* cameraView;
@property (nonatomic) Boolean frontCamera;
@property (nonatomic) NSInteger noOfInstruction;
@property (nonatomic) NSInteger noOfImages;
@property (nonatomic) NSInteger instructionTimeout;
@property (nonatomic) NSString* userID;
@property (nonatomic) Boolean pinChallenge;
@property (nonatomic) NSInteger pinLength;
@property (nonatomic) float pinChallengeTimeout;
@property (nonatomic) float pinPressDuration;
@property (nonatomic) Boolean enableDeviceOrientation;
@property (nonatomic) Boolean isOnline;
@property (nonatomic) NSInteger convenienceMode;
@property (nonatomic) float pauseTime;
@property (nonatomic) STRICTNESS_LEVEL strictnessLevel;
@property (nonatomic,strong) id <IEnroller> enrollDelegate;
@property (nonatomic,strong) id <IAuthenticator> authDelegate;
+(NSString *) getSDKVersion;

-(Boolean) isUserEnrolled:(NSString *) userID;
-(Boolean) deleteEnrollment:(NSString *) userID;
-(void) startEnrollment;
-(void) startAuthentication;
-(void) cancelSession; // KILL SESSION
-(void) setAuthenticationLevel: (int )level;


// static to access API without invoking camera
+(void) setLogginEnabled:(Boolean)enable MODE:(LOG_MODE)MODE; // API to enable log and log mode (static for get processed api)
+(Boolean) clearLogs; // API to clear logs
+(NSString *) getLogs;  // API to return log path

// static method to get the processed face images
+(void)getProcessedImages:(NSArray *) imagePaths  imageFormats:(NSArray *) imageFormats delegate:(id<IImageProcessor>) imageDelegate;


+(void)verifyEnrollmentUsingImageData:(NSData*)imgData withUserID:(NSString*)userID andImageType:(NSString*)imageType withThreshold:(float) threshold success:(void (^)(NSInteger result, NSString *message))success failure:(void (^)(NSInteger result, NSString *message))failure;

@end

NS_ASSUME_NONNULL_END
