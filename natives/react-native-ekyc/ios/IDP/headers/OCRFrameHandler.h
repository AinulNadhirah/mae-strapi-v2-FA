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
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>
#import <CoreMedia/CoreMedia.h>
#import <CoreVideo/CoreVideo.h>
#import <CoreImage/CoreImage.h>
#import <ImageIO/ImageIO.h>
#import <GLKit/GLKit.h>


@protocol OCRProtocol <NSObject>
@required
- (void) allFieldsCaptured;                //The delegate need to implement this method to click the camera
- (void) ocrStatus: (float) percentageCompletion BRIGHTNESS:(int) brightness;
- (void) ocrScanStatus: (float) percentageCompletion EXTRA_INFORMATION:(NSDictionary*) extraInformation;

@end

@interface OCRFrameHandler : NSObject
{
    id <OCRProtocol> _delegate;
}

@property (strong, nonatomic) id delegate;
- (id) initWithParams :(UIView*) superView LUM: (NSString*) lum DETECTION_TYPE: (NSString*) detectionType NO_VOTES:(int)noOfVotes PAGE_NO: (int) pageNo VERBS: (NSArray<NSString*>* ) verbs TIMEOUT:(int) timeout;
- (CIImage*) scanDocument :(CMSampleBufferRef) sampleBuffer;
- (NSMutableArray *) getDocumentImage;
@property (strong, nonatomic) CIDetector *detector;
@property (strong, nonatomic) UIImage *facePhoto;
@property (strong, nonatomic) NSString *details;
@property (strong, nonatomic) NSString *result;

@property(assign) CGPoint topLeft;                      //Top left co-ordinate of manual crop rectangle
@property(assign) float aspectRatio;                   //Aspect ratio width/height of the rectangle
@property(assign) float widthRect;                     // Width of the rectangle

-(void) startReadingDocument;
@property (strong, nonatomic) NSString *colourCode;
@end

