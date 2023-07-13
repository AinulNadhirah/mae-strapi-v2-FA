import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    ImageBackground,
    Dimensions,
    ScrollView,
    Linking,
    NativeModules,
    Platform,
} from "react-native";
import Config from "react-native-config";
import RNekyc from "react-native-ekyc";
import RNFS from "react-native-fs";
import LinearGradient from "react-native-linear-gradient";
import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";

import {
    APPLY_CARD_INTRO,
    MAE_ONBOARD_DETAILS,
    MAE_NAME_VERIFICATION,
    MAE_TERMS_COND,
    MAE_REUPLOAD_SUCCESS,
    ZEST_CASA_STACK,
    ZEST_CASA_ACTIVATE_ACCOUNT,
    APPLY_MAE_SCREEN,
    PREMIER_MODULE_STACK,
    PREMIER_ACTIVATE_ACCOUNT,
    CAPTURE_SELFIE_SCREEN,
    MORE,
    APPLY_SCREEN,
    MAE_MODULE_STACK,
    MAE_REUPLOAD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";
import configZipFile from "@components/zoloz/config_realId.zip";

import { withModelContext } from "@context";

import {
    initeKYCAPI,
    eKYCOCRAPI,
    initeKYCV2API,
    eKYCCheckResult,
    eKYCGetResultUpdateZestAPI,
} from "@services";

import { YELLOW, ROYAL_BLUE, GREY, NEARYLY_DARK_GREY, WHITE, MEDIUM_GREY } from "@constants/colors";
import { CAPTURE_DOCS_BASE64 } from "@constants/data";
import {
    PM1_DRAFT_USER,
    PM1_NTB_USER,
    PMA_NTB_USER,
    PMA_DRAFT_USER,
    KAWANKU_SAVINGS_NTB_USER,
    KAWANKU_SAVINGS_DRAFT_USER,
    KAWANKU_SAVINGSI_NTB_USER,
    KAWANKU_SAVINGSI_DRAFT_USER,
} from "@constants/premierConfiguration";
import {
    AUTH_NOT_SUCCESSFUL,
    AUTH_TIMEOUT,
    BACK,
    CANCEL,
    COMMON_ERROR_MSG,
    CONTINUE,
    COUNTRY_SAME_AS_PASSPORT,
    ekycFailed,
    ENABLE_CAMERA_ACCESS,
    ENABLE_CAMERA_ACCESS_DESC,
    ENSURE_BIODATA_CLEAR_BEFORE_CONTINUE,
    ENSURE_MYKAD_CLEAR_BEFORE_CONTINUE,
    ID_VERIFICATION_FAIL,
    MYKAD_NUMBER_MISMATCH,
    passportScanDesc,
    PASSPORT_EXPIRED_TRY_AGAIN,
    PASSPORT_NUMBER_MISMATCH,
    PLSTP_UD_MYKAD,
    PLSTP_VER_IC_SCAN_DESC,
    PLSTP_VER_IC_SNAP_DESC,
    PLSTP_VER_IC_TITLE,
    PLSTP_VER_PASSPORT_TITLE,
    RETAKE,
    scanBackDesc,
    scanBackTitle,
    scanFrontDesc,
    scanFrontTitle,
    scanIntroDesc,
    scanIntroTitle,
    scanStartDesc,
    scanStartTitle,
    SETTINGS,
    UNABLE_TO_DETECT_HOLOGRAM,
} from "@constants/strings";
import { ZEST_DRAFT_USER, ZEST_NTB_USER } from "@constants/zestCasaConfiguration";

import { storeCloudLogs } from "@utils/cloudLog";
import { checkCamPermission, isEmpty } from "@utils/dataModel/utility";

import Assets from "@assets";

const { height } = Dimensions.get("window");

const { ZolozKit } = NativeModules;

let ocrSDKResult,
    ocrReqPayload,
    ocrDocImages,
    humanFace,
    docData,
    initAPIResult,
    transactionId,
    checkResultResponse;

const base64 = CAPTURE_DOCS_BASE64;
const destinationPath = RNFS.DocumentDirectoryPath + "/config_realId.zip";

class CaptureDocumentScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        navigation: PropTypes.object,
        route: PropTypes.object,
    };

    casaUsers = [
        PM1_NTB_USER,
        PMA_NTB_USER,
        PM1_DRAFT_USER,
        PMA_DRAFT_USER,
        KAWANKU_SAVINGS_NTB_USER,
        KAWANKU_SAVINGS_DRAFT_USER,
        KAWANKU_SAVINGSI_NTB_USER,
        KAWANKU_SAVINGSI_DRAFT_USER,
    ];
    isCASA = false;
    constructor(props) {
        super(props);
        this.isCASA = this.casaUsers.includes(props.route.params?.eKycParams?.from);
        this.state = {
            filledUserDetails: props.route.params?.filledUserDetails,
            eKycParams: props.route.params?.eKycParams,
            idFrontImgData: "",
            idBackImgData: "",
            hideButtons: true,
            cameraPermission: true,
            isZoloz: false,
            selectedIDType: props.route?.params?.eKycParams?.selectedIDType, // MyKad/Passport
            title:
                props.route?.params?.eKycParams?.selectedIDType === PLSTP_UD_MYKAD
                    ? PLSTP_VER_IC_TITLE
                    : PLSTP_VER_PASSPORT_TITLE,
            description:
                props.route?.params?.eKycParams?.selectedIDType === PLSTP_UD_MYKAD
                    ? PLSTP_VER_IC_SCAN_DESC
                    : PLSTP_VER_IC_SNAP_DESC,
        };
    }

    componentDidMount() {
        console.log("[CaptureDocumentScreen] >> [componentDidMount]");
        this.deleteFile();
        this.props.navigation.addListener("focus", this.onScreenFocus);
    }

    onScreenFocus = () => {
        console.log("[CaptureDocumentScreen] >> [onScreenFocus]");
        if (this.props.route?.params?.from === CAPTURE_SELFIE_SCREEN) {
            this.setState({
                idFrontImgData: "",
                idBackImgData: "",
                hideButtons: true,
            });
        }
    };

    resetScreen = () => {
        const { selectedIDType } = this.state;
        this.setState({
            idFrontImgData: "",
            idBackImgData: "",
            hideButtons: true,
            description:
                selectedIDType === PLSTP_UD_MYKAD ? PLSTP_VER_IC_SCAN_DESC : PLSTP_VER_IC_SNAP_DESC,
        });
    };

    deleteFile = () => {
        const { isZoloz } = this.props.getModel("misc");
        this.setState({ isZoloz });
        RNFS.unlink(destinationPath)
            .then(() => {
                console.log("Deleted the file");
            })
            // `unlink` will throw an error, if the item to unlink does not exist
            .catch((err) => {
                console.log(
                    "[CaptureDocumentScreen] >> [deleteFile catch] >> Delete file error ::: ",
                    err.message
                );
            });
    };

    moveToDocumentsFolder = async () => {
        /* below code will move the config_realId.zip to documents folder to access by zoloz sdk */
        const resource = resolveAssetSource(configZipFile);
        const fileUri = resource.uri;
        console.log("file URI :: ", { destinationPath, resource, fileUri });
        if (Platform.OS === "android") {
            RNFS.copyFileAssets("config_realId.zip", destinationPath)
                .then((result) => {
                    console.log("result ::: ", result);
                    this.frontImagePressed();
                })
                .catch((error) => console.log(error));
        } else {
            const downloadOptions = {
                fromUrl: fileUri,
                toFile: destinationPath,
            };
            RNFS.downloadFile(downloadOptions).promise.then((res) => {
                console.log("res ::: ", res);
                res?.statusCode === 200 && this.frontImagePressed();
            });
        }
    };

    onBackTap = () => {
        console.log("[CaptureDocumentScreen] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[CaptureDocumentScreen] >> [onCloseTap]");
        const { eKycParams } = this.state;
        this.props.navigation.navigate(eKycParams?.entryStack || MORE, {
            screen: eKycParams?.entryScreen || APPLY_SCREEN,
            params: eKycParams?.entryParams,
        });
    };

    onCloseTapZest = () => {
        console.log("[CaptureDocumentScreen] >> [onCloseTapZest]");
        const MAEUserDetails = this.state?.eKycParams || {};
        MAEUserDetails.securityPhraseImage = null;
        MAEUserDetails.documentImages = null;
        this.props.navigation.navigate(MAE_MODULE_STACK, {
            screen: APPLY_MAE_SCREEN,
            params: MAEUserDetails,
        });
    };

    moveToNext = async () => {
        console.log("[CaptureDocumentScreen] >> [moveToNext]");
        const { deviceInformation } = this.props.getModel("device");
        const { isZoloz } = this.state;
        if (deviceInformation.Emulator !== 1 && deviceInformation.Emulator !== 2) {
            isZoloz ? this.navigateToNextScreen() : this.eKYCOCRDataSubmit();
        } else {
            // Emulator
            const { eKycParams } = this.state;
            const filledUserDetails = this.prepareUserDetails();
            if (eKycParams?.from === APPLY_CARD_INTRO) {
                // Re-route back to Apply Card Flow
                this.props.navigation.navigate(filledUserDetails.entryStack, {
                    screen: filledUserDetails.entryScreen,
                    params: {
                        ...filledUserDetails.entryParams,
                        from: "eKYC",
                        eKycStatus: "05",
                        ekycRefId: "010000",
                        ekycSuccess: true,
                    },
                });
            } else if (eKycParams?.from === MAE_REUPLOAD) {
                this.props.navigation.navigate(MAE_REUPLOAD_SUCCESS, {
                    filledUserDetails,
                });
            } else if (eKycParams?.from === ZEST_NTB_USER || eKycParams?.from === ZEST_DRAFT_USER) {
                this.props.navigation.navigate(ZEST_CASA_STACK, {
                    screen: ZEST_CASA_ACTIVATE_ACCOUNT,
                    params: {
                        isZest: eKycParams?.isZestI,
                    },
                });
            } else if (eKycParams?.from === PM1_NTB_USER || eKycParams?.from === PM1_DRAFT_USER) {
                this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                    screen: PREMIER_ACTIVATE_ACCOUNT,
                    params: {
                        isPM1: eKycParams?.isPM1,
                    },
                });
            } else if (eKycParams?.from === PMA_NTB_USER || eKycParams?.from === PMA_DRAFT_USER) {
                this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                    screen: PREMIER_ACTIVATE_ACCOUNT,
                    params: {
                        isPMA: eKycParams?.isPMA,
                    },
                });
            } else if (
                eKycParams?.from === KAWANKU_SAVINGS_NTB_USER ||
                eKycParams?.from === KAWANKU_SAVINGS_DRAFT_USER
            ) {
                this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                    screen: PREMIER_ACTIVATE_ACCOUNT,
                    params: {
                        isKawanku: eKycParams?.isKawanku,
                    },
                });
            } else if (
                eKycParams?.from === KAWANKU_SAVINGSI_NTB_USER ||
                eKycParams?.from === KAWANKU_SAVINGSI_DRAFT_USER
            ) {
                this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                    screen: PREMIER_ACTIVATE_ACCOUNT,
                    params: {
                        isKawankuSavingsI: eKycParams?.isKawankuSavingsI,
                    },
                });
            } else {
                this.props.navigation.navigate(MAE_TERMS_COND, {
                    filledUserDetails,
                });
            }
        }
    };

    navigateToNextScreen = () => {
        const { selectedIDType, eKycParams } = this.state;
        const from = eKycParams?.from;
        const ekycRefId = checkResultResponse?.ekycRefId ?? null;
        const ekycUpdatePayload = {
            ekycRefId,
            ekycIdImage: checkResultResponse?.extIdInfo?.extraImages?.CROPPED_FRONT,
            ekycIdImageBack: checkResultResponse?.extIdInfo?.extraImages?.CROPPED_BACK,
            ekycSelfieImage: checkResultResponse?.extFaceInfo?.faceImg,
            pan: eKycParams?.pan ?? "",
            accountNumber: eKycParams?.accountNumber ?? "",
            idNo: eKycParams?.idNo ?? "",
        };
        if (from === APPLY_CARD_INTRO) {
            this.handleMaeCardNav(ekycRefId, eKycParams, checkResultResponse);
        } else if (from === MAE_REUPLOAD) {
            this.props.navigation.navigate(MAE_REUPLOAD_SUCCESS, {
                filledUserDetails: this.prepareUserDetails(checkResultResponse),
            });
        } else if (from === ZEST_NTB_USER || from === ZEST_DRAFT_USER) {
            this.handleZestiNav(ekycUpdatePayload, eKycParams);
        } else if (this.isCASA) {
            this.handlePMAPM1Nav(ekycUpdatePayload, eKycParams);
        } else {
            this.handleApplyMaeNav(eKycParams, selectedIDType);
        }
    };

    handleApplyMaeNav = (eKycParams, selectedIDType) => {
        const nameCheckResult =
            selectedIDType === PLSTP_UD_MYKAD && eKycParams?.isNameCheck
                ? this.nameCheck(checkResultResponse)
                : "";
        if (nameCheckResult) {
            this.props.navigation.navigate(MAE_NAME_VERIFICATION, {
                filledUserDetails: this.prepareUserDetails(checkResultResponse),
                initAPIResult,
                name: nameCheckResult,
            });
        } else {
            this.props.navigation.navigate(MAE_TERMS_COND, {
                filledUserDetails: this.prepareUserDetails(checkResultResponse),
            });
        }
    };

    handleMaeCardNav = (ekycRefId, eKycParams, checkResultResponse) => {
        this.props.navigation.navigate(eKycParams.entryStack, {
            screen: eKycParams.entryScreen,
            params: {
                ...eKycParams.entryParams,
                from: "eKYC",
                ekycRefId,
                eKycStatus:
                    checkResultResponse.ekycResult === "Success"
                        ? "05"
                        : eKycParams.entryParams?.eKycStatus,
                ekycSuccess: checkResultResponse.ekycResult === "Success",
            },
        });
    };

    handleZestiNav = (ekycUpdatePayload, eKycParams) => {
        eKYCGetResultUpdateZestAPI(ekycUpdatePayload)
            .then((responseUploadEKYC) => {
                if (responseUploadEKYC) {
                    this.props.navigation.navigate(ZEST_CASA_STACK, {
                        screen: ZEST_CASA_ACTIVATE_ACCOUNT,
                        params: {
                            isZest: eKycParams?.isZestI,
                        },
                    });
                } else {
                    const result = responseUploadEKYC?.data?.result;
                    const statusDesc = result?.statusDesc ?? null;
                    this.onCloseTapZest();
                    showErrorToast({
                        message: statusDesc || ekycFailed,
                    });
                }
            })
            .catch((error) => {
                console.log("[CaptureDocumentScreen] >> [eKYCGetResultUpdateZestAPI] >> Failure");
                if (error?.error?.error !== "suspended") {
                    this.onCloseTapZest();
                    showErrorToast({
                        message: error.message,
                    });
                }
            });
    };

    handlePMAPM1Nav = (ekycUpdatePayload, eKycParams) => {
        eKYCGetResultUpdateZestAPI(ekycUpdatePayload)
            .then((responseUploadEKYC) => {
                if (responseUploadEKYC) {
                    this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                        screen: PREMIER_ACTIVATE_ACCOUNT,
                        params: {
                            isPM1: eKycParams?.isPM1,
                            isPMA: eKycParams?.isPMA,
                            isKawanku: eKycParams?.isKawanku,
                            isKawankuSavingsI: eKycParams?.isKawankuSavingsI,
                        },
                    });
                } else {
                    const result = responseUploadEKYC?.data?.result;
                    const statusDesc = result?.statusDesc ?? null;
                    showErrorToast({
                        message: statusDesc || ekycFailed,
                    });
                }
            })
            .catch((error) => {
                console.log("[CaptureDocumentScreen] >> [CASA] >> Failure");
                if (error?.error?.error !== "suspended") {
                    showErrorToast({
                        message: error.message,
                    });
                }
            });
    };

    prepareUserDetails = (result) => {
        console.log("CaptureDocumentScreen >> [prepareUserDetails]");
        let documentImages = {};
        const { isZoloz, selectedIDType, idFrontImgData, idBackImgData } = this.state;
        if (selectedIDType === PLSTP_UD_MYKAD) {
            documentImages = {
                idFrontImgData: isZoloz
                    ? result?.extIdInfo?.extraImages?.CROPPED_FRONT
                    : idFrontImgData, //result?.extIdInfo?.frontPageImg,
                idBackImgData: isZoloz
                    ? result?.extIdInfo?.extraImages?.CROPPED_BACK
                    : idBackImgData, //result?.extIdInfo?.backPageImg,
            };
        } else {
            documentImages = {
                idFrontImgData: isZoloz ? result?.extIdInfo?.frontPageImg : idFrontImgData,
            };
        }
        const selfieImages = isZoloz && { selfieImgData: result?.extFaceInfo?.faceImg };

        const MAEUserDetails = this.props.route.params?.filledUserDetails || {};
        MAEUserDetails.documentImages = documentImages;
        MAEUserDetails.docData = isZoloz ? result?.extIdInfo?.ocrResult : docData;
        MAEUserDetails.selfieImages = selfieImages;
        MAEUserDetails.ekycRefId = result?.ekycRefId || "";

        return MAEUserDetails;
    };

    handleClosePopup = () => this.setState({ cameraPermission: true });

    gotoSettings = () => {
        console.log("[CaptureDocumentScreen] >> [gotoSettings]");
        this.setState(
            {
                cameraPermission: true,
            },
            () => {
                Linking.canOpenURL("app-settings:")
                    .then((supported) => {
                        if (!supported) {
                            console.log("Can't handle settings url");
                        } else {
                            return Linking.openURL("app-settings:");
                        }
                    })
                    .catch((err) => console.error("An error occurred", err));
            }
        );
    };

    frontImagePressedFico = async () => {
        console.log("[CaptureDocumentScreen] >> [frontImagePressed]");
        const { selectedIDType, filledUserDetails } = this.state;
        const permission = await checkCamPermission();
        if (permission) {
            const { deviceInformation, deviceId } = this.props.getModel("device");
            const deviceDetails = {
                device_model: deviceInformation.DeviceModel,
                os_version: deviceInformation.DeviceSystemVersion,
            };
            const params =
                filledUserDetails?.onBoardDetails2?.from === ZEST_NTB_USER ||
                filledUserDetails?.onBoardDetails2?.from === ZEST_DRAFT_USER
                    ? {
                          ext_ref: filledUserDetails?.onBoardDetails2?.isZestI
                              ? `ZEST-${filledUserDetails.onBoardDetails2.idNo}`
                              : `M2UPR-${filledUserDetails.onBoardDetails2.idNo}`, //Unique number (For now we pass IC num / Passport Number)
                          device_id: deviceId, //Device UUID
                          device_details: JSON.stringify(deviceDetails), // Device modal and OS version is mandatory
                          doc_type: selectedIDType === PLSTP_UD_MYKAD ? "mykad" : "passport", //mykad/passport
                          country:
                              selectedIDType !== PLSTP_UD_MYKAD
                                  ? filledUserDetails.onBoardDetails2.passportCountry
                                  : "", // IF doctype is passport then send country name //India, Singapore, Cambodia etc
                          device_platform: Platform.OS === "android" ? "and" : "ios",
                      }
                    : {
                          ext_ref: filledUserDetails.onBoardDetails2.idNo, //Unique number (For now we pass IC num / Passport Number)
                          device_id: deviceId, //Device UUID
                          device_details: JSON.stringify(deviceDetails), // Device modal and OS version is mandatory
                          doc_type: selectedIDType === PLSTP_UD_MYKAD ? "mykad" : "passport", //mykad/passport
                          country:
                              selectedIDType !== PLSTP_UD_MYKAD
                                  ? filledUserDetails.onBoardDetails2.passportCountry
                                  : "", // IF doctype is passport then send country name //India, Singapore, Cambodia etc
                          device_platform: Platform.OS === "android" ? "and" : "ios",
                      };
            this.initeKYCFICO(params);
        }
    };

    frontImagePressed = async () => {
        console.log("isZoloz : ", this.state.isZoloz);
        if (!this.state.isZoloz) {
            this.frontImagePressedFico();
            return;
        }
        console.log("[CaptureDocumentScreen] >> [zolozInit]");
        const { selectedIDType, eKycParams } = this.state;
        const { idNo, sceneCode, fullName, passportCountry, passportCountryCode } = eKycParams;
        const exists = await RNFS.exists(destinationPath);
        if (exists) {
            ZolozKit.getMetaInfo((metaInfo) => {
                const requestData = {
                    metaInfo,
                    docType: selectedIDType, // === PLSTP_UD_MYKAD ? PLSTP_UD_MYKAD : "Passport",
                    userId: idNo,
                    sceneCode,
                    name: fullName,
                    country: selectedIDType !== PLSTP_UD_MYKAD ? passportCountry : "", // IF doctype is passport then send country name //India, Singapore, Cambodia etc
                    countryCode: selectedIDType !== PLSTP_UD_MYKAD ? passportCountryCode : "",
                };
                this.initeKYC(requestData);
            });
        } else {
            console.log("[CaptureDocumentScreen] >> [zolozInit] >> File not exists");
            this.moveToDocumentsFolder();
        }
    };

    initeKYC = async (params) => {
        console.log("[CaptureDocumentScreen] >> [initeKYC]");
        const response = await this.initReq(params);
        if (response) {
            console.log("[CaptureDocumentScreen][initeKYC] >> Success");
            initAPIResult = response.data.result;
            const statusCode = initAPIResult?.result?.resultStatus;
            if (statusCode === "S") {
                this.zolozStart(initAPIResult);
            } else {
                showErrorToast({
                    message: initAPIResult.response_message,
                });
            }
        } else {
            showErrorToast({
                message: response.message || COMMON_ERROR_MSG,
            });
        }
    };

    initReq = async (req) => {
        try {
            return await initeKYCV2API(req);
        } catch (error) {
            return error;
        }
    };

    zolozStart = (response) => {
        const { ZLZ_LOCAL_KEY, ZLZ_CHAMELEON_KEY } = ZolozKit.getConstants();
        const jsonData = response;
        transactionId = jsonData.transactionId;
        ZolozKit.start(
            jsonData.clientCfg,
            {
                [ZLZ_CHAMELEON_KEY]: destinationPath,
                [ZLZ_LOCAL_KEY]: "en-US",
            },
            (result) => {
                console.log("start result ::: ", result);
                result ? this.zolozCheckResultAPI() : this.resetScreen();
            }
        );
    };

    zolozCheckResultAPI = async () => {
        console.log("[CaptureDocumentScreen] >> [zolozCheckResultAPI]");
        const { eKycParams } = this.state;
        const requestData = {
            transactionId,
            isReturnImage: "Y",
            userId: eKycParams?.idNo,
            reqType: eKycParams?.reqType,
        };
        const response = await this.checkResult(requestData);
        console.log("[CaptureDocumentScreen][zolozCheckResultAPI] >> Response : ", response);
        checkResultResponse = response?.data?.result;
        if (checkResultResponse) {
            this.validateCheckResultResponse(checkResultResponse);
        } else {
            this.handleCheckResultFailure(response);
        }
    };

    handleCheckResultFailure = (error) => {
        this.props.updateModel({ ekycCheckResult: error });
        if (["9999", "9998"].includes(error?.error?.result?.statusCode)) {
            //If failure at zoloz verification
            showErrorToast({
                message: error?.error?.result?.statusDesc,
            });
        } else if (error?.error?.result?.statusCode === "9997") {
            //If failed due to details matching missmatch
            this.mismatchDetails(error?.error?.result?.statusDesc);
        } else {
            showErrorToast({
                message: ID_VERIFICATION_FAIL,
            });
        }
    };

    checkResult = async (req) => {
        // eslint-disable-next-line no-useless-catch
        try {
            return await eKYCCheckResult(req);
        } catch (error) {
            return error;
        }
    };

    validateCheckResultResponse = (response) => {
        const { selectedIDType } = this.state;
        let errorMessage = "";
        switch (response?.ekycResult) {
            case "Failure":
                errorMessage = AUTH_NOT_SUCCESSFUL;
                break;
            case "VoidTimeout":
                errorMessage = AUTH_TIMEOUT;
                break;
            default:
                break;
        }

        if (response?.ekycResult === "Success") {
            this.setState({
                idFrontImgData: response?.extIdInfo?.frontPageImg,
                idBackImgData: response?.extIdInfo?.backPageImg,
                hideButtons: false,
                description:
                    selectedIDType === PLSTP_UD_MYKAD
                        ? ENSURE_MYKAD_CLEAR_BEFORE_CONTINUE
                        : ENSURE_BIODATA_CLEAR_BEFORE_CONTINUE,
            });
        } else if (response?.ekycResult === "VoidTimeout") {
            this.resetScreen();
            showErrorToast({
                message: errorMessage,
            });
        } else {
            this.resetScreen();
            if (!__DEV__) {
                this.onCloseTap();
            }
            showErrorToast({
                message: ekycFailed,
            });
        }
    };

    nameCheck = () => {
        const { eKycParams } = this.state;
        if (checkResultResponse) {
            const ocrName = checkResultResponse?.extIdInfo?.ocrResult?.NAME.toLowerCase();
            return ocrName !== eKycParams?.fullName.toLowerCase()
                ? checkResultResponse?.extIdInfo?.ocrResult?.NAME
                : "";
        }
        return "";
    };

    mismatchDetails = (msg) => {
        const { eKycParams } = this.state;
        showErrorToast({
            message: msg,
        });
        if (eKycParams?.from === "NewMAE") {
            this.props.navigation.navigate(MAE_ONBOARD_DETAILS, {
                entryScreen: eKycParams?.entryScreen,
                entryStack: eKycParams?.entryStack,
                entryParams: eKycParams?.entryParams,
            });
        }
    };

    render() {
        const {
            title,
            description,
            idFrontImgData,
            idBackImgData,
            selectedIDType,
            eKycParams,
            cameraPermission,
        } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <View style={styles.viewContainer}>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                                // headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                                headerRightElement={
                                    eKycParams?.from !== MAE_REUPLOAD ? (
                                        <HeaderCloseButton onPress={this.onCloseTap} />
                                    ) : null
                                }
                            />
                        }
                    >
                        <ScrollView>
                            <View style={styles.formContainer}>
                                <React.Fragment>
                                    <View style={styles.fieldContainer}>
                                        {/* Title */}
                                        <Typo
                                            fontSize={14}
                                            lineHeight={23}
                                            fontWeight="600"
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={title}
                                        />

                                        {/* Description */}
                                        <Typo
                                            fontSize={20}
                                            lineHeight={30}
                                            fontWeight="300"
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={description}
                                        />

                                        {/* Image Capture Tabs */}
                                        <View>
                                            {/* Top Image Capture Tab */}
                                            {idFrontImgData !== "" ? (
                                                <TouchableOpacity
                                                    style={styles.captureButton}
                                                    onPress={this.frontImagePressed}
                                                    accessibilityLabel="frontImageClick"
                                                >
                                                    <View>
                                                        <ImageBackground
                                                            style={styles.capturedImage}
                                                            imageStyle={styles.capturedImageStyle}
                                                            source={{
                                                                uri: `data:image/gif;base64,${idFrontImgData}`,
                                                            }}
                                                        />
                                                    </View>
                                                </TouchableOpacity>
                                            ) : (
                                                <View style={styles.captureMainView}>
                                                    <TouchableOpacity
                                                        style={styles.camerabuttonView}
                                                        onPress={this.frontImagePressed}
                                                        accessibilityLabel="moveToNext"
                                                    >
                                                        <Image
                                                            style={styles.cameraImage}
                                                            source={Assets.maeCamIcon}
                                                        />

                                                        {selectedIDType === PLSTP_UD_MYKAD ? (
                                                            <Typo
                                                                fontSize={12}
                                                                lineHeight={23}
                                                                fontWeight="600"
                                                                letterSpacing={0}
                                                                textAlign="center"
                                                                text="Front"
                                                                color={NEARYLY_DARK_GREY}
                                                                style={styles.frontTypo}
                                                            />
                                                        ) : null}
                                                    </TouchableOpacity>
                                                </View>
                                            )}

                                            {/* Bottom Image Capture Tab */}
                                            {selectedIDType === PLSTP_UD_MYKAD ? (
                                                idBackImgData !== "" ? (
                                                    <TouchableOpacity
                                                        style={styles.captureButton}
                                                        onPress={this.frontImagePressed}
                                                        accessibilityLabel="moveToNext"
                                                    >
                                                        <View>
                                                            <ImageBackground
                                                                style={styles.capturedImage}
                                                                imageStyle={
                                                                    styles.capturedImageStyle
                                                                }
                                                                source={{
                                                                    uri: `data:image/gif;base64,${idBackImgData}`,
                                                                }}
                                                            />
                                                        </View>
                                                    </TouchableOpacity>
                                                ) : (
                                                    <View style={styles.captureMainView}>
                                                        <TouchableOpacity
                                                            style={styles.camerabuttonView}
                                                            onPress={this.frontImagePressed}
                                                            accessibilityLabel="moveToNext"
                                                        >
                                                            <Image
                                                                style={styles.cameraImage}
                                                                source={Assets.maeCamIcon}
                                                            />

                                                            {selectedIDType === PLSTP_UD_MYKAD ? (
                                                                <Typo
                                                                    fontSize={12}
                                                                    lineHeight={23}
                                                                    fontWeight="600"
                                                                    letterSpacing={0}
                                                                    textAlign="center"
                                                                    text={BACK}
                                                                    color={NEARYLY_DARK_GREY}
                                                                    style={styles.backTypo}
                                                                />
                                                            ) : null}
                                                        </TouchableOpacity>
                                                    </View>
                                                )
                                            ) : null}
                                        </View>
                                    </View>
                                </React.Fragment>
                            </View>
                        </ScrollView>
                        {!this.state.hideButtons && (
                            <View style={styles.bottomBtnContCls}>
                                <LinearGradient
                                    colors={["#efeff300", MEDIUM_GREY]}
                                    style={styles.linearGradient}
                                />
                                <ActionButton
                                    backgroundColor={YELLOW}
                                    borderRadius={20}
                                    height={48}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={CONTINUE}
                                        />
                                    }
                                    onPress={this.moveToNext}
                                />
                                <TouchableOpacity
                                    onPress={this.frontImagePressed}
                                    activeOpacity={0.8}
                                    style={styles.retakeTypo}
                                >
                                    <Typo
                                        color={ROYAL_BLUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={RETAKE}
                                        textAlign="center"
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScreenLayout>
                    <Popup
                        visible={!cameraPermission}
                        title={ENABLE_CAMERA_ACCESS}
                        description={ENABLE_CAMERA_ACCESS_DESC}
                        onClose={this.handleClosePopup}
                        primaryAction={{
                            text: SETTINGS,
                            onPress: this.gotoSettings,
                        }}
                        secondaryAction={{
                            text: CANCEL,
                            onPress: this.handleClosePopup,
                        }}
                    />
                </View>
            </ScreenContainer>
        );
    }
    initeKYCFICO = (params) => {
        console.log("[CaptureDocumentScreen] >> [initeKYC]");
        const { deviceInformation } = this.props.getModel("device");
        if (deviceInformation.Emulator === 1) {
            const filledUserDetails = this.prepareUserDetails();
            this.props.navigation.navigate(CAPTURE_SELFIE_SCREEN, {
                filledUserDetails,
            });
            return;
        }

        initeKYCAPI(true, JSON.stringify(params))
            .then((response) => {
                console.log("[CaptureDocumentScreen][inniteKYC] >> Success");
                initAPIResult = JSON.parse(response.data.result);
                const statusCode = initAPIResult.response_code;
                if (statusCode === "100") {
                    if (deviceInformation.Emulator !== 1 && deviceInformation.Emulator !== 2) {
                        this.startOCR(response.data.result);
                    } else {
                        //If Emulator
                        this.setState({
                            idFrontImgData: base64,
                            idBackImgData: base64,
                            hideButtons: false,
                        });
                    }
                } else {
                    showErrorToast({
                        message: initAPIResult.response_message,
                    });
                }
            })
            .catch((error) => {
                console.log("[CaptureDocumentScreen] >> [initeKYC] >> Failure", error);
                showErrorToast({
                    message: error.message,
                });
            });
    };

    startOCR = async (result) => {
        console.log("[CaptureDocumentScreen] >> [startOCR]");
        const { selectedIDType, filledUserDetails } = this.state;
        const initParseResult = JSON.parse(result);
        const ocrJSON = {
            docType: initParseResult.doc_type, //MYS_MYKAD for IC and for passport CountryISOCode_PASS
            sessionID: initParseResult.uid, //result.uid;
            docReq: result, //UID from init responnse
        }; //Data need to get from Backend
        const displayText = {};
        const lookupData = {};
        //Sample lookup data
        // #define CONSTANT_LOOKUP_DATA_MYKAD @"{\"placeOfBirth\":\"NEGERI SEMBILAN\",\"uid\":\"901030-05-510\",\"address\":\"NO 311 JALAN SPRINGHILL 10\/22 BANDAR SPRINGHILL 71010 PORT DICKSON NEGERI SEMBILAN\",\"dob\":\"1990 10 30\",\"nationality\":\"WARGANEGARA\",\"sex\":\"PEREMPUAN\",\"name\":\"SUBASHINI AP SUBHAKARU\"}"
        // #define CONSTANT_LOOKUP_DATA_PASSPORT @"{\"issuing_org\":\"IND\",\"document_number\":\"M934136\",\"surname\":\"BHANDARI\",\"dob\":\"1991 11 18\",\"nationality\":\"IND\",\"expiration_date\":\"2025 05 13\",\"given_name\":\"AMAN SINGH\",\"sex\":\"M\",\"personal_number\":\"\",\"ID\":\"P\"}"

        const idNo = filledUserDetails.onBoardDetails2.idNo;
        if (selectedIDType === PLSTP_UD_MYKAD) {
            displayText.scanIntroTitle = scanIntroTitle;
            displayText.scanIntroDesc = scanIntroDesc;
            displayText.scanStartTitle = scanStartTitle;
            displayText.scanStartDesc = scanStartDesc;
            displayText.scanFrontTitle = scanFrontTitle;
            displayText.scanFrontDesc = scanFrontDesc;
            displayText.scanBackTitle = scanBackTitle;
            displayText.scanBackDesc = scanBackDesc;

            lookupData.uid = idNo.substr(0, 6) + "-" + idNo.substr(6, 2) + "-" + idNo.substr(8, 4);
            lookupData.name = filledUserDetails.onBoardDetails?.fullName;
        } else {
            displayText.passportScanDesc = passportScanDesc;

            lookupData.document_number = idNo.toUpperCase();
            // // lookupData.issuing_org = initParseResult.doc_type;
            // lookupData.nationality = initParseResult.doc_type.split("_")[0];
        }
        ocrJSON.displayText = displayText;
        ocrJSON.lookupData = JSON.stringify(lookupData);

        if (Platform.OS === "android") {
            ocrJSON.licenseKey = Config.EKYC_ANDROID_LICENSE_KEY;
            ocrJSON.devEnable = Config?.DEV_ENABLE ?? "";
        }

        // if (Platform.OS == "ios") {
        const eKYCResult = await RNekyc.startKYC(ocrJSON, false);

        if (eKYCResult.result === "noCameraPermission") {
            //Popup
            this.setState({ cameraPermission: false });
        } else if (eKYCResult.result === "fail") {
            showErrorToast({
                message: UNABLE_TO_DETECT_HOLOGRAM,
            });
            this._logSDKError("eKYC hologram capture failed", "eKYC ID Capture Fail");
            this.onBackTap(); //If failed need to redirect to back page.
        } else {
            this.ocrResult(eKYCResult, initParseResult.doc_type);
        }
        // } else {
        //     // @GV please standardised the android's library function the same way iOS did
        //     ocrJSON.licenseKey = Config.EKYC_ANDROID_LICENSE_KEY;
        // RNekyc.startKYC(
        //     ocrJSON,
        //     (error) => {
        //         //Error
        //         console.error(error);
        //         console.log(" eKYC fails..%@" + error);
        //     },
        //     (eKYCResult) => {
        //         try {
        //             //Success nonce
        //             console.log("eKYC Response ==> ");
        //             console.log(" eKYC Details ::: ", eKYCResult);
        //             this.ocrResult(JSON.parse(eKYCResult), initParseResult.doc_type);
        //         } catch (e) {
        //             if (e !== null && e !== "") {
        //                 console.log("cipher error : " + e.toString());
        //             }
        //         }
        //     }
        // );
        // }
    };

    ocrResult = (eKYCResult, docType) => {
        console.log("[CaptureDocumentScreen] >> [ocrResult]");
        const { selectedIDType, filledUserDetails } = this.state;
        ocrSDKResult = eKYCResult.result;
        const docImages = eKYCResult.images; //IC Front&Back images or Passport Image
        ocrSDKResult = JSON.parse(ocrSDKResult);
        const responseModel = ocrSDKResult;
        // let docData;
        const [responseCodes] = responseModel.response_codes; // TODO check during unit testing in device
        console.log("[CaptureDocumentScreen] >> [response_codes]", responseCodes);
        if (responseCodes === "200") {
            // if (selectedIDType == PLSTP_UD_MYKAD) {
            //     const validateCode = responseModel.response_codes;
            //     if (
            //         validateCode.includes("6002") &&
            //         filledUserDetails?.onBoardDetails2?.from !== APPLY_CARD_INTRO
            //     ) {
            //         lookUpValidation = false;
            //     }
            // }

            ocrDocImages = docImages;
            let idNumber;
            if (responseModel.mrz) {
                docData = responseModel.mrz; //OCR data of PASSPORT
                idNumber = docData.document_number;
                const countryCode = docType.split("_");
                if (countryCode[0].toUpperCase() !== docData.nationality.toUpperCase()) {
                    this.mismatchDetailsFICO(COUNTRY_SAME_AS_PASSPORT);
                    return;
                }
                let doe = docData.expiration_date;
                doe = doe.replace(/ /g, "-");
                const passportExpiry = new Date(doe);
                const todaysDate = new Date();
                if (passportExpiry < todaysDate) {
                    this.mismatchDetailsFICO(PASSPORT_EXPIRED_TRY_AGAIN);
                    return;
                }
            } else if (responseModel.ocr) {
                docData = responseModel.ocr; //OCR data of IC
                idNumber = docData.uid.replace(/-/g, "");
            } else {
                console.log();
            }
            if (filledUserDetails.onBoardDetails2.idNo.toUpperCase() !== idNumber.toUpperCase()) {
                const msg =
                    selectedIDType === PLSTP_UD_MYKAD
                        ? MYKAD_NUMBER_MISMATCH
                        : PASSPORT_NUMBER_MISMATCH;
                this.mismatchDetailsFICO(msg);
                return;
            }
            humanFace = responseModel.human_faces[0].value;
            let idFrontImgData = "";
            let idBackImgData = "";

            if (docImages.length > 1) {
                idFrontImgData = docImages[0].img0;
                idBackImgData = docImages[1].img1;
            } else if (docImages.length === 1) {
                idFrontImgData = docImages[0].img0;
            } else {
                console.log("No images in success method.");
            }

            this.setState({
                idFrontImgData: isEmpty(idFrontImgData) ? "" : idFrontImgData,
                idBackImgData: isEmpty(idBackImgData) ? "" : idBackImgData,
                hideButtons: false,
                description:
                    selectedIDType === PLSTP_UD_MYKAD
                        ? ENSURE_MYKAD_CLEAR_BEFORE_CONTINUE
                        : ENSURE_BIODATA_CLEAR_BEFORE_CONTINUE,
            });
            ocrReqPayload = eKYCResult.ocrReqPayload;
        } else {
            this.setState({
                idFrontImgData: "",
                idBackImgData: "",
                hideButtons: true,
                description:
                    selectedIDType === PLSTP_UD_MYKAD
                        ? PLSTP_VER_IC_SCAN_DESC
                        : PLSTP_VER_IC_SNAP_DESC,
            });
            const [responseMessages] = ocrSDKResult.response_messages; // TODO check during unit testing in device
            showErrorToast({
                message: responseMessages,
            });
            const errorLog = {
                response_codes: ocrSDKResult?.response_codes,
                response_messages: ocrSDKResult?.response_messages,
            };
            this._logSDKError(errorLog, "eKYC ID Capture Fail");
        }
    };

    _logSDKError = (error, errorType) => {
        const { getModel } = this.props;
        storeCloudLogs(getModel, {
            errorType,
            errorDetails: error,
        });
    };

    mismatchDetailsFICO = (msg) => {
        const { filledUserDetails } = this.state;
        showErrorToast({
            message: msg,
        });
        // this.onCloseTap(); // Redirecting to entry point
        if (filledUserDetails?.onBoardDetails2?.from === "NewMAE") {
            const { filledUserDetails } = this.state;
            this.props.navigation.navigate(MAE_ONBOARD_DETAILS, {
                entryScreen: filledUserDetails?.entryScreen,
                entryStack: filledUserDetails?.entryStack,
                entryParams: filledUserDetails?.entryParams,
            });
        }
    };

    eKYCOCRDataSubmit = () => {
        console.log("[CaptureDocumentScreen] >> [eKYCOCRDataSubmission]");

        eKYCOCRAPI(true, JSON.parse(ocrReqPayload))
            .then(() => {
                console.log("[CaptureDocumentScreen][eKYCOCRDataSubmission] >> Success");
                const { selectedIDType } = this.state;
                const filledUserDetails = this.prepareUserDetails();
                //Name matching check commented out as per business decission.(5-11-2020)
                if (
                    docData &&
                    selectedIDType === PLSTP_UD_MYKAD &&
                    filledUserDetails?.onBoardDetails2?.from !== APPLY_CARD_INTRO
                ) {
                    //Name Matching with OCR one
                    const ocrName = docData.name.toLowerCase();
                    if (ocrName !== filledUserDetails.onBoardDetails.fullName.toLowerCase()) {
                        this.props.navigation.navigate(MAE_NAME_VERIFICATION, {
                            filledUserDetails,
                            ocrSDKResult,
                            ocrReqPayload,
                            initAPIResult,
                            ocrDocImages,
                            humanFace,
                            name: docData?.name?.toUpperCase(),
                        });
                        return;
                    }
                }

                this.props.navigation.navigate(CAPTURE_SELFIE_SCREEN, {
                    filledUserDetails,
                    ocrSDKResult,
                    ocrReqPayload,
                    initAPIResult,
                    ocrDocImages,
                    humanFace,
                });
            })
            .catch((error) => {
                console.log("[CaptureDocumentScreen] >> [eKYCOCRDataSubmission] >> Failure", error);
                showErrorToast({
                    message: error.message,
                });
            });
    };
}

const styles = StyleSheet.create({
    backTypo: {
        marginTop: 31,
    },
    bottomBtnContCls: {
        height: 130,
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    cameraImage: {
        alignItems: "center",
        height: 21,
        width: 25,
    },
    camerabuttonView: {
        alignItems: "center",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        width: "100%",
    },
    captureButton: {
        borderRadius: 8,
        height: (height * 22) / 100,
        marginTop: (height * 3) / 100,
        width: "100%",
    },
    captureMainView: {
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 1,
        borderStyle: "dashed",
        borderWidth: 2.5,
        height: (height * 22) / 95,
        marginLeft: "5%",
        marginTop: (height * 3) / 100,
        position: "relative",
        width: "90%",
    },
    capturedImage: {
        alignItems: "center",
        borderColor: GREY,
        borderRadius: 1,
        borderStyle: "dashed",
        borderWidth: 2.5,
        flexDirection: "row",
        height: "100%",
        justifyContent: "center",
        marginLeft: "5%",
        position: "relative",
        width: "90%",
    },
    capturedImageStyle: {
        borderRadius: 5,
        height: "100%",
        width: "100%",
    },
    fieldContainer: {
        marginTop: 24,
    },
    formContainer: {
        marginBottom: 40,
        marginHorizontal: 36,
    },
    frontTypo: {
        marginTop: 31,
    },
    linearGradient: {
        height: 30,
        left: 0,
        position: "absolute",
        right: 0,
        top: -30,
    },
    retakeTypo: {
        marginTop: 24,
    },
    viewContainer: {
        flex: 1,
    },
});

export default withModelContext(CaptureDocumentScreen);
