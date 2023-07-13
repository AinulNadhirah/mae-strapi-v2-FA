//
//  RNPassKit.h
//  RNPassKit
//
//  Created by Masayuki Iwai on 2018/02/09.
//  Copyright © 2018 Masayuki Iwai. All rights reserved.
//

#import <PassKit/PassKit.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTBridge.h>
#import <React/RCTUtils.h>
#import <WatchConnectivity/WatchConnectivity.h>

@interface RNPassKit : RCTEventEmitter<RCTBridgeModule, PKAddPassesViewControllerDelegate, PKAddPaymentPassViewControllerDelegate, NSURLSessionDelegate, WCSessionDelegate>

@property (nonatomic, strong)NSUserDefaults *standardUserDefaults;
@property (nonatomic, strong)NSDictionary *jsData;

@property (strong,nonatomic) WCSession *session;
@property (assign,nonatomic) BOOL isPairedWatchExist;
//- (instancetype)initWithEncryptionScheme:(NSString *)encryptionScheme;
//- (instancetype)initWithRequestConfiguration:(PKAddPaymentPassRequestConfiguration *)configuration delegate:(id<PKAddPaymentPassViewControllerDelegate>)delegate;

@end
