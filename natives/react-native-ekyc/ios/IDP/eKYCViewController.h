//
//  eKYCViewController.h
//  M2ULife
//
//  Created by Rakesh on 21/12/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "ScanBuilder.h"
#import "FrameProcessor.h"

NS_ASSUME_NONNULL_BEGIN

@interface eKYCViewController : UIViewController<ScanBuilderProtocol> {
  FrameProcessor *fp;
  NSUserDefaults *defaults;
  NSArray *imagesArr;
  NSString *docDetails;
  NSString *isHologram;
}
@property (nonatomic, strong) UIView *boxView;
@property (nonatomic, strong)NSDictionary *ocrInitData;
@property (weak, nonatomic) IBOutlet UIButton *closeBtn;
- (IBAction)closePage:(id)sender;
@property (weak, nonatomic) IBOutlet UILabel *instructionLabel;
@property (weak, nonatomic) IBOutlet UILabel *descriptionLabel;

@property (weak, nonatomic) IBOutlet UIButton *ScanNowBtn;
- (IBAction)ScanNowAction:(id)sender;

@end

NS_ASSUME_NONNULL_END

