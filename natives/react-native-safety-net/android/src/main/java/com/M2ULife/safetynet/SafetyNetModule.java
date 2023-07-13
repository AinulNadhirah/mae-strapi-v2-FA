package com.M2ULife.safetynet;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.LifecycleEventListener;

import com.google.android.gms.safetynet.SafetyNet;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.logging.Logger;

import android.app.Activity;
import android.view.WindowManager;
import android.content.BroadcastReceiver;
import android.widget.Toast;
import android.content.Intent;

import android.app.DownloadManager;
import android.app.DownloadManager.Query;
import android.app.DownloadManager.Request;
import android.content.Context;
import android.net.Uri;
import android.os.Environment;
import java.io.File;
import android.content.IntentFilter;
import android.database.Cursor;


import static android.content.Context.DOWNLOAD_SERVICE;
import static com.M2ULife.safetynet.SafetyNetResponse.parseJsonWebSignature;


public class SafetyNetModule extends ReactContextBaseJavaModule implements LifecycleEventListener{
    public static final String REACT_CLASS = "ReactNativeSafetyNet";

    private Logger logger = Logger.getLogger("RSAReactNativeModule");
    private final String PART_1 = "AIzaSyD";
    private final String PART_2 = "xZscaEFJay5m";
    private final String PART_3 = "IhYA91rByon";
    private final String PART_4 = "uVF_Te4lU";
    private final ReactApplicationContext reactContext;

    private Callback singleCallback;
    public DownloadManager downloadManager;
    public long downloadID;
    public static final String EVENT_ACTION = "android.intent.action.DOWNLOAD_COMPLETE";

    private String downloadSuccessMsg = "Download completed";
    private String downloadFailedMsg = "Download failed";


    public SafetyNetModule(ReactApplicationContext context) {
        super(context);

        this.reactContext = context;
        reactContext.addLifecycleEventListener(this);
        reactContext.registerReceiver(onDownloadComplete,new IntentFilter(EVENT_ACTION));    
    }

    @Override
    public String getName() {
        // Tell React the name of the module
        // https://facebook.github.io/react-native/docs/native-modules-android.html#the-toast-module
        return REACT_CLASS;
    }

    @ReactMethod
    public void getSafetyNetAttestationToken(String nonce, Callback errorCallback, Callback successCallback) {
        try {
            SafetyNet.getClient(reactContext).attest(nonce.getBytes(), PART_1 +
            PART_2 + PART_3 + PART_4)
                    .addOnSuccessListener(reactContext.getCurrentActivity(),
                            response -> {
                                /* Success - SafetNet Attestation */
                                final SafetyNetResponse safetyNetResponse = parseJsonWebSignature(response.getJwsResult());

                                logger.info("response: " + response.getJwsResult());
                                WritableNativeMap writableNativeMap = new WritableNativeMap();
                                writableNativeMap.putString("JW_TOKEN", response.getJwsResult());

                                WritableNativeMap dWritableNativeMap = new WritableNativeMap();
                                dWritableNativeMap.putString("nonce",safetyNetResponse.getNonce());
                                dWritableNativeMap.putString("timestampMs",""+safetyNetResponse.getTimestampMs());
                                dWritableNativeMap.putString("apkPackageName",safetyNetResponse.getApkPackageName());
                                dWritableNativeMap.putBoolean("basicIntegrity",safetyNetResponse.isBasicIntegrity());
                                dWritableNativeMap.putBoolean("ctsProfileMatch",safetyNetResponse.isCtsProfileMatch());

                                writableNativeMap.putMap("decryptString",dWritableNativeMap);

                                successCallback.invoke(writableNativeMap);
                            })
                    .addOnFailureListener(reactContext.getCurrentActivity(), e -> {
                        logger.info("SafetyNet failed:\n" + e.getMessage());
                        logger.info("failed " + e.getMessage());
                        errorCallback.invoke();
                    });
        } catch (Exception e) {
            errorCallback.invoke(e.getMessage());
        }
    }

    private byte[] getRequestNonce() {
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        byte[] bytes = new byte[16];
        try {
            byteStream.write(bytes);
        } catch (IOException e) {
            return null;
        }

        return byteStream.toByteArray();
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

    @ReactMethod
    public void downloadManagerFromURL(ReadableMap requestConfig, Callback callback) {
        logger.info("downloadManagerFromURL ++++++");
        singleCallback = callback;
        WritableNativeMap writableNativeMap = new WritableNativeMap();

        try {
            String downloadTitle = (requestConfig.hasKey("downloadTitle")) ? requestConfig.getString("downloadTitle") : "Download...";
            String downloadDescription = (requestConfig.hasKey("downloadDescription")) ? requestConfig.getString("downloadDescription") : "Downloading file...";
            String filename = (requestConfig.hasKey("filename")) ? requestConfig.getString("filename") : null;

            String folderName = (requestConfig.hasKey("folderName")) ? requestConfig.getString("folderName") : "";
            Boolean showInDownloads = (requestConfig.hasKey("showInDownloads")) ? requestConfig.getBoolean("showInDownloads") : true;

            String url = (requestConfig.hasKey("url")) ? requestConfig.getString("url") : "";
            String directory = (requestConfig.hasKey("directory")) ? requestConfig.getString("directory") : "";
            String downloadSuccessMsg1 = (requestConfig.hasKey("downloadSuccessMsg")) ? requestConfig.getString("downloadSuccessMsg") : "";
            String downloadFailedMsg1 = (requestConfig.hasKey("downloadFailedMsg")) ? requestConfig.getString("downloadFailedMsg") : "";

            //  "Download" | "Documents" | "Pictures"
            if (directory.equals(Environment.DIRECTORY_PICTURES))
                directory = Environment.DIRECTORY_PICTURES;
            else if (directory.equals(Environment.DIRECTORY_DOCUMENTS))
                directory = Environment.DIRECTORY_DOCUMENTS;
            else
                directory = Environment.DIRECTORY_DOWNLOADS; // default

            if (folderName != null && folderName.trim().length() > 0) {
                folderName = folderName + "/";
            } else {
                folderName = "";
            }

           
            if (downloadSuccessMsg1 != null && downloadSuccessMsg1.trim().length() > 0)
                downloadSuccessMsg = downloadSuccessMsg1;

            if (downloadFailedMsg1 != null && downloadFailedMsg1.trim().length() > 0)
                downloadFailedMsg = downloadFailedMsg1;

            logger.info("url:" + url);
            logger.info("downloadTitle:" + downloadTitle);
            logger.info("downloadDescription:" + downloadDescription);
            logger.info("filename:" + filename);
            logger.info("directory:" + directory);
            logger.info("folderName:" + folderName);
            logger.info("showInDownloads:" + showInDownloads);
            logger.info("downloadSuccessMsg:" + downloadSuccessMsg);
            logger.info("downloadFailedMsg:" + downloadFailedMsg);

            Uri uri = Uri.parse(url);

            if (uri == null) {
                writableNativeMap.putString("referenceID", null);
                singleCallback.invoke(writableNativeMap, null);
                return;
            }
            String scheme = uri.getScheme();
            if (scheme == null || (!scheme.equals("http") && !scheme.equals("https"))) {
                writableNativeMap.putString("referenceID", null);
                singleCallback.invoke(writableNativeMap, null);
                return;
            }

            File file = new File(Environment.getExternalStoragePublicDirectory(directory).getPath() + "/" + folderName + filename);

            DownloadManager.Request request = new DownloadManager.Request(uri)
                    .setTitle(downloadTitle)
                    .setDescription(downloadDescription)
                    .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE)
                    .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    .setDestinationUri(Uri.fromFile(file))
                    .setAllowedOverMetered(true)
                    .setAllowedOverRoaming(true)
                    .setVisibleInDownloadsUi(showInDownloads);
            downloadManager = (DownloadManager) reactContext.getSystemService(DOWNLOAD_SERVICE);
            downloadID = downloadManager.enqueue(request);

            writableNativeMap.putString("referenceID", String.valueOf(downloadID));
            singleCallback.invoke(null, writableNativeMap);
        } catch (Exception e) {
            writableNativeMap.putString("referenceID", null);
            singleCallback.invoke(writableNativeMap, null);
        }
    }

     private BroadcastReceiver onDownloadComplete = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            //Fetching the download id received with the broadcast
            long id = intent.getLongExtra("extra_download_id", -1);
            logger.info("onDownloadComplete onReceive:" + id);
            //Checking if the received broadcast is for our enqueued download by matching download id
            if (downloadID == id) {
                final Activity activity = getCurrentActivity();
                if (activity != null) {
                    activity.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            boolean isSuccess = isDownloadSuccess(downloadID);
                            String msg = isSuccess ? downloadSuccessMsg : downloadFailedMsg;
                            Toast.makeText(activity, msg, Toast.LENGTH_LONG).show();
                            downloadID = 0;
                        }
                    });
                }
            }
        }
    };

    private boolean isDownloadSuccess(long downloadId) {
        logger.info("Checking download status for id: " + downloadId);
        // Verify if download is a success
    try {
        Cursor c = downloadManager.query(new DownloadManager.Query().setFilterById(downloadId));
        if (c != null && c.moveToFirst()) {
            int status = c.getInt(c.getColumnIndex(DownloadManager.COLUMN_STATUS));
            if (status == DownloadManager.STATUS_SUCCESSFUL) {
                return true; //Download is successful
            } else {
                int reason = c.getInt(c.getColumnIndex(DownloadManager.COLUMN_REASON));
                logger.info("Download not correct, status [" + status + "] reason [" + reason + "]");
                return false;
            }
         }
        } catch (Exception e) {
            logger.info("Exception ++++ ");
        }
        return false;
    }

    @Override
    public void onHostResume() {
        logger.info("onHostResume ++++++");
    }

    @Override

    public void onHostPause() {
        logger.info("onHostPause ++++++");
    }

    @Override
    public void onHostDestroy() {
        logger.info("onHostDestroy ++++++");
        reactContext.unregisterReceiver(onDownloadComplete);
    }
}
