import React, { Component } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { RNCamera } from "react-native-camera";
import ImgToBase64 from "react-native-image-base64";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { WHITE, MEDIUM_GREY } from "@constants/colors";

import Assets from "@assets";

class ScanKYCScreen extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.camera = null;
        this.camra_type = "";

        if (this.props.route.params.CAMERA_TYPE == "Selfi") {
            this.camra_type = RNCamera.Constants.Type.front;
        } else {
            this.camra_type = RNCamera.Constants.Type.back;
        }
        this.state = {
            filledUserDetails: props.route.params?.filledUserDetails,
            camera: {
                type: this.camra_type,
                flashMode: RNCamera.Constants.FlashMode.auto,
            },
            cameraType: RNCamera.Constants.Type.front,
            desc: this.props.route.params.openCamText,
            switchCam: false,
        };

        console.log("camerra .Type is. :" + this.state.camera.type);
    }

    componentWillMount() {
        // this.checkPermission();
    }

    onBackTap = () => {
        console.log("[ScanKYCScreen] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[ScanKYCScreen] >> [onCloseTap]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || "More", {
            screen: filledUserDetails?.entryScreen || "Apply",
            params: filledUserDetails?.entryParams,
        });
    };

    onSwitchCamera = () => {
        const flag = !this.state.switchCam;
        if (flag) {
            cameraType = RNCamera.Constants.Type.back;
        } else {
            cameraType = RNCamera.Constants.Type.front;
        }
        this.setState({ cameraType, switchCam: flag });
    };

    async takePicture() {
        console.log("inside the take picture method");
        if (this.camera) {
            const options = { quality: 1, fixOrientation: true };
            const data = await this.camera.takePictureAsync(options);
            let ScanImageData = {};
            if (data != undefined && data != null) {
                ScanImageData.data = data;
                ScanImageData.uri = data.uri;
                if (!ScanImageData.uri) {
                    showInfoToast({
                        message: "No image Before open cropping only, please select image.",
                    });
                    return;
                }
                //
                ImgToBase64.getBase64String(ScanImageData.uri)
                    .then((base64String) => {
                        this.props.navigation.navigate(navigationConstant.UPLOAD_SECURITY_IMAGE, {
                            selfieImgData: base64String,
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        }
    }

    render() {
        const { camera, desc, cameraType, filledUserDetails } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <RNCamera
                    ref={(cam) => {
                        this.camera = cam;
                    }}
                    type={cameraType}
                    flashMode={RNCamera.Constants.FlashMode.auto}
                    permissionDialogTitle={"Permission to use camera"}
                    permissionDialogMessage={"We need your permission to use your phone camera"}
                    androidCameraPermissionOptions={{
                        title: "Permission to use camera",
                        message: "We need your permission to use your camera",
                        buttonPositive: "Allow",
                        buttonNegative: "Deny",
                    }}
                    style={styles.cameraView}
                    cropToPreview={false}
                    captureAudio={false}
                    // ratio='6:9'
                >
                    <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", flex: 1 }}>
                        <ScreenLayout
                            useSafeArea
                            paddingHorizontal={36}
                            paddingBottom={0}
                            header={
                                <HeaderLayout
                                    headerLeftElement={
                                        <HeaderBackButton onPress={this.onBackTap} isWhite={true} />
                                    }
                                    headerRightElement={
                                        filledUserDetails?.from != "updateDetails" ? (
                                            <HeaderCloseButton
                                                onPress={this.onCloseTap}
                                                isWhite={true}
                                            />
                                        ) : null
                                    }
                                />
                            }
                        >
                            <View style={styles.cameraLayout}>
                                <View style={styles.selficamrabackground}>
                                    {/* <View style={styles.selfiviewCamera}> */}
                                    {/* <RNCamera
											ref={cam => {
												this.camera = cam;
											}}
											type={RNCamera.Constants.Type.front}
											flashMode={RNCamera.Constants.FlashMode.auto}
											faceDetectionLandmarks={RNCamera.Constants.FaceDetection.Landmarks.all}
											permissionDialogTitle={"Permission to use camera"}
											permissionDialogMessage={"We need your permission to use your camera phone"}
											androidCameraPermissionOptions={{
												title: "Permission to use camera",
												message: "We need your permission to use your camera",
												buttonPositive: "Allow",
												buttonNegative: "Deny"
											}}
											style={styles.cameraView}
											cropToPreview={false}
											captureAudio={false}
											// ratio='6:9'
										/> */}
                                    {/* </View> */}
                                </View>
                            </View>
                            <View style={styles.addLoyaltyCardDesc}>
                                <Typo
                                    text={desc}
                                    fontSize={17}
                                    fontWeight="300"
                                    lineHeight={23}
                                    color={WHITE}
                                />
                            </View>
                            <View style={styles.captureButtonView}>
                                <TouchableOpacity
                                    style={styles.captureButton}
                                    onPress={this.onSwitchCamera}
                                >
                                    <Image
                                        accessible={true}
                                        style={styles.captureButton}
                                        source={Assets.switchCamera}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.captureButton}
                                    onPress={this.takePicture.bind(this)}
                                >
                                    <Image
                                        accessible={true}
                                        style={styles.captureButton}
                                        source={Assets.icYellowCamIcon}
                                    />
                                </TouchableOpacity>
                            </View>
                        </ScreenLayout>
                    </View>
                </RNCamera>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    cameraLayout: {
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        width: "100%",
        height: "55%",
    },
    selficamrabackground: {
        // flexDirection: "column",
        marginTop: 80,
        borderColor: WHITE,
        borderWidth: 2,
        height: 300,
        width: 300,
        borderRadius: 150,
        borderStyle: "solid",
    },
    selfiviewCamera: {
        borderRadius: 150,
        height: "100%",
        overflow: "hidden",
        width: "100%",
    },
    cameraView: {
        flex: 1,
    },
    addLoyaltyCardDesc: {
        height: 46,
        marginLeft: "10%",
        marginTop: 40,
        width: "80%",
    },
    captureButton: {
        height: 100,
        width: 100,
    },
    captureButtonView: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 100,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
});

export default ScanKYCScreen;
