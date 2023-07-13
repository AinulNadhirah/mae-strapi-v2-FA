import React, { Component } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform,
    Dimensions,
    PermissionsAndroid,
} from "react-native";
import { RNCamera } from "react-native-camera";
import ImgToBase64 from "react-native-image-base64";

import {
    LOYALTY_ADD_CARD,
    LOYALTY_CARD_PHOTO,
    LOYALTY_CONFIRM_CARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
// import NavigationService from "@navigation/navigationService";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
// import ImagePicker from "react-native-image-crop-picker";
import { showInfoToast, hideToast } from "@components/Toast";

import { WHITE } from "@constants/colors";

import Assets from "@assets";

const screenHeight = Dimensions.get("window").height;

let barcodeDetails = {};

class LoyaltyScanCard extends Component {
    constructor(props) {
        super(props);
        const from = props.route.params.from;
        let title, desc;
        if (from === "barcode") {
            title = "Add Loyalty Card";
            desc = "Take a clear picture of your barcode";
        } else if (from === "front") {
            title = "Add Card Image (Front)";
            desc = "Place your card in the area and capture when ready";
        } else if (from === "back") {
            title = "Add Card Image (Back)";
            desc = "Place your card in the area and capture when ready";
        }
        this.camera = null;
        barcodeDetails = {};
        this.state = {
            ...barcodeDetails,
            camera: {
                type: RNCamera.Constants.Type.back,
                flashMode: RNCamera.Constants.FlashMode.auto,
                barcodeFinderVisible: true,
            },
            showCamera: false,
            title: title,
            desc: desc,
            from: from,
            barcodeToast: true,
            navigateFrom: props?.route?.params?.navigateFrom,
        };
    }

    componentDidMount = () => {
        console.log("[LoyaltyScanCard] >> [componentDidMount]");
        if (Platform.OS === "android") {
            this.checkPermission();
        }
        if (this.state.from === "barcode" && this.state.barcodeToast) {
            setTimeout(() => {
                this.showToastMessage();
            }, 3000);
        }
    };

    showToastMessage = () => {
        if (this.state.from === "barcode" && this.state.barcodeToast) {
            showInfoToast({
                message:
                    "Your barcode could not be detected. Please enter your card number manually.",
            });
        }
    };

    async checkPermission() {
        try {
            const granted = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );

            if (granted) {
                console.log("You can use the WRITE_EXTERNAL_STORAGE");
            } else {
                console.log("WRITE_EXTERNAL_STORAGE permission denied");
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: "MAE MY App Storage Permission",
                        message:
                            "Allow MAE MY to access photos, media and other files on your device?",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK",
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("You can use the storage");
                    this.setState({ showCamera: true });
                } else {
                    console.log("Storage permission denied");
                }
            }
        } catch (err) {
            console.warn(err);
        }

        try {
            const granted1 = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
            );
            if (granted1) {
                console.log("You can use the READ_EXTERNAL_STORAGE");
            } else {
                console.log("READ_EXTERNAL_STORAGE permission denied");
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title: "MAE MY App Storage Permission",
                        message:
                            "Allow MAE MY to access photos, media and other files on your device?",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK",
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("You can use the storage");
                    this.setState({ showCamera: true });
                } else {
                    console.log("Storage permission denied");
                }
            }
        } catch (err) {
            console.warn(err);
        }
    }

    onBarCodeRead(scanResult) {
        console.log("ScanImageData.barCode :" + scanResult.data);
        if (
            this.state.from === "barcode" &&
            scanResult &&
            scanResult?.data &&
            scanResult.data.length
        ) {
            this.state.barcodeToast = false;
            hideToast();
            this.barcodeDetails = this.prepareBarcodeDetails();
            this.props.navigation.navigate(LOYALTY_ADD_CARD, {
                barcodeNumber: scanResult.data,
            });
        }
        return;
    }

    prepareBarcodeDetails = () => {
        this.barcodeDetails = { ...this.state };
        console.log("LoyaltyScanCard >> colourDetails >> ", this.barcodeDetails);
        return this.barcodeDetails;
    };

    onBackTap = () => {
        console.log("[LoyaltyScanCard] >> [onBackTap]");
        this.state.barcodeToast = false;
        hideToast();
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[LoyaltyScanCard] >> [onCloseTap]");
        this.state.barcodeToast = false;
        const { navigateFrom } = this.state;
        hideToast();
        if (this.state.from !== "barcode") {
            navigateFrom == "viewCard"
                ? this.props.navigation.navigate(LOYALTY_CONFIRM_CARD)
                : this.props.navigation.navigate(LOYALTY_ADD_CARD);
        } else {
            this.props.navigation.navigate("Dashboard", {
                screen: "Loyalty",
                params: {
                    loadCards: false,
                },
            });
        }
    };

    async takePicture() {
        console.log("inside the take picture method");
        if (this.camera) {
            const options = { quality: 0.3, fixOrientation: true };
            const data = await this.camera.takePictureAsync(options);
            if (data) {
                if (!data.uri) {
                    showInfoToast({
                        message: "No image Before open cropping only, please select image.",
                    });
                    return;
                }

                // this.state.from === "front" ? this.props.navigation.navigate(LOYALTY_CARD_PHOTO, { cardFrontImage: data.uri }) : this.props.navigation.navigate(LOYALTY_CARD_PHOTO, { cardBackImage: data.uri });
                //
                ImgToBase64.getBase64String(data.uri)
                    .then((base64String) => {
                        if (this.state.from === "front") {
                            this.props.navigation.navigate(LOYALTY_CARD_PHOTO, {
                                cardFrontImageB64: base64String,
                                cardFrontImage: data.uri,
                            });
                        } else if (this.state.from === "back") {
                            this.props.navigation.navigate(LOYALTY_CARD_PHOTO, {
                                cardBackImageB64: base64String,
                                cardBackImage: data.uri,
                            });
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });

                // ImagePicker.openCropper({
                // 	path: ScanImageData.uri,
                // 	width: 275 * 3,
                // 	height: 175 * 3,
                // 	cropping: true,
                // 	compressImageQuality: 1,
                // 	includeBase64: true,
                // 	freeStyleCropEnabled: true,
                // 	mediaType: "photo",
                // 	orientation: "portrait",
                // 	pauseAfterCapture: true,
                // 	fixOrientation: true
                // })
                // 	.then(image => {
                // 		if (this.state.from === "front") {
                // 			this.props.navigation.navigate(LOYALTY_CARD_PHOTO, { cardFrontImage: image.data });
                // 		} else if (this.state.from === "back") {
                // 			this.props.navigation.navigate(LOYALTY_CARD_PHOTO, { cardBackImage: image.data });
                // 		}
                // 	})
                // 	.catch(e => {
                // 		console.log(e);
                // 	});
            }
        }
    }

    render() {
        console.log("[LoyaltyScanCard] >> [render]");
        const { title, desc, from } = this.state;
        return (
            <ScreenContainer backgroundType="image" backgroundImage={Assets.loyaltycardbackground}>
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
                                    <HeaderCloseButton onPress={this.onCloseTap} isWhite={true} />
                                }
                            />
                        }
                    >
                        <View>
                            <View style={styles.addLoyaltyCardView}>
                                <Typo
                                    text={title}
                                    fontSize={17}
                                    fontWeight="300"
                                    lineHeight={20}
                                    color={WHITE}
                                />
                            </View>
                            <View style={styles.camerabackground}>
                                <View style={styles.viewCamera}>
                                    <RNCamera
                                        ref={(cam) => {
                                            this.camera = cam;
                                        }}
                                        style={styles.cameraView}
                                        barCodeTypes={[
                                            RNCamera.Constants.BarCodeType.aztec,
                                            RNCamera.Constants.BarCodeType.code128,
                                            RNCamera.Constants.BarCodeType.code39,
                                            RNCamera.Constants.BarCodeType.code39mod43,
                                            RNCamera.Constants.BarCodeType.code93,
                                            RNCamera.Constants.BarCodeType.ean13,
                                            RNCamera.Constants.BarCodeType.ean8,
                                            RNCamera.Constants.BarCodeType.pdf417,
                                            RNCamera.Constants.BarCodeType.upce,
                                            RNCamera.Constants.BarCodeType.interleaved2of5,
                                            RNCamera.Constants.BarCodeType.itf14,
                                            RNCamera.Constants.BarCodeType.datamatrix,
                                            RNCamera.Constants.BarCodeType.qr,
                                        ]}
                                        onBarCodeRead={
                                            from === "barcode"
                                                ? this.onBarCodeRead.bind(this)
                                                : null
                                        }
                                        permissionDialogTitle={"MAE MY Permission to use camera"}
                                        permissionDialogMessage={"Allow MAE MY to take photos?"}
                                        androidCameraPermissionOptions={{
                                            title: "MAE MY Permission to use camera",
                                            message: "Allow MAE MY to take photos?",
                                            buttonPositive: "Allow",
                                            buttonNegative: "Deny",
                                        }}
                                        cropToPreview={true}
                                        captureAudio={false}
                                    />
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
                            {/* Enter Manual Button */}
                            {from === "barcode" ? (
                                <View style={styles.enterManualBtnView}>
                                    <ActionButton
                                        backgroundColor={WHITE}
                                        borderRadius={24}
                                        height={48}
                                        width={146}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text="Enter Manually"
                                            />
                                        }
                                        onPress={this.onBackTap}
                                    />
                                </View>
                            ) : (
                                <View style={styles.captureButtonView}>
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
                            )}
                        </View>
                    </ScreenLayout>
                </View>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    addLoyaltyCardDesc: {
        height: 46,
        marginLeft: "10%",
        marginTop: 30,
        width: "80%",
    },
    addLoyaltyCardView: {
        height: 46,
        marginTop: 30,
    },
    cameraView: {
        flex: 1,
    },
    camerabackground: {
        borderColor: WHITE,
        borderRadius: 9,
        borderStyle: "solid",
        borderWidth: 2,
        flexDirection: "column",
        height: 206,
        marginTop: "20%",
    },
    captureButton: {
        height: 100,
        width: 100,
    },
    captureButtonView: {
        alignItems: "center",
        height: 100,
        justifyContent: "center",
        marginTop: "10%",
        width: "100%",
        // marginTop: (screenHeight * 6) / 100,
        // bottom: "0%",
    },
    enterManualBtnView: {
        alignItems: "center",
        marginTop: (screenHeight * 6) / 100,
        // height: 200,
        // justifyContent: "space-around",
        // marginHorizontal: (screenWidth * 15) / 100,
    },
    viewCamera: {
        borderRadius: 6,
        height: 202,
        overflow: "hidden",
        // flex: 1,
    },
});

export default LoyaltyScanCard;
