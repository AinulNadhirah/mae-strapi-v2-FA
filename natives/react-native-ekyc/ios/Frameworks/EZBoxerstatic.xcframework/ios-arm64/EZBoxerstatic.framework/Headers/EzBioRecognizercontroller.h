//
/*
~ This material is the confidential, unpublished property  
~ of Fair Isaac Corporation. Receipt or possession  
~ of this material does not convey rights to divulge,  
~ reproduce, use, or allow others to use it without 
 ~ the specific written authorization of Fair Isaac  
~ Corporation and use must conform strictly to the  
~ license agreement.  ~  
~ Copyright (c) Fair Isaac Corporation, 2021  
~ All Rights Reserved. 
*/


#import "EzBioClientRecognizer.h"
#import <UIKit/UIKit.h>
#import "EzBioSDK.h"
#import "FBAKeychainWrapper.h"
#import "NSData+AES.h"

NS_ASSUME_NONNULL_BEGIN

@protocol EzBioEnrollViewControllerDelegate <NSObject>

- (void)faceEnrollStatus:(int)faceStatus lightStatus:(int)lightStatus brightnessLevel:(float)brightnessLevel instructionToShow:(NSString *)instruction;
- (void)voiceEnrollStatus:(int)noiseLevel numOfPhrasesCaptured:(size_t)numOfPhrasesCaptured withVoiceEnergy:(float)voiceEnergy;
- (void)onEnrollmentDone:(NSInteger)enrollmentStatus;

@end

@protocol EzBioAuthenticateViewControllerDelegate <NSObject>

- (void)faceAuthStatus:(int)faceStatus lightStatus:(int)lightStatus brightnessLevel:(float)brightnessLevel;
- (void)faceLivenessChallengeStatus:(NSString *)target status:(NSString *)status failureStatus:(NSString *)failureStatus;
- (void)voiceAuthStatus:(int)noiseLevel numOfPhrasesCaptured:(long)numOfPhrasesCaptured withVoiceEnergy:(float)authVoiceEnergy;
- (void)onAuthenticationDone:(NSInteger)authenticationStatus;
@optional
- (void)onAuthenticationDone:(NSInteger)authenticationStatus message:(NSString *)message;

@end

@interface EzBioRecognizercontroller : EzBioClientRecognizer <IEnroller,IAuthenticator, IImageProcessor>

//default property
typedef enum {
    ActionEnroll = 1,
    ActionAuthenticate = 2
} EzBioAction;
@property EzBioAction action;

typedef enum {
    TypeNone = 0,
    TypeVoice,
    TypeFace,
    TypeFaceOrVoice,
    TypeFaceAndVoice
} EzBioType;
@property EzBioType type;
//if >0, will trigger faceLivenessChallengeStatus
@property NSInteger numOfFaceChallenge;

@property (strong, nonatomic) NSString *userID;
//Enabling/disabling logging
@property BOOL isLoggingEnabled;
//Logging initial state
@property BOOL isLoggingEnabledBorn;
@property BOOL isFirstTimeUpgrade;
@property (strong, nonatomic) NSString *encryptionAlias;


//property for enrollment
@property (strong, nonatomic) NSString *passphraseUsed;
@property long enrollmentTimeoutMS;
//@property UIView *cameraView;
//@property (nonatomic,strong) UIView* cameraView;
@property BOOL isEnrollingWithLiveness;



//property for authentication
@property BOOL shouldStayAfterAuthenticate;
@property long authenticationTimeoutMS;
//will be mapped to FBA setAuthenticationLevel
typedef enum {
    SecurityLevelLowest,
    SecurityLevelLow,
    SecurityLevelMedium,
    SecurityLevelHigh,
    SecurityLevelHighest
} EzBioSecurityLevel;
@property EzBioSecurityLevel securityLevel;
@property BOOL isUsingLiveness;
@property BOOL isFaceChallengeOn;
typedef enum {
    AudioQualityOff,
    AudioQualityLowest,
    AudioQualityLow,
    AudioQualityMedium,
    AudioQualityHigh,
    AudioQualityHighest
} EzBioAudioQualityLevel;
@property EzBioAudioQualityLevel audioQualityLevel;



//Delegate object for enrollment
@property(nonatomic,strong)id<EzBioEnrollViewControllerDelegate> enrollmentDelegate;

//Delegate object for Authentication
@property(nonatomic,strong)id<EzBioAuthenticateViewControllerDelegate> authenticationDelegate;

@property BOOL isFaceAndVoiceAuth;




//FBA liveness strictnessLevel : 1=LOW, 2=MEDIUM, 3=HIGH
- (void)setStrictnessLevelValue:(NSInteger)livenessStrictnessLevel;
- (void)enroll;
- (void)authenticate;
//- (void)cancelEnrollOrAuthenticationAction;

-(void) verifyEnrollmentWithImage:(NSData*)imgData withUserID:(NSString*)userID andImageType:(NSString*)imageType;
-(void) verifyEnrollmentWithImageThreshold:(NSData*)imgData withUserID:(NSString*)userID andImageType:(NSString*)imageType withThreshold:(float) threshold;
+(BOOL)isUserIsEnrolled:(NSString *)userID enrollmentMode:(int)mode;
+(BOOL)isUserIsEnrolled:(NSString *)userID enrollmentMode:(int)mode withEncryptionAlias:(NSString *)encryptionAlias;
+(NSString*) getBiometricDataPayload:(NSString*)deviceId appID:(NSString*)appID serialNos:(NSArray*)serialNos bioHashType:(NSString*)bioHashType bioHashValue:(NSString*)bioHashValue error:(NSError **) error;
+(BOOL)deleteEnrolledUserWithID:(NSString *)userID enrollmentMode:(int) mode;
+(BOOL)deleteEnrolledUserWithID:(NSString *)userID enrollmentMode:(int)mode withEncryptionAlias:(NSString *)encryptionAlias;
+(NSString*)getBiometricHash:(NSString*)userId enrollmentMode:(int)mode;
+(NSString*)getBiometricHash:(NSString*)userId enrollmentMode:(int)mode withEncryptionAlias:(NSString *)encryptionAlias;
- (UIImage*) getEnrollmentImage: (NSString*) userID;

//logging fx
+ (NSString*)getLogFile;
+ (NSString*)getBiometricLogs;
+ (BOOL)clearLogs;

//determine no of enrollments
+(NSInteger)getNumberOfEnrollments;

@end

NS_ASSUME_NONNULL_END
