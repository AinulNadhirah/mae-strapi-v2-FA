/**
****************************************************************************
**
**   This material is the confidential, proprietary, unpublished property
**   of Fair Isaac Corporation.  Receipt or possession of this material
**   does not convey rights to divulge, reproduce, use, or allow others
**   to use it without the specific written authorization of Fair Isaac
**   Corporation and use must conform strictly to the license agreement.
**
**   Copyright (c) 2019-2020 Fair Isaac Corporation.  All rights reserved.
**
****************************************************************************
**/
#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <UIKit/UIKit.h>

@protocol CameraHelperDelegate
@required
-(void) captureOutputSampelBuffer:(CMSampleBufferRef) cmSampleBuffer;
-(void) clickCompleted: (UIImage*) imageClicked;
@end
@interface CameraHelper : NSObject <AVCaptureVideoDataOutputSampleBufferDelegate>{
}
@property (nonatomic,weak) id <CameraHelperDelegate> delegate;
-(BOOL) startCamera;
-(BOOL) stopCamera;
-(BOOL) attachView:(UIView *) uiview;
-(void) getStillImageOutput;
-(BOOL) flashStatus:(BOOL) value;

@end

