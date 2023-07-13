package com.ficocustom;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Point;
import android.graphics.PorterDuff;
import android.graphics.Rect;
import android.graphics.Typeface;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Display;
import android.view.View;
import android.view.ViewTreeObserver;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.DocumentCapture.NativeDocumentCapture;
import com.M2ULife.ekycEzbio.ReactNativeEkycActivity;
import com.ezmcom.offline.camera.ScanActivityBase;
import com.ezmcom.offline.constants.Constants_CaptureEvents;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.logging.Logger;

public class ScanActivityBaseCustom extends ScanActivityBase {
    private Logger logger = Logger.getLogger("maybank: ScanActivityBaseCustom");
    TextView scanTopTextView = null, scanBottomTextView = null;
    ImageView backButtonImageView = null, rectFrameImageView = null, hintImagePreview = null;
    private boolean nricHologramDetected = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        int idCaptureButton = getResources().getIdentifier("captureButton", "id", getPackageName());
        if (idCaptureButton == 0) {
            return;
        }

        Button captureButton = findViewById(idCaptureButton);
        Typeface buttonTypeface = Typeface.createFromAsset(getAssets(), "fonts/Montserrat-Bold.ttf");
        captureButton.setTypeface(buttonTypeface);

        scanTopTextView = findViewById(getResources().getIdentifier("textPreview", "id", getPackageName()));
        scanBottomTextView = findViewById(getResources().getIdentifier("scan_text_bottom", "id", getPackageName()));

        backButtonImageView = findViewById(getResources().getIdentifier("close_scan", "id", getPackageName()));
        rectFrameImageView = findViewById(getResources().getIdentifier("imagePreview", "id", getPackageName()));
        hintImagePreview = findViewById(getResources().getIdentifier("hintImagePreview", "id", getPackageName()));

        setTextViewFont(scanTopTextView);
        setTextViewFont(scanBottomTextView);

        backButtonImageView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                logger.info("ekyc backButtonImageView+++++");
                final long DELAY_IN_MS = 2000;
                if (!view.isClickable()) {
                    return;
                }
                view.setClickable(false);
                view.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        view.setClickable(true);
                    }
                }, DELAY_IN_MS);

                ReactNativeEkycActivity.action = "back";
                // new NativeDocumentCapture().terminateScanner();
                finish();
            }
        });

        Log.i("maybank", "ScanActivityBaseCustom onCreate : " + ReactNativeEkycActivity.idType);

        //drawRect();
        //drawRect2();
        drawRect3();
        if (ReactNativeEkycActivity.idType.equals("MYS_MYKAD")) {
            drawScanHints("hologram");
            scanTopTextView.setText(ReactNativeEkycActivity.scanIntroTitle);
            scanBottomTextView.setText(ReactNativeEkycActivity.scanIntroDesc);
        } else {
            scanBottomTextView.setText(ReactNativeEkycActivity.passportScanDesc); //passport
        }

    }

    @Override
    public void eventCaptured(String event, JSONObject data) throws JSONException {
//        if (data != null) {
//            Toast.makeText(getApplicationContext(), "eventCaptured: " + event + "\n" + data.toString(), Toast.LENGTH_SHORT).show();
//        } else {
//            Toast.makeText(getApplicationContext(), "eventCaptured: " + event, Toast.LENGTH_SHORT).show();
//        }
        switch (event) {

//            case Constants_CaptureEvents.progress:
//                Toast.makeText(getApplicationContext(), "progress: " + data.getInt("progress") + "%", Toast.LENGTH_SHORT).show();
//                break;
            case Constants_CaptureEvents.readFace:
                // new NativeDocumentCapture().terminateScanner();
                /*int id = getResources().getIdentifier("scanning_front_ocr", "string", getPackageName());

                if (id == 0) {
                    Log.e("ID", "ID " + "align_and_tap_to_start_back" + " not found");

                } else {
                    textView.setText(getResources().getString(id));
                }*/
                //Toast.makeText(getApplicationContext(), "readFace completed", Toast.LENGTH_SHORT).show();
                /*new NativeDocumentCapture().terminateScanner();*/
                break;

            case Constants_CaptureEvents.readHologram:
                /*id = getResources().getIdentifier("align_and_tap_to_start_front", "string", getPackageName());
                if (id == 0) {
                    Log.e("ID", "ID " + "align_and_tap_to_start_front" + " not found");

                } else {
                    textView.setText(getResources().getString(id));
                }*/
                if (ReactNativeEkycActivity.idType.equals("MYS_MYKAD")) {
                    scanTopTextView.setText(ReactNativeEkycActivity.scanStartTitle);
                    scanBottomTextView.setText(ReactNativeEkycActivity.scanStartDesc);
                }

                //Toast.makeText(getApplicationContext(), "read Hologram", Toast.LENGTH_SHORT).show();
                break;
            case Constants_CaptureEvents.hologramDetectionComplete:

               /* id = getResources().getIdentifier("align_and_tap_to_start_front", "string", getPackageName());
                if (id == 0) {
                    Log.e("ID", "ID " + "align_and_tap_to_start_front" + " not found");

                } else {
                    textView.setText(getResources().getString(id));
                }*/

                if (ReactNativeEkycActivity.idType.equals("MYS_MYKAD")) {
                    if (data != null) {
                        Log.i("data", data.toString());
                        boolean isHologramDetectionSuccess = data.has("hologram_detection") ? data.getBoolean("hologram_detection") : false;
                        nricHologramDetected = isHologramDetectionSuccess;
                        if (isHologramDetectionSuccess) {
                            scanTopTextView.setText(ReactNativeEkycActivity.scanFrontTitle);
                            scanBottomTextView.setText(ReactNativeEkycActivity.scanFrontDesc);
                            drawScanHints("front");

                            //Auto capture for hologram OCR
                            new NativeDocumentCapture().setManualMode(false);
                            new NativeDocumentCapture().setDetectonModeForce(1);
                            //Toast.makeText(getApplicationContext(), "HologramDetection Success", Toast.LENGTH_LONG).show();
                        } else {
                            //stop the process
                            //Toast.makeText(getApplicationContext(), "HologramDetection Failed", Toast.LENGTH_LONG).show();
                        }
                    } else {
                        //something is wrong
                        //Toast.makeText(getApplicationContext(), "Failed: Something is wrong: ", Toast.LENGTH_LONG).show();
                    }
                }

                //Toast.makeText(getApplicationContext(), "hologramDetectionComplete", Toast.LENGTH_SHORT).show();
                break;

            case Constants_CaptureEvents.detectFaceBlur:
            case Constants_CaptureEvents.detectBlur:

                int blurcount = (int) data.get("blurContinuousFrame");
                if (blurcount % 20 == 0) {
                    Toast.makeText(getApplicationContext(), "Tap to focus", Toast.LENGTH_SHORT).show();
                }
                break;
            case Constants_CaptureEvents.readFront:

                //Toast.makeText(getApplicationContext(), "All the data collected", Toast.LENGTH_SHORT).show();
                /*id = getResources().getIdentifier("align_and_tap_to_start_back", "string", getPackageName());
                if (id == 0) {
                    Log.e("ID", "ID " + "align_and_tap_to_start_back" + " not found");

                } else {
                    textView.setText(getResources().getString(id));
                }*/
                //readFront completed
                if (ReactNativeEkycActivity.idType.equals("MYS_MYKAD")) {
                    if (nricHologramDetected == true) {
                        scanTopTextView.setText(ReactNativeEkycActivity.scanBackTitle);
                        scanBottomTextView.setText(ReactNativeEkycActivity.scanBackDesc);
                        drawScanHints("back");
                    } else {
                        Toast.makeText(getApplicationContext(), "Hologram detection failed. Please retry", Toast.LENGTH_LONG).show();
                        backButtonImageView.performClick();
                    }
                }
                //Toast.makeText(getApplicationContext(), "readFront completed", Toast.LENGTH_SHORT).show();
                break;


            case Constants_CaptureEvents.readBarcode:
                //Toast.makeText(getApplicationContext(), "readBarcode", Toast.LENGTH_SHORT).show();

                break;

            case Constants_CaptureEvents.readText:
                //Toast.makeText(getApplicationContext(), "read Text", Toast.LENGTH_SHORT).show();

                break;

            case Constants_CaptureEvents.startingScan:

                //Toast.makeText(getApplicationContext(), "Starting Scan", Toast.LENGTH_SHORT).show();

                if (ReactNativeEkycActivity.idType.equals("MYS_MYKAD")) {
                    showRectFrame();
                }
                break;

            case Constants_CaptureEvents.cameraInitComplete:

                //TODO : commented part is for callbacks message customization for clients

                /*if(doc_type== passport)
                {
                    id = getResources().getIdentifier("align_and_tap_to_start_front", "string", getPackageName()); // for front card
                }
                else if(doc_type== id_card)
                {
                    id = getResources().getIdentifier("align_and_tap_to_start_Hologram", "string", getPackageName()); //for hologram
                }*/
                //TODO : commented part is for callbacks message customization for clinets

                //id = getResources().getIdentifier("align_and_tap_to_start_Hologram", "string", getPackageName());

                /*if (id == 0) {
                    Log.e("ID", "ID " + "align_and_tap_to_start_front" + " not found");
                } else {
                    textView.setText(getResources().getString(id));
                }*/
                break;
            case Constants_CaptureEvents.readMrzBack1:
                //Toast.makeText(getApplicationContext(), "readMrzBack1", Toast.LENGTH_SHORT).show();
                break;

        }

    }

    private void setTextViewFont(TextView textView) {
        Typeface face = Typeface.createFromAsset(getAssets(), "fonts/Montserrat-Regular.ttf");
        textView.setTypeface(face);
    }


    public void drawRect() {
        //screen height and width
        DisplayMetrics displayMetrics = new DisplayMetrics();
        getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        int heightPixels = displayMetrics.heightPixels;
        int widthPixels = displayMetrics.widthPixels;

        int width = (int) Math.round(widthPixels * 0.8);
        int height = (int) Math.round(heightPixels * 0.25);
        Log.i("dimensions", widthPixels + ";" + heightPixels);

        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);

        Rect innerRectangle = new Rect(0, 0, width, height);

        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setColor(Color.WHITE);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(12);
        canvas.drawRect(innerRectangle, paint);
        rectFrameImageView.setImageBitmap(bitmap);

        int[] location = new int[2];
        rectFrameImageView.getLocationOnScreen(location);
        ViewTreeObserver vto = rectFrameImageView.getViewTreeObserver();
        vto.addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
            @Override
            public void onGlobalLayout() {
                rectFrameImageView.getViewTreeObserver().removeGlobalOnLayoutListener(this);
                int[] posXY = new int[2];
                rectFrameImageView.getLocationOnScreen(posXY);
                int x = posXY[0];
                int y = posXY[1];
                Log.i("maybank", "dimensions : " + "location333: " + x + " " + y);
            }
        });
    }

    private void drawRect2() {
        // draw border

        //screen height and width
        DisplayMetrics displayMetrics = new DisplayMetrics();
        getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        int height = displayMetrics.heightPixels;
        int widthh = displayMetrics.widthPixels;
        Log.i("dimensions: ", widthh + ":" + height);


        Display display = getWindowManager().getDefaultDisplay();
        Point size = new Point();
        display.getSize(size);
        int topLeftx = size.x / 20;
        int topLefty = size.y / 8;
        String tpleft = String.valueOf(topLeftx) + "," + String.valueOf(topLefty);


        float bottomx, bottomy, topx, topy;

        float cropAR, finalCropAR;
        int cropWidth, finalWidth, cropHeight;

        //accessing topleft , aspect ratio and cropWidth  parameter from SDK
       /* tpleftx = new NativeDocumentCapture().getTopLeftX();
        tplefty = new NativeDocumentCapture().getTopLeftY();
        cropAR = new NativeDocumentCapture().getCropingAspectRatio();
        cropWidth = new NativeDocumentCapture().getCropingWidth();*/

        topLeftx = ReactNativeEkycActivity.topLeftX;
        topLefty = ReactNativeEkycActivity.topLeftY;
        cropAR = ReactNativeEkycActivity.aspectRatio;
        cropWidth = ReactNativeEkycActivity.width;

        //cropAR =0;
        //cropWidth =0;

        Log.i("maybank", "topLeftx : " + topLeftx + "; topLefty:" + topLefty + "; cropAR:" + cropAR + "; cropWidth: " + cropWidth);

        //checking valid aspectRatio or setting default aspectratio
        if (cropAR > 2.0f || cropAR < 0.2f) {
            cropAR = 1.586f;
        }


        // checking valid width or setting default width
        if ((cropWidth + topLeftx) > widthh || cropWidth == 0) {
            cropWidth = (int) widthh - (int) (2 * topLeftx);
            Log.i("maybank", "cropWidth+++");
        }

        //calculating points
        topx = topLeftx;
        topy = topLefty;
        bottomx = topx + cropWidth;

        cropHeight = (int) (cropWidth / cropAR);

        bottomy = topy + (cropWidth / cropAR);
        Log.i("maybank", "bottomx: " + bottomx + "; bottomy: " + bottomy);
        Log.i("maybank", "cropWidth: " + cropWidth + "; cropHeight: " + cropHeight);
        Bitmap bitmap = Bitmap.createBitmap(cropWidth, cropHeight, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);

        //Drawing rectangle
        Paint paint;
        canvas.drawColor(0, PorterDuff.Mode.CLEAR);

        paint = new Paint();
        paint.setStyle(Paint.Style.STROKE);
        paint.setColor(Color.parseColor("#044ee2"));
        paint.setStrokeWidth(50);
        canvas.drawRect(topx, topy, bottomx, bottomy, paint);
        rectFrameImageView.setImageBitmap(bitmap);
    }


    private void drawRect3() {
        // draw border

        //screen height and width
        DisplayMetrics displayMetrics = new DisplayMetrics();
        getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        int height = displayMetrics.heightPixels;
        int widthh = displayMetrics.widthPixels;
        Log.i("maybank", "dimensions : " + widthh + ":" + height);

        float bottomx, bottomy, topx, topy;
        float cropAR, tpleftx, tplefty, finalCropAR;
        int cropWidth, cropHeight, finalWidth;

        //accessing topleft , aspect ratio and cropWidth  parameter from SDK
        tpleftx = ReactNativeEkycActivity.topLeftX;
        tplefty = ReactNativeEkycActivity.topLeftY;
        cropAR = ReactNativeEkycActivity.aspectRatio;
        cropWidth = ReactNativeEkycActivity.width;

        //checking valid aspectRatio or setting default aspectratio
        if (cropAR > 2.0f || cropAR < 0.2f) {
            cropAR = 1.586f;
        }
        // checking valid width or setting default width
        if ((cropWidth + tpleftx) > widthh || cropWidth == 0) {
            cropWidth = (int) widthh - (int) (2 * tpleftx);
        }

        //calculating points
        topx = tpleftx;
        topy = tplefty;
        bottomx = topx + cropWidth;
        bottomy = topy + (cropWidth / cropAR);

        cropHeight = (int) (cropWidth / cropAR);

        Log.i("maybank", "tpleftx : " + tpleftx + "; tplefty:" + tplefty + "; bottomx: " + bottomx + "; bottomy:" + bottomy);
        Log.i("maybank", "cropWidth : " + cropWidth + "; cropHeight:" + cropHeight);

        //Drawing rectangle
        Bitmap bitmap = Bitmap.createBitmap(widthh, height, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        canvas.drawColor(0, PorterDuff.Mode.CLEAR);

        Paint paint = new Paint();
        paint.setColor(Color.WHITE);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(12);
        canvas.drawRect(topx, topy, bottomx, bottomy, paint); //left, top, right, bottom

        rectFrameImageView.setImageBitmap(bitmap);
    }

    private void drawScanHints(String type) {

        rectFrameImageView.setVisibility(View.INVISIBLE);

        int drawableID = getResources().getIdentifier("scan_hologram_moving", "drawable", getPackageName());
        if (type.equals("hologram")) {
            drawableID = getResources().getIdentifier("scan_hologram_moving", "drawable", getPackageName());
        } else if (type.equals("front")) {
            drawableID = getResources().getIdentifier("scan_frontof_mykad", "drawable", getPackageName());
        } else if (type.equals("back")) {
            drawableID = getResources().getIdentifier("scan_backof_mykad", "drawable", getPackageName());
        } else if (type.equals("frontPassport")) {
            drawableID = getResources().getIdentifier("scan_backof_mykad", "drawable", getPackageName());
        }

        hintImagePreview.setImageResource(drawableID);
        hintImagePreview.setPadding(50, 0, 50, 100);
        hintImagePreview.setVisibility(View.VISIBLE);

    }

    private void showRectFrame() {
        hintImagePreview.setVisibility(View.GONE);
        rectFrameImageView.setVisibility(View.VISIBLE);
    }
}
