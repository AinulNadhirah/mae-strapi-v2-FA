import PropTypes from "prop-types";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { RNCamera } from "react-native-camera";
import ImagePicker from "react-native-image-crop-picker";
import { useSafeArea } from "react-native-safe-area-context";

import ScreenLayout from "@layouts/ScreenLayout";

import ScreenContainer from "@components/Containers/ScreenContainer";
import { showSuccessToast } from "@components/Toast";

import { withModelContext } from "@context";

import { updateProfilePicture } from "@services";

import { BLACK } from "@constants/colors";
import { FA_SETTINGS_PROFILE_PHOTO } from "@constants/strings";

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

function ProfileCamera({ navigation, route, updateModel }) {
    const [loading, setLoading] = useState(false);
    const [useCamera, setUseCamera] = useState(false);
    const camera = useRef();
    const safeArea = useSafeArea();

    const handleClose = useCallback(() => {
        navigation.setParams({ imagePicker: false });

        navigation.canGoBack() && navigation.goBack();
    }, [navigation]);

    const handleCropImage = useCallback(
        async (image) => {
            console.log("incropimage");
            if (image && image.data) {
                const params = {
                    imgBase64: image.data,
                };

                setLoading(true);

                try {
                    const response = await updateProfilePicture(params);

                    if (response) {
                        console.log(response);

                        updateModel({
                            user: {
                                profileImage: `data:jpeg;base64,${image.data}`,
                            },
                        });

                        showSuccessToast({
                            message: "Profile successfully updated.",
                        });
                    }
                } catch (error) {
                    // error when saving, manage by api manager
                } finally {
                    setLoading(false);
                    handleClose();
                }
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
                quality: 0.5,
            };
            const capture = await camera.current.takePictureAsync(options);

            if (capture && capture.uri) {
                ImagePicker.openCropper({
                    path: capture.uri,
                    width: 294,
                    height: 294,
                    includeBase64: true,
                    cropperToolbarTitle: "",
                    cropperCircleOverlay: true,
                    showCropGuidelines: false,
                    hideBottomControls: true,
                })
                    .then(handleCropImage)
                    .catch(handleCropError);
            }
        }
    }

    const openImageLibrary = useCallback(() => {
        ImagePicker.openPicker({
            width: 294,
            height: 294,
            cropping: true,
            compressImageQuality: 0.8,
            mediaType: "photo",
            forceJpg: true,
            includeBase64: true,
            cropperToolbarTitle: "",
            cropperCircleOverlay: true,
            showCropGuidelines: false,
            hideBottomControls: true,
        })
            .then(handleCropImage)
            .catch(handlePickImageError);
    }, [handleCropImage, handlePickImageError]);

    // function handleZoom(event, state, zoomEventObj) {
    //     console.log(event, state, zoomEventObj);
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
            analyticScreenName={FA_SETTINGS_PROFILE_PHOTO}
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
                                    type={RNCamera.Constants.Type.front}
                                    flashMode={RNCamera.Constants.FlashMode.off}
                                    captureAudio={false}
                                    androidCameraPermissionOptions={{
                                        title: "MAE Permission to use camera",
                                        message: "Allow MAE to take photos?",
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

ProfileCamera.propTypes = {
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
    closeButton: {
        alignItems: "center",
        height: 44,
        width: 44,
    },
    closeButtonIcon: {
        height: 17,
        width: 17, // match the size of the actual image
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

export default withModelContext(ProfileCamera);
