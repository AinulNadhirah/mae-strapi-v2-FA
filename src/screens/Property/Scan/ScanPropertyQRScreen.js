/* eslint-disable object-shorthand */

/* eslint-disable react-native/no-color-literals */

/* eslint-disable react-native/sort-styles */

/* eslint-disable react/jsx-no-bind */

/* eslint-disable react-native/no-inline-styles */

/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";
import { RNCamera } from "react-native-camera";
import Permissions from "react-native-permissions";
import QRCodeScanner from "react-native-qrcode-scanner";

import {
    BANKINGV2_MODULE,
    PROPERTY_DETAILS,
    SCAN_PROPERTY_QR_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import {
    getPropertyDetails,
    getPreLoginPropertyDetails,
    getPreLoginPropertyDetailsCloud,
    getPostLoginPropertyDetailsCloud,
} from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, WHITE } from "@constants/colors";
import {
    SCAN_PROP_QR,
    COMMON_ERROR_MSG,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_PROPERTY_SCAN_QR,
} from "@constants/strings";

import { isEmpty } from "@utils/dataModel/utility";

const { width, height } = Dimensions.get("window");

function ScanPropertyQRScreen({ route, navigation }) {
    const { getModel } = useModelController();
    const [loading, setLoading] = useState(true);
    const [permissionCheck, setPermissionCheck] = useState(false);
    const [flashOn, setFlashOn] = useState(false);
    const [viewFocused, setViewFocused] = useState(false);
    const [qrScanActive, setQRScanActive] = useState(true);
    const { isPostLogin } = getModel("auth");

    useEffect(() => {
        init();

        const onFocus = navigation.addListener("focus", () => {
            console.log("[ScanPropertyQRScreen] >> [focusListener]");
            setViewFocused(true);
            setQRScanActive(true);
        });

        const onBlur = navigation.addListener("blur", () => {
            setViewFocused(false);
        });
        return () => {
            onFocus;
            onBlur;
        };
    }, []);

    const init = async () => {
        console.log("[ScanPropertyQRScreen] >> [init]");
        const isPermission = await checkCameraPermission();
        if (isPermission) {
            setPermissionCheck(true);
            setTimeout(() => {
                setLoading(false);
            }, 1500);
        } else {
            showErrorToast({ message: "Required camera permission" });
            setLoading(false);
        }

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_PROPERTY_SCAN_QR,
        });
    };

    const onPressBack = () => {
        console.log("[ScanPropertyQRScreen] >> [onPressBack]");
        navigation.canGoBack() && navigation.goBack();
    };

    const checkCameraPermission = async () => {
        const permissionResult = await Permissions.request("camera");
        return !(
            permissionResult === "denied" ||
            permissionResult === "undetermined" ||
            permissionResult === "restricted"
        );
    };

    const onPressFlashButton = () => {
        console.log("[ScanPropertyQRScreen][onPressFlashButton] >> [flashOn]: " + flashOn);
        setFlashOn(!flashOn);
    };

    const onScanningSuccess = (e) => {
        console.log("[ScanPropertyQRScreen] >> [onScanningSuccess]", e);
        if (qrScanActive) {
            if (e === null) {
                showErrorToast({ message: "Unable to process your QR Code. Please try again." });
                return;
            }
            if (Platform.OS !== "ios") Vibration.vibrate();
            setQRScanActive(false);
            getDetails(e.data);
        }
    };

    const getDetails = async (qrData) => {
        console.log("[ScanPropertyQRScreen] >> [getDetails]");

        setLoading(true);

        const navParams = route?.params ?? {};
        const latitude = navParams?.latitude ?? "";
        const longitude = navParams?.longitude ?? "";

        //Request object
        const params = { property_id: null, property_url: qrData, latitude, longitude };

        const { propertyMetadata } = getModel("misc");
        const isCloudEnabled = propertyMetadata?.propertyCloudEnabled ?? false;
        const cloudEndPointBase = propertyMetadata?.propertyCloudUrl ?? "";

        if (isPostLogin) {
            const apiCall =
                isCloudEnabled && !isEmpty(cloudEndPointBase)
                    ? getPostLoginPropertyDetailsCloud(cloudEndPointBase, params)
                    : getPropertyDetails(params);

            try {
                const httpResp = await apiCall;
                handleGetPropertyDetailsResponse(httpResp, latitude, longitude);
            } catch (error) {
                handleGetPropertyDetailsError(error);
            } finally {
                setLoading(false);
                setTimeout(() => {
                    setQRScanActive(true);
                }, 1000);
            }
        } else {
            const apiCall =
                isCloudEnabled && !isEmpty(cloudEndPointBase)
                    ? getPreLoginPropertyDetailsCloud(cloudEndPointBase, params)
                    : getPreLoginPropertyDetails(params);

            try {
                const httpResp = await apiCall;
                handleGetPropertyDetailsResponse(httpResp, latitude, longitude);
            } catch (error) {
                handleGetPropertyDetailsError(error);
            } finally {
                setLoading(false);
                setTimeout(() => {
                    setQRScanActive(true);
                }, 1000);
            }
        }
    };

    const handleGetPropertyDetailsResponse = (httpResp, latitude, longitude) => {
        console.log("[ScanPropertyQRScreen][getPropertyDetails] >> Response: ", httpResp);
        const result = httpResp?.data?.result ?? {};
        const statusCode = result?.statusCode ?? null;
        const statusDesc = result?.statusDesc ?? null;
        if (statusCode === "0000") {
            const propertyDetail = result?.propertyDetails ?? {};
            if (propertyDetail) {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: PROPERTY_DETAILS,
                    params: {
                        propertyDetail,
                        latitude,
                        longitude,
                        from: SCAN_PROPERTY_QR_SCREEN,
                    },
                });
            }
        } else {
            // Show error message
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
        }
    };

    const handleGetPropertyDetailsError = (error) => {
        console.log("[ScanPropertyQRScreen][getPropertyDetails] >> Exception: ", error);
        showErrorToast({
            message: error?.message ?? COMMON_ERROR_MSG,
        });
    };

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={loading}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={SCAN_PROP_QR}
                            />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
            >
                <React.Fragment>
                    {permissionCheck && viewFocused && (
                        <View style={{ width: width, height: height }}>
                            <QRCodeScanner
                                cameraStyle={{ width: "100%", height: "100%" }}
                                containerStyle={{ width: "100%", height: "100%" }}
                                showMarker={true}
                                vibrate={false}
                                onRead={onScanningSuccess}
                                reactivate={true}
                                cameraProps={{
                                    autoFocus: RNCamera.Constants.AutoFocus.on,
                                    barCodeTypes: [RNCamera.Constants.BarCodeType.qr],
                                    flashMode: flashOn
                                        ? RNCamera.Constants.FlashMode.torch
                                        : RNCamera.Constants.FlashMode.off,
                                    googleVisionBarcodeType:
                                        Platform.OS === "ios"
                                            ? ""
                                            : RNCamera.Constants.GoogleVisionBarcodeDetection
                                                  .BarcodeType.QR_CODE,
                                    googleVisionBarcodeMode:
                                        Platform.OS === "ios"
                                            ? ""
                                            : RNCamera.Constants.GoogleVisionBarcodeDetection
                                                  .BarcodeMode.ALTERNATE,
                                }}
                                customMarker={
                                    <View style={styles.container}>
                                        <View style={styles.contentContainer}>
                                            <Image
                                                style={styles.qrFrame}
                                                source={require("@assets/icons/ic_qr_border.png")}
                                            />
                                            <Typo
                                                fontSize={18}
                                                fontWeight="300"
                                                color={WHITE}
                                                lineHeight={18}
                                                style={styles.placeQRText}
                                                text="Place QR code in the scan area"
                                            />
                                        </View>
                                        <View style={styles.torchContainer}>
                                            <TouchableOpacity onPress={onPressFlashButton}>
                                                <Image
                                                    style={styles.torchImage}
                                                    source={
                                                        flashOn
                                                            ? require("@assets/icons/ic_qr_torch_off.png")
                                                            : require("@assets/icons/ic_qr_torch_on.png")
                                                    }
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                }
                            />
                        </View>
                    )}
                </React.Fragment>
            </ScreenLayout>
        </ScreenContainer>
    );
}

ScanPropertyQRScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        height: height,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    contentContainer: {
        alignItems: "center",
        flex: 0.7,
        justifyContent: "center",
    },
    torchContainer: {
        flex: 0.3,
        justifyContent: "flex-start",
    },
    qrFrame: {
        width: width / 1.4,
        height: width / 1.4,
    },
    placeQRText: {
        marginTop: 30,
    },
    torchImage: {
        width: 40,
        height: 40,
        resizeMode: "contain",
    },
});

export default ScanPropertyQRScreen;
