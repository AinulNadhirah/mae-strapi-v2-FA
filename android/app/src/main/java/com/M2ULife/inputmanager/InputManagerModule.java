package com.M2ULife.inputmanager;

import androidx.annotation.Nullable;
import android.content.pm.ApplicationInfo;
import android.provider.Settings;
import android.view.inputmethod.InputMethodInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.Toast;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.Callback;
import com.maybank2u.life.R;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

public class InputManagerModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "InputManager";
    private static ReactApplicationContext reactContext = null;

    public InputManagerModule(ReactApplicationContext context) {
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
    public void exampleMethod () {
        // An example native method that you will expose to React
        // https://facebook.github.io/react-native/docs/native-modules-android.html#the-toast-module
    }

    private static void emitDeviceEvent(String eventName, @Nullable WritableMap eventData) {
        // A method for emitting from the native side to JS
        // https://facebook.github.io/react-native/docs/native-modules-android.html#sending-events-to-javascript
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, eventData);
    }

    @ReactMethod
    public void isUsingCustomKeyboard(Callback callback){
        InputMethodManager imm = (InputMethodManager) reactContext.getSystemService(ReactApplicationContext.INPUT_METHOD_SERVICE);
        boolean isCustomKeyboard = false;
        String packageName = null;
        String[] supportedCustomKeyboards;
        supportedCustomKeyboards = reactContext.getResources().getStringArray(R.array.supported_custom_keyboards);

        List<InputMethodInfo> mInputMethodProperties = imm.getEnabledInputMethodList();
        for (InputMethodInfo inputMethod : mInputMethodProperties) {
             packageName = inputMethod.getPackageName();
                if (inputMethod.getId().equals(Settings.Secure.getString(reactContext.getContentResolver(),Settings.Secure.DEFAULT_INPUT_METHOD))) {
                    //If Current keyboard is under support keyboard list marks as non custom Keyboard
                    if (Arrays.asList(supportedCustomKeyboards).contains(packageName)) {
                        isCustomKeyboard =  false;
                    }else{
                        //If Current keyboard not in support keyboard list and does not match with system keybord marks as custom Keyboard
                        if ((inputMethod.getServiceInfo().applicationInfo.flags & ApplicationInfo.FLAG_SYSTEM) == 0) {
                            isCustomKeyboard =  true;
                        }
                    }
                }
        }
        callback.invoke(isCustomKeyboard);
    }
}
