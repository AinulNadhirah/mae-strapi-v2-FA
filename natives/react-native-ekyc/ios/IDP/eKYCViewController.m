//
//  eKYCViewController.m
//  M2ULife
//
//  Created by Rakesh on 21/12/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "eKYCViewController.h"
#import "ReactNativeEkyc.h"
#import "HologramProcessor-Swift.h"
//#import "Ezlogger/Ezlogger.h"


@class Ezloger;
@interface eKYCViewController ()

@end

@implementation eKYCViewController {
  ScanBuilder *scanBuilder;
  UIImage *faceImageHolo;
  UIImageView *demoImage;
  NSString *faceImageHoloInd;
  NSMutableArray *hologramCardImages;
  NSString *hologramResultStatus;
  UILabel *label;
  CGPoint topLeft;
  float widthRect;
  float aspectRatio;
}

//NSString const *CONSTANT_FACE_HOLOGRAM_KEY = @"face_from_hologramImage";

- (void)viewDidLoad {
    [super viewDidLoad];
    //[[UIScreen mainScreen] bounds].size
//    self.view.frame.size.height = [[UIScreen mainScreen] bounds].size.height;
//    self.view.frame.size.width = [[UIScreen mainScreen] bounds].size.width;
  self.view.frame = CGRectMake(0, 0, [[UIScreen mainScreen] bounds].size.width, [[UIScreen mainScreen] bounds].size.height);

    faceImageHoloInd = @"false";

//    [self checkCameraPermission:self.ocrInitData];
    NSError *error;
    fp = [[FrameProcessor alloc] initWithError: &error];
    if(error){
        NSLog(@"Error occurred while initialization %@" , error.localizedDescription);
        return;
    }else{
        NSLog(@"Processor initilization is successfull");
    }
    
  topLeft =CGPointMake(self.instructionLabel.frame.origin.x, self.instructionLabel.frame.origin.y + self.instructionLabel.frame.size.height + 10);            //Top Left coordinate of rectangle
  widthRect = [[UIScreen mainScreen] bounds].size.width - (2 * self.instructionLabel.frame.origin.x); //Since width is zero sdk will auto calculate the width
  aspectRatio = 1.568;  //Aspect ratio width/height of the document. Cannot set(0,0)
  [self drawRectangle:topLeft ASPECTRATIO:aspectRatio WIDTH:widthRect VIEW:self.view];        //Draw rectangle on self.view
//  [EzLogUtility enableLog];
//  [EzLogUtility EZSetLogOnConsole:YES];
//  [EzLogUtility EZClearLogs];
}

-(void) drawRectangle: (CGPoint) topLeft ASPECTRATIO:(float) ratioSides WIDTH:(float) width VIEW:(UIView*) view
{
    if(topLeft.x == 0 && topLeft.y == 0)
        return;
    
    float xOrigin = topLeft.x;
    float yorigin = topLeft.y;
    if(ratioSides <= 0)
        ratioSides = 1.586;
    if(width <= 0)
        width = view.frame.size.width - 2*xOrigin;
    float height = width / ratioSides;
    
    CAShapeLayer *rectLayer;
    rectLayer = [CAShapeLayer layer];
    rectLayer.strokeColor = [UIColor whiteColor].CGColor;
    rectLayer.fillColor = nil;
    rectLayer.lineWidth=2.0;
    rectLayer.path = [UIBezierPath bezierPathWithRect:CGRectMake(xOrigin, yorigin, width, height)].CGPath;
    
    [[view layer] addSublayer:rectLayer];
  
  label = [[UILabel alloc] initWithFrame:CGRectMake(self.instructionLabel.frame.origin.x, (yorigin + height + 20 ), width, self.instructionLabel.frame.size.height)];
//  label.text = @"test label";
  label.textColor = [UIColor whiteColor];
  label.textAlignment = NSTextAlignmentCenter;
  label.numberOfLines = 2;
  label.backgroundColor = [UIColor clearColor];
  label.font = [UIFont fontWithName:@"Montserrat-Regular" size:19.0f];
  
  NSString *docType = [self.ocrInitData valueForKey:@"docType"];
  if([docType isEqualToString:@"MYS_MYKAD"]) {
    self.closeBtn.hidden = false;
    self.instructionLabel.text = [[self.ocrInitData valueForKey:@"displayText"]valueForKey:@"scanIntroTitle"];
//    self.descriptionLabel.text = [[self.ocrInitData valueForKey:@"displayText"]valueForKey:@"scanIntroDesc"];
    label.text = [[self.ocrInitData valueForKey:@"displayText"]valueForKey:@"scanIntroDesc"];
  }else {
//    self.descriptionLabel.text = [[self.ocrInitData valueForKey:@"displayText"]valueForKey:@"passportScanDesc"];
    label.text = [[self.ocrInitData valueForKey:@"displayText"]valueForKey:@"passportScanDesc"];
  }
  
  //
  [self.view addSubview:label];
  [self checkCameraPermission:self.ocrInitData];
  
  if([docType isEqualToString:@"MYS_MYKAD"]) {
    demoImage =[[UIImageView alloc] initWithFrame:CGRectMake(xOrigin, yorigin, width, height)];
    demoImage.image=[UIImage imageNamed:@"mykadHologram"];
    [self.view addSubview:demoImage];
  }
}

- (IBAction)closePage:(id)sender {
  [ReactNativeEkyc backButton:@"back"];
  [scanBuilder terminateScanner];
  [[self presentingViewController] dismissViewControllerAnimated:NO completion:nil];
  
//  [self.navigationController popToRootViewControllerAnimated:YES];
//  [scanBuilder terminateScanner];
}

-(void) checkCameraPermission:(NSDictionary *)ocrJSON{
    NSString *mediaType = AVMediaTypeVideo;
    AVAuthorizationStatus authStatus = [AVCaptureDevice authorizationStatusForMediaType:mediaType];
    if(authStatus == AVAuthorizationStatusAuthorized) {
      [self startDocumentScanner:[ocrJSON valueForKey:@"docReq"]];
        
    } else if(authStatus == AVAuthorizationStatusDenied){
        // denied
      [self noCameraPermission];
    } else if(authStatus == AVAuthorizationStatusRestricted){
        
    } else if(authStatus == AVAuthorizationStatusNotDetermined){
        
        [AVCaptureDevice requestAccessForMediaType:mediaType completionHandler:^(BOOL granted) {
            
            dispatch_async(dispatch_get_main_queue(), ^{
                if(granted){
                    NSLog(@"permission is granted");
                  [self startDocumentScanner:[ocrJSON valueForKey:@"docReq"]];
                } else {
                    NSLog(@"Not granted access to %@", mediaType);
                }
            });
            
            
        }];
    } else {
        // impossible, unknown authorization status
    }
//  [EzLogUtility EzLog:[ocrJSON valueForKey:@"docReq"] TAG:@"Init call request" LOGTYPE:nil];
    mediaType = nil;
    ocrJSON = nil;
}

-(void) startDocumentScanner:(NSString *)ocrJSON
{
    NSLog(@">>>>>>>>startDocumentScanner");
    NSError *error = nil;

    NSString *configJson = ocrJSON;
//    CGPoint topLeft =CGPointMake(20, self.instructionLabel.frame.origin.y + self.instructionLabel.frame.size.height + 10);            //Top Left coordinate of rectangle
//    float widthRect = 0.0;                                                      //Since width is zero sdk will auto calculate the width
//    float aspectRatio = 1.568;                                                  //Aspect ratio width/height of the document. Cannot set(0,0)
//    [self drawRectangle:topLeft ASPECTRATIO:aspectRatio WIDTH:widthRect VIEW:self.view];        //Draw rectangle on self.view
    
    
    scanBuilder = [[ScanBuilder alloc] initWithJson:configJson ERROR:&error];        //Instantiatating through configursations
    if(error == nil)                                                 // No error occured. Json valid
    {
        scanBuilder.delegate = self;                                  //Callback class
        scanBuilder.detectColourCode = @"#EAB619";                     //Hex colour code to set the colour on edge detection
        scanBuilder.isScanPortrait = YES;                            //YES- Portrait Mode No- Portrait Mode
        [self.view addSubview : self.boxView];                          // Hologram red box
//        scanBuilder.topLeft = topLeft;                                       //Top Left coordinate of rectangle
//        scanBuilder.width = widthRect;                                       //Since width is zero sdk will auto calculate the width
//        scanBuilder.aspectRatio = aspectRatio;                                  //Aspect ratio width/height of the document. Cannot set(0,0)
        [scanBuilder setOverlayRect:topLeft WIDTH:0.0 ASPECT_RATIO:aspectRatio];
        [scanBuilder setLookUpData:[self.ocrInitData valueForKey:@"lookupData"]];
        [scanBuilder initializeCamera:self.view ERROR:&error];               // Start the camera but don't start the scanning yet
        if(error != nil)
        {
            [scanBuilder scan];
        }
    }
    else
    {
        //--Some error has occured since the CONFIG JSON is not valid.
        //-- Do something--
    }
}

- (UIView *)boxView {
  if (!_boxView) {
      _boxView = [[UIView alloc] initWithFrame:CGRectZero];
      _boxView.layer.borderColor = [UIColor redColor].CGColor;
      _boxView.layer.borderWidth = 2;
      _boxView.backgroundColor = [UIColor clearColor];
  }
  return _boxView;
}

- (void)hologramStatusCallback:(NSMutableArray *)outputData FRAME: (UIImage*) imageFrame
{
  NSLog(@"detectionResults in app");
  NSLog(@"%@" ,outputData);
  self.instructionLabel.text = [[self.ocrInitData valueForKey:@"displayText"]valueForKey:@"scanStartTitle"];
  label.text = [[self.ocrInitData valueForKey:@"displayText"]valueForKey:@"scanStartDesc"];
      
  if( outputData == nil)
  {
      self.boxView.frame = CGRectZero;
  }
  else
  {
      for (NSObject *prediction in outputData) {
          Prediction *hologramPrediction = (Prediction *)prediction;
          CGAffineTransform transform = CGAffineTransformMakeScale(self.view.frame.size.width/1080, self.view.frame.size.height/1920);
          CGRect boxrect = CGRectApplyAffineTransform(hologramPrediction.rect, transform);
          
          self.boxView.frame =  boxrect;
          hologramPrediction = nil;
          
      }
  }
}

- (void) hologramFinalCallback : (NSString *)results :(NSArray *)detectedImages :(NSDictionary *)extraInformation;
{
  NSLog(@"hologramFinalCallback");
  if([results  isEqual: @"FAIL"]) {
    [self HologramFail];
    return;
  }
  defaults = [NSUserDefaults standardUserDefaults];
  [self.boxView removeFromSuperview];
  self.closeBtn.hidden = NO;
  _ScanNowBtn.hidden = NO;
  NSString *base64Face = [extraInformation objectForKey: @"face_from_hologramImage"]; //Face image extraction during hologram
  if(!base64Face) {
    [self HologramFail];
    return;
  }
  [defaults setValue:base64Face forKey:@"hologramImageBase64"]; // Storing Face image to verify with selfie
  [defaults synchronize];
  self.instructionLabel.text = [[self.ocrInitData valueForKey:@"displayText"]valueForKey:@"scanFrontTitle"];
  label.text = [[self.ocrInitData valueForKey:@"displayText"]valueForKey:@"scanFrontDesc"];
  demoImage.image=[UIImage imageNamed:@"mykadFront"];
  demoImage.hidden = NO;
  results = nil;
  detectedImages = nil;
  extraInformation = nil;
  //Dynamic Mode for IC/MyKad
  CGPoint topLeft = CGPointMake(0, 0);
  float widthRect = 0.0;
  float aspectRatio = 1.568;
  [scanBuilder setOverlayRect:topLeft WIDTH:widthRect ASPECT_RATIO:aspectRatio];
}

-(void)HologramFail {
  [ReactNativeEkyc hologramFail:@"fail"];
  [scanBuilder terminateScanner];
  [[self presentingViewController] dismissViewControllerAnimated:NO completion:nil];
}

-(void)noCameraPermission {
  [ReactNativeEkyc hologramFail:@"noCameraPermission"];
  double delayInSeconds = 1.0;
  dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC));
  dispatch_after(popTime, dispatch_get_main_queue(), ^(void){
      [[self presentingViewController] dismissViewControllerAnimated:NO completion:nil];
  });
}

-(void)ocrScanStatus:(float)percentageCompletion EXTRA_INFORMATION:(NSDictionary *)extraInformation {
    NSLog(@"ocrScanStatus :: percentageCompletion");
    dispatch_sync(dispatch_get_main_queue(), ^{
        NSString *perc = @"%";
        NSLog(@"completed app  %f", percentageCompletion);
      self.instructionLabel.text = [NSString stringWithFormat:@"Scanning in progress %0.f%@..Please wait till progress reaches 100%@",percentageCompletion,perc,perc];
    });
}

- (void) onPageCompletion: (NSArray*) images
{
    NSLog(@">>Page scanned. Moving to next page.");
    self.instructionLabel.text = [[self.ocrInitData valueForKey:@"displayText"]valueForKey:@"scanBackTitle"];
    label.text = [[self.ocrInitData valueForKey:@"displayText"]valueForKey:@"scanBackDesc"];
    demoImage.image=[UIImage imageNamed:@"mykadBack"];
    demoImage.hidden = NO;
    _ScanNowBtn.hidden = NO;
    images = nil;
}

- (void) onScanCompletion: (NSMutableArray*) images DETAILS_DOC:(NSString *) details RESULT:(nonnull NSString *)result
{
    scanBuilder = nil;
    NSLog(@">>Document scanned completed.");
    [self getOcrRequestData:images DETAILS_DOC:details RESULT:result];
  
    images = nil;
    details = nil;
    result = nil;
}

-(NSMutableArray *) convertToBase64:(NSMutableArray *)images From:(NSString *)from {
  
  NSMutableArray *base64Images = [[NSMutableArray alloc]init];
  for (int i=0; i<images.count; i++) {
    NSData *imageData = UIImagePNGRepresentation([images objectAtIndex:i]);
    NSString * base64String = [imageData base64EncodedStringWithOptions:0];
    NSMutableDictionary *objFormation = [[NSMutableDictionary alloc]init];
    NSString *keyName = [NSString stringWithFormat:@"img%i",i];
    if([from isEqualToString:@"FaceImgFromHolo"]) {
      keyName = @"img1";
    }
    [objFormation setValue:base64String forKey:keyName];
    [base64Images addObject:objFormation];
  }
  
  return base64Images;
}

-(void)getOcrRequestData: (NSMutableArray*) images DETAILS_DOC:(NSString *) details RESULT:(nonnull NSString *)result {
    NSLog(@"getOcrRequestData");
    NSData *data = [details dataUsingEncoding:NSUTF8StringEncoding];
    id jsonDetails = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
    NSArray *resCodeArray = [[NSArray alloc]init];
    resCodeArray = [jsonDetails valueForKey:@"response_codes"];
    NSString *respCode;
    if(resCodeArray.count > 0) {
        respCode = [resCodeArray objectAtIndex:0];
    }else {
        respCode = @"999";//Handling if resCodeArray count is empty
    }
    NSString *ocrRequestPayload;
    
    if([respCode isEqualToString:@"200"]) {
      NSString *docType = [_ocrInitData valueForKey:@"docType"];
      NSString *sessionID = [_ocrInitData valueForKey:@"sessionID"];
      NSError *error;
      fp = [[FrameProcessor alloc] initWithError: &error];
      ocrRequestPayload = [fp getEzScanPayloadRequest:images DOCTYPE:docType SESSIONID:sessionID ISENCRYPTION:false OFFLINE_DATA:details];
      [self extractFaceImageFromJson:details];
    } else {
      //--Some error has occured while scan not done properly.
      //-- Do something--
    }
    // For Card images MyKad(front and back) or Passport
    NSMutableArray *cardBase64Images = [[NSMutableArray alloc]init];
    if(images.count > 0) {
      cardBase64Images = [self convertToBase64:images From:@"cardImages"];
    }
    [ReactNativeEkyc scanResult:cardBase64Images DETAILS_DOC:details ocrRequestPayload:ocrRequestPayload RESULT:result];
    [scanBuilder terminateScanner];
    [[self presentingViewController] dismissViewControllerAnimated:NO completion:nil];
  
    images = nil;
    details = nil;
    result = nil;
}

- (void) moveToRoot:(UIBarButtonItem *)sender {
    [self.navigationController popToRootViewControllerAnimated:YES];
}

-(void) extractFaceImageFromJson: (NSString*) details
{
    NSData *data = [details dataUsingEncoding:NSUTF8StringEncoding];
    id jsonDetails = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
    NSMutableArray *humanFaces = [jsonDetails objectForKey:@"human_faces"];
    NSString *ocrInfo = [jsonDetails objectForKey:@"mrz"];//ocr //mrz
    if(ocrInfo == nil) {
      ocrInfo = [jsonDetails objectForKey:@"ocr"];
    }

    NSString *PrimaryFaceImg = nil;
    if(humanFaces.count >=1 )
    {
        PrimaryFaceImg = [humanFaces[0] objectForKey: @"value"];
        NSData *data = [[NSData alloc]initWithBase64EncodedString:PrimaryFaceImg options:NSDataBase64DecodingIgnoreUnknownCharacters];
         UIImage *faceImage = nil;
        if(data != nil)
        {
            faceImage = [UIImage imageWithData: data];
        }
        defaults = [NSUserDefaults standardUserDefaults];
        [defaults setValue:PrimaryFaceImg forKey:@"OCRHumanFace"]; // storing image to verify with selfie
        [defaults synchronize];
    }
   details = nil;
}

- (IBAction)ScanNowAction:(id)sender {
  NSLog(@"ScanNowAction :::");
  [scanBuilder scan];
  _ScanNowBtn.hidden = YES;
  demoImage.hidden = YES;
}
@end
