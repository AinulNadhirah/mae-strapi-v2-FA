package com.M2ULife.ekycEzbio;

import android.content.ContextWrapper;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Point;
import android.os.Bundle;
import android.os.Environment;
import android.text.Html;
import android.util.Base64;
import android.view.Display;
import android.widget.Toast;

import com.DocumentCapture.NativeDocumentCapture;
import com.ezmcom.ezlogger.EzLogUtility;
import com.ezmcom.offline.controller.Controller_docChooser;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.channels.FileChannel;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.logging.Logger;

public class ReactNativeEkycActivity extends Controller_docChooser {
    private Logger logger = Logger.getLogger("maybank: ReactNativeEkycActivity");
    String TAG = "maybank2u";
    String ocrPayload, sdkVer, ezLogFilepath = "", devEnable = "";
    String sessionID = null, docReq = null, lookupData = null;
    public static String idType = null,
            scanIntroTitle = null, scanIntroDesc = null, scanStartTitle = null, scanStartDesc = null,
            scanFrontTitle = null, scanFrontDesc = null, scanBackTitle = null, scanBackDesc = null,
            passportScanDesc = null, action = "";

    public static int topLeftX, topLeftY, width;
    public static float aspectRatio = 1.586f; // 1.416f
    private boolean isHologramEnabled = true;
    public String tpleft = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        JSONObject configJsonObject = null;
        String licenseKey = null;
        try {
            Intent intent = getIntent();
            if (intent.hasExtra("idType")) {
                idType = intent.getStringExtra("idType");
                logger.info("idType:" + idType);
            }

            if (intent.hasExtra("Document")) {
                docReq = intent.getStringExtra("Document");
            }

            if (intent.hasExtra("sessionID")) {
                sessionID = intent.getStringExtra("sessionID");
                logger.info("sessionID:" + sessionID);
            }

            if (intent.hasExtra("licenseKey")) {
                licenseKey = intent.getStringExtra("licenseKey");
            }

            if (intent.hasExtra("lookupData")) {
                lookupData = intent.getStringExtra("lookupData");
                logger.info("lookupData:" + lookupData);
            }

            if (intent.hasExtra("scanIntroTitle")) {
                scanIntroTitle = intent.getStringExtra("scanIntroTitle");
                logger.info("scanIntroTitle:" + scanIntroTitle);
            }

            if (intent.hasExtra("scanIntroDesc")) {
                scanIntroDesc = intent.getStringExtra("scanIntroDesc");
                logger.info("scanIntroDesc:" + scanIntroDesc);
            }

            if (intent.hasExtra("scanStartTitle")) {
                scanStartTitle = intent.getStringExtra("scanStartTitle");
                logger.info("scanStartTitle:" + scanStartTitle);
            }

            if (intent.hasExtra("scanStartDesc")) {
                scanStartDesc = intent.getStringExtra("scanStartDesc");
                logger.info("scanStartDesc:" + scanStartDesc);
            }

            if (intent.hasExtra("scanFrontTitle")) {
                scanFrontTitle = intent.getStringExtra("scanFrontTitle");
                logger.info("scanFrontTitle:" + scanFrontTitle);
            }

            if (intent.hasExtra("scanFrontDesc")) {
                scanFrontDesc = intent.getStringExtra("scanFrontDesc");
                logger.info("scanFrontDesc:" + scanFrontDesc);
            }

            if (intent.hasExtra("scanBackTitle")) {
                scanBackTitle = intent.getStringExtra("scanBackTitle");
                logger.info("scanBackTitle:" + scanBackTitle);
            }

            if (intent.hasExtra("scanBackDesc")) {
                scanBackDesc = intent.getStringExtra("scanBackDesc");
                logger.info("scanBackDesc:" + scanBackDesc);
            }

            if (intent.hasExtra("passportScanDesc")) {
                passportScanDesc = intent.getStringExtra("passportScanDesc");
                logger.info("passportScanDesc:" + passportScanDesc);
            }
			if (intent.hasExtra("devEnable")) {
                devEnable = intent.getStringExtra("devEnable");
                logger.info("devEnable:" + devEnable);
            }

            logger.info("idType:" + idType);
            configJsonObject = new JSONObject(docReq);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        //get sdk version
        sdkVer = new NativeDocumentCapture().getSDKVersionIDP();
        logger.info("getSDKVersionIDP: " + sdkVer);

        //enable logs
        if (devEnable.equals("true")) {
            EzLogUtility.enableLog(getApplicationContext());
            EzLogUtility.EZSetLogOnConsole(true);
            ezLogFilepath = EzLogUtility.EzLogGetFilePath();
            //"/data/user/0/com.maybank2u.life/Ezlog.txt"
            logger.info("logger filepath:" + ezLogFilepath);
            LogEzLogsToFile("getSDKVersionIDP: " + sdkVer);
            LogEzLogsToFile("lookupData: " + lookupData);
        }

        JSONObject sdkProperty = new JSONObject();
        JSONObject lookUpDataJSONObj = null;
        try {

            if (lookupData != null && !lookupData.isEmpty())
                lookUpDataJSONObj = new JSONObject(lookupData);

            Display display = getWindowManager().getDefaultDisplay();
            Point size = new Point();
            display.getSize(size);
            topLeftX = size.x / 25;
            if ("MYS_MYKAD".equalsIgnoreCase(idType)) {
                //mykad
                topLeftY = size.y / 3;
                isHologramEnabled = true;
            } else {
                //passport
                topLeftY = size.y / 4;
                aspectRatio = 1.416f;
                isHologramEnabled = false;
            }
            tpleft = topLeftX + "," + topLeftY;
            width = size.x;

            logger.info("width:height: " + size.x + ":" + size.y);
            logger.info("tpleft: " + tpleft);

//            sdkProperty.put("topLeft", tpleft);
//            sdkProperty.put("width", String.valueOf(size.x)); //screen width size
//            sdkProperty.put("aspectRatio", String.valueOf(aspectRatio));
//            sdkProperty.put("hologramEnabled", isHologramEnabled);

/*
            // Document detection Configuration
            sdkProperty.put("drawRectColour","#b81138");
            sdkProperty.put("mode","landscape");
            sdkProperty.put("CustomizeScanActivityBase","true");

            // For manual capture (optional) parameters for manual cropping
            sdkProperty.put("topLeft","10,100");
            sdkProperty.put("width","500")
            sdkProperty.put("aspectRatio","1.586");
            sdkProperty.put("rectDebug","false");
            // Hologram configuration
            sdkProperty.put("hologramEnabled",true);

            // manual
            sdkProperty.put("topLeft", tpleft);
            sdkProperty.put("mode", "portrait");
            sdkProperty.put("width", String.valueOf(size.x)); //screen width size
            sdkProperty.put("aspectRatio", String.valueOf(aspectRatio));
            sdkProperty.put("rectDebug", "true");
            sdkProperty.put("autoTesting", "false");
            sdkProperty.put("drawRectColour", "#b81138");
            sdkProperty.put("hologramEnabled", isHologramEnabled);
            sdkProperty.put("license", licenseKey);
            sdkProperty.put("CustomizeScanActivityBase", "true");
*/
            String tpleft2 = String.valueOf(topLeftX)+","+String.valueOf(topLeftY);
            sdkProperty.put("topLeft", tpleft2);
            sdkProperty.put("mode", "portrait");
            sdkProperty.put("aspectRatio", String.valueOf(aspectRatio));
            sdkProperty.put("rectDebug", "false");
            sdkProperty.put("autoTesting", "false");
            sdkProperty.put("drawRectColour", "#b81138");
            sdkProperty.put("hologramEnabled", isHologramEnabled);
            sdkProperty.put("license", licenseKey);
            sdkProperty.put("CustomizeScanActivityBase", "true");
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            System.out.println("\nconfigJsonObject: "+ configJsonObject.toString());
            System.out.println("\nsdkProperty: "+ sdkProperty.toString());
            if (lookUpDataJSONObj != null) {
                System.out.println("\nlookUpDataJSONObj: "+ lookUpDataJSONObj.toString());
            }
            build(configJsonObject, sdkProperty, lookUpDataJSONObj);
            logger.info("Starting Scanning");
            scan();
            LogEzLogsToFile("docReq: " + configJsonObject.toString());
            LogEzLogsToFile("sdkProperty: " + sdkProperty.toString());
        }
    }

    @Override
    public void captureCompleted(final String response, String[] pathToCapturedImages) {
        logger.info("captureCompleted+++++");
        System.out.println("captureCompleted -> "+ response);
        Intent result = new Intent();
        try {
            //saveToSharedPref("result", "captureCompleted", response);
            LogEzLogsToFile("captureCompleted response: " + response);
            JSONObject jsonResponse = new JSONObject(response);
            JSONArray codesArray = jsonResponse.has("response_codes") ? jsonResponse.getJSONArray("response_codes") : null;
            String statusCode = (codesArray != null) ? (String) codesArray.get(0) : "9999";
            logger.info("statusCode: " + statusCode);

            String ocrResult = extractOCR(response);
            String encodedFrontSide = "", encodedBackSide = "";
            if (statusCode.equals("200")) {
                showToast("Capture Completed");
                logger.info("idType +++++" + idType);
                logger.info("ocrResult +++++" + ocrResult);
                LogEzLogsToFile("captureCompleted ocrResult: " + ocrResult);
                captureHumanFaces(response);

                if ("MYS_MYKAD".equalsIgnoreCase(idType)) {
                    extractHologramImage(response);
                    encodedFrontSide = extractFrontSide(pathToCapturedImages);
                    encodedBackSide = extractBackSide(pathToCapturedImages);
                } else {
                    //Passport
                    encodedFrontSide = extractFrontSide(pathToCapturedImages);
                }

                //prepare form request for getOCRRequestPayload call
                JSONArray imagesJsonArray = new JSONArray();
                JSONObject jsonObject = new JSONObject();

                if ("MYS_MYKAD".equalsIgnoreCase(idType)) {
                    //MYS_MYKAD
                    imagesJsonArray.put(0, encodedFrontSide);
                    imagesJsonArray.put(1, encodedBackSide);
                } else {
                    //Passport
                    imagesJsonArray.put(0, encodedFrontSide);
                }

                jsonObject.put("images", imagesJsonArray);
                jsonObject.put("docType", idType);  //Ex: IND_PASS //MYS_MYKAD
                jsonObject.put("sessionId", sessionID);
                jsonObject.put("isEncryption", "false");
                jsonObject.put("data", response);

                LogEzLogsToFile("req object for RequestPayload: " + jsonObject.toString());
                getOCRRequestPayload(jsonObject, pathToCapturedImages[0]);
            } else {
                //Status is not ok
                showToast("Capture failure with code:" + statusCode);
                logger.info("extractOCR result fail with status code: " + statusCode);
                Intent resultFailIntent = new Intent();
                resultFailIntent.putExtra("prefName", "");
                resultFailIntent.putExtra("status", "FAIL");
                resultFailIntent.putExtra("action", action);
                setResult(RESULT_OK, resultFailIntent);
                finish();
            }
        } catch (Exception e) {
            logger.info("captureCompleted Exception: " + e.getMessage());
            e.printStackTrace();
            sendErrorResults(e.getMessage());
        }
    }

    //pathToCapturedImages[0] contains the name of the shared pref // "result"
    //pathToCapturedImages[1] contains the front image  //"img1"
    //pathToCapturedImages[2] contains the back image   //"img2"
    private String extractFrontSide(String[] pathToCapturedImages) {
        logger.info("extractFrontSide pathToCapturedImages: " + pathToCapturedImages[0]);
        String encodedFrontSide = retrieveFromSharedPref(pathToCapturedImages[0], pathToCapturedImages[1]);
        //saveToInternalStorage("front", decodeAndGenerateBitmap(encodedFrontSide));
        return encodedFrontSide;
    }

    private String extractBackSide(String[] pathToCapturedImages) {
        logger.info("extractBackSide pathToCapturedImages: " + pathToCapturedImages[0]);
        String encodedBackSide = retrieveFromSharedPref(pathToCapturedImages[0], pathToCapturedImages[2]);
        //saveToInternalStorage("back", decodeAndGenerateBitmap(encodedBackSide));
        return encodedBackSide;
    }

    private void extractHologramImage(String response) {
        logger.info("extractHologramImage+++ ");
        try {
            JSONObject jsonResponse = new JSONObject(response);
            if ("MYS_MYKAD".equalsIgnoreCase(idType)) {
                JSONObject dataModel_hologram = jsonResponse.getJSONObject("dataModel_hologram");
                boolean hologram_detection = dataModel_hologram.getBoolean("hologram_detection");

                if (hologram_detection) {
                    String face_from_hologramImage = dataModel_hologram.getString("face_from_hologramImage");
                    saveToSharedPref("result", "face_from_hologramImage", face_from_hologramImage);
                    //saveToInternalStorage("face_from_hologramImage", decodeAndGenerateBitmap(face_from_hologramImage));
                }

                //capture hologram images
                JSONObject hologram_images = dataModel_hologram.getJSONObject("hologram_images");
                JSONArray hologramImagesArray = hologram_images.getJSONArray("values");
                logger.info("hologramImagesArray length:" + hologramImagesArray.length());

                String hologram_image_0 = "", hologram_image_1 = "", hologram_image_2 = "";

                if (hologramImagesArray.length() == 1) {
                    hologram_image_0 = String.valueOf(hologramImagesArray.get(0));
                } else if (hologramImagesArray.length() == 2) {
                    hologram_image_0 = String.valueOf(hologramImagesArray.get(0));
                    hologram_image_1 = String.valueOf(hologramImagesArray.get(1));
                } else if (hologramImagesArray.length() == 3) {
                    hologram_image_0 = String.valueOf(hologramImagesArray.get(0));
                    hologram_image_1 = String.valueOf(hologramImagesArray.get(1));
                    hologram_image_2 = String.valueOf(hologramImagesArray.get(2));
                }

                if (!hologram_image_0.isEmpty()) {
                    saveToSharedPref("result", "holo_image_0", hologram_image_0);
                    //saveToInternalStorage("holo_image_0", decodeAndGenerateBitmap(hologram_image_0));
                }

                if (!hologram_image_1.isEmpty()) {
                    saveToSharedPref("result", "holo_image_1", hologram_image_1);
                    //saveToInternalStorage("holo_image_1", decodeAndGenerateBitmap(hologram_image_1));
                }

                if (!hologram_image_2.isEmpty()) {
                    saveToSharedPref("result", "holo_image_2", hologram_image_2);
                    //saveToInternalStorage("holo_image_2", decodeAndGenerateBitmap(hologram_image_2));
                }
            }
        } catch (JSONException e) {
            logger.info("extractHologramImage JSONException::: " + e.getMessage());
            e.printStackTrace();
        }
    }

    //Returns Front page Texts
    private String extractOCR(String response) {
        try {
            logger.info("extractOCR+++ " + response);
            JSONObject jsonResponse = new JSONObject(response);
            if ("MYS_MYKAD".equalsIgnoreCase(idType) && jsonResponse.has("ocr")) {
                return jsonResponse.get("ocr").toString();
            } else if (jsonResponse.has("mrz")) {
                return jsonResponse.get("mrz").toString();
            }
        } catch (JSONException e) {
            logger.info("extractOCR JSONException::: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
        return "";
    }

    //returns the coloured and monochrome human faces
    private void captureHumanFaces(String response) {
        try {
            logger.info("captureHumanFaces+++");

            JSONObject jsonResponse = new JSONObject(response);
            JSONArray faceImagesJSONArray = jsonResponse.getJSONArray("human_faces");
            logger.info("captureHumanFaces length+++ " + faceImagesJSONArray.length());

            if ("MYS_MYKAD".equalsIgnoreCase(idType)) { //retrieve face images : human_face_main_0, human_face_alt
                JSONObject humanFaceColour = faceImagesJSONArray.getJSONObject(0);
                saveToSharedPref("result", "color", humanFaceColour.getString("value"));
                //saveToInternalStorage("color", decodeAndGenerateBitmap(humanFaceColour.getString("value")));

                if (faceImagesJSONArray.length() > 1) {
                    try {
                        JSONObject humanFaceMono = faceImagesJSONArray.getJSONObject(1);
                        saveToSharedPref("result", "mono", humanFaceMono.getString("value"));
                        //saveToInternalStorage("mono", decodeAndGenerateBitmap(humanFaceMono.getString("value")));
                    } catch (JSONException e) {
                        logger.info("captureHumanFaces mono JSONException+++ " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            } else { //retrieve the passport main image
                JSONObject humanFaceColour = faceImagesJSONArray.getJSONObject(0);
                saveToSharedPref("result", "color", humanFaceColour.getString("value"));
                //saveToInternalStorage("color", decodeAndGenerateBitmap(humanFaceColour.getString("value")));
            }
        } catch (JSONException e) {
            logger.info("captureHumanFaces JSONException+++ " + e.getMessage());
            e.printStackTrace();
        }
    }

    /* function to generate the request payload for sending to the OCR server */
    private void getOCRRequestPayload(JSONObject jsonObject, String prefName) {
        try {
            logger.info("getOCRRequestPayload+++++ ");
            String status = "";

        /*
        the response from the function encryptImages will return the whole OCR datapacket in the
        response.payload. Send this response.payload as a request body to the OCR API.
         */
            com.ezmcom.ezscannersdk.sdk.Models.Response response = new com.ezmcom.ezscannersdk.sdk2.utils.EncryptUtils(getApplicationContext())
                    .encryptImages(
                        /*
                        please pass an array of images, where image at the first index is the,
                        first image capture and second index is the second image capture and vice
                        versa. For example, if an ID card is being captured; the front side of the
                        ID card will be at index 0 and the back side of the ID card will be at index 1.
                         */
                            jsonObject.getJSONArray("images"),
                        /*
                        the document type that you are sending across. For example if it is an Indian
                        passport the document type will be IND_PASS. Please check our documentation or
                        contact our team for your document type if you already do not know.
                         */
                            jsonObject.getString("docType"),
                        /*
                        a unique ID that represents the session being called. If you call the init API
                        pass the session ID you receive as part of the init response. Otherwise you
                        can pass an ID that is unique to you.
                         */
                            jsonObject.getString("sessionId"),
                        /*
                        pass true if you want your data packet to be encrypted otherwise pass as false.
                         */
                            jsonObject.getString("isEncryption"),
                            jsonObject.getString("data")
                    );
            if (response.getPayload() != null) {
                logger.info("getOCRRequestPayload returned successfully 101");
                response.setResponseCode("101");
                response.setResponseMessage("Payload returned successfully");
                ocrPayload = response.getPayload();
                saveToSharedPref(prefName, "ocrReqPayload", ocrPayload);
                status = "PASS";
                logger.info("getOCRRequestPayload ocrPayload:" + ocrPayload);
                LogEzLogsToFile("getOCRRequestPayload returned successfully 101");
                LogEzLogsToFile("getOCRRequestPayload response.getPayload():" + ocrPayload);
            } else {
                response.setResponseCode("102");
                status = "FAIL";
                logger.info("getOCRRequestPayload setResponseCode 102");
                LogEzLogsToFile("getOCRRequestPayload setResponseCode 102");
            }
            // new NativeDocumentCapture().terminateScanner();
            Intent result = new Intent();
            result.putExtra("prefName", prefName);
            result.putExtra("status", status);
            result.putExtra("action", action);
            setResult(RESULT_OK, result);
            exportEzLogFile();
            finish();

        } catch (Exception e) {
            logger.info("getOCRRequestPayload Exception:" + e.toString());
        }
    }

    private Bitmap decodeAndGenerateBitmap(String encodedImage) {
        try {
            logger.info("decodeAndGenerateBitmap+++ ");
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] imageBytes = baos.toByteArray();
            imageBytes = Base64.decode(encodedImage, Base64.DEFAULT);
            return BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length);
        } catch (Exception e) {
            logger.info("decodeAndGenerateBitmap Exception+++ " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private String saveToInternalStorage(String fileName, Bitmap bitmapImage) {
        try {
            logger.info("saveToInternalStorage for : " + fileName);
            if (bitmapImage != null) {
                ContextWrapper cw = new ContextWrapper(getApplicationContext());
                File directory = cw.getDir("imageDir", MODE_PRIVATE);

                File imageFile = new File(directory, fileName + ".jpg");

                // if (!imageFile.exists()) { // uncomment to prevent over write
                FileOutputStream fos = null;
                try {
                    fos = new FileOutputStream(imageFile);
                    // Use the compress method on the BitMap object to write image to the OutputStream
                    bitmapImage.compress(Bitmap.CompressFormat.JPEG, 100, fos);
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    try {
                        fos.flush();
                        fos.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
                return imageFile.getAbsolutePath();
            }
            // }
        } catch (Exception e) {
            logger.info("saveToInternalStorage Exception+++ " + e.getMessage());
            e.printStackTrace();
            return null;
        }
        return null;
    }

    private void sendErrorResults(String error) {
        logger.info("sendErrorResults: " + error);
        Intent resultFailIntent = new Intent();
        resultFailIntent.putExtra("prefName", "");
        resultFailIntent.putExtra("status", "FAIL");
        resultFailIntent.putExtra("error", error);
        setResult(RESULT_OK, resultFailIntent);
        finish();
    }


    /*@Override
    public void onBackPressed() {
        logger.info("onBackPressed");
        sendErrorResults("User pressed the back button!");
        super.onBackPressed();
    }*/


    @Override
    public void captureFailed(String response) {
        try {
            showToast("Capture failed");
            logger.info("Capture Failed");
            logger.info("Setting the results");
            logger.info("Response : " + response);
            sendErrorResults(response);
        } catch (Exception e) {
            logger.info("captureFailed Exception+++ " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String retrieveFromSharedPref(String prefName, String key) {
        logger.info("retrieveFromSharedPref+++ prefName: " + prefName + ":::key : " + key);
        SharedPreferences prefs = getSharedPreferences(prefName, MODE_PRIVATE);
        return prefs.getString(key, "");
    }

    public void saveToSharedPref(String prefName, String key, String data) {
        logger.info("saveToSharedPrefName: " + prefName + "; key : " + key);
        SharedPreferences.Editor editor = getSharedPreferences(prefName, MODE_PRIVATE).edit();
        //editor.putString(key, Html.fromHtml(data).toString());
        editor.putString(key, data);
        editor.apply();
    }

    public void showToast(String msg) {
        try {
            //Toast.makeText(getApplicationContext(), msg, Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            logger.info("showToast Exception:" + e.toString());
        }
    }

    private void LogEzLogsToFile(String message) {
        if (ezLogFilepath != null && ezLogFilepath.isEmpty() && message.isEmpty())
            return;

        try {
            EzLogUtility.Ezlog(message, TAG, EzLogUtility.EZ_LOG.EZINFO);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void exportEzLogFile() {
        if (ezLogFilepath != null && ezLogFilepath.isEmpty())
            return;

        try {
            boolean isAvailable = false;
            boolean isWritable = false;
            boolean isReadable = false;
            String state = Environment.getExternalStorageState();

            if (Environment.MEDIA_MOUNTED.equals(state)) {
                // Operation possible - Read and Write
                isAvailable = true;
                isWritable = true;
                isReadable = true;
            } else if (Environment.MEDIA_MOUNTED_READ_ONLY.equals(state)) {
                // Operation possible - Read Only
                isAvailable = true;
                isWritable = false;
                isReadable = true;
            } else {
                // SD card not available
                isAvailable = false;
                isWritable = false;
                isReadable = false;
            }
            logger.info("exportEzLogFile isWritable :" + isWritable);

            // getExternalStoragePublicDirectory() represents root of external storage, we are using DOWNLOADS
            // Accessing the saved data from the downloads folder
            File dst = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            File src = new File(ezLogFilepath);

            //if folder does not exist
            if (!dst.exists()) {
                if (!dst.mkdir()) {
                    return;
                }
            } else if (!isWritable) {
                return;
            }

            String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            File expFile = new File(dst.getPath() + File.separator + "Ezlogs.txt");
            FileChannel inChannel = null;
            FileChannel outChannel = null;

            try {
                inChannel = new FileInputStream(src).getChannel();
                outChannel = new FileOutputStream(expFile).getChannel();
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            }

            try {
                inChannel.transferTo(0, inChannel.size(), outChannel);
            } finally {
                if (inChannel != null)
                    inChannel.close();
                if (outChannel != null)
                    outChannel.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
