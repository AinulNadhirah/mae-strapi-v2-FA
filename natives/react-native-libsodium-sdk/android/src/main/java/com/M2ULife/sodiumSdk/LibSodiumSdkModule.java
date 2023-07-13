package com.M2ULife.sodiumSdk;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.uimanager.IllegalViewOperationException;

import static org.libsodium.jni.NaCl.sodium;

import org.libsodium.jni.SodiumConstants;

import static org.libsodium.jni.SodiumConstants.ZERO_BYTES;
import static org.libsodium.jni.crypto.Util.prependZeros;
import static org.libsodium.jni.crypto.Util.removeZeros;

import org.json.JSONException;
import org.json.JSONObject;

import android.util.Base64;
import android.util.Log;

public class LibSodiumSdkModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "ReactNativeLibsodiumSdk";
    private static ReactApplicationContext reactContext = null;

    public LibSodiumSdkModule(ReactApplicationContext context) {
        super(context);

        reactContext = context;
    }

    @Override
    public String getName() {
        // Tell React the name of the module
        // https://facebook.github.io/react-native/docs/native-modules-android.html#the-toast-module
        return REACT_CLASS;
    }

    @ReactMethod
    public void initKey(Callback callback) {
        byte[] PublicKey = new byte[SodiumConstants.PUBLICKEY_BYTES];
        byte[] SecretKey = new byte[SodiumConstants.SECRETKEY_BYTES];
        sodium().crypto_box_curve25519xsalsa20poly1305_keypair(PublicKey,
                SecretKey);
        byte[] Nonce = new byte[SodiumConstants.XSALSA20_POLY1305_SECRETBOX_NONCEBYTES];
        sodium().randombytes(Nonce, Nonce.length);

        JSONObject json = new JSONObject();
        try {
            json.put("pk",Base64.encodeToString(PublicKey, Base64.NO_WRAP));
            json.put("sk",Base64.encodeToString(SecretKey, Base64.NO_WRAP));
        } catch (JSONException e) {
            e.printStackTrace();
        }

        try {
            Log.d("successCallback", json.toString());

            callback.invoke(null, json.toString());
        } catch (IllegalViewOperationException e) {
            callback.invoke(e.getMessage(), null);

        }
    }

    @ReactMethod
    public void encryptAndAuthenticate(ReadableArray params, Callback callback) {
        if (params.size() < 1) {
            callback.invoke("Missing params", null);
            return;
        }

        String messageStr = params.getString(0);
        String serverPkStr = params.getString(1);
        String secretKeyStr = params.getString(2);

        try {
            byte[] message = messageStr.getBytes(); // convert message
            // string to byte
            // array
            message = prependZeros(ZERO_BYTES, message); // mandatory
            int messageLen = message.length;
            byte[] ServerPublicKey = Base64.decode(serverPkStr,
                    Base64.NO_WRAP);
            byte[] SecretKey = Base64.decode(secretKeyStr, Base64.NO_WRAP);
            byte[] Nonce = new byte[SodiumConstants.XSALSA20_POLY1305_SECRETBOX_NONCEBYTES];
            sodium().randombytes(Nonce, Nonce.length);

            // ** ciphertext initilaize
            byte[] ClientCt = new byte[message.length];
            int CtLen = ClientCt.length;

            if (sodium().crypto_box_curve25519xsalsa20poly1305(ClientCt,
                    message, messageLen, Nonce, ServerPublicKey, SecretKey) != 0) {
                callback.invoke("Failed", null);
            } else {
                WritableMap json = new WritableNativeMap();

                json.putString("ct", Base64.encodeToString(ClientCt, Base64.NO_WRAP));
                json.putString("nonce", Base64.encodeToString(Nonce, Base64.NO_WRAP));

                callback.invoke(null, json);
            }

        } catch (IllegalViewOperationException e) {
            callback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void decryptAndVerify(ReadableArray params, Callback callback) {
        if (params.size() < 1) {
            callback.invoke("Missing params", null);
            return;
        }

        String serverCipherStr = params.getString(0);
        String serverPkStr = params.getString(1);
        String serverNonceStr = params.getString(2);
        String mySkStr = params.getString(3);

        try {
            byte[] serverCipher = Base64.decode(serverCipherStr,
                    Base64.NO_WRAP);
            byte[] serverPk = Base64.decode(serverPkStr, Base64.NO_WRAP);

            Log.d("serverPkStr", serverPkStr);
            Log.d("serverPk byte ",""+ serverPk);
            byte[] serverNonce = Base64.decode(serverNonceStr,
                    Base64.NO_WRAP);
            byte[] mySk = Base64.decode(mySkStr, Base64.NO_WRAP);

            /* initilize unsigned message */
            byte[] unsigned_message = new byte[serverCipher.length]; // plain
            // text
            int ret = sodium().crypto_box_curve25519xsalsa20poly1305_open(
                    unsigned_message, serverCipher, unsigned_message.length,
                    serverNonce, serverPk, mySk);

            if (ret == 0) {
                unsigned_message = removeZeros(ZERO_BYTES, unsigned_message);
                String plainText = new String(unsigned_message);
                WritableMap json = new WritableNativeMap();
                json.putString("plainText", plainText);
                callback.invoke(null, json);
            } else {
                callback.invoke("Failed", null);
            }

        } catch (IllegalViewOperationException e) {
            callback.invoke(e.getMessage(), null);
        }
    }
}
