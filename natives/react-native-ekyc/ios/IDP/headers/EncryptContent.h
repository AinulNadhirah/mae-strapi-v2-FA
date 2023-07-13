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

#ifndef EncryptContent_h
#define EncryptContent_h


#endif /* EncryptContent_h */

#import <UIKit/UIKit.h>

@interface EncryptContent: NSObject
-(NSString*) getOCRRequestPayload: (NSArray<UIImage*>*) images DOCTYPE : (NSString*) docType SESSIONID : (NSString*) sessionId ISENCRYPTION : (Boolean) isEncryption;
-(NSString*) getEzScanPayloadRequest: (NSArray<UIImage*>*) images DOCTYPE : (NSString*) docType SESSIONID : (NSString*) sessionId ISENCRYPTION : (Boolean) isEncryption OFFLINE_DATA: (NSString*) docDetails;
@end
