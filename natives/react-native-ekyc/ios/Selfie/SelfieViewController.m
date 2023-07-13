//
//  SelfieViewController.m
//  M2ULife
//
//  Created by Rakesh on 13/01/2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "SelfieViewController.h"
#import "ReactNativeEzBio.h"

@interface SelfieViewController ()
{
  CustomProgressView *customProgressView;
}
@end

@implementation SelfieViewController
NSInteger enrollmentTimeoutMS;
@synthesize defaults;

- (void)viewDidLoad {
    [super viewDidLoad];
    self.closeBtn.hidden = YES;
    self.view.frame = CGRectMake(0, 0, [[UIScreen mainScreen] bounds].size.width, [[UIScreen mainScreen] bounds].size.height);
    [self.navigationItem setHidesBackButton:YES animated:YES];
    UIBarButtonItem *backbutton =  [[UIBarButtonItem alloc] initWithTitle:@"< Back" style:UIBarButtonItemStyleDone target:nil action:nil];
    self.navigationItem.leftBarButtonItem = backbutton;
    [backbutton setTarget:self];
    self.captureSelfieBtn.hidden = NO;
    UIBarButtonItem *rightButton = [[UIBarButtonItem alloc] initWithTitle:@"Start" style:UIBarButtonItemStylePlain target:self action:@selector(enroll)];
    self.navigationItem.rightBarButtonItem = rightButton;
    // Do any additional setup after loading the view from its nib.
//    [self drawCircle];
}

-(void)drawCircle{
    // Set up the shape of the circle
  int radius = self.view.frame.size.width/2 - 50;//140;
    CAShapeLayer *circle = [CAShapeLayer layer];
    // Make a circular shape
    circle.path = [UIBezierPath bezierPathWithRoundedRect:CGRectMake(0, 0, 2.0*radius, 2.0*radius)cornerRadius:radius].CGPath;
     
    // Center the shape in self.view
    circle.position = CGPointMake(CGRectGetMidX(self.view.frame)-radius,
    CGRectGetMidY(self.view.frame)-radius - 40);
     
    // Configure the apperence of the circle
    circle.fillColor = [UIColor clearColor].CGColor;
    circle.strokeColor = [UIColor whiteColor].CGColor;
    circle.lineWidth = 2;
     
    // Add to parent layer
    [self.view.layer addSublayer:circle];
 
}
-(void)loadingTimer{
      CGRect value = (CGRect)self.view.frame;
      customProgressView = [[CustomProgressView alloc] initWithFrame:value];
      customProgressView.delegate = self;
      [self.view addSubview:customProgressView];
        [customProgressView setProgress:[NSNumber numberWithFloat:1.0] width:[NSNumber numberWithFloat:(self.view.frame.size.width/2)-10] timer:[NSNumber numberWithFloat:10.0]];
}

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    
    if (self) {
        self.enrollmentDelegate = self;
    }
    return self;
}

-(void)viewWillAppear:(BOOL)animated {
  NSLog(@"viewWillAppear demo");
  [super viewWillAppear:animated];
  self.enrollmentDelegate = self;
  self.userID = [_selfieData valueForKey:@"userID"];
  self.type = TypeFace;
  self.isEnrollingWithLiveness = YES;
  self.enableDeviceOrientation = NO;
  self.strictnessLevel = 1;
//  [self setStrictnessLevelValue:1];//As per Dabar&Musa (FICO) 0,1,2,3,4
  BOOL hasEnrollment = [EzBioRecognizercontroller isUserIsEnrolled:self.userID enrollmentMode:TypeFace];
  if (hasEnrollment) {
      [EzBioRecognizercontroller deleteEnrolledUserWithID:self.userID enrollmentMode:TypeFace];
  }
  long enrollTO = [defaults integerForKey:@"enrollmentTimeout"];
  if(enrollTO == 0) enrollTO = 30000;
  self.numOfFaceChallenge = 3;
  self.enrollmentTimeoutMS = 30000;//enrollTO;
  self.isLoggingEnabled = NO;
}

-(void) viewDidAppear:(BOOL)animated {
    NSLog(@"viewDidAppear demo");
    [super viewDidAppear:animated];
    self.cameraView.hidden = NO;
//    self.cameraView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, self.enrollCameraView.frame.size.width, self.enrollCameraView.frame.size.height)];
//    [self.enrollCameraView addSubview:self.cameraView];
    super.enrollmentDelegate = self;
//    [self enroll];
//    [self.enrollCameraView bringSubviewToFront:_selfieOvalImage];
//    [self performSelector:@selector(loadingTimer) withObject:nil afterDelay:0.5f];
}

//-(void) loadEzBio {
//  self.cameraView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, self.enrollCameraView.frame.size.width, self.enrollCameraView.frame.size.height)];
//  self.cameraView.hidden = NO;
//}

#pragma Mark EzBioEnrollViewControllerDelegate

-(void) faceEnrollStatus:(int)faceStatus lightStatus:(int)lightStatus brightnessLevel:(float)brightnessLevel instructionToShow:(NSString *)instruction {
    NSLog(@"faceEnrollStatus %d, lightStatus %d, brightnessLevel %f", faceStatus, lightStatus, brightnessLevel);
    NSLog(@">> instruction %@ <<", instruction);
    dispatch_async(dispatch_get_main_queue(), ^{
//        UIImage* faceImage = nil;
//        switch(faceStatus) {
//            default:
//            case 1:
//                self.faceStatusLabel.text = @"";
//                break;
//            case 2:
//                self.faceStatusLabel.text = @"Please align and fill the frame with your face.";
//                break;
//            case 3:
//                self.faceStatusLabel.text = @"Sorry, we don't see your face.";
//                break;
//            case 0:
//                self.faceStatusLabel.text = @"Sorry, we don't see your face.";
//                break;
//        }
        self.instructionLabel.text = instruction;
        float lightMeterProgress = 0.0;
        switch(lightStatus) {
            default:
            case 1:
                lightMeterProgress = 1.f;
                NSLog(@"light ok");
                break;
            case 2:
                lightMeterProgress = .6f;
                NSLog(@"light low");
                break;
            case 3:
                lightMeterProgress = .3f;
                NSLog(@"light none");
                break;
            case 0:
                lightMeterProgress = .0f;
                NSLog(@"light unknown");
                break;
        }
//        self.faceStatusLabel.text = instruction;
    });
}

//-(void) voiceEnrollStatus:(int)noiseLevel numOfPhrasesCaptured:(size_t)numOfPhrasesCaptured {
- (void)voiceEnrollStatus:(int)noiseLevel numOfPhrasesCaptured:(size_t)numOfPhrasesCaptured withVoiceEnergy:(float)voiceEnergy {
    NSLog(@"voiceEnrollStatus %d, numOfPhrasesCaptured %zu, voiceEnergy %f", noiseLevel, numOfPhrasesCaptured, voiceEnergy);
}

-(void)onEnrollmentDone:(NSInteger)enrollmentStatus {
    NSLog(@"enrollmentStatus %ld", (long)enrollmentStatus);
//    NSString *enrollStr;
//    UIImage *enrollStatusImage;
    UIImage* enrollmentImage;
    NSString *base64Images,*message;
    if (enrollmentStatus == 0) {
//      enrollmentStatus = 1;
//      enrollStr = [NSString stringWithFormat:@"Enrollment Successful"];
//      enrollStatusImage = [UIImage imageNamed:@"tick_green.png"];
      enrollmentImage = [self getEnrollmentImage:self.userID];
      base64Images = [self convertToBase64:enrollmentImage];
      message = @"Enrolment Success";
    }
    else if (enrollmentStatus == -2) {
        message = @"Sorry, we are not able to verify you. Please retry and follow the on-screen instruction.";//@"Enrollment Timeout";
    }else if (enrollmentStatus == 6) {
        message = @"Sorry, please try again.";//@"Enrollment Cancelled";
    }else if (enrollmentStatus == -5) {
        message = @"Sorry, please try again.";//@"Enrollment Failed : More than 1 face captured in frame.";
    }else if (enrollmentStatus == -6) {
        message = @"Sorry, we are not able to detect your image. Please try again.";//@"Enrollment Failed : Face image not found.";
    }else {
        message = @"Sorry, we are not able to detect your image. Please try again.";//@"Enrollment Failed";
    }
//    [defaults synchronize];
    self.enrollmentDelegate = nil;
  
  [ReactNativeEzBio selfieResult:base64Images RESULT:enrollmentStatus Message:message];
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [[self presentingViewController] dismissViewControllerAnimated:NO completion:nil];
    });
}

-(NSString *) convertToBase64:(UIImage *)images {
  
  NSData *imageData = UIImagePNGRepresentation(images);
  NSString * base64String = [imageData base64EncodedStringWithOptions:0];
  return base64String;
}
- (IBAction)closeViewController:(id)sender {
  [ReactNativeEzBio backButton:@""];
  [[self presentingViewController] dismissViewControllerAnimated:NO completion:nil];
}

- (IBAction)captureNow:(id)sender {
    self.captureSelfieBtn.hidden = YES;
    [self enroll];
}

-(void)verifySelfieWithImageData:(NSDictionary *)data {
    defaults = [NSUserDefaults standardUserDefaults];
    NSString *imageBase64;
    if([[data valueForKey:@"type"] isEqualToString:@"primary"]) {
      imageBase64 = [defaults valueForKey:@"OCRHumanFace"];
    }else if([[data valueForKey:@"type"] isEqualToString:@"secondary"]) {
      imageBase64 = [defaults valueForKey:@"OCRSecondaryFaceImage"];//Need to change to ghost image
    }else if([[data valueForKey:@"type"] isEqualToString:@"hologram"]) {
      imageBase64 = [defaults valueForKey:@"hologramImageBase64"];
    }
  
  if(imageBase64) {
    NSData* imageData =  [[NSData alloc]initWithBase64EncodedString:imageBase64 options:NSDataBase64DecodingIgnoreUnknownCharacters];
  //  NSData *imageData = [imageBase64 dataUsingEncoding:NSUTF8StringEncoding];
     UIImage *faceImage = nil;
      if(imageData != nil)
      {
         faceImage = [UIImage imageWithData: imageData];
      }
      NSData *imgData = [NSData dataWithData:UIImageJPEGRepresentation(faceImage, 0.0)];
      self.userID = [data valueForKey:@"userID"];
      self.type = TypeFace;
      self.securityLevel = [[data valueForKey:@"securityLevel"] intValue];
//      self.authDelegate = self;
      self.authenticationDelegate = self;
      float frrVal = [[data valueForKey:@"frrValue"]floatValue];
      if(frrVal >= 0.0015 && frrVal <= 0.00165) {
          frrVal = 0.20f;
      }
//      [self verifyEnrollmentUsingImageDataWithFRR:imgData withUserID:self.userID andImageType:@"jpg" withFRR:frrVal];
      [self verifyEnrollmentWithImageThreshold:imgData withUserID:self.userID andImageType:@"jpg" withThreshold:frrVal];
  }
   
//    [self verifyEnrollmentUsingImageData:imageData withUserID:self.userID andImageType:@"JPG"];
}

#pragma auth callback
-(void)faceAuthStatus:(int)faceStatus lightStatus:(int)lightStatus brightnessLevel:(float)brightnessLevel {
    
}

-(void) voiceAuthStatus:(int)noiseLevel numOfPhrasesCaptured:(long) numOfPhrasesCaptured withVoiceEnergy:(float)authVoiceEnergy {
  
}

-(void) faceLivenessChallengeStatus:(NSString *)target status:(NSString *)status failureStatus:(NSString *)failureStatus {
  
}
// //This wil be called during biometric authentication AND image verification (verifyEnrollmentUsingImageData)
//-(void)onAuthenticationDone:(NSInteger)authenticationStatus {
//
//}

-(void)onAuthenticationDone:(NSInteger)authenticationStatus message:(NSString *)message {
    NSLog(@"onAuthenticationDone");
    NSLog(@"onAuthenticationDone > %ld > ",(long)authenticationStatus);
    [ReactNativeEzBio verifySelfieResult:authenticationStatus Message:message];
}
@end
