package com.M2ULife.rsaSdk;

import android.app.Activity;
import android.provider.Settings;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.rsa.mobilesdk.sdk.MobileAPI;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.logging.Logger;

public class RsaSdkModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "RsaSdk";
    private static ReactApplicationContext reactContext = null;
    private MobileAPI mobileAPI = null;
    private JSONObject mJDeviceInfo = null;

    private Logger logger = Logger.getLogger("RsaSdkModule");

    public RsaSdkModule(ReactApplicationContext context) {
    // Pass in the context to the constructor and save it so you can emit events
    // https://facebook.github.io/react-native/docs/native-modules-android.html#the-toast-module
        super(context);

        reactContext = context;
    }

    @Override
    public String getName() {
    // Tell React the name of the module
    // https://facebook.github.io/react-native/docs/native-modules-android.html#the-toast-module
        return REACT_CLASS;
    }

    @Override
    public Map<String, Object> getConstants() {
    // Export any constants to be used in your native module
    // https://facebook.github.io/react-native/docs/native-modules-android.html#the-toast-module
        final Map<String, Object> constants = new HashMap<>();
        constants.put("EXAMPLE_CONSTANT", "example");

        return constants;
    }

    @ReactMethod
    public void getRSAMobileSDK(Callback callback) {
        final Activity activity = getCurrentActivity();
        try {
            mobileAPI = MobileAPI.getInstance(activity);
            mobileAPI.destroy();
            Properties properties = new Properties();
            properties.setProperty("Configuration-key", "2");
            mobileAPI.initSDK(properties);
            String deviceInfoStr = mobileAPI.collectInfo();
            JSONObject obj = new JSONObject();
            obj.put("success", "true");
            obj.put("result", deviceInfoStr);
            callback.invoke(null, obj.toString());
        } catch (Exception e) {
            callback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void getUuid(Callback callback) {
        try {
            String uuid = null;

            uuid = Settings.Secure.getString(reactContext.getContentResolver(), Settings.Secure.ANDROID_ID);
            callback.invoke(null, uuid);
        } catch (Exception e) {
            callback.invoke(e.getMessage(), null);
        }
    }
}