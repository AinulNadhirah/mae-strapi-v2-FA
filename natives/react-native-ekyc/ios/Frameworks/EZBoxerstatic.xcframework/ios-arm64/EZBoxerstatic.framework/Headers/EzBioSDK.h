/*
~ This material is the confidential, unpublished property
~ of Fair Isaac Corporation. Receipt or possession
~ of this material does not convey rights to divulge,
~ reproduce, use, or allow others to use it without
 ~ the specific written authorization of Fair Isaac
~ Corporation and use must conform strictly to the
~ license agreement.  ~
~ Copyright (c) Fair Isaac Corporation, 2020
~ All Rights Reserved.
*/


#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface EzBioSDK : NSObject

+ (void)initEncryptor:(NSString *)encAlias;
+ (void)initEncryptorWithDefaultEncAlias;

@end
