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
    EZASSERT
}EZ_LOG;

@interface EzLogUtility : NSObject

+(void) enableLog;
+(void) EZSetLogOnConsole:(bool) setConsoleLog;
+(bool) EZClearLogs;
+(NSString *) EzLogGetFilePath;
+(void) EzLog :(NSString* )logMessage TAG:  (NSString *)tag  LOGTYPE: (EZ_LOG ) logType;

@end

NS_ASSUME_NONNULL_END
