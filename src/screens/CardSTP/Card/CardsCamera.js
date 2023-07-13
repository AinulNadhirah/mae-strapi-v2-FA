import PropTypes from "prop-types";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Modal } from "react-native";
import { RNCamera } from "react-native-camera";
import DocumentPicker from "react-native-document-picker";
import ImagePicker from "react-native-image-crop-picker";
import { useSafeArea } from "react-native-safe-area-context";

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

function CardsCamera({ onCallback, onClose, pickerType }) {
    const [useCamera, setUseCamera] = useState(false);
    const camera = useRef();
    const safeArea = useSafeArea();

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const handleCropImage = useCallback(
        async (doc) => {
            console.log("handleCropImage", doc);
            if (doc?.path) {
                onCallback(doc);
            }
        },
        [onCallback]
    );

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
                    compressImageQuality: 0.7,
                    mediaType: "photo",
                    //multiple: true,
                    forceJpg: true,
                    includeBase64: true,
                    cropperToolbarTitle: "",
                    showCropGuidelines: false,
                    hideBottomControls: true,
                })
                    .then(handleCropImage)
                    .catch(handleClose);
            }
        }
    }

    const openImageLibrary = useCallback(() => {
        console.log("openImageLibrary");
        ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true,
            compressImageQuality: 0.7,
            mediaType: "any",
            forceJpg: true,
            includeBase64: true,
            //multiple: true,
            cropperToolbarTitle: "",
            showCropGuidelines: false,
            hideBottomControls: true,
        })
            .then(handleCropImage)
            .catch(handleClose);
    }, [handleCropImage, handleClose]);

    const openPDFLibrary = useCallback(async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf],
            });
            console.log(res[0]);
            handleCropImage({ ...res[0], path: res[0]?.uri });
        } catch (err) {
            console.log(err);
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker, exit any dialogs or menus and move on
                handleClose();
            } else {
                throw err;
            }
        }
    }, [handleCropImage, handleClose]);

    useEffect(() => {
        if (pickerType === 0) {
            setUseCamera(false);
            openImageLibrary();
        } else if (pickerType === 1) {
            setUseCamera(false);
            openPDFLibrary();
        } else {
            setUseCamera(true);
        }
    }, [pickerType, useCamera]);

    return (
        <Modal animated animationType="slide" hardwareAccelerated onRequestClose={handleClose}>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={BLACK}
                overlaySolidColor={BLACK}
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
        </Modal>
    );
}

CardsCamera.propTypes = {
    onCallback: PropTypes.func,
    onClose: PropTypes.func,
    pickerType: PropTypes.number,
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

export default withModelContext(CardsCamera);
