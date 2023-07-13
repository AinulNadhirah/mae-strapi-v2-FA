//
//  EzLogUtility.h
//  Ezlogger
//
//  Created by Dabar Singh Parihar on 21/04/2020.
//  Copyright © 2020 Fico. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

 typedef enum {
    EZVERBOSE=0,
    EZDEBUG,
    EZINFO,
    EZWARN,
    EZERROR,
    EZASSERT,
    EZANALYTICS
}EZ_LOG;

@interface EzLogUtility : NSObject

+(void) enableLog;
+(void) enableCalibration;
+(void) EZSetLogOnConsole:(bool) setConsoleLog;
+(bool) EZClearLogs;
+(bool) EZClearCalibrationLogs;
+(NSString *) EzLogGetFilePath;
+(NSString *) EzGetCalibrationFilePath;
+(void) EzLog :(NSString* )logMessage TAG:  (NSString *)tag  LOGTYPE: (EZ_LOG ) logType;
+(void) EzAnalytics :(NSString* )logMessage TAG: (NSString *)tag;


@end

NS_ASSUME_NONNULL_END
