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
#import "CameraHelper.h"
#import "DeviceInfo.h"
#import <Foundation/NSSet.h>
#import "FPConstants.h"
#import "EncryptContent.h"
#import "FaceDetection.h"
#import "OCRFrameHandler.h"
@protocol HologramProcessorDelegate;

static NSString *const kmodelInputWidth = @"inputWidth";
static NSString *const kmodelInputHeight = @"inputHeight";
static NSString *const kCountryModelPath = @"modelPath";
static NSString *const kCountryLabelPath = @"labelPath";
static NSString *const kDetectorHologramFound = @"holograms_found";
static NSString *const kDetectorMandatoryHologramFound = @"mandatory_holograms_found";
static NSString *const kDetectorMandatoryHologram = @"mandatory_holograms";
static NSString *const kDetectorThreshold = @"threshold";
static NSString *const kDetectorTotalFrames = @"total_frames";
static NSString *const kDetectorTotalLabels = @"total_holograms";
static NSString *const kDetectorMinLabels = @"min_passing_holograms";
static NSString *const kDetectorFramesProcessed = @"total_frame_processed";
static NSString *const kDetectorFramesHighestConfidence = @"confidence";
static NSString *const kDetectorFramesHologramDetected = @"hologram_detected";
static NSString *const kDetectorScaleFactor = @"scale_factor";
static NSString *const kDetectorFaceExtraction = @"face_from_hologramImage";

static NSString *const kClassifierThreshold = @"threshold";
static NSString *const kClassifierTotalFrames = @"total_frames";
static NSString *const kClassifierPassingFrames = @"min_passing_frames";
static NSString *const kClassifierFramesProcessed = @"total_frame_processed";
static NSString *const kClassifierFramesPassed = @"total_frame_passed";
static NSString *const kClassifierHighetsFramesConfidence = @"confidence";
static NSString *const kClassifierScaleFactor = @"scale_factor";
static NSString *const kClassifierMinConsecutiveFramesRequired = @"consecutive_frames";
static NSString *const kClassifierMaxConsecutiveFramesFound = @"max_consecutive_frame_found";
static NSString *const kClassifierProcessedData = @"classifier_analysis";




enum MODEL_COMPILATAION_RESULT{
    DETECTOR_COMPILATION_STARTED,
    CLASSIFIER_COMPILATION_STARTED,
    CLASSIFIER_COMPILATION_SUCCESS,
    DETECTOR_COMPILATION_SUCCESS,
    DETECTOR_COMPILATION_FAILED,
    CLASSIFIER_COMPILATION_FAILED,
    RESULT_UNKNOWN
};

@protocol FrameProcessorResultDelegate <NSObject>
- (void) detectionResults:(NSMutableArray *)outputData FRAME: (UIImage*) imageFrame;
- (void) finalDetectionResults:(NSString *)results :(NSArray *) detectedImages : (NSDictionary*)extraInformation;
- (void) finalClassificationResults : (NSString *)results :(UIImage *) classifiedImage :(NSDictionary *)extraInformation;
- (void) flashStatus :(BOOL) status; // return true if flash is turned on or false if flash is turned off
- (void) getDocumentCroppedImage : (UIImage *) croppedImage :(UIImage *) fullImage;
- (void) getScannedResults : (NSMutableDictionary*) images DETAILS_DOC:(NSString *) details RESULT:(NSString*) result;
- (void) compilationResults :  (enum MODEL_COMPILATAION_RESULT) result;
- (void) ocrStatus: (float) percentageCompletion BRIGHTNESS:(int) brightness;
- (void) ocrScanStatus: (float) percentageCompletion EXTRA_INFORMATION:(NSDictionary*) extraInformation;

- (void) onDownloadComplete : (NSInteger) errorCode : (NSString *) errorMessage;
- (void) onDownloadProgress : (long)bytesReceived : (long)totalBytesToReceive;
- (void) onError: (NSError *) error;
@end

@interface FrameProcessor : NSObject<CameraHelperDelegate,HologramProcessorDelegate,OCRProtocol,NSURLSessionDataDelegate, NSURLSessionDelegate,NSURLSessionTaskDelegate, NSURLSessionDownloadDelegate>{
}
@property (nonatomic,strong) id <FrameProcessorResultDelegate> delegate;
-(instancetype)init NS_UNAVAILABLE;
-(id)initWithError :(NSError** _Nonnull)error;

/**
 * @brief Inititlizes the camera
 *
 * @author Ezmcom 23/11/2018
 */
-(void) initializeCamera;


/**
 * @brief Start hologram detection with the given configuration
 *
 * @author Ezmcom 23/11/2018
 * @param configuration for the hologram detection should be passed as nsdictionary
 or pass nil if you want to use default parameter
 * Create a nsdictionay object with one of the following parameter
 * kDetectorMandatoryHologram: with mandatory hologram list to be detected;
 * kDetectorThreshold: minimum detector threshold for all holograms
 * kDetectorTotalFrames: Total number of frames to be processed
 * kDetectorTotalLabels: Total labels present in the mlmodel
 * kDetectorMinLabels = minimum number of labels to be detected
 * call backs in (void) finalDetectionResults:(NSString *)results :(NSArray *) detectedImages : (NSDictionary*)extraInformation;
 and intermittent result in -(void) detectionResults:(NSMutableArray *)outputData FRAME: (UIImage*) imageFrame;
 *
 */
-(void) startHologramDetection :(NSDictionary *_Nullable) configuration;


-(void) downloadHogramModel : (NSURL *) modelUrl country:(NSString *)countryName type:(NSString *) docType version:(NSString *) modelVersion;


/**
 * @brief Toggle the flash when camera is on
 *
 * @author Ezmcom 23/11/2018
 * @param flashStatus to turn on send YES else SEND NO to turn off
 * return if successful then return YES else return NO
 */
-(BOOL) toggleFlash: (BOOL) flashStatus;


/**
 * @brief destroy the frame processor
 *
 * @author Ezmcom 23/11/2018
 */
-(void) destroyAll;


/**
 * @brief Attach the view to camera
 *
 * @author Ezmcom 23/11/2018
 * @param uiview to on which camera should be displayed
 * return if successful then return YES else return NO
 */
-(BOOL) attachViewToCamera : (UIView *_Nonnull) uiview;


/**
 * @brief Get device information.
 *
 * @author Ezmcom 23/11/2018
 * @return Nsmutable dictionary with various device related parameters
 */
-(NSMutableDictionary *_Nonnull)getDeviceInfo;

//Set topLeft point of the rectangle in UIView where the user will keep the document
@property(nonatomic, assign) CGPoint topLeft;
//Set Width/Height of the document
@property(nonatomic, assign) float aspectRatio;
//Set the Width of the rectangle in UIView where user needs to keep the card
@property(nonatomic, assign) float width;
//Orientation of camera
@property(assign) Boolean isScanPortrait;

-(NSString*) getEzScanPayloadRequest: (NSArray<UIImage*>*) images DOCTYPE : (NSString*) docType SESSIONID : (NSString*) sessionId ISENCRYPTION : (Boolean) isEncryption OFFLINE_DATA: (NSString*) docDetails;
-(Boolean) readDocumentPage: (UIView*) view LUM : (NSString*) luminosity DETECTION_TYPE: (NSString*) detectionType NO_VOTES: (int) noOfVotes PAGE_NO: (int) pageNo VERBS:(NSArray<NSString*> *)verbs TIMEOUT:(int) timeout;


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
- (id) detectFace: (CIImage*_Nonnull) image ORIENTATION: (NSString*_Nonnull) orientation;

/**
* @brief Starts the offline OCR
*
* @author Aman Singh Bhandari 24/10/2018
*/
-(void) startReadingDocument;


@property (strong, nonatomic) NSString *colourCode;




@end





