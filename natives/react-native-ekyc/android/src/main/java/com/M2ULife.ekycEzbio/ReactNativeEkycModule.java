package com.M2ULife.ekycEzbio;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.Toast;

import androidx.annotation.Nullable;

import com.DocumentCapture.NativeDocumentCapture;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.logging.Logger;

import static android.content.Context.MODE_PRIVATE;

public class ReactNativeEkycModule extends ReactContextBaseJavaModule {
    private Logger logger = Logger.getLogger("maybank: ReactNativeEkycModule");

    public static final String REACT_CLASS = "ReactNativeEkyc";
    private static ReactApplicationContext reactContext = null;
    private static final int SCAN_REQUEST_CODE = 12345;
    private Callback singleCallback;

    private String idType = "";

    public ReactNativeEkycModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        // Add the listener for `onActivityResult`
        reactContext.addActivityEventListener(mActivityEventListener);
    }

    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {

        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
            super.onActivityResult(activity, requestCode, resultCode, intent);
            WritableNativeMap writableMap = new WritableNativeMap();
            try {
                logger.info("eKYCModule Inside Activity Result");
                logger.info("eKYCModule requestCode : " + requestCode);
                logger.info("eKYCModule resultCode : " + resultCode);
                if (requestCode == SCAN_REQUEST_CODE) {
                    if (resultCode == Activity.RESULT_CANCELED) {
                        logger.info("Scan request was cancelled" + requestCode);
                        writableMap.putString("error", "Scan request was cancelled");
                        singleCallback.invoke(writableMap, null);
                    } else if (resultCode == Activity.RESULT_OK) {
                        logger.info("Result OK");
                        if (null != intent) {
                            logger.info("Intent Not Null");
                            String prefName = "result";
                            String status = intent.getStringExtra("status");
                            String action = intent.hasExtra("action") ? intent.getStringExtra("action") : "";
                            writableMap.putString("status", action);

                            if (status.equals("FAIL") && !action.isEmpty()) {
                                writableMap.putString("result", action); //RESULT SHARED PREF
                                singleCallback.invoke(null, writableMap);
                            } else {
                                WritableArray imagesJsonArray = new WritableNativeArray();
                                WritableMap imageFrontNativeMap = new WritableNativeMap();
                                imageFrontNativeMap.putString("img0", retrieveFromSharedPref(prefName, "img1"));
                                imagesJsonArray.pushMap(imageFrontNativeMap);

                                logger.info("idType: " + idType);

                                //back image and Hologram images only for myKAD
                                if ("MYS_MYKAD".equalsIgnoreCase(idType)) {
                                    WritableMap imageBackNativeMap = new WritableNativeMap();
                                    imageBackNativeMap.putString("img1", retrieveFromSharedPref(prefName, "img2"));
                                    imagesJsonArray.pushMap(imageBackNativeMap);

                                    //add hologram images
                                /*String faceHologramImage = retrieveFromSharedPref(prefName, "face_from_hologramImage");
                                JSONObject faceHologramJSONObject = new JSONObject();
                                faceHologramJSONObject.put("img0", faceHologramImage);
                                HologramJsonArray.put(faceHologramJSONObject);

                                String holo_image_0 = retrieveFromSharedPref(prefName, "holo_image_0");
                                String holo_image_1 = retrieveFromSharedPref(prefName, "holo_image_1");
                                String holo_image_2 = retrieveFromSharedPref(prefName, "holo_image_2");

                                JSONObject holoImage0JSONObject = new JSONObject();
                                holoImage0JSONObject.put("img1", holo_image_0);
                                HologramJsonArray.put(holoImage0JSONObject);

                                //add these also if not empty
                                if (!holo_image_1.isEmpty()) {
                                    JSONObject holoImage1JSONObject = new JSONObject();
                                    holoImage1JSONObject.put("img2", holo_image_1);
                                    HologramJsonArray.put(holoImage1JSONObject);
                                }

                                if (!holo_image_2.isEmpty()) {
                                    JSONObject holoImage2JSONObject = new JSONObject();
                                    holoImage2JSONObject.put("img3", holo_image_2);
                                    HologramJsonArray.put(holoImage2JSONObject);
                                }*/
                                }

                                writableMap.putString("result", retrieveFromSharedPref(prefName, "result")); //RESULT SHARED PREF
                                writableMap.putString("ocrReqPayload", retrieveFromSharedPref(prefName, "ocrReqPayload")); //ocrReqPayload
                                //json.put("hologramImages", HologramJsonArray); // EMPTY FOR PASSPORT
                                writableMap.putArray("images", imagesJsonArray); //img1 FOR PASSPORT
                                singleCallback.invoke(null, writableMap);
                            }
                        } else {
                            logger.info("Intent is Null. Failed to capture data");
                            writableMap.putString("error", "Failed to capture data");
                            singleCallback.invoke(writableMap, null);
                        }
                        return;
                    }
                }
            } catch (Exception ex) {
                logger.info("Exception ex: "+ ex.toString());
                writableMap.putString("error", "An error occurred during initiating scan.");
            }

        }
    };

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void startKYC(ReadableMap readableMap, Callback callback) {
        logger.info("startKYC+++++");
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            return;
        }
        singleCallback = callback;
        deleteResultSharedPref();
        startActivityFromMainThread(readableMap);
    }

    private static void emitDeviceEvent(String eventName, @Nullable WritableMap eventData) {
        // A method for emitting from the native side to JS
        // https://facebook.github.io/react-native/docs/native-modules-android.html#sending-events-to-javascript
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, eventData);
    }


    public void startActivityFromMainThread(ReadableMap readableMap) {
        //String ocrJson, String idType, String sessionID, String licenseKey

        String docReq = (readableMap.hasKey("docReq")) ? readableMap.getString("docReq") : null;
        idType = (readableMap.hasKey("docType")) ? readableMap.getString("docType") : null; // MyKad //Passport
        String sessionID = (readableMap.hasKey("sessionID")) ? readableMap.getString("sessionID") : null;
        String licenseKey = (readableMap.hasKey("licenseKey")) ? readableMap.getString("licenseKey") : "";
        String devEnable = (readableMap.hasKey("devEnable")) ? readableMap.getString("devEnable") : "";

        docReq = docReq.trim();
        sessionID = sessionID.trim();
        idType = idType.trim();

        ReadableMap displayTextReadableMap = readableMap.getMap("displayText");
        String scanIntroTitle = (displayTextReadableMap.hasKey("scanIntroTitle")) ? displayTextReadableMap.getString("scanIntroTitle") : null;
        String scanIntroDesc = (displayTextReadableMap.hasKey("scanIntroDesc")) ? displayTextReadableMap.getString("scanIntroDesc") : null;
        String scanStartTitle = (displayTextReadableMap.hasKey("scanStartTitle")) ? displayTextReadableMap.getString("scanStartTitle") : null;
        String scanStartDesc = (displayTextReadableMap.hasKey("scanStartDesc")) ? displayTextReadableMap.getString("scanStartDesc") : null;
        String scanFrontTitle = (displayTextReadableMap.hasKey("scanFrontTitle")) ? displayTextReadableMap.getString("scanFrontTitle") : null;
        String scanFrontDesc = (displayTextReadableMap.hasKey("scanFrontDesc")) ? displayTextReadableMap.getString("scanFrontDesc") : null;
        String scanBackTitle = (displayTextReadableMap.hasKey("scanBackTitle")) ? displayTextReadableMap.getString("scanBackTitle") : null;
        String scanBackDesc = (displayTextReadableMap.hasKey("scanBackDesc")) ? displayTextReadableMap.getString("scanBackDesc") : null;
        String passportScanDesc = (displayTextReadableMap.hasKey("passportScanDesc")) ? displayTextReadableMap.getString("passportScanDesc") : null;
        logger.info("startActivityFromMainThread idType::" + idType);

        String lookupData = (readableMap.hasKey("lookupData")) ? readableMap.getString("lookupData") : null;

        Intent intent = new Intent(reactContext, ReactNativeEkycActivity.class);
        intent.putExtra("Document", docReq);
        intent.putExtra("idType", idType);
        intent.putExtra("sessionID", sessionID);
        intent.putExtra("licenseKey", licenseKey);
        intent.putExtra("lookupData", lookupData);
        intent.putExtra("scanIntroTitle", scanIntroTitle);
        intent.putExtra("scanIntroDesc", scanIntroDesc);
        intent.putExtra("scanStartTitle", scanStartTitle);
        intent.putExtra("scanStartDesc", scanStartDesc);
        intent.putExtra("scanFrontTitle", scanFrontTitle);
        intent.putExtra("scanFrontDesc", scanFrontDesc);
        intent.putExtra("scanBackTitle", scanBackTitle);
        intent.putExtra("scanBackDesc", scanBackDesc);
        intent.putExtra("passportScanDesc", passportScanDesc);
		intent.putExtra("devEnable", devEnable);

        logger.info("Starting Activity for Results");
        Activity currentActivity = getReactApplicationContext().getCurrentActivity();
        currentActivity.startActivityForResult(intent, SCAN_REQUEST_CODE);
    }

    private String retrieveFromSharedPref(String prefName, String key) {
        logger.info("retrieveFromSharedPref+++ prefName: " + prefName + ":::key : " + key);
        Activity currentActivity = getReactApplicationContext().getCurrentActivity();
        SharedPreferences prefs = currentActivity.getSharedPreferences(prefName, MODE_PRIVATE);
        return prefs.getString(key, "");
    }

    private void deleteResultSharedPref() {
        logger.info("deleteResultSharedPref++++");
        SharedPreferences.Editor editor = getCurrentActivity().getSharedPreferences("result", MODE_PRIVATE).edit();
        editor.clear();
        editor.commit();
    }
}
