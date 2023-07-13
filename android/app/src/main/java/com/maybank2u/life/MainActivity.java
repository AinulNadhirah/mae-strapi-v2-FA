package com.maybank2u.life;

import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.modules.network.OkHttpClientProvider;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;
import com.facebook.react.ReactActivity;
import com.zoontek.rnbootsplash.RNBootSplash;

import android.os.Bundle; // Import this.
import android.view.WindowManager;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.util.Log;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class MainActivity extends ReactActivity {
    private static String CERTIFICATE_SHA1;

    private static String calcSHA1(byte[] signature) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA1");
        digest.update(signature);
        byte[] signatureHash = digest.digest();
        return bytesToHex(signatureHash);
    }

    public static String bytesToHex(byte[] bytes) {
        final char[] hexArray = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'};
        char[] hexChars = new char[bytes.length * 2];
        int v;
        for (int j = 0; j < bytes.length; j++) {
            v = bytes[j] & 0xFF;
            hexChars[j * 2] = hexArray[v >>> 4];
            hexChars[j * 2 + 1] = hexArray[v & 0x0F];
        }
        return new String(hexChars);
    }

    public static boolean validateAppSignature(Context context) {
        try {
            // get the signature form the package manager
            PackageInfo packageInfo = context.getPackageManager().getPackageInfo(context.getPackageName(), PackageManager.GET_SIGNATURES);
            Signature[] appSignatures = packageInfo.signatures;
            // this sample only checks the first certificate
            for (Signature signature : appSignatures) {
                byte[] signatureBytes = signature.toByteArray();
                // calc sha1 in hex
                String currentSignature = calcSHA1(signatureBytes);
                // compare signatures
                Log.i("ValidateSigningCertificate", "Signature is " + currentSignature + " (" + CERTIFICATE_SHA1 + ")");
                return CERTIFICATE_SHA1.equalsIgnoreCase(currentSignature);
            }
        } catch (Exception e) { // if error assume failed to validate
            return false;
        }

        return false;
    }

    /**
     * Returns the name of the main component registered from JavaScript. This is
     * used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "M2ULife";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactRootView createRootView() {
                return new RNGestureHandlerEnabledRootView(MainActivity.this);
            }
        };
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        CERTIFICATE_SHA1 = getString(R.string.CERTIFICATE_SHA1);
        if (!BuildConfig.DEBUG && !validateAppSignature(getApplicationContext())) {
            //Signature is bad.
            finish();
        } else {
            //Signature is valid.
            // SplashScreen.show(this, R.style.SplashScreenTheme);
            RNBootSplash.init(R.drawable.background_splash, MainActivity.this);
            super.onCreate(null);
            if (BuildConfig.SSLPINNING_ENABLE == "true")
                OkHttpClientProvider.setOkHttpClientFactory(new OkHttpCertPin());
            getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_HIDDEN);
            // Stopping testers to take screenshot. WIll uncomment it later
            // getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);// snap shot and screen shot
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
    }

    @Override
    protected void onPause() {
        super.onPause();
        //show screen blank in recent apps list
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE);
    }
}
