import PropTypes from "prop-types";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import { RNCamera } from "react-native-camera";
import ImagePicker from "react-native-image-crop-picker";
import { useSafeArea } from "react-native-safe-area-context";

import ScreenLayout from "@layouts/ScreenLayout";

import ScreenContainer from "@components/Containers/ScreenContainer";
import { successToastProp, showSuccessToast } from "@components/Toast";

import { logEvent } from "@services/analytics";
import { editImageGoalAPI } from "@services/index";

import {
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    FA_TABUNG_EDIT_PHOTO_SUCCESSFUL,
} from "@constants/strings";

import { ErrorLogger } from "@utils/logs";

import Images from "@assets";

const BackButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.backButton}>
        <Image source={Images.headerBackWhite} style={styles.backButtonIcon} />
    </TouchableOpacity>
);

BackButton.propTypes = {
    onPress: PropTypes.func,
};

const CloseButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.closeButton}>
        <Image source={Images.headerCloseWhite} style={styles.closeButtonIcon} />
    </TouchableOpacity>
);

CloseButton.propTypes = {
    onPress: PropTypes.func,
};

const GoalEditPictureScreen = ({ navigation, route }) => {
    const cameraReference = useRef();
    const [useCamera, setUseCamera] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const safeArea = useSafeArea();

    const openImageLibrary = useCallback(async () => {
        try {
            const croppedImage = await ImagePicker.openPicker({
                width: Dimensions.get("window").width - 48,
                height: 174,
                cropping: true,
                compressImageQuality: 0.8,
                mediaType: "photo",
                forceJpg: true,
                includeBase64: true,
                cropperToolbarTitle: "",
                cropperCircleOverlay: false,
                showCropGuidelines: false,
                hideBottomControls: true,
            });
            if (croppedImage) handleCroppedImage(croppedImage);
            else handleCropError();
        } catch (error) {
            ErrorLogger(error);
            handleCropError();
        }
    }, [handleCroppedImage, handleCropError]);

    const handleCropError = useCallback(() => {
        handleClose();
    }, [handleClose]);

    const handleClose = useCallback(() => navigation.goBack(), [navigation]);

    const updateGoalImage = useCallback(
        async (image) => {
            try {
                const response = await editImageGoalAPI(`/goal/editImage`, {
                    goalId: route.params.goalId,
                    image,
                });
                if (response && response.status === 200) return response;
                return null;
            } catch (error) {
                ErrorLogger(error);
                return null;
            }
        },
        [route]
    );

    const handleCroppedImage = useCallback(
        async (image) => {
            const data = image?.data;
            const mime = image?.mime;
            if (data && mime) {
                setShowLoader(true);
                try {
                    const response = await updateGoalImage(
                        `data:${image.mime};base64,${image.data}`
                    );
                    if (response) {
                        showSuccessToast(
                            successToastProp({
                                message: "Changes saved.",
                            })
                        );
                        logEvent(FA_FORM_COMPLETE, {
                            [FA_SCREEN_NAME]: FA_TABUNG_EDIT_PHOTO_SUCCESSFUL,
                        });
                    }
                } catch (error) {
                    ErrorLogger(error);
                } finally {
                    setShowLoader(false);
                    handleClose();
                }
            }
        },
        [handleClose, updateGoalImage]
    );

    const handleOnSnap = useCallback(async () => {
        if (!cameraReference?.current) return;
        let capturedImage = null;

        try {
            capturedImage = await cameraReference.current.takePictureAsync({
                quality: 0.5,
            });
        } catch (error) {
            return;
        }

        if (capturedImage?.uri) {
            const croppedImage = await ImagePicker.openCropper({
                path: capturedImage.uri,
                width: Dimensions.get("window").width - 48,
                height: 174,
                includeBase64: true,
                cropperToolbarTitle: "",
                cropperCircleOverlay: false,
                showCropGuidelines: false,
                hideBottomControls: true,
            });
            if (croppedImage) handleCroppedImage(croppedImage);
        }
    }, [handleCroppedImage]);

    useEffect(() => {
        if (route?.params?.useCamera) setUseCamera(true);
        else openImageLibrary();
    }, [route, openImageLibrary]);

    return (
        <>
            <ScreenContainer showLoaderModal={showLoader} backgroundType="color">
                <ScreenLayout
                    header={<View />}
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                >
                    <>
                        {useCamera && (
                            <RNCamera
                                ref={cameraReference}
                                style={styles.camera}
                                type={RNCamera.Constants.Type.back}
                                flashMode={RNCamera.Constants.FlashMode.off}
                                captureAudio={false}
                                permissionDialogTitle={"MAE MY Permission to use camera"}
                                permissionDialogMessage={"Allow MAE MY to take photos?"}
                                androidCameraPermissionOptions={{
                                    title: "MAE MY Permission to use camera",
                                    message: "Allow MAE MY to take photos?",
                                    buttonPositive: "Allow",
                                    buttonNegative: "Deny",
                                }}
                            />
                        )}

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
                </ScreenLayout>
            </ScreenContainer>
        </>
    );
};

GoalEditPictureScreen.propTypes = {
    navigation: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
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
    camera: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
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

export default React.memo(GoalEditPictureScreen);
