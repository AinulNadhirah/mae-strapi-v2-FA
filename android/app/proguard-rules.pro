# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

-keep class com.facebook.crypto.** {
   *;
}
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.maybank2u.life.BuildConfig { *; }
-keep class com.maybank2u.life.huawei.BuildConfig { *; }
-keep class io.invertase.firebase.** { *; }
-keep public class com.horcrux.svg.** {*;}
-dontwarn io.invertase.firebase.**
-dontwarn org.slf4j.**
-keepclassmembers class **.NativeDocumentCapture {
   *;
}
-keep public class com.ezmcom.**{
	*;
	<fields>;
}
-keep class org.opencv.** { *; }
-keep public class com.dylanvann.fastimage.* {*;}
-keep public class com.dylanvann.fastimage.** {*;}
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}

-keep class okio.**{
    <fields>;
    <methods>;
}

# not to obfuscate HMS SDK
-ignorewarnings
-keepattributes *Annotation*
-keepattributes Exceptions
-keepattributes InnerClasses
-keepattributes Signature
-keep class com.hianalytics.android.**{*;}
-keep class com.huawei.updatesdk.**{*;}
-keep class com.huawei.hms.**{*;}
-keep class com.huawei.availablity.**{*;}
-repackageclasses

