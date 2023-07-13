package com.M2ULife.ekycEzbio;

import android.app.ProgressDialog;
import android.content.Context;
import android.content.ContextWrapper;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.os.Bundle;
import android.util.Base64;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.ezmcom.ezbio.android.sdk.EzBioSDK;
import com.ezmcom.ezbio.android.sdk.activity.CustomEnrollmentActivity;
import com.ezmcom.ezbio.android.sdk.constants.Constants;
import com.fico.fba.client.android.sdk.EzBioClientRecognizer.EzBioClientRecognizerActivity;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.logging.Logger;

public class ReactNativeEzbioActivity extends CustomEnrollmentActivity implements CustomEnrollmentActivity.EnrollSessionCallback {
    private String TAG = "maybank: ReactNativeEzbioActivity";
    private Logger logger = Logger.getLogger("maybank: ReactNativeEzbioActivity");

    private TextView faceStatusView;
    private ImageView backButtonImageView = null;
    private ProgressDialog progressDialog, progressDialog2;
    private Button selfieStartButton = null;

    private String userId = null, selfieDescription = null;
    private int mode;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        try {
            this.enableDeviceOrientation = false;
            this.noOfInstruction = 3;
            this.strictnessLevel = STRICTNESS_LEVEL.fromInt(1);
            CustomEnrollmentActivity.setCustomEnrollmentCallback(this);
        } catch (Exception e) {
            e.printStackTrace();
        }
        super.onCreate(savedInstanceState);
        int layoutId = getResources().getIdentifier("activity_ekyc_selfie_custom_enroll", "layout", getPackageName());
        setContentView(layoutId);
        Log.i(TAG, "ReactNativeEzbioActivity onCreate+++++");

        Intent data = getIntent();
        if (data != null) {
            selfieDescription = data.getStringExtra("selfieDescription");
            Log.i(TAG, "selfieDescription: " + selfieDescription);
        }

        faceStatusView = findViewById(getResources().getIdentifier("faceStatus", "id", getPackageName()));
        backButtonImageView = findViewById(getResources().getIdentifier("selfie_back", "id", getPackageName()));
        //closeButtonImageView = findViewById(R.id.selfie_close);

        selfieStartButton = findViewById(getResources().getIdentifier("selfie_start_btn", "id", getPackageName()));
        selfieStartButton.setEnabled(true);
        selfieStartButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                selfieStartButton.setVisibility(View.GONE);
                beginEnrollment();
            }
        });

        Typeface buttonTypeface = Typeface.createFromAsset(getAssets(), "fonts/Montserrat-Bold.ttf");
        selfieStartButton.setTypeface(buttonTypeface);

        userId = getIntent().getExtras().getString(Constants.USER_ID);
        mode = getIntent().getIntExtra(Constants.ENROLLMENT_TYPE, 1);
        Log.i(TAG, "onCreate: userId as " + userId + ", mode as " + mode);

        backButtonImageView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.i(TAG, "Selfie backButtonImageView+++++");
                Intent result = new Intent();
                result.putExtra("status", 9997);
                result.putExtra("msg", "close");
                setResult(RESULT_CANCELED, result);
                finish();
            }
        });

        Typeface face = Typeface.createFromAsset(getAssets(), "fonts/Montserrat-Regular.ttf");
        faceStatusView.setTypeface(face);
        //drawCircle();
    }

    private void beginEnrollment() {
        startEnrollment();
    }


    @Override
    public void onPause() {
        super.onPause();
        if (progressDialog != null) {
            progressDialog.dismiss();
            progressDialog = null;
        }
    }

    @Override
    public void onErrorDetected(int errorCode, String errorMessage) {
        super.onErrorDetected(errorCode, errorMessage);
        Toast.makeText(ReactNativeEzbioActivity.this, "Selfie enroll error: "+ errorMessage, Toast.LENGTH_LONG).show();
        System.out.println("onErrorDetected: " + errorCode + " -> "+ errorMessage);
        Log.i(TAG, "onErrorDetected errorCode errorMessage:msg = " + errorCode + ":" + errorMessage);
    }
    @Override
    public void faceEnrollStatus(int faceStatus, int lightStatus, float brightnessLevel, String faceInstruction) {
        // faceStatusView.setText("faceStatus:" + faceStatus + ", lightStatus:" + lightStatus + ", brightnessLevel:" + brightnessLevel + " instruction:" + faceInstruction);
        // facefeedback.setImageResource(faceStatus == 1 ? R.drawable.face_ok : R.drawable.face_not_ok);
//       try {
//           if (faceInstruction != null) {
//               Thread.sleep(200);
               faceStatusView.setText(faceInstruction);
//           }
//       } catch (InterruptedException e) {
//           System.out.println("faceEnrollStatus interruptedException : " + e.toString());
//           Thread.currentThread().interrupt();
//       }
    }

    @Override
    public void voiceEnrollStatus(int noiseStatus, float voiceLevel, long numOfPhrasesCaptured) {
        //voiceStatusView.setText("noiseStatus " + noiseStatus + ", voiceLevel " + voiceLevel + ", numOfPhrasesCaptured" + numOfPhrasesCaptured);
    }

    @Override
    public void onEnrollmentDone(int code, String message) {
        //Toast.makeText(this, "onEnrollmentDone status code: " + code, Toast.LENGTH_LONG).show();
        Log.i(TAG, "onEnrollmentDone status code:msg = " + code + ":" + message);

        System.out.println("onEnrollmentDone: " + code + " -> "+ message);

        progressDialog2 = new ProgressDialog(ReactNativeEzbioActivity.this);
        progressDialog2.setMessage("Please wait. Verification in progress...");
        progressDialog2.show();

        SharedPreferences prefs = getSharedPreferences("appSettings", Context.MODE_PRIVATE);
        prefs.edit().putInt("arg0", code).commit();
        prefs.edit().putString("arg1", code == -1 ? "Sorry, we are not able to detect your image. Please try again." : message).commit();

        int enroll_mode = prefs.getInt("enrollmentType", 1);

        if (enroll_mode == Constants.ENROLL_FACE_ONLY || enroll_mode == Constants.ENROLL_VOICE_ONLY || enroll_mode == Constants.ENROLL_FACE_AND_VOICE) {
            prefs.edit().putInt(userId + "_enrollType", enroll_mode).commit();
            /*try {
                String hash = EzBioSDK.getBiometricHash(userId, enroll_mode);
                Toast.makeText(ReactNativeEzbioActivity.this, "got biohash  " + hash, Toast.LENGTH_LONG).show();
            } catch (Exception e) {
                Toast.makeText(ReactNativeEzbioActivity.this, "biohash exception " + e.getMessage(), Toast.LENGTH_LONG).show();
                e.printStackTrace();
            }*/
        }

        if (code == 0) {
            try {
                Bitmap immagex = EzBioSDK.getEnrollmentImage(userId);
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                immagex.compress(Bitmap.CompressFormat.JPEG, 100, baos);
                byte[] b = baos.toByteArray();
                String imageEncoded = Base64.encodeToString(b, Base64.DEFAULT);

                if (imageEncoded != null) {
                    Log.i(TAG, "getEnrollmentImage not null++++");
                    SharedPreferences.Editor editor = getSharedPreferences("settings", Context.MODE_PRIVATE).edit();
                    editor.putBoolean("livenessDetection", true);
                    editor.apply();

                    SharedPreferences.Editor data_editor = getSharedPreferences("result", MODE_PRIVATE).edit();
                    data_editor.putString("selfieImg", imageEncoded);
                    data_editor.apply();
                } else {
                    code = 9999;
                    Log.i(TAG, "getEnrollmentImage null++++");
                }
                closeProgressDialog();
                Intent result = new Intent();
                result.putExtra("status", code);
                result.putExtra("msg", message);
                setResult(RESULT_OK, result);
                finish();

            } catch (Exception e) {
                e.printStackTrace();
                closeProgressDialog();
            }
        } else {
            SharedPreferences.Editor editor = getSharedPreferences("settings", Context.MODE_PRIVATE).edit();
            editor.putBoolean("livenessDetection", false);
            editor.apply();

            Log.i(TAG, "handleEnrollmentDone null++++");
            closeProgressDialog();
            Intent result = new Intent();
            result.putExtra("status", 9999);
            result.putExtra("msg", (code == -1 ? "Sorry, we are not able to detect your image. Please try again." : message));

            setResult(RESULT_OK, result);
            finish();
        }
    }

    @Override
    public void onSavingEnrollment() {
        Log.i(TAG, "onSavingEnrollment++++");
    }

    public String getStringImage(Bitmap bmp) {
        Log.i(TAG, "getStringImage+++ ");
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        bmp.compress(Bitmap.CompressFormat.JPEG, 100, baos);
        byte[] imageBytes = baos.toByteArray();
        String encodedImage = Base64.encodeToString(imageBytes, Base64.NO_WRAP);
        saveToInternalStorage("selfie", bmp);
        return encodedImage;
    }

    @Override
    public void onEnrollmentStatusUpdate(int isFacePresent, int livenessCommand, String livenessCommandMessage, int livenessCommandResult, int enrollmentPercentage) {
        super.onEnrollmentStatusUpdate(isFacePresent, livenessCommand, livenessCommandMessage, livenessCommandResult, enrollmentPercentage);
//        Toast.makeText(ReactNativeEzbioActivity.this, "Enrollment progress: "+ enrollmentPercentage +"% \n Face detected: " + isFacePresent, Toast.LENGTH_LONG).show();
        System.out.println("Enrollment progress: "+ enrollmentPercentage +"% \n Face detected: " + isFacePresent);
    }

    private String saveToInternalStorage(String fileName, Bitmap bitmapImage) {
        Log.i(TAG, "saveToInternalStorage+++ ");
        ContextWrapper cw = new ContextWrapper(getApplicationContext());
        File directory = cw.getDir("imageDir", Context.MODE_PRIVATE);

        File imageFile = new File(directory, fileName + ".jpg");

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

    public void drawCircle() {
        //screen height and width
        DisplayMetrics displayMetrics = new DisplayMetrics();
        getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        int heightPixels = displayMetrics.heightPixels;
        int widthPixels = displayMetrics.widthPixels;
        Log.i("dimensions", widthPixels + ";" + heightPixels);

        int widthSpace = (int) Math.round(widthPixels * 0.15);
        widthPixels = widthPixels - widthSpace;

        Bitmap bitmap = Bitmap.createBitmap(widthPixels, widthPixels, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);

        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setColor(Color.WHITE);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(8);

        // Calculate the available radius of canvas
        int radius = Math.min(canvas.getWidth(), canvas.getHeight() / 2);

        // Set a pixels value to padding around the circle
        int padding = 15;
        canvas.drawCircle(
                canvas.getWidth() / 2, // cx
                canvas.getHeight() / 2, // cy
                radius - padding, // Radius
                paint // Paint
        );

        //selfieCircleImageView.setImageBitmap(bitmap);
    }

    private void closeProgressDialog() {
        if (progressDialog2 != null) {
            progressDialog2.dismiss();
            progressDialog2 = null;
        }
    }

}

