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
@class OCRConfig;
@class PhyConfig;
@class HoloConfig;
@class DocPageConfig;
@class Response;

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

extern Boolean isScannerPortrait;
static NSString *const const_brightness_key = @"brightness";
static NSString *const const_isDocumentBlur_key = @"isDocumentBlur";

@protocol ScanBuilderProtocol <NSObject>
@required

/**
 * @brief callback for completion of OCR of a document page
 *
 * @author Aman Singh Bhandari 30/09/2019
 * @param images document images
 */
- (void) onPageCompletion: (NSArray*) images;
/**
 * @brief callback for completion of OCR of document
 *
 * @author Aman Singh Bhandari 30/09/2019
 * @param images document images
 * @param details ocr details of document
 * @param result ocr details of document
 */
- (void) onScanCompletion: (NSMutableArray*) images DETAILS_DOC:(NSString *) details RESULT:(NSString*) result;
/**
 * @brief provides percentage comleted for offline OCR and brightness of the camera
 *
 * @author Aman Singh Bhandari 30/09/2019
 * @param percentageCompletion Percentage Completed for offline OCR.
 * @param brightness Brightness of scanner camera(Range -5<>8). Recommended brightness is 1<>2.
 *
 */
- (void) ocrStatus: (float) percentageCompletion BRIGHTNESS:(int) brightness;


/**
 * @brief provides percentage comleted for offline OCR and brightness of the camera
 *
 * @author Aman Singh Bhandari 30/09/2019
 * @param percentageCompletion Percentage Completed for offline OCR.
 * @param brightness Brightness of scanner camera(Range -5<>8). Recommended brightness is 1<>2.
 *
 */
- (void) ocrScanStatus: (float) percentageCompletion EXTRA_INFORMATION:(NSDictionary*) extraInformation;


/**
 * @brief detailed status of Hologram detection
 *
 * @author Aman Singh Bhandari 30/09/2019
 * @param outputData Data consist of hologram categrory detected and its corresponding confidence.
 * @param imageFrame Image on which hologram detection was performed.
 *
 */
- (void) hologramStatusCallback : (NSMutableArray *)outputData FRAME: (UIImage*) imageFrame;

/**
 * @brief final result callback for hologram detection
 *
 * @author Aman Singh Bhandari 30/09/2019
 * @param results PASS/FAIL result of hologram detection.
 * @param detectedImages Set of images where hologram was detected
 * @param extraInformation contains the classifier analysis. Contains result of all the frame processed with various categories detected above a certain threshold.
 */
- (void) hologramFinalCallback : (NSString *)results :(NSArray *)detectedImages :(NSDictionary *)extraInformation;
@end

@interface ScanBuilder : NSObject
{
    NSString *docType;
    OCRConfig *ocrConfig;
    PhyConfig *phyConfig;
    HoloConfig *holoConfig;
    Boolean nextPageCameraPause;
}


//Delegate for callbacks on application interaface
@property(nonatomic,weak) id <ScanBuilderProtocol> delegate;
//Set Hex-value to change the colour code of document detection markings on camera screen
@property(nonatomic,weak) NSString *detectColourCode;
//Set YES to scan the document in portrait position
@property(assign) Boolean isScanPortrait;
//Set the Hologram model stored path
@property(assign) NSString* modelPath;
//Set the Hologram label stored path
@property(assign) NSString* labelPath;
//Set the debug rectangle to show or not
@property(assign) Boolean rectDebug;
//Set the Look up data from App which will be refferred
@property(nonatomic, assign) NSString* lookUpData;



/**
 * @brief creates an instance of ScanBuilder with configurations passed.
 * @author Aman Singh Bhandari 31/05/2018.
 * @param json Describes the flow and behavior of the offline OCR for each page.
 *
 * @param error holds the NSError object if there were any during initialization. If ‘nil’ then initialization happened error free. App needs to handle if there are any errors.
*/
-(id) initWithJson:(NSString*) json ERROR:(NSError**) error;


/**
 * @brief Starts the 1980X1080 camera in the center of the given view leaving margins if there is any extra space on X or Y coordinates. But the scanning is not started yet.
 * @author Aman Singh Bhandari 31/05/2018.
 * @param view view passed should already have components/subviews before calling this.
 *
 * @param error holds the NSError object if there were any during initialization. If ‘nil’ then initialization happened error free. App needs to handle if there are any errors.
*/
-(void) initializeCamera:(UIView*) view ERROR:(NSError**) error;


/**
 * @brief Starts the 1980X1080 camera in the center of the given view leaving margins if there is any extra space on X or Y coordinates. But the scanning is not started yet. The camera is launched to start the Hologram detection.
 * @author Aman Singh Bhandari 31/08/2020.
 * @param view view passed should already have components/subviews before calling this.
 *
 * @param error holds the NSError object if there were any during initialization. If ‘nil’ then initialization happened error free. App needs to handle if there are any errors.
*/
-(void) startHologram:(UIView*) view ERROR:(NSError**) error;



/**
 * @brief Starts the 1980X1080 camera in the center of the given view leaving margins if there is any extra space on X or Y coordinates. But the scanning is not started yet. Camera is launched to start the OCR of the document.
 * @author Aman Singh Bhandari 31/08/2020.
 * @param view view passed should already have components/subviews before calling this.
 *
 * @param error holds the NSError object if there were any during initialization. If ‘nil’ then initialization happened error free. App needs to handle if there are any errors.
*/
-(void) startOCR:(UIView*) view ERROR:(NSError**) error;



/**
 * @brief Starts the 1980X1080 camera in the center of the given view leaving margins if there is any extra space on X or Y coordinates. But the scanning is not started yet.
 * @author Aman Singh Bhandari 31/05/2018.
 * @param view view passed should already have components/subviews before calling this.
 *
 * @param error holds the NSError object if there were any during initialization. If ‘nil’ then initialization happened error free. App needs to handle if there are any errors.
*/

-(void) documentCapture:(UIView*) view ERROR:(NSError**) error;

/**
 * @brief reads the details when card is shown to the camera.must be called once the camera is initialised and scanning needs to start to detect hologram or OCR scanning.
 *
 * @author Aman Singh Bhandari 31/05/2018.
 */
-(void) scan;

/**
 * @brief Terminate all the ongoing processes int the SDK and reset the same by deallocating all the objects.
 *
 * @author Aman Singh Bhandari 31/03/2020
 *
 * @param json input json which will be explored and all the properties of class will be initialzed.
*/
-(void) terminateScanner;


/**
 *@brief returns the SDK version of IDP
 *@author Aman Singh Bhandari 07/05/2020
 *
 *@return SDK Version
 */
+(NSString*) getSDKVersionIDP;


/**
@brief Sets the overlay reactangle drawn on app screen
@author Aman Singh Bhandari 07/05/2020
@param topLeft Set topLeft point of the rectangle in UIView where the user will keep the document
@param width Set the Width of the rectangle in UIView where user needs to keep the card
@param aspectRatio Set Width/Height of the document
*/
-(void) setOverlayRect:(CGPoint) topLeft WIDTH:(float) width ASPECT_RATIO:(float) aspectRatio;

@end


NS_ASSUME_NONNULL_END
