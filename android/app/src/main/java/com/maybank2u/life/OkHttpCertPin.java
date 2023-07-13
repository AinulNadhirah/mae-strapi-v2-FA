package com.maybank2u.life;

import com.facebook.react.modules.network.OkHttpClientFactory;
import com.facebook.react.modules.network.OkHttpClientProvider;
import com.facebook.react.modules.network.ReactCookieJarContainer;

import java.util.concurrent.TimeUnit;

import okhttp3.CertificatePinner;
import okhttp3.OkHttpClient;

public class OkHttpCertPin implements OkHttpClientFactory {
    private static String hostname = "*.maybank.com.my";

    @Override
    public OkHttpClient createNewNetworkModuleClient() {
        CertificatePinner certificatePinner = new CertificatePinner.Builder()
            // Production - ExprDate: Saturday, 22 July 2023 at 07:59:59
            .add("maya.maybank2u.com.my", "sha256/8cPMxWaFJTOJc8860p/MPxhj7TxTiwz0gclT/MFhYBE=")
            // Production - ExprDate: Thrusday, 23 May 2024 at 23:59:59 
            .add("maya.maybank2u.com.my", "sha256/i4IwjXFdqW/zKUF4DoiXo+D8pSOzajTY1sElV/OZJlI=")
            // Production - Intermediate As Backup - ExprDate: Sunday, 22 October 2028 at 8:00:00 PM Malaysia Time
            .add("maya.maybank2u.com.my", "sha256/RRM1dGqnDFsCJXBTHky16vi1obOlCgFFn/yOhI/y+ho=")
            // Staging - ExprDate: Wednesday, 3 January 2024 at 01:06:01
            .add("staging.maya.maybank2u.com.my", "sha256/JmuvBLD5Oet1rpurn/7K7KWUeNjjO7R6pVGN88fKuZ4=")
            // Staging - Intermediate As BackUp - ExprDate: Tuesday, 21 November 2028 at 8:00:00 AM Malaysia Time
            .add("staging.maya.maybank2u.com.my", "sha256/hETpgVvaLC0bvcGG3t0cuqiHvr4XyP2MTwCiqhgRWwU=")
            // Direct From OpenSSL Command for SIT AND UAT (Share the Same SSL Cert) - ExprDate: Sunday, 19 March 2023 at 17:24:28
            .add(hostname, "sha256/evDQ82lYadH5cu0MxzqsdOf0d/CfBFEKQ0xkOhjC2uc=")
            // SIT
            .add(hostname, "sha256/D7ce8tvKuSYinPu3zO8Wz6Gc74UWa2MK7AsJMTMM7jU=")
            // UAT
            .add(hostname, "sha256/2OndsS/gLTqD58um4iHo2BQ4yVNL+Rz7sgMriyclar0=")
            .build();

        OkHttpClient.Builder client = new OkHttpClient.Builder()
            .connectTimeout(0, TimeUnit.MILLISECONDS)
            .readTimeout(0, TimeUnit.MILLISECONDS)
            .writeTimeout(0, TimeUnit.MILLISECONDS)
            .cookieJar(new ReactCookieJarContainer())
            .certificatePinner(certificatePinner);

        return OkHttpClientProvider.enableTls12OnPreLollipop(client).build();
    }
}