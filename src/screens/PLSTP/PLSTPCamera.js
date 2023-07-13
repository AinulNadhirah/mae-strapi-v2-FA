import PropTypes from "prop-types";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { RNCamera } from "react-native-camera";
import ImagePicker from "react-native-image-crop-picker";
import { useSafeArea } from "react-native-safe-area-context";

import { PLSTP_UPLOAD_DOCS, PLSTP_UPLOAD_DOC_VERIFICATION } from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ScreenContainer from "@components/Containers/ScreenContainer";

import { withModelContext } from "@context";

import { BLACK } from "@constants/colors";

import Images from "@assets";

const BackButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.backButton}>
        <Image source={Images.headerBackWhite} style={styles.backButtonIcon} />
    </TouchableOpacity>
);

BackButton.propTypes = {
    onPress: PropTypes.func.isRequired,
};

const CloseButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.closeButton}>
        <Image source={Images.headerCloseWhite} style={styles.closeButtonIcon} />
    </TouchableOpacity>
);

CloseButton.propTypes = {
    onPress: PropTypes.func.isRequired,
};

function PLSTPCamera({ navigation, route, updateModel }) {
    const params = route?.params ?? {};
    const { docType, clickImage, docCount } = params;
    const loading = false;
    const [useCamera, setUseCamera] = useState(false);
    const camera = useRef();
    const safeArea = useSafeArea();

    const handleClose = useCallback(() => {
        navigation.setParams({ imagePicker: false });

        navigation.canGoBack() && navigation.goBack();
    }, [navigation]);

    const handleCropImage = useCallback(
        async (image) => {
            console.tron.log("incropimage");
            if (image?.data) {
                let docs = route?.params?.docs || {};
                let docsCamArray = route?.params?.docsCamArray || [];
                let retakeImgNum = parseInt(clickImage);
                let screenName = PLSTP_UPLOAD_DOC_VERIFICATION;
                if (docType === "IC") {
                    if (clickImage === "icFront") {
                        docsCamArray[0] = image.path;
                    } else {
                        docsCamArray[1] = image.path;
                    }
                } else if (docType === "SALARY") {
                    docs = {
                        ...docs,
                        salaryURL: image.path,
                    };
                    screenName = PLSTP_UPLOAD_DOCS;
                } else if (docType === "EA") {
                    docs = { ...docs, eaImg: image.data, eaURL: image.path };
                    screenName = PLSTP_UPLOAD_DOCS;
                } else if (
                    docType === "BE" ||
                    docType === "TMSA" ||
                    docType === "BTR" ||
                    docType === "BS"
                ) {
                    if (retakeImgNum) {
                        docsCamArray[retakeImgNum - 1] = image.path;
                    } else {
                        docsCamArray.push(image.path);
                    }
                } else if (docType === "BR") {
                    docs = { ...docs, brImg: image.data, brURL: image.path };
                    screenName = PLSTP_UPLOAD_DOCS;
                }
                navigation.navigate(screenName, {
                    ...route.params,
                    docs,
                    imgBase64: image.data,
                    imgPath: image.path,
                    docCount: retakeImgNum ? docCount : docCount + 1,
                    docsCamArray,
                    from: "camera",
                });
            }
        },
        [handleClose, updateModel]
    );

    function handleCropError() {}

    const handlePickImageError = useCallback(() => {
        handleClose();
    }, [handleClose]);

    async function handleOnSnap() {
        if (camera?.current) {
            const options = {
                quality: 0.8,
            };
            const capture = await camera.current.takePictureAsync(options);

            if (capture?.uri) {
                ImagePicker.openCropper({
                    // width: 300,
                    // height: 400,
                    compressImageMaxWidth: 300,
                    path: capture.uri,
                    includeExif: true,
                    freeStyleCropEnabled: true,
                    cropping: true,
                    compressImageQuality: 0.8,
                    mediaType: "photo",
                    forceJpg: true,
                    includeBase64: true,
                    cropperToolbarTitle: "",
                    showCropGuidelines: false,
                    hideBottomControls: true,
                })
                    .then(handleCropImage)
                    .catch(handleCropError);
            }
        }
    }

    const openImageLibrary = useCallback(() => {
        // ImagePicker.openPicker({
        //     multiple: true,
        //     compressImageQuality: 0.5,
        //     cropping: true,
        //   }).then(images => {
        //     console.log(images);
        //   });
        ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true,
            compressImageQuality: 0.8,
            mediaType: "photo",
            forceJpg: true,
            includeBase64: true,
            cropperToolbarTitle: "",
            showCropGuidelines: false,
            hideBottomControls: true,
        })
            .then(handleCropImage)
            .catch(handlePickImageError);
    }, [handleCropImage, handlePickImageError]);

    // function handleZoom(event, state, zoomEventObj) {
    //     console.tron.log(event, state, zoomEventObj);
    // }

    useEffect(() => {
        if (route?.params?.imagePicker) {
            setUseCamera(false);

            openImageLibrary();
        } else if (!useCamera) {
            setUseCamera(true);
        }
    }, [navigation, route, useCamera, openImageLibrary]);

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={BLACK}
            overlaySolidColor={BLACK}
            showLoaderModal={loading || route?.params?.imagePicker}
        >
            <>
                <ScreenLayout
                    header={<View />}
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                >
                    <View style={styles.container}>
                        {useCamera && (
                            <>
                                <RNCamera
                                    ref={camera}
                                    style={styles.preview}
                                    type={RNCamera.Constants.Type.back}
                                    flashMode={RNCamera.Constants.FlashMode.off}
                                    captureAudio={false}
                                    androidCameraPermissionOptions={{
                                        title: "MAE Permission to use camera",
                                        message:
                                            "MAE would like to access the camera to capture photo for the profile picture and others.",
                                        buttonPositive: "Allow",
                                        buttonNegative: "Deny",
                                    }}
                                />

                                <View style={styles.profilePictureContainer}>
                                    <View
                                        style={[
                                            styles.profilePictureHeader,
                                            {
                                                paddingTop: safeArea.top + 46,
                                            },
                                        ]}
                                    >
                                        <BackButton onPress={handleClose} />
                                        <CloseButton onPress={handleClose} />
                                    </View>
                                    <View style={styles.profilePictureControl}>
                                        <TouchableOpacity
                                            onPress={handleOnSnap}
                                            style={styles.profilePictureControlSnap}
                                        >
                                            <Image
                                                source={Images.cameraYellow}
                                                style={styles.profilePictureControlSnapIcon}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

PLSTPCamera.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    updateModel: PropTypes.func,
};

const styles = StyleSheet.create({
    backButton: {
        alignItems: "center",
        height: 44,
        width: 44,
    },
    backButtonIcon: {
        height: 15,
        width: 22,
    },
    captureNote: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        position: "relative",
        paddingTop: 20,
    },
    closeButton: {
        alignItems: "center",
        height: 44,
        width: 44,
    },
    closeButtonIcon: {
        height: 17,
        width: 17,
    },
    container: {
        flex: 1,
    },
    preview: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    profilePictureContainer: {
        flex: 1,
        justifyContent: "space-between",
    },
    profilePictureControl: {
        alignItems: "center",
    },
    profilePictureControlSnap: {
        paddingVertical: 48,
    },
    profilePictureControlSnapIcon: {
        height: 50,
        width: 50,
    },
    profilePictureHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        position: "relative",
    },
});

export default withModelContext(PLSTPCamera);
