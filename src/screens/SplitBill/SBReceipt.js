import React, { Component } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { RNCamera } from "react-native-camera";
import RNFS from "react-native-fs";
import Permissions from "react-native-permissions";

import { SB_CONFIRMATION, SB_RECEIPT, SB_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { updateBillReceiptAPI } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, WHITE, YELLOW } from "@constants/colors";
import {
    FA_SCREEN_NAME,
    FA_SPLIT_BILL_DELETE_RECEIPT,
    FA_SPLIT_BILL_RECEIPT,
    FA_VIEW_SCREEN,
    RECEIPT,
    YES,
} from "@constants/strings";
import { BILL_RECEIPT_API } from "@constants/url";

import * as DataModel from "@utils/dataModel";

import Assets from "@assets";

import { commonCbHandler } from "./SBController";

class SBReceipt extends Component {
    state = {
        // UI Manipulation
        openCamera: this.props?.route?.params?.openCamera ?? false,
        confirmImgIcons: this.props?.route?.params?.confirmImgIcons ?? false,
        deleteIcon: this.props?.route?.params?.deleteIcon ?? false,
        splitBillReceipt: this.props?.route?.params?.splitBillReceipt ?? "",
        isReceiptAURL: this.props?.route?.params?.isReceiptAURL ?? false,
        showConfirmPopup: false,

        // Flow Data
        screenName: this.props?.route?.params?.screenName ?? "",
        flowType: this.props?.route?.params?.flowType ?? "",
        billId: this.props?.route?.params?.billId ?? "",

        // Logged In User Related
        token: "",
    };

    componentDidMount = () => {
        console.log("[SBReceipt] >> [componentDidMount]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SPLIT_BILL_RECEIPT,
        });

        // Using Focus to handle props with new values
        this.props.navigation.addListener("focus", this.onScreenFocus);
    };

    onScreenFocus = () => {
        console.log("[SBReceipt] >> [onScreenFocus]");

        const { getModel } = this.props;
        const { token } = getModel("auth");

        this.setState({ token: `bearer ${token || ""}` });

        const params = this.props?.route?.params ?? null;
        if (!params) return;

        const { openCamera, confirmImgIcons, deleteIcon, splitBillReceipt, screenName } =
            this.state;

        this.setState({
            openCamera: params?.openCamera ?? openCamera,
            confirmImgIcons: params?.confirmImgIcons ?? confirmImgIcons,
            deleteIcon: params?.deleteIcon ?? deleteIcon,
            splitBillReceipt: params?.splitBillReceipt ?? splitBillReceipt,
            screenName: params?.screenName ?? screenName,
        });
    };

    onBackTap = () => {
        console.log("[SBReceipt] >> [onBackTap]");

        this.props.navigation.goBack();
    };

    checkPermission = async () => {
        console.log("[SBReceipt] >> [checkPermission]");

        const status = await Permissions.request("camera");
        return !(status == "denied" || status == "undetermined" || status == "restricted");
    };

    takePicture = async () => {
        console.log("[SBReceipt] >> [takePicture]");

        const permission = await this.checkPermission();
        if (permission && this.camera) {
            const options = {
                quality: 1,
                fixOrientation: true,
                skipProcessing: true,
            };
            const data = await this.camera.takePictureAsync(options);

            if (data != undefined && data != null) {
                const uri = data.uri;
                if (!uri) {
                    return Alert.alert(
                        "No image",
                        "Before open cropping only, please select image"
                    );
                }

                const base64image = await RNFS.readFile(uri, "base64");
                const isReceiptAURL = DataModel.isURL(base64image);
                this.setState({
                    splitBillReceipt: base64image,
                    openCamera: false,
                    confirmImgIcons: true,
                    isReceiptAURL,
                });
            }
        }
    };

    retakePicture = () => {
        console.log("[SBReceipt] >> [retakePicture]");

        this.setState({
            confirmImgIcons: false,
            openCamera: true,
        });
    };

    savePicture = () => {
        console.log("[SBReceipt] >> [savePicture]");
        const { screenName, flowType, splitBillReceipt } = this.state;

        switch (screenName) {
            case SB_CONFIRMATION:
                this.props.navigation.navigate(SB_CONFIRMATION, {
                    splitBillReceipt: splitBillReceipt,
                    backFrom: "takePhoto",
                    screenName: SB_RECEIPT,
                });
                break;
            case SB_DETAILS:
                this.props.navigation.navigate(SB_DETAILS, {
                    splitBillReceipt,
                    flowType,
                });
                break;
            default:
                break;
        }
    };

    showConfirmPopup = () => {
        console.log("[SBReceipt] >> [showConfirmPopup]");

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_SPLIT_BILL_DELETE_RECEIPT,
        });

        this.setState({ showConfirmPopup: true });
    };

    hideConfirmPopup = () => {
        console.log("[SBReceipt] >> [hideConfirmPopup]");

        this.setState({ showConfirmPopup: false });
    };

    deletePicture = async () => {
        console.log("[SBReceipt] >> [deletePicture]");

        // Hide confirmation popup
        this.hideConfirmPopup();

        const url = BILL_RECEIPT_API;
        const { billId, flowType } = this.state;

        // Empty checking
        if (!billId) {
            showErrorToast({
                message: "Cannot update receipt due to missing details. Please try again later.",
            });
            return;
        }

        // Request object
        const params = {
            billId: billId,
            image: null,
        };

        const httpResp = await updateBillReceiptAPI(url, params, true).catch((error) => {
            console.log("[SBReceipt][updateBillReceiptAPI] >> Exception: ", error);
        });
        const { code, message } = commonCbHandler(httpResp);
        if (code === 0) {
            this.props.navigation.navigate(SB_DETAILS, {
                flowType,
                deleteReceipt: true,
            });
        } else {
            showErrorToast({
                message: message,
            });
        }
    };

    render() {
        const {
            openCamera,
            splitBillReceipt,
            confirmImgIcons,
            deleteIcon,
            isReceiptAURL,
            showConfirmPopup,
            token,
        } = this.state;

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <React.Fragment>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        // useSafeArea
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={RECEIPT}
                                    />
                                }
                            />
                        }
                    >
                        <React.Fragment>
                            <View style={Style.cameraCls}>
                                {openCamera ? (
                                    <RNCamera
                                        ref={(cam) => {
                                            this.camera = cam;
                                        }}
                                        type={RNCamera.Constants.Type.back}
                                        flashMode={RNCamera.Constants.FlashMode.auto}
                                        permissionDialogTitle={"Permission to use camera"}
                                        permissionDialogMessage={
                                            "We need your permission to use your camera phone"
                                        }
                                        androidCameraPermissionOptions={{
                                            title: "Permission to use camera",
                                            message: "We need your permission to use your camera",
                                            buttonPositive: "Allow",
                                            buttonNegative: "Deny",
                                        }}
                                        style={Style.cameraCls}
                                        cropToPreview={true}
                                        captureAudio={false}
                                    />
                                ) : (
                                    <Image
                                        source={{
                                            uri: isReceiptAURL
                                                ? splitBillReceipt
                                                : `data:image/jpeg;base64,${splitBillReceipt}`,
                                            headers: {
                                                Authorization: token,
                                            },
                                        }}
                                        style={Style.receiptImageCls}
                                        resizeMode="cover"
                                        resizeMethod="resize"
                                    />
                                )}
                            </View>

                            {/* Bottom button container */}
                            <View style={Style.bottomContCls}>
                                {/* Take Picture Button */}
                                {openCamera && (
                                    <TouchableOpacity
                                        style={[Style.iconContCls, { backgroundColor: YELLOW }]}
                                        onPress={this.takePicture}
                                    >
                                        <Image
                                            source={Assets.icon32BlackCamera}
                                            style={Style.camIconCls}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                )}

                                {/* Delete Button */}
                                {deleteIcon && (
                                    <TouchableOpacity
                                        style={[Style.iconContCls, { backgroundColor: WHITE }]}
                                        onPress={this.showConfirmPopup}
                                    >
                                        <Image
                                            source={Assets.icon32BlackTrash}
                                            style={Style.deleteIconCls}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                )}

                                {confirmImgIcons && (
                                    <View style={Style.iconsCls}>
                                        {/* Cross Button */}
                                        <TouchableOpacity
                                            style={[Style.iconContCls, { backgroundColor: WHITE }]}
                                            onPress={this.retakePicture}
                                        >
                                            <Image
                                                source={Assets.icClose}
                                                style={Style.crossIconCls}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>

                                        {/* Tick Button */}
                                        <TouchableOpacity
                                            style={[Style.iconContCls, Style.savePicCls]}
                                            onPress={this.savePicture}
                                        >
                                            <Image
                                                source={Assets.icTickBlackSmall}
                                                style={Style.tickIconCls}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </React.Fragment>
                    </ScreenLayout>

                    {/* REMOVE RECEIPT CONFIRMATION POPUP */}
                    <Popup
                        visible={showConfirmPopup}
                        title="Delete attachment"
                        description="Are you sure you want to delete the attachment?"
                        onClose={this.hideConfirmPopup}
                        primaryAction={{
                            text: YES,
                            onPress: this.deletePicture,
                        }}
                    />
                </React.Fragment>
            </ScreenContainer>
        );
    }
}

const Style = StyleSheet.create({
    bottomContCls: {
        alignItems: "center",
        backgroundColor: "transparent",
        bottom: 0,
        height: 100,
        justifyContent: "center",
        left: 0,
        position: "absolute",
        right: 0,
    },

    camIconCls: {
        height: "60%",
        width: "60%",
    },

    cameraCls: {
        flex: 1,
    },
    crossIconCls: {
        height: "80%",
        width: "80%",
    },

    deleteIconCls: {
        height: "60%",
        width: "60%",
    },

    iconContCls: {
        alignItems: "center",
        borderColor: WHITE,
        borderRadius: 30,
        borderStyle: "solid",
        borderWidth: 2,
        height: 50,
        justifyContent: "center",
        overflow: "hidden",
        width: 50,
    },

    iconsCls: {
        flexDirection: "row",
    },

    receiptImageCls: {
        height: "100%",
        width: "100%",
    },

    savePicCls: {
        backgroundColor: WHITE,
        marginLeft: 50,
    },

    tickIconCls: {
        height: "40%",
        width: "40%",
    },
});

export default withModelContext(SBReceipt);
