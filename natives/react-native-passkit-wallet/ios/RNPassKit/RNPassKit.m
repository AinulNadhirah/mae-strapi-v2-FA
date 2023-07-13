//
//  RNPassKit.m
//  RNPassKit
//
//  Created by Masayuki Iwai on 2018/02/09.
//  Copyright © 2018 Masayuki Iwai. All rights reserved.
//

#import <PassKit/PassKit.h>
#import "RNPassKit.h"
#import <React/RCTLog.h>
#import <WatchConnectivity/WatchConnectivity.h>

@implementation RNPassKit

RCT_EXPORT_MODULE()
// Step 1: Cheking Device Eligibility
RCT_EXPORT_METHOD(canAddPasses:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject) {
    RCTLog(@"test log");
    self.isPairedWatchExist = NO;
    [self checkPairedWatches];
    resolve(@([PKAddPaymentPassViewController canAddPaymentPass]));
}
// Fetching Wallet Redirection URL for that card using FPANID
RCT_EXPORT_METHOD(payWithApplePay:(NSString *)cardInfo
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject) {
    NSLog(@"%@",cardInfo);
    NSString * cardIdentifier = cardInfo;
    NSURL *passURL;
    
    PKPassLibrary *passLibrary = [[PKPassLibrary alloc] init];
    NSArray *paymentPasses = [[NSArray alloc] init];
    if (@available(iOS 13.5, *)) { // PKPassTypePayment is deprecated in iOS13.5
      paymentPasses = [passLibrary passes];
      for (PKPass *pass in paymentPasses) {
        PKSecureElementPass *paymentPass = [pass secureElementPass];
        if ([[paymentPass primaryAccountIdentifier] isEqualToString:cardIdentifier]) {
            passURL = [pass passURL];
        }
      }
    } else {
      paymentPasses = [passLibrary passesOfType: PKPassTypePayment];
      for (PKPass *pass in paymentPasses) {
        PKPaymentPass *paymentPass = [pass paymentPass];
        if([[paymentPass primaryAccountIdentifier] isEqualToString:cardIdentifier]) {
            passURL = [pass passURL];
        }
      }
    }
    
    resolve(passURL.absoluteString);
}
// Fetching Wallet Redirection URL for that card using card suffix
RCT_EXPORT_METHOD(payWithApplePaySuffix:(NSString *)cardSuffix
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject) {
    NSLog(@"%@",cardSuffix);
    NSString * cardIdentifier = cardSuffix;
    NSURL *passURL;
    
    PKPassLibrary *passLibrary = [[PKPassLibrary alloc] init];
    NSArray *paymentPasses = [[NSArray alloc] init];
    if (@available(iOS 13.5, *)) { // PKPassTypePayment is deprecated in iOS13.5
      paymentPasses = [passLibrary passes];
      for (PKPass *pass in paymentPasses) {
        PKSecureElementPass *paymentPass = [pass secureElementPass];
        if ([[paymentPass primaryAccountNumberSuffix] isEqualToString:cardIdentifier]) {
            passURL = [pass passURL];
        }
      }
    } else {
      paymentPasses = [passLibrary passesOfType: PKPassTypePayment];
      for (PKPass *pass in paymentPasses) {
        PKPaymentPass *paymentPass = [pass paymentPass];
        if([[paymentPass primaryAccountNumberSuffix] isEqualToString:cardIdentifier]) {
            passURL = [pass passURL];
        }
      }
    }
    resolve(passURL.absoluteString);
}
// Fetching Provisioned cards (Which are already added in Wallet)
RCT_EXPORT_METHOD(getProvisionedCards:(NSString *)cardInfo
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject) {
    NSLog(@"getProvisionedCards ::: %@",cardInfo);
    PKPassLibrary *passLibrary = [[PKPassLibrary alloc] init];
    NSArray<PKPass *> *paymentPasses = [[NSArray alloc] init];
    NSMutableArray *cardsArray = [[NSMutableArray alloc] init];
    NSMutableArray *remoteCardsArray = [[NSMutableArray alloc] init];
    if (@available(iOS 13.5, *)) { // PKPassTypePayment is deprecated in iOS13.5
      paymentPasses = [passLibrary passes];
      for (PKPass *pass in paymentPasses) {
        PKSecureElementPass *paymentPass = [pass secureElementPass];
          [cardsArray addObject:[paymentPass primaryAccountIdentifier]];
      }
    } else {
      paymentPasses = [passLibrary passesOfType: PKPassTypePayment];
      for (PKPass *pass in paymentPasses) {
        PKPaymentPass *paymentPass = [pass paymentPass];
          [cardsArray addObject:[paymentPass primaryAccountIdentifier]];
      }
    }
    
    if (WCSession.isSupported) { // check if the device support to handle an Apple Watch
        WCSession *session = [WCSession defaultSession];
        session.delegate = self;
        [session activateSession];
        
        if ([session isPaired]) { // Check if the iPhone is paired with the Apple Watch

          if (@available(iOS 13.5, *)) {
                paymentPasses = [passLibrary remoteSecureElementPasses]; // remotePaymentPasses is deprecated in iOS13.5
                for (PKSecureElementPass *pass in paymentPasses) {
                    PKSecureElementPass *paymentPass = [pass secureElementPass];
                    [remoteCardsArray addObject:[paymentPass primaryAccountIdentifier]];
                }
            } else {
                paymentPasses = [passLibrary remotePaymentPasses];
                for (PKPass *pass in paymentPasses) {
                    PKPaymentPass * paymentPass = [pass paymentPass];
                    [remoteCardsArray addObject:[paymentPass primaryAccountIdentifier]];
                }
            }
          
        }
    }
    NSDictionary *provisionedCards = [[NSDictionary alloc]initWithObjects:@[cardsArray, remoteCardsArray] forKeys:@[@"device",@"watch"]];
    
    resolve(provisionedCards);
}
// Checking Card provisioned in which devices (iPhone or Apple Watch) using FPANID
RCT_EXPORT_METHOD(checkCardEligibility:(NSString *)cardInfo
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject) {
    NSLog(@"checkCardEligibility ::: %@",cardInfo);
    NSString * cardIdentifier = cardInfo;
    BOOL cardEligible = true;
    BOOL cardAddedtoPasses = false;
    BOOL cardAddedtoRemotePasses = false;
    
    if(cardIdentifier) {
        PKPassLibrary *passLibrary = [[PKPassLibrary alloc] init];
        NSArray *paymentPasses = [[NSArray alloc] init];
        if (@available(iOS 13.5, *)) { // PKPassTypePayment is deprecated in iOS13.5
          paymentPasses = [passLibrary passes];
          for (PKPass *pass in paymentPasses) {
            PKSecureElementPass *paymentPass = [pass secureElementPass];
            if ([[paymentPass primaryAccountIdentifier] isEqualToString:cardIdentifier]) {
              cardAddedtoPasses = true;
            }
          }
        } else {
          paymentPasses = [passLibrary passesOfType: PKPassTypePayment];
          for (PKPass *pass in paymentPasses) {
            PKPaymentPass *paymentPass = [pass paymentPass];
            if([[paymentPass primaryAccountIdentifier] isEqualToString:cardIdentifier]) {
              cardAddedtoPasses = true;
            }
          }
        }
        
        if (WCSession.isSupported) { // check if the device support to handle an Apple Watch
            WCSession *session = [WCSession defaultSession];
            session.delegate = self;
            [session activateSession];
            
            if ([session isPaired]) { // Check if the iPhone is paired with the Apple Watch

              if (@available(iOS 13.5, *)) {
                    paymentPasses = [passLibrary remoteSecureElementPasses]; // remotePaymentPasses is deprecated in iOS13.5
                    for (PKSecureElementPass *pass in paymentPasses) {
                        if ([[pass primaryAccountIdentifier] isEqualToString:cardIdentifier]) {
                            cardAddedtoRemotePasses = true;
                        }
                    }
                } else {
                    paymentPasses = [passLibrary remotePaymentPasses];
                    for (PKPass *pass in paymentPasses) {
                        PKPaymentPass * paymentPass = [pass paymentPass];
                        if([[paymentPass primaryAccountIdentifier] isEqualToString:cardIdentifier])
                            cardAddedtoRemotePasses = true;
                    }
                }
              
                }
            else
                cardAddedtoRemotePasses = cardAddedtoPasses;
        }
        else
            cardAddedtoRemotePasses = cardAddedtoPasses;

        cardEligible = !cardAddedtoPasses || !cardAddedtoRemotePasses;
    }
    NSDictionary *isCardAdded = [[NSDictionary alloc]initWithObjects:@[@(cardAddedtoPasses), @(cardAddedtoRemotePasses)] forKeys:@[@"device",@"watch"]];
    
    resolve(isCardAdded);
}
// Checking Card provisioned in which devices (iPhone or Apple Watch) using card number suffix
RCT_EXPORT_METHOD(checkCardEligibilitySuffix:(NSString *)cardInfo
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject) {
    NSString * cardIdentifier = cardInfo;
    BOOL cardEligible = true;
    BOOL cardAddedtoPasses = false;
    BOOL cardAddedtoRemotePasses = false;
    
    PKPassLibrary *passLibrary = [[PKPassLibrary alloc] init];
    NSArray *paymentPasses = [[NSArray alloc] init];
    if (@available(iOS 13.5, *)) { // PKPassTypePayment is deprecated in iOS13.5
      paymentPasses = [passLibrary passes];
      for (PKPass *pass in paymentPasses) {
        PKSecureElementPass *paymentPass = [pass secureElementPass];
        if ([[paymentPass primaryAccountNumberSuffix] isEqualToString:cardIdentifier]) {
          cardAddedtoPasses = true;
        }
      }
    } else {
      paymentPasses = [passLibrary passesOfType: PKPassTypePayment];
      for (PKPass *pass in paymentPasses) {
        PKPaymentPass *paymentPass = [pass paymentPass];
        if([[paymentPass primaryAccountNumberSuffix] isEqualToString:cardIdentifier]) {
          cardAddedtoPasses = true;
        }
      }
    }
    
    if (WCSession.isSupported) { // check if the device support to handle an Apple Watch
        WCSession *session = [WCSession defaultSession];
        session.delegate = self;
        [session activateSession];
        
        if ([session isPaired]) { // Check if the iPhone is paired with the Apple Watch

          if (@available(iOS 13.5, *)) {
                paymentPasses = [passLibrary remoteSecureElementPasses]; // remotePaymentPasses is deprecated in iOS13.5
                for (PKSecureElementPass *pass in paymentPasses) {
                    if ([[pass primaryAccountNumberSuffix] isEqualToString:cardIdentifier]) {
                        cardAddedtoRemotePasses = true;
                    }
                }
            } else {
                paymentPasses = [passLibrary remotePaymentPasses];
                for (PKPass *pass in paymentPasses) {
                    PKPaymentPass * paymentPass = [pass paymentPass];
                    if([[paymentPass primaryAccountNumberSuffix] isEqualToString:cardIdentifier])
                        cardAddedtoRemotePasses = true;
                }
            }
          
            }
        else
            cardAddedtoRemotePasses = cardAddedtoPasses;
    }
    else
        cardAddedtoRemotePasses = cardAddedtoPasses;

    cardEligible = !cardAddedtoPasses || !cardAddedtoRemotePasses;
    NSDictionary *isCardAdded = [[NSDictionary alloc]initWithObjects:@[@(cardAddedtoPasses), @(cardAddedtoRemotePasses)] forKeys:@[@"device",@"watch"]];
    
    resolve(isCardAdded);
}
// Step 1 : Adding card to the wallet (In App Provisioning)
RCT_EXPORT_METHOD(addPass:(NSDictionary *)cardInfo
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject) {
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults setBool:false forKey:@"deligateTriggered"];
    [defaults setValue:@"launch" forKey:@"addCardLaunch"];
    [defaults setValue:nil forKey:@"addCardErr"];
    [defaults setValue:nil forKey:@"addCardPass"];
    [defaults synchronize];
    
    NSError *error;
    NSLog(@"param value : %@",cardInfo);
    self.jsData = cardInfo;
    //Preparing request to pass to PKAddPaymentPassViewController
    PKAddPaymentPassRequestConfiguration *request;
    if (@available(iOS 10.0, *)) {
        request = [[PKAddPaymentPassRequestConfiguration alloc] initWithEncryptionScheme:PKEncryptionSchemeECC_V2];
        request.cardholderName  = [cardInfo valueForKey:@"holderName"];
        request.primaryAccountSuffix = [cardInfo valueForKey:@"cardNoSuffix"];
        request.localizedDescription = [cardInfo valueForKey:@"localizedDesc"];
        request.primaryAccountIdentifier = [cardInfo valueForKey:@"primaryAccountIdentifier"];
        NSString* paymentNetwork = [cardInfo valueForKey:@"paymentNetwork"];
        if([[paymentNetwork uppercaseString] isEqualToString:@"VISA"]) {
            request.paymentNetwork = PKPaymentNetworkVisa;
        }
        if([[paymentNetwork uppercaseString] isEqualToString:@"MASTERCARD"]) {
            request.paymentNetwork = PKPaymentNetworkMasterCard;
        }
        if([[paymentNetwork uppercaseString] isEqualToString:@"AMEX"]) {
            request.paymentNetwork = PKPaymentNetworkAmex;
        }
        //request.paymentNetwork = [cardInfo valueForKey:@"paymentNetwork"];
        //[self getCardFPAN:[cardInfo valueForKey:@"cardNoSuffix"]];
        //[cardInfo valueForKey:@"primaryAccountIdentifier"];
    }

    if (error) {
        reject(@"", @"Failed to create pass.", error);
        return;
    }
    NSLog(@"Request ::: %@",request);
    dispatch_async(dispatch_get_main_queue(), ^{
        UIApplication *sharedApplication = RCTSharedApplication();
        UIWindow *window = sharedApplication.keyWindow;
        if (window) {
          UIViewController *rootViewController = window.rootViewController;
          if (rootViewController) {
              PKAddPaymentPassViewController *addPassVC = [[PKAddPaymentPassViewController alloc] initWithRequestConfiguration:request delegate:self];
              addPassVC.delegate = self;
              if(!addPassVC) {
                  reject(@"", @"Failed to present PKAddPassesViewController.", nil);
              }
              //Launch the pass view controller
              [[UIApplication sharedApplication].delegate.window.rootViewController presentViewController:addPassVC animated:NO completion:^{
                  // Succeeded
                  resolve(nil);
              }];
            return;
          }
        }
        
        reject(@"", @"Failed to present PKAddPassesViewController.", nil);
  });
}
// get card FPAN ID using card number suffix
- (NSString *) getCardFPAN:(NSString *) cardSuffix{
    
    PKPassLibrary *passLibrary = [[PKPassLibrary alloc] init];
    NSArray<PKPass *> *paymentPasses = [passLibrary passesOfType:PKPassTypePayment];
    for (PKPass *pass in paymentPasses) {
        PKPaymentPass * paymentPass = [pass paymentPass];
        if([[paymentPass primaryAccountNumberSuffix] isEqualToString:cardSuffix])
            return [paymentPass primaryAccountIdentifier];
    }
    
    if (WCSession.isSupported) { // check if the device support to handle an Apple Watch
        WCSession *session = [WCSession defaultSession];
        session.delegate = self;
        [session activateSession];
        
        if ([session isPaired]) { // Check if the iPhone is paired with the Apple Watch
            paymentPasses = [passLibrary remotePaymentPasses];
            for (PKPass *pass in paymentPasses) {
                PKPaymentPass * paymentPass = [pass paymentPass];
                if([[paymentPass primaryAccountNumberSuffix] isEqualToString:cardSuffix])
                    return [paymentPass primaryAccountIdentifier];
            }
        }
    }
    
    return nil;
}

// Fetching the final result once the pass view controller dismissed
RCT_EXPORT_METHOD(getAddCardResult:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject)
{
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    if([defaults valueForKey:@"addCardPass"] && [defaults boolForKey:@"deligateTriggered"] == true) {
        // resolve([defaults valueForKey:@"addCardPass"]);
        resolve(@"successfully provisioned");
    }else if([[defaults valueForKey:@"addCardErr"] isEqualToString:@"error"] && [defaults boolForKey:@"deligateTriggered"] == true) {
//        resolve([defaults valueForKey:@"addCardErr"]);
        NSString *cardNo = [self.jsData valueForKey:@"cardNo"];
        NSString *cardName = [self.jsData valueForKey:@"cardName"];
        NSDictionary *provisionedCards = [[NSDictionary alloc]initWithObjects:@[cardNo, cardName] forKeys:@[@"cardNo",@"cardName"]];
        resolve(provisionedCards);
    }else if([defaults valueForKey:@"addCardLaunch"]) {
        resolve(@"launch");
    }
    [defaults setBool:false forKey:@"deligateTriggered"];
    [defaults setValue:@"launch" forKey:@"addCardLaunch"];
    [defaults setValue:nil forKey:@"addCardErr"];
    [defaults setValue:nil forKey:@"addCardPass"];
}
// Checking for paired devices
RCT_EXPORT_METHOD(checkPairedDevices:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject)
{
    NSMutableDictionary* dictionary = [[NSMutableDictionary alloc] init];
    if (WCSession.isSupported) { // check if the device support to handle an Apple Watch
        WCSession *session = [WCSession defaultSession];
        session.delegate = self;
        [session activateSession];
        if (session.isPaired) { // Check if the iPhone is paired with the Apple Watch
            [dictionary setObject:@YES forKey:@"isWatchPaired"];
        } else {
            [dictionary setObject:@NO forKey:@"isWatchPaired"];
        }
    } else {
        [dictionary setObject:@NO forKey:@"isWatchPaired"];
    }
    
    resolve(dictionary);
}

//For Apple Native Button
- (NSDictionary *)constantsToExport {
  PKAddPassButton *addPassButton = [[PKAddPassButton alloc] initWithAddPassButtonStyle:PKAddPassButtonStyleBlack];
  [addPassButton layoutIfNeeded];
  
  return @{
           @"AddPassButtonStyle": @{
               @"black": @(PKAddPassButtonStyleBlack),
               @"blackOutline": @(PKAddPassButtonStyleBlackOutline),
               },
           @"AddPassButtonWidth": @(CGRectGetWidth(addPassButton.frame)),
           @"AddPassButtonHeight": @(CGRectGetHeight(addPassButton.frame)),
           };
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

#pragma mark - RCTEventEmitter implementation
// PaymentPassViewController listener
- (NSArray<NSString *> *)supportedEvents {
  return @[@"addPassesViewControllerDidFinish"];
}

// PaymentPassViewController which triggered once the provision is Success/Fail.
- (void)addPaymentPassViewController:(nonnull PKAddPaymentPassViewController *)controller didFinishAddingPaymentPass:(nullable PKPaymentPass *)pass error:(nullable NSError *)error {
    NSLog(@"didFinishAddingPaymentPass :: Delegate");
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [controller dismissViewControllerAnimated:YES completion:^{
        if(pass) {
            NSLog(@"didFinishAddingPaymentPass :: pass %@", pass);
//            [defaults setValue:pass forKey:@"addCardPass"];
            [defaults setValue:@"success" forKey:@"addCardPass"];
            [self sendEventWithName:@"addPassesViewControllerDidFinish" body:pass];
        }else {
            if ([defaults boolForKey:@"deligateTriggered"] == true) {
                [defaults setValue:@"error" forKey:@"addCardErr"];
            } else {
                [defaults setValue:nil forKey:@"addCardErr"];
            }
            NSLog(@"Error , %@",error);
            [self sendEventWithName:@"addPassesViewControllerDidFinish" body:error];
        }
        [defaults synchronize];
    }];
}

// PaymentPassViewController delegate method which return nonce, nonceSignature, Certificates Array and Handler to return the response to Wallet that received from BE.
- (void)addPaymentPassViewController:(nonnull PKAddPaymentPassViewController *)controller generateRequestWithCertificateChain:(nonnull NSArray<NSData *> *)certificates nonce:(nonnull NSData *)nonce nonceSignature:(nonnull NSData *)nonceSignature completionHandler:(nonnull void (^)(PKAddPaymentPassRequest * _Nonnull))handler {
    NSLog(@"generateRequestWithCertificateChain :: Delegate");
    
    NSString *convertedNonce = [nonce base64EncodedStringWithOptions:0];
    NSLog(@"Converted Nonce = %@",convertedNonce);
    
    NSString * convertedNonceSig = [nonceSignature base64EncodedStringWithOptions:0];
    NSLog(@"Converted Nonce Signature = %@",convertedNonceSig);
    
    NSMutableArray *convertedCert = [[NSMutableArray alloc]init];
    for(int i=0; i<certificates.count; i++) {
        [convertedCert addObject:[[certificates objectAtIndex:i] base64EncodedStringWithOptions:0]];
    }
    NSLog(@"The cert ::: %@", convertedCert);
    
    NSString *cardNo = [self.jsData valueForKey:@"cardNo"];
    NSString *paymentNetwork = [self.jsData valueForKey:@"paymentNetwork"];
    NSString *isMaeDebit = [self.jsData valueForKey:@"isMaeDebit"];
    NSDictionary *provReq = [[NSDictionary alloc] initWithObjects:@[convertedNonce, convertedNonceSig, convertedCert, cardNo, paymentNetwork, isMaeDebit] forKeys:@[@"nonce", @"nonceSignature", @"certificates", @"cardAccountNo", @"network", @"maeDebit"]];
    NSLog(@"provRequest ::: %@", provReq);
    
    //Preparing the API Request Data
    NSURL *url = [NSURL URLWithString:[self.jsData valueForKey:@"url"]];
    //The URL where you send the POST
    NSMutableURLRequest *req = [NSMutableURLRequest requestWithURL:url
                                                       cachePolicy:NSURLRequestReloadIgnoringCacheData
                                                   timeoutInterval:60];

    [req setHTTPMethod:@"POST"];
    NSData *jsonBodyData = [NSJSONSerialization dataWithJSONObject:provReq options:kNilOptions error:nil];
    
    NSString *authToken = [NSString stringWithFormat:@"bearer %@", [self.jsData valueForKey:@"token"]];
    [req setValue:authToken forHTTPHeaderField:@"authorization"];//maya-authorization
    [req setValue:authToken forHTTPHeaderField:@"maya-authorization"];
    [req setValue:@"IOS" forHTTPHeaderField:@"X-APP-PLATFORM"];
    [req setValue:[self.jsData valueForKey:@"version"] forHTTPHeaderField:@"X-APP-VERSION"];
    [req setValue:[self.jsData valueForKey:@"appEnvRegion"] forHTTPHeaderField:@"X-APP-ENVIRONMENT"];
    [req setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    [req setValue:@"application/json" forHTTPHeaderField:@"accept"];
    [req setHTTPBody:jsonBodyData];
    
    NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];
    NSURLSession *session = [NSURLSession sessionWithConfiguration:config
                                                          delegate:nil
                                                     delegateQueue:[NSOperationQueue mainQueue]];
    // Initiate the API Request
    NSURLSessionDataTask *task = [session dataTaskWithRequest:req
                                            completionHandler:^(NSData * _Nullable data,
                                                                NSURLResponse * _Nullable response,
                                                                NSError * _Nullable error) {
        
        NSHTTPURLResponse *httpResp = (NSHTTPURLResponse *) response;
        PKAddPaymentPassRequest *paymentPassRequest = [[PKAddPaymentPassRequest alloc] init];
        NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
        [defaults setBool:true forKey:@"deligateTriggered"];
        if (error != nil) {
            // Something went wrong...
            NSLog(@"Servor responded with error %@",error.description);
            [controller dismissViewControllerAnimated:YES completion:^{
                [defaults setValue:@"error" forKey:@"addCardErr"];
                [self sendEventWithName:@"addPassesViewControllerDidFinish" body:nil];
            }];
        }else if(httpResp.statusCode < 200 || httpResp.statusCode >= 300) {
            NSLog(@"Servor responded with error %@",error.description);
            [controller dismissViewControllerAnimated:YES completion:^{
                [defaults setValue:@"error" forKey:@"addCardErr"];
                [self sendEventWithName:@"addPassesViewControllerDidFinish" body:nil];
            }];
        } else {
            NSDictionary *forJSONObject = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:nil];
            NSLog(@"Response of Provisioning API : %@", forJSONObject);
            
            NSDictionary* result = [forJSONObject valueForKey:@"result"];
            NSString* activationData = [result objectForKey:@"activationData"];
            NSString* encryptedPassData = [result objectForKey:@"encryptedData"];
            NSString* ephemeralPublicKey = [result objectForKey:@"ephemeralPublicKey"];
            
            NSLog(@"activationData ::: %@",activationData);
            NSLog(@"encryptedPassData ::: %@",encryptedPassData);
            NSLog(@"ephemeralPublicKey ::: %@",ephemeralPublicKey);

            paymentPassRequest.encryptedPassData = [[NSData alloc] initWithBase64EncodedString:encryptedPassData options:0];

            paymentPassRequest.activationData = [[NSData alloc] initWithBase64EncodedString:activationData options:0];

            paymentPassRequest.ephemeralPublicKey = [[NSData alloc] initWithBase64EncodedString:ephemeralPublicKey options:0];
            
            [defaults synchronize];
            handler(paymentPassRequest);
        }
    }];
    [task resume];
}


-(void)checkPairedWatches
{
    if ([WCSession isSupported]) {
        self.session = [WCSession defaultSession];
        self.session.delegate = self;
        [self.session activateSession];
    }
}

/** Called when all delegate callbacks for the previously selected watch has occurred. The session can be re-activated for the now selected watch using activateSession. */
- (void)sessionDidDeactivate:(WCSession *)session
{
    
}

- (void)session:(nonnull WCSession *)session
    activationDidCompleteWithState:(WCSessionActivationState)activationState
    error:(nullable NSError *)error
{
    if (activationState == WCSessionActivationStateActivated) {
        if (self.session.isPaired) {
            self.isPairedWatchExist = YES;
        }
    }
}

//Dummy method : For testing purpose
RCT_EXPORT_METHOD(doPaymentRequest:(NSString *)base64Encoded
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject) {
    
    NSLog(@"didFinishAddingPaymentPass :: Delegate");
    PKAddPaymentPassRequest *paymentPassRequest = [[PKAddPaymentPassRequest alloc] init];
    paymentPassRequest.encryptedPassData = [[NSData alloc] initWithBase64EncodedString:@"" options:0];
    paymentPassRequest.activationData = [@"XXXXXXXXXXX" dataUsingEncoding:NSUTF8StringEncoding];
    paymentPassRequest.ephemeralPublicKey = [@"XXXXXXXXXXX" dataUsingEncoding:NSUTF8StringEncoding];

}



@end
