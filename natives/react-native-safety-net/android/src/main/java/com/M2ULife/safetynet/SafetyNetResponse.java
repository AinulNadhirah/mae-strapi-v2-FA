package com.M2ULife.safetynet;

import android.util.Base64;
import android.util.Log;

import androidx.annotation.Nullable;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Arrays;

/**
 * SafetyNet API payload Response (once unencoded from JSON Web token)
 * <p>
 * {
 * "nonce": "iBnt4sI4KCA5Vqh7yDxzUVJYxBYUIQG396Wgmu6lA/Y=",
 * "timestampMs": 1432658018093,
 * "apkPackageName": "com.scottyab.safetynet.sample",
 * "apkDigestSha256": "WN2ADq4LZvMsd0CFBIkGRl8bn3mRKIppCmnqsrJzUJg=",
 * "ctsProfileMatch": false,
 * "basicIntegrity": false,
 * "extension": "CY+oATrcJ6Cr",
 * "apkCertificateDigestSha256": ["Yao6w7Yy7/ab2bNEygMbXqN9+16j8mLKKTCsUcU3Mzw="]
 * "advice": "LOCK_BOOTLOADER,RESTORE_TO_FACTORY_ROM"
 * }
 * <p>
 */
public class SafetyNetResponse {

    private static final String TAG ="maybank";
    private String nonce;
    private long timestampMs;
    private String apkPackageName;
    private String[] apkCertificateDigestSha256;
    private String apkDigestSha256;
    private boolean ctsProfileMatch;
    private boolean basicIntegrity;
    private String advice;



    /**
     * @return BASE64 encoded
     */
    public String getNonce() {
        return nonce;
    }

    public long getTimestampMs() {
        return timestampMs;
    }

    /**
     * @return com.package.name.of.requesting.app
     */
    public String getApkPackageName() {
        return apkPackageName;
    }

    /**
     * SHA-256 hash of the certificate used to sign requesting app
     *
     * @return BASE64 encoded
     */
    public String[] getApkCertificateDigestSha256() {
        return apkCertificateDigestSha256;
    }

    /**
     * SHA-256 hash of the app's APK
     * <p>
     * Google Play since March 2018 adds a small amount of metadata to all apps which makes this apk validation less useful.
     *
     * @return BASE64 encoded
     */
    @Deprecated
    public String getApkDigestSha256() {
        return apkDigestSha256;
    }


    /**
     * If the value of "ctsProfileMatch" is true, then the profile of the device running your app matches the profile of a device that has passed Android compatibility testing.
     *
     * @return
     */
    public boolean isCtsProfileMatch() {
        return ctsProfileMatch;
    }

    /**
     * If the value of "basicIntegrity" is true, then the device running your app likely wasn't tampered with, but the device has not necessarily passed Android compatibility testing.
     *
     * @return
     */
    public boolean isBasicIntegrity() {
        return basicIntegrity;
    }

    /**
     * Advice for passing future checks
     *
     * @return
     */
    public String getAdvice() {
        return advice;
    }

    /**
     * Parse the JSON string into populated SafetyNetResponse object
     *
     * @param decodedJWTPayload JSON String (always a json string according to JWT spec)
     * @return populated SafetyNetResponse
     */
    @Nullable
    public static SafetyNetResponse parse(String decodedJWTPayload) {

        Log.i(TAG, "decodedJWTPayload json:" + decodedJWTPayload);

        SafetyNetResponse response = new SafetyNetResponse();
        try {
            JSONObject root = new JSONObject(decodedJWTPayload);
            Log.i(TAG, root.toString());
            if (root.has("nonce")) {
                response.nonce = root.getString("nonce");
            }

            if (root.has("apkCertificateDigestSha256")) {
                JSONArray jsonArray = root.getJSONArray("apkCertificateDigestSha256");
                if (jsonArray != null) {
                    String[] certDigests = new String[jsonArray.length()];
                    for (int i = 0; i < jsonArray.length(); i++) {
                        certDigests[i] = jsonArray.getString(i);
                    }
                    response.apkCertificateDigestSha256 = certDigests;
                }
            }

            if (root.has("apkDigestSha256")) {
                response.apkDigestSha256 = root.getString("apkDigestSha256");
            }

            if (root.has("apkPackageName")) {
                response.apkPackageName = root.getString("apkPackageName");
            }

            if (root.has("basicIntegrity")) {
                response.basicIntegrity = root.getBoolean("basicIntegrity");
            }

            if (root.has("ctsProfileMatch")) {
                response.ctsProfileMatch = root.getBoolean("ctsProfileMatch");
            }

            if (root.has("timestampMs")) {
                response.timestampMs = root.getLong("timestampMs");
            }

            if (root.has("advice")) {
                response.advice = root.getString("advice");
            }

            return response;
        } catch (JSONException e) {
            Log.e(TAG, "problem parsing decodedJWTPayload:" + e.getMessage(), e);
        }
        return null;
    }


    @Override
    public String toString() {
        return "SafetyNetResponse{" +
                "nonce='" + nonce + '\'' +
                ", timestampMs=" + timestampMs +
                ", apkPackageName='" + apkPackageName + '\'' +
                ", apkCertificateDigestSha256=" + Arrays.toString(apkCertificateDigestSha256) +
                ", apkDigestSha256='" + apkDigestSha256 + '\'' +
                ", ctsProfileMatch=" + ctsProfileMatch +
                ", basicIntegrity=" + basicIntegrity +
                ", advice=" + advice +
                '}';
    }

    public static SafetyNetResponse parseJsonWebSignature(String jwsResult) {
        try {
            Log.i(TAG, "parseJsonWebSignature+++");
            if (jwsResult == null) {
                return null;
            }
            //the JWT (JSON WEB TOKEN) is just a 3 base64 encoded parts concatenated by a . character
            final String[] jwtParts = jwsResult.split("\\.");

            if (jwtParts.length == 3) {
                //we're only really interested in the body/payload
                String decodedPayload = new String(Base64.decode(jwtParts[1], Base64.DEFAULT));

                return SafetyNetResponse.parse(decodedPayload);
            } else {
                return null;
            }

        } catch (Exception e) {
            return null;
        }
    }
}