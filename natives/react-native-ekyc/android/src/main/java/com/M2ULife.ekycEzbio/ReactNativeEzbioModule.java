package com.M2ULife.ekycEzbio;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.WindowManager;

import com.ezmcom.ezbio.android.sdk.EzBioSDK;
import com.ezmcom.ezbio.android.sdk.constants.Constants;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Map;
import java.util.logging.Logger;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import static android.content.Context.MODE_PRIVATE;

public class ReactNativeEzbioModule extends ReactContextBaseJavaModule {
    private Logger logger = Logger.getLogger("maybank: ReactNativeEzbioModule");

    public static final String REACT_CLASS = "ReactNativeEzBio";
    private static ReactApplicationContext reactContext = null;

    ProgressDialog progressDialog;

    private static final int ENROLLMENT_REQUEST_CODE = 111;
    private String userId = "", selfieDescription = "";

    private Callback singleCallback;

    public ReactNativeEzbioModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

        reactContext.addActivityEventListener(mActivityEventListener1);
    }

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        return super.getConstants();
    }

    private static void emitDeviceEvent(String eventName, @Nullable WritableMap eventData) {
        // A method for emitting from the native side to JS
        // https://facebook.github.io/react-native/docs/native-modules-android.html#sending-events-to-javascript
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, eventData);
    }

    @ReactMethod
    public void startSelfie(ReadableMap reqReadbaleMap, Callback callback) {
        logger.info("EzBioModule startSelfie+++");
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            return;
        }
        singleCallback = callback;

        try {
            EzBioSDK.init(reactContext);
        } catch (Exception e) {
            logger.info("Exception EzBioSDK init++++++");
        }

        if (EzBioSDK.isSDKInitialized()) {
            EzBioSDK.setAuthenticationLevel(2);
            EzBioSDK.setUseLivenessChallenge(true);
            EzBioSDK.setNumOfLivenessChallenge(3);
        }
        userId = reqReadbaleMap.getString("userID");
        selfieDescription = reqReadbaleMap.getString("description");
        try {
            boolean isEnrolledAlready = EzBioSDK.isUserEnrolled(userId, Constants.ENROLL_FACE_ONLY);
            logger.info("isEnrolled : " + isEnrolledAlready);
            if (isEnrolledAlready) {
                EzBioSDK.deleteUser(userId, Constants.ENROLL_FACE_ONLY, new EzBioSDK.DeleteUICallback() {
                    @Override
                    public void updateUI(Exception e) {
                        logger.info("deleteUser status: " + e);
                        if (e == null) {
                            logger.info("deleteUser successful++++");
                            //deletion successful
                            doCustomEnrollment();
                        } else {
                            //deletion unsuccessful
                            logger.info("deleteUser unsuccessful++++++");
                            WritableNativeMap writableMap = new WritableNativeMap();
                            writableMap.putString("error", "deleteUser unsuccessful");
                            singleCallback.invoke(writableMap, null);
                        }
                    }
                });
            } else {
                //New User
                logger.info("EzBioModule new user+++");
                doCustomEnrollment();
            }
        } catch (Exception ex) {
            logger.info(">> Exception startSelfie::: " + ex.getMessage());
        }
    }

    @ReactMethod
    public void verifySelfieWithDoc(ReadableMap map, Callback callback) {
        logger.info("EzBioModule verifySelfieWithDoc+++");
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            return;
        }
        singleCallback = callback;

        progressDialog = new ProgressDialog(currentActivity);
        progressDialog.setMessage("Please wait. Verification in progress...");
        progressDialog.show();

        String userID = map.getString("userID");
        String frrValueString = map.getString("frrValue");
        String securityLevelString = map.getString("securityLevel");
        String type = map.getString("type");
        boolean isDeleteUser = map.getBoolean("isDeleteUser");

        float frrValue = Float.parseFloat(frrValueString);
        if (frrValue >= 0.0006 && frrValue <= 0.0008) {
            frrValue = 0.20f;
        }
        int securityLevel = Integer.parseInt(securityLevelString);


        logger.info("EzBioModule verifySelfieWithDoc type:" + type);
        logger.info("EzBioModule verifySelfieWithDoc userID:" + userID);
        logger.info("EzBioModule verifySelfieWithDoc frrValue:" + frrValue);
        logger.info("EzBioModule verifySelfieWithDoc securityLevel:" + securityLevelString);
        logger.info("EzBioModule verifySelfieWithDoc isDeleteUser:" + isDeleteUser);

        String base64Image = null;
        try {
            if (type.equals("primary")) {
                //color
                base64Image = retrieveFromSharedPref("result", "color");
            } else if (type.equals("secondary")) {
                //mono
                base64Image = retrieveFromSharedPref("result", "mono");
            } else if (type.equals("hologram")) {
                //face_From_hologram
                base64Image = retrieveFromSharedPref("result", "face_from_hologramImage");
            }

            EzBioSDK.ImageVerifierCallback imageVerifierCallback = new EzBioSDK.ImageVerifierCallback() {
                @Override
                public void OnImageVerificationDone(boolean b, String s) {
                    logger.info("OnImageVerificationDonezz b: " + b);
                    logger.info("OnImageVerificationDonezz s: " + s);
                    WritableNativeMap writableNativeMap = new WritableNativeMap();
                    if (b) {
                        //Success
                        writableNativeMap.putString("status", "success");
                        writableNativeMap.putString("details", s);
                        //Toast.makeText(getCurrentActivity(), "Verification Success for " + type, Toast.LENGTH_LONG).show();
                        singleCallback.invoke(null, writableNativeMap);
                    } else {
                        //failure
                        //Toast.makeText(getCurrentActivity(), "Verification Failure for " + type, Toast.LENGTH_LONG).show();
                        writableNativeMap.putString("status", "failure");
                        writableNativeMap.putString("details", s);
                        singleCallback.invoke(null, writableNativeMap);
                    }
                    try {
                        // JSONObject messageJson = new JSONObject(s); // parse the JSON string

                        // String predictionValue = messageJson.getString("predictionValue");
                        // String returnMessage = messageJson.getString("returnMessage");
                        // String userId = messageJson.getString("userId");
                        // String resultCode = messageJson.getString("resultCode");
                        
                        if (isDeleteUser) {
                            logger.info("isDeleteUser : " + isDeleteUser);
                            EzBioSDK.deleteUser(userID, Constants.ENROLL_FACE_ONLY, new EzBioSDK.DeleteUICallback() {
                                @Override
                                public void updateUI(Exception e) {
                                    if (e == null) {
                                        logger.info("deleteUser successful++++");
                                        //deletion successful
                                    } else {
                                        //deletion unsuccessful
                                        logger.info("deleteUser unsuccessful++++++" + e.getMessage());
                                    }
                                }
                            });
                        }
                    } catch (Exception e) {
                        logger.info("Exception deleteUser: " + e.toString());
                        progressDialog.dismiss();
                    }
                    progressDialog.dismiss();
                }
            };
            EzBioSDK.verifyEnrollmentWithImageFRR(imageVerifierCallback, userID, base64Image, false, "image/jpeg", securityLevel, frrValue);
        } catch (Exception e) {
            logger.info("Exception doVerifyWithDoc: " + e.toString());
            progressDialog.dismiss();
        }
    }

    private void doCustomEnrollment() {
        try {
            logger.info("doCustomEnrollment+++");

            EzBioSDK.setLoggingEnabled(true);
            Intent intent1 = new Intent(reactContext, ReactNativeEzbioActivity.class);

            intent1.putExtra(Constants.USER_ID, userId);
            intent1.putExtra("selfieDescription", selfieDescription);
            intent1.putExtra(Constants.ENROLLMENT_TYPE, Constants.ENROLL_FACE_ONLY);
            intent1.putExtra(Constants.CAMERA_VIEW_ID,  reactContext.getResources().getIdentifier("camera_view", "id", reactContext.getPackageName()));
            intent1.putExtra(Constants.STRICTNESS_LEVEL,1);
            intent1.putExtra(Constants.USE_LIVENESS,true);
            //load enrollment timeout from prefs
            int timeOut = 30;
            intent1.putExtra(Constants.ENROLL_TIMEOUT, timeOut * 1000);
            Activity currentActivity1 = getReactApplicationContext().getCurrentActivity();
            currentActivity1.startActivityForResult(intent1, ENROLLMENT_REQUEST_CODE);
        } catch (Exception e) {
            logger.info("Exception doEnrollment: " + e.toString());
        }
    }

    private final ActivityEventListener mActivityEventListener1 = new BaseActivityEventListener() {

        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
            if (requestCode == ENROLLMENT_REQUEST_CODE) {
                logger.info("EZBioModule onActivityResult requestCode:" + requestCode);
                logger.info("EZBioModule onActivityResult resultCode:" + resultCode);
                if (resultCode == Activity.RESULT_CANCELED) {
                    singleCallback.invoke(true, null);
                } else if (resultCode == Activity.RESULT_OK) {
                    int status = intent.getIntExtra("status", 1);
                    String msg = intent.getStringExtra("msg");
                    String imageData = retrieveFromSharedPref("result", "selfieImg");
                    logger.info("EZBioModule ActivityEventListener status::" + status);
                    WritableNativeMap writableNativeMap = new WritableNativeMap();
                    writableNativeMap.putInt("status", status);
                    writableNativeMap.putString("message", msg);
                    writableNativeMap.putString("images", imageData);
                    singleCallback.invoke(null, writableNativeMap);
                } else {
                    logger.info("EZBioModule ActivityEventListener else");
                    singleCallback.invoke(true, null);
                }
            }
        }
    };

    private String retrieveFromSharedPref(String prefName, String key) {
        logger.info("retrieveFromSharedPref+++ prefName: " + prefName + ":::key : " + key);
        SharedPreferences prefs = getCurrentActivity().getSharedPreferences(prefName, MODE_PRIVATE);
        return prefs.getString(key, "");
    }

    @ReactMethod
    public void screenshotDisable(boolean isEnable, Callback callback) {
        logger.info("screenshotDisable ++++++" + isEnable);
        singleCallback = callback;
        final Activity activity = getCurrentActivity();
        if (activity != null) {
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (isEnable) {
                        activity.getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
                    } else {
                        activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
                    }
                    singleCallback.invoke(null, true);
                }
            });
        }
    }

}
