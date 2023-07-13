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

@interface NSData (AES)
- (NSData*) Scramble: (NSString *) key;
- (NSData*) ScrambleData: (NSData**)key error:(NSError **)error;
- (NSData*) UnScramble: (NSString *) key andForData:(NSMutableData*)objScrambleData;
- (NSData*) UnscrambleData: (NSData *) key forData:(NSData*) encryptedData error:(NSError **)error;
-(NSData*) generateAESKey;
- (NSData *)encryptEnrollmentFile:(NSData *)key error:(NSError **)error;
- (NSData *)decryptEnrollmentFile:(NSData *)key error:(NSError **)error;
@end
