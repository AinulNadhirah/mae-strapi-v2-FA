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
#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>

@interface FaceDetection : NSObject

/**
 * @brief Detects the most prominent face in an image and returns the rectangle cordinate encircling the face.
 *
 * @author Aman Singh Bhandari 24/10/2018
 * @param image The image in which the face detection needs to apply
 * @param orientation Orientation of the image which is needed to correctly locate the face through cordinate
 *          "up" when the card is not rotated
 *          "right" when the card is roatated right in the image
 *
 * @return cordinates of the face described by a rectangle.
 */
+ (id) detectFace: (CIImage*) image DOC_ORIENTATION: (NSString*) orientation;
@end
