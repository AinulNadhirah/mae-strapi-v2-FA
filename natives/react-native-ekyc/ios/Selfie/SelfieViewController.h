//
//  SelfieViewController.h
//  M2ULife
//
//  Created by Rakesh Palivela on 13/01/2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "EzBioRecognizercontroller.h"
#import "CustomProgressView.h"

//@class EzBioRecognizercontroller;

NS_ASSUME_NONNULL_BEGIN

@interface SelfieViewController : EzBioRecognizercontroller <EzBioEnrollViewControllerDelegate,EzBioAuthenticateViewControllerDelegate,CustomProgressViewDelegate>
@property (weak, nonatomic) IBOutlet UIButton *closeBtn;
@property (weak, nonatomic) IBOutlet UIImageView *selfieOvalImage;
@property (strong, nonatomic) IBOutlet UIView *cameraView;
@property (weak, nonatomic) IBOutlet UILabel *instructionLabel;
@property (weak, nonatomic) IBOutlet UIButton *captureSelfieBtn;
@property (nonatomic, strong)NSDictionary *selfieData;
//@property (weak, nonatomic) IBOutlet UIView *enrollCameraView;
@property (strong, nonatomic) NSUserDefaults *defaults;
- (IBAction)closeViewController:(id)sender;
-(void)verifySelfieWithImageData:(NSDictionary *)data;
- (IBAction)captureNow:(id)sender;
@end

NS_ASSUME_NONNULL_END
