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
#define SCANCARD_SDK_VERSION @"1.3"

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>
#import <CoreMedia/CoreMedia.h>
#import <CoreVideo/CoreVideo.h>
#import <CoreImage/CoreImage.h>
#import <ImageIO/ImageIO.h>
#import <GLKit/GLKit.h>
#import <GLKit/GLKit.h>

@protocol CameraProtocol <NSObject>
@required
- (void) click;                //The delegate need to implement this method to click the camera
@end

@interface EdgeDetector : NSObject
{
    id <CameraProtocol> _delegate;
}

@property (strong, nonatomic) id delegate;
- (id) initWithParams :(UIView*) superView DOC_ASPECT_RATIO : (float) docAspectRatio AUTODETECT : (Boolean) autoDetect LUM : (NSString*) lum;
- (CIImage*) detectDocument :(CMSampleBufferRef) sampleBuffer;
- (NSMutableArray *) getCropppedImage;
- (UIImage *)croppingImageByRect:(UIImage *)imageToCrop toRect:(CGRect)rect;
@property (strong, nonatomic) CIDetector *detector;
@end

