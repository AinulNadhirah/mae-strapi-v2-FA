//
//  ReactNativeLibsodiumSdk.m
//
//  Created by Idraki
//  Copyright (c) 2021 PaddlePop Corporation
//

#import "ReactNativeLibsodiumSdk.h"
#import <React/RCTLog.h>
#import "sodium.h"

@implementation ReactNativeLibsodiumSdk
@synthesize bridge = _bridge;

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(initKey:(RCTResponseSenderBlock)callback)
{
  
    _myKeyPair = [NACLAsymmetricKeyPair keyPair];

    NSDictionary *json = [NSDictionary dictionaryWithObjectsAndKeys:
                    [_myKeyPair.publicKey.data base64EncodedStringWithOptions:0], @"pk",
                    [_myKeyPair.privateKey.data base64EncodedStringWithOptions:0], @"sk",
                    nil];

    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:json
                                                 options:NSJSONReadingAllowFragments // Pass 0 if you don't care about the readability of the generated string
                  
                                                   error:&error];

    NSString *jsonString = nil;

    if (! jsonData) {
        NSLog(@"Got an error: %@", error);
        callback(@[error, [NSNull null]]);
    } else {
        jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        
        callback(@[[NSNull null], jsonString]);
    }
}

RCT_EXPORT_METHOD(encryptAndAuthenticate:(NSArray *)dataArray:(RCTResponseSenderBlock)callback)
{
    /* base64 to nsdata conversion */
    NSLog(@"data array is %@",dataArray);

    NSString *search = [[dataArray objectAtIndex:0] stringByReplacingOccurrencesOfString:@"\\" withString:@""];


    /* base64 to nsdata conversion */
    NSString *plainText =search ;
    NSData *pkData = [[NSData alloc] initWithBase64EncodedString:[dataArray objectAtIndex:1] options:0];
    NSData *mySkData = [[NSData alloc] initWithBase64EncodedString:[dataArray objectAtIndex:2] options:0];

    /* nsdata to key conversion */
    NACLNonce *myNonce = [NACLNonce nonce];
    NACLAsymmetricPublicKey  *serverKey = [[NACLAsymmetricPublicKey alloc] initWithData:pkData];
    NACLAsymmetricPrivateKey  *mySkKey =[[NACLAsymmetricPrivateKey alloc] initWithData:mySkData];

    NSData *encryptedData;
    encryptedData = [plainText encryptedDataUsingPublicKey:serverKey
                                              privateKey:mySkKey
                                                   nonce:myNonce];

    if (encryptedData == nil) {
        NSLog(@"Encryption Failed");
        NSDictionary *json = [NSDictionary dictionaryWithObjectsAndKeys:
                          @"Encryption Failed", @"ERROR",
                          nil];
        
        callback(@[json, [NSNull null]]);
        
    } else {
        NSDictionary *json = [NSDictionary dictionaryWithObjectsAndKeys:
                          [encryptedData base64EncodedStringWithOptions:0], @"ct",
                          [myNonce.data base64EncodedStringWithOptions:0], @"nonce",
                          nil];
        NSLog(@"Encryption Success %@",json);
        
        callback(@[[NSNull null], json]);
    }
}

RCT_EXPORT_METHOD(decryptAndVerify:(NSArray *)dataArray:(RCTResponseSenderBlock)callback)
{
    NSLog(@"Data array %@",dataArray);

    /* base64 to nsdata conversion */
    // Type 3 --- RMBB Process
    NSData *cipherData = [[NSData alloc] initWithBase64EncodedString:[dataArray objectAtIndex:0] options:0];
    NSData *pkData = [[NSData alloc] initWithBase64EncodedString:[dataArray objectAtIndex:1] options:0];
    NSData *nonceData = [[NSData alloc] initWithBase64EncodedString:[dataArray objectAtIndex:2] options:0];
    NSData *mySkData = [[NSData alloc] initWithBase64EncodedString:[dataArray objectAtIndex:3] options:0];

    /* nsdata to key conversion */
    NACLNonce *serverNonce = [NACLNonce nonceWithData:nonceData];
    NACLAsymmetricPublicKey  *serverKey = [[NACLAsymmetricPublicKey alloc] initWithData:pkData];
    NACLAsymmetricPrivateKey  *mySkKey =[[NACLAsymmetricPrivateKey alloc] initWithData:mySkData];

    NSString* plainText = [cipherData decryptedTextUsingPublicKey:serverKey privateKey:mySkKey nonce:&serverNonce];
    
    NSLog(@"plainText isss %@",plainText);

    if (plainText == nil) {
        NSLog(@"Error decrcryption issues");
        NSDictionary *json = [NSDictionary dictionaryWithObjectsAndKeys:
                              @"Decryption Failed", @"ERROR",
                              nil];
        
        callback(@[json, [NSNull null]]);
    } else {
        NSDictionary *json = [NSDictionary dictionaryWithObjectsAndKeys:
                          plainText, @"plainText",
                          nil];
        
        callback(@[[NSNull null], json]);
    }
}

- (NSData *)RandomBytes{
  NSUInteger nonceLength = crypto_box_NONCEBYTES;
  unsigned char noncebuf[nonceLength];
  randombytes_buf(noncebuf, nonceLength);
  return [NSData dataWithBytes:noncebuf length:nonceLength];
}


@end
