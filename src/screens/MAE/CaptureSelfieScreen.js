import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, TouchableOpacity, Image, StyleSheet } from "react-native";
import RNekyc from "react-native-ekyc";
import LinearGradient from "react-native-linear-gradient";

import {
    APPLY_CARD_INTRO,
    MAE_TERMS_COND,
    CAPTURE_ID_SCREEN,
    MAE_REUPLOAD_SUCCESS,
    ZEST_CASA_STACK,
    ZEST_CASA_ACTIVATE_ACCOUNT,
    PREMIER_MODULE_STACK,
    PREMIER_ACTIVATE_ACCOUNT,
    APPLY_MAE_SCREEN,
    MORE,
    APPLY_SCREEN,
    MAE_MODULE_STACK,
    MAE_REUPLOAD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { eKYCCOMMITAPI, eKYCGetResultAPI, eKYCGetResultUpdateZestAPI } from "@services";

import { YELLOW, ROYAL_BLUE, MEDIUM_GREY, GHOST_WHITE } from "@constants/colors";
import { CAPTURE_SELFIE_BASE64 } from "@constants/data";
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
    selfieDesc,
    ekycFailed,
    BLURRY_SELFIE_RETAKE,
    PLSTP_UD_MYKAD,
    TIME_FOR_SELFIE,
    REMOVE_FACE_MASK,
    CONTINUE,
    RETAKE,
    ENSURE_FACE_VISIBLE,
    PASSPORT,
    SECURITY_LEVEL,
} from "@constants/strings";
import { ZEST_DRAFT_USER, ZEST_NTB_USER } from "@constants/zestCasaConfiguration";

import { checkCamPermission } from "@utils/dataModel/utility";

import Assets from "@assets";

const facialRecognitionResults = [0, 0, 0];
let selfieImageButtonDisabled = false;
let selfieSDKResult = null;
const predictionValue = { primary: 0, secondary: 0, hologram: 0 };
const imageFRRResult = { primary: "", secondary: "", hologram: "" };

//For Emulator
const base64 = CAPTURE_SELFIE_BASE64;

class CaptureSelfieScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            goBack: PropTypes.func,
            navigate: PropTypes.func,
        }),
        route: PropTypes.shape({
            params: PropTypes.shape({
                filledUserDetails: PropTypes.shape({
                    onBoardDetails2: PropTypes.shape({
                        selectedIDType: PropTypes.any,
                    }),
                }),
                humanFace: PropTypes.any,
                initAPIResult: PropTypes.any,
                ocrDocImages: PropTypes.any,
                ocrReqPayload: PropTypes.any,
                ocrSDKResult: PropTypes.any,
            }),
        }),
    };

    casaPM1Users = [PM1_NTB_USER, PM1_DRAFT_USER];
    casaPMAUsers = [PMA_NTB_USER, PMA_DRAFT_USER];
    casaKawankuSavingsUsers = [KAWANKU_SAVINGS_NTB_USER, KAWANKU_SAVINGS_DRAFT_USER];
    casaKawankuSavingsIUsers = [KAWANKU_SAVINGSI_NTB_USER, KAWANKU_SAVINGSI_DRAFT_USER];
    casaUsers = [
        ...this.casaPM1Users,
        ...this.casaPMAUsers,
        ...this.casaKawankuSavingsUsers,
        ...this.casaKawankuSavingsIUsers,
    ];
    isCASA = false;

    constructor(props) {
        super(props);
        this.isCASA = this.casaUsers.includes(
            props.route.params?.filledUserDetails?.onBoardDetails2?.from
        );
        this.state = {
            selfieImgData: "",
            filledUserDetails: props.route.params?.filledUserDetails,
            hideButtons: true,
            selectedIDType: props.route.params?.filledUserDetails.onBoardDetails2.selectedIDType, // MyKad/Passport
            deviceInformation: "",
            ocrSDKResult: props.route.params?.ocrSDKResult,
            initAPIResult: props.route.params?.initAPIResult,
            ocrDocImages: props.route.params?.ocrDocImages,
            loading: false,
            selfieDescription: BLURRY_SELFIE_RETAKE,
        };
    }

    componentDidMount() {
        console.log("[CaptureSelfieScreen] >> [componentDidMount]");
        this.init();
        // this.props.navigation.addListener("focus", this.onScreenFocus);
    }

    init() {
        const deviceInfo = this.props.getModel("device");
        this.setState({ deviceInformation: deviceInfo.deviceInformation });
    }

    // onScreenFocus = () => {
    //     console.log("[CaptureSelfieScreen] >> [onScreenFocus]");
    //     if (this.props.route.params) {
    //         if (this.props.route.params.selfieImgData) {
    //             this.setState({
    //                 selfieImgData: this.props.route.params.selfieImgData
    //                     ? this.props.route.params.selfieImgData
    //                     : "",
    //             });
    //         }
    //     }
    // };

    onBackTap = () => {
        console.log("[CaptureSelfieScreen] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[CaptureSelfieScreen] >> [onCloseTap]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || MORE, {
            screen: filledUserDetails?.entryScreen || APPLY_SCREEN,
            params: filledUserDetails?.entryParams,
        });
    };

    onCloseTapZest = () => {
        console.log("[CaptureSelfieScreen] >> [onCloseTapZest]");
        const MAEUserDetails = this.state?.filledUserDetails || {};
        MAEUserDetails.securityPhraseImage = null;
        MAEUserDetails.documentImages = null;
        this.props.navigation.navigate(MAE_MODULE_STACK, {
            screen: APPLY_MAE_SCREEN,
            params: MAEUserDetails,
        });
    };

    moveToNext = async () => {
        console.log("[CaptureSelfieScreen] >> [moveToNext]");
        // Selfie upload check
        const { deviceInformation } = this.state;
        if (this.state.selfieImgData !== "") {
            const jsonData = {
                idType: this.state.selectedIDType,
                deviceInfo: this.state.deviceInformation,
                idNum: this.state.filledUserDetails.onBoardDetails2.idNo,
                passportCountry:
                    this.state.selectedIDType !== PLSTP_UD_MYKAD
                        ? this.state.filledUserDetails.onBoardDetails2.passportCountry
                        : "",
            };
            this.eKYCCommit(jsonData);
        } else {
            //For Emulator
            if (deviceInformation.Emulator === 1 || deviceInformation.Emulator === 2) {
                const filledUserDetails = this.prepareUserDetails();
                if (
                    filledUserDetails?.onBoardDetails2?.from === ZEST_NTB_USER ||
                    filledUserDetails?.onBoardDetails2?.from === ZEST_DRAFT_USER
                ) {
                    this.props.navigation.navigate(ZEST_CASA_STACK, {
                        screen: ZEST_CASA_ACTIVATE_ACCOUNT,
                        params: {
                            isZest: true,
                        },
                    });
                } else if (this.casaPM1Users.includes(filledUserDetails?.onBoardDetails2?.from)) {
                    this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                        screen: PREMIER_ACTIVATE_ACCOUNT,

                        params: {
                            isPM1: true,
                        },
                    });
                } else if (this.casaPMAUsers.includes(filledUserDetails?.onBoardDetails2?.from)) {
                    this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                        screen: PREMIER_ACTIVATE_ACCOUNT,
                        params: {
                            isPMA: true,
                        },
                    });
                } else if (
                    this.casaKawankuSavingsUsers.includes(filledUserDetails?.onBoardDetails2?.from)
                ) {
                    this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                        screen: PREMIER_ACTIVATE_ACCOUNT,
                        params: {
                            isKawanku: true,
                        },
                    });
                } else if (
                    this.casaKawankuSavingsIUsers.includes(filledUserDetails?.onBoardDetails2?.from)
                ) {
                    this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                        screen: PREMIER_ACTIVATE_ACCOUNT,
                        params: {
                            isKawankuSavingsI: true,
                        },
                    });
                } else {
                    this.props.navigation.navigate(MAE_TERMS_COND, {
                        filledUserDetails,
                    });
                }
            }
        }
    };

    prepareUserDetails = (result) => {
        console.log("CaptureDocumentScreen >> [prepareUserDetails]");

        const selfieImages = { selfieImgData: this.state.selfieImgData };

        const MAEUserDetails = this.state.filledUserDetails;
        MAEUserDetails.selfieImages = selfieImages;
        MAEUserDetails.ekycRefId = result?.ekycRefId || "";

        return MAEUserDetails;
    };

    selfiImageClicked = async () => {
        console.log("[CaptureSelfieScreen] >> [selfiImageClicked]");

        //double tap fix
        if (selfieImageButtonDisabled) return;
        selfieImageButtonDisabled = true;

        // Camera view configuration specific for this screen
        const jsonData = {
            idType: this.state.selectedIDType,
            deviceInfo: this.state.deviceInformation,
            idNum: this.state.filledUserDetails.onBoardDetails2.idNo,
            passportCountry:
                this.state.selectedIDType !== PLSTP_UD_MYKAD
                    ? this.state.filledUserDetails.onBoardDetails2.passportCountry
                    : "",
        };
        const permission = await checkCamPermission();
        if (permission) {
            this.startSelfie(jsonData);
        } else {
            selfieImageButtonDisabled = false;
        }
    };

    render() {
        const { selfieImgData, hideButtons, loading, selfieDescription } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
            >
                <View style={styles.viewContainer}>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
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
                                            text={TIME_FOR_SELFIE}
                                        />

                                        {/* Description */}
                                        <Typo
                                            fontSize={20}
                                            lineHeight={30}
                                            fontWeight="300"
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={selfieDescription}
                                        />
                                        {/* Note */}
                                        <Typo
                                            fontSize={14}
                                            lineHeight={24}
                                            fontWeight="300"
                                            textAlign="left"
                                            text={REMOVE_FACE_MASK}
                                        />

                                        <View style={styles.profilePicture}>
                                            <View style={styles.profilePictureCircle}>
                                                <Image
                                                    source={
                                                        selfieImgData
                                                            ? {
                                                                  uri: `data:image/jpeg;base64,${selfieImgData}`,
                                                              }
                                                            : Assets.ekycSelfieImage
                                                    }
                                                    style={styles.profilePictureImage}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </React.Fragment>
                            </View>
                        </ScrollView>
                        {hideButtons ? (
                            <View style={styles.continuebottomBtnCls}>
                                <LinearGradient
                                    colors={[GHOST_WHITE, MEDIUM_GREY]}
                                    style={styles.linearGradient}
                                />
                                <ActionButton
                                    fullWidth
                                    onPress={this.selfiImageClicked}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={CONTINUE}
                                        />
                                    }
                                />
                            </View>
                        ) : (
                            <View style={styles.bottomBtnContCls}>
                                <LinearGradient
                                    colors={[GHOST_WHITE, MEDIUM_GREY]}
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
                                    onPress={this.selfiImageClicked}
                                    activeOpacity={0.8}
                                    style={styles.retakeBtn}
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
                </View>
            </ScreenContainer>
        );
    }

    startSelfie = async (jsonData) => {
        console.log("[CaptureSelfieScreen] >> [startSelfie]");
        if (jsonData.deviceInfo.Emulator !== 1 && jsonData.deviceInfo.Emulator !== 2) {
            const { initAPIResult } = this.state;
            const selfieJSON = {};
            const selectedIDType = jsonData.idType;
            const idNumber = jsonData.idNum;
            if (selectedIDType === PLSTP_UD_MYKAD) {
                selfieJSON.userID = idNumber;
                initAPIResult?.client_config?.face_recognition_from_secondary_image &&
                    (initAPIResult.client_config.face_recognition_from_secondary_image.verified =
                        undefined);
                initAPIResult?.client_config?.face_recognition_from_hologram_image &&
                    (initAPIResult.client_config.face_recognition_from_hologram_image.verified =
                        undefined);
            } else if (selectedIDType === PASSPORT) {
                selfieJSON.userID = idNumber;
            } else {
                console.log("unable to retrieve selected Id Type data");
                selfieJSON.userID = "test123";
            }
            selfieJSON.description = selfieDesc;
            selfieJSON.timeOut = 30000;

            try {
                selfieImageButtonDisabled = false;
                const selfieResult = await RNekyc.startSelfie(selfieJSON, false);

                if (selfieResult) {
                    console.log("selfieResult Response ==> ");
                    this.selfieResultCall(selfieResult, jsonData);
                }
            } catch (error) {
                console.error(error);
                console.log(" selfieResult fails..%@" + error);
            }
        } else {
            //If Emulator
            this.setState({ selfieImgData: base64, hideButtons: false });
            selfieImageButtonDisabled = false;
        }
    };

    selfieResultCall = (selfieResult, jsonData) => {
        console.log("[CaptureSelfieScreen] >> [selfieResultCall]");
        if (selfieResult.status === 0) {
            selfieSDKResult = selfieResult.images;
            this.setState({
                selfieImgData: selfieSDKResult,
                hideButtons: false,
                selfieDescription: ENSURE_FACE_VISIBLE,
            });
            this.verifySelfieWithDocImage("primary", jsonData);
        } else {
            this.setState({
                selfieImgData: "",
                hideButtons: true,
                selfieDescription: BLURRY_SELFIE_RETAKE,
            });
            showErrorToast({
                message: selfieResult.message,
            });
        }
    };

    verifySelfieWithDocImage = async (type, jsonData) => {
        console.log("[CaptureSelfieScreen] >> [verifySelfieWithDocImage]");
        const { initAPIResult } = this.state;
        const verifyJSON = {
            userID: this.state.filledUserDetails.onBoardDetails2.idNo,
            type,
        };
        if (type === "primary") {
            verifyJSON.frrValue = initAPIResult?.client_config?.face_recognition?.frr;
            verifyJSON.securityLevel =
                initAPIResult?.client_config?.face_recognition?.security_level;
            const selectedIDType = jsonData.idType;
            verifyJSON.isDeleteUser = selectedIDType === PASSPORT;
        } else if (type === "secondary") {
            verifyJSON.frrValue =
                initAPIResult.client_config?.face_recognition_from_secondary_image?.frr;
            verifyJSON.securityLevel =
                initAPIResult.client_config?.face_recognition_from_secondary_image?.security_level;
        } else {
            verifyJSON.frrValue =
                initAPIResult?.client_config?.face_recognition_from_hologram_image?.frr;
            verifyJSON.securityLevel =
                initAPIResult?.client_config?.face_recognition_from_hologram_image?.security_level;
            verifyJSON.isDeleteUser = true; //"hologram"
        }

        try {
            const verifyResult = await RNekyc.verifySelfieWithDoc(verifyJSON, false);
            if (verifyResult) {
                this.verifyImageResponse(verifyResult, type, jsonData);
            }
        } catch (error) {
            console.error(error);
            console.log(" verifyResult fails..%@" + error);
        }
    };

    verifyImageResponse = (result, type, jsonData) => {
        console.log("[CaptureSelfieScreen] >> [verifyImageResponse]");
        const { initAPIResult } = this.state;
        const predictionResult = JSON.parse(result?.details);
        if (type === "primary") {
            //prediction value
            predictionValue.primary = predictionResult?.predictionValue;
            imageFRRResult.primary = JSON.stringify(predictionResult);
            if (result.status === "success") {
                facialRecognitionResults[0] = 1;
            } else {
                facialRecognitionResults[0] = 0;
            }
        } else if (type === "secondary") {
            predictionValue.secondary = predictionResult?.predictionValue;
            imageFRRResult.secondary = JSON.stringify(predictionResult);
            if (result.status === "success") {
                facialRecognitionResults[1] = 1;
            } else {
                facialRecognitionResults[1] = 0;
            }
        } else {
            predictionValue.hologram = predictionResult?.predictionValue;
            imageFRRResult.hologram = JSON.stringify(predictionResult);
            if (result.status === "success") {
                facialRecognitionResults[2] = 1;
            } else {
                facialRecognitionResults[2] = 0;
            }
        }
        const selectedIDType = jsonData.idType;
        if (selectedIDType !== PASSPORT) {
            if (
                initAPIResult.client_config?.face_recognition_from_secondary_image &&
                initAPIResult.client_config?.face_recognition_from_secondary_image?.frr &&
                initAPIResult.client_config?.face_recognition_from_secondary_image?.verified ===
                    undefined
            ) {
                initAPIResult.client_config.face_recognition_from_secondary_image.verified = "true";
                this.verifySelfieWithDocImage("secondary", jsonData);
            } else if (
                initAPIResult.client_config?.face_recognition_from_hologram_image &&
                initAPIResult.client_config?.face_recognition_from_hologram_image?.frr &&
                initAPIResult.client_config?.face_recognition_from_hologram_image?.verified ===
                    undefined
            ) {
                initAPIResult.client_config.face_recognition_from_hologram_image.verified = "true";
                this.verifySelfieWithDocImage("hologram", jsonData);
            } else {
                // eKYCCommit(view);
            }
        }
    };

    eKYCCommit = (jsonData) => {
        console.log("[CaptureSelfieScreen] >> [eKYCCommit]");
        if (jsonData.deviceInfo.Emulator !== 1 && jsonData.deviceInfo.Emulator !== 2) {
            const { ocrDocImages, initAPIResult, ocrSDKResult } = this.state;
            const commitRequestPayload = {
                uid: initAPIResult.uid,
                security_check: [],
                images: [],
            };
            commitRequestPayload.uid = initAPIResult.uid;
            commitRequestPayload.security_check = [];
            commitRequestPayload.images = [];

            const faceObj = {
                sub_cat: "face_recognition",
                result: facialRecognitionResults[0],
                details: [
                    { value: initAPIResult?.client_config?.face_recognition?.frr, key: "frr" },
                    {
                        value: initAPIResult?.client_config?.face_recognition?.security_level,
                        key: SECURITY_LEVEL,
                    },
                    {
                        value: predictionValue.primary,
                        key: "prediction_value",
                    },
                    {
                        value: imageFRRResult.primary,
                        key: "FRR_Result",
                    },
                ],
            };
            commitRequestPayload.security_check.push(faceObj);

            const livenessObj = {
                sub_cat: "liveness_detection",
                result: 1,
            };
            commitRequestPayload.security_check.push(livenessObj);

            const ocrDocObj = {
                img_key: "ocr_doc_0",
                img_value: ocrDocImages[0].img0,
            };
            ocrDocObj.img_key = "ocr_doc_0";
            ocrDocObj.img_value = ocrDocImages[0].img0;
            commitRequestPayload.images.push(ocrDocObj);

            const holoObj = {};
            const holoFaceObj = {};
            const ocrDocObj1 = {};

            const holoFaceImg = {};
            const selectedIDType = jsonData.idType;

            if (selectedIDType === PLSTP_UD_MYKAD) {
                // IC Back Image
                ocrDocObj1.img_key = "ocr_doc_1";
                ocrDocObj1.img_value = ocrDocImages[1].img1;
                commitRequestPayload.images.push(ocrDocObj1);

                // Hologram Presence
                holoObj.sub_cat = "hologram_present";
                holoObj.details = [
                    { value: initAPIResult?.client_config?.hologram?.threshold, key: "Threshold" },
                    {
                        value: initAPIResult?.client_config?.hologram?.total_frames,
                        key: "Total Frames",
                    },
                    {
                        value: initAPIResult?.client_config?.hologram?.total_holograms,
                        key: "Total Holograms",
                    },
                    {
                        value: initAPIResult?.client_config?.hologram?.min_passing_holograms,
                        key: "Min Passing Holograms",
                    },
                    {
                        value: ocrSDKResult?.dataModel_hologram?.threshold_found,
                        key: "Threshold_Found",
                    },
                    {
                        value: ocrSDKResult?.dataModel_hologram?.hologram_detection,
                        key: "Hologram_Detection",
                    },
                    {
                        value: ocrSDKResult?.dataModel_hologram?.threshold_required,
                        key: "Threshold_Required",
                    },
                    {
                        value: ocrSDKResult?.dataModel_hologram?.frames_to_process,
                        key: "Frames_To_Process",
                    },
                    {
                        value: ocrSDKResult?.dataModel_hologram?.holograms_found,
                        key: "Holograms_Found",
                    },
                    {
                        value: ocrSDKResult?.dataModel_hologram?.frames_processed,
                        key: "Frames_Processed",
                    },
                    {
                        value: JSON.stringify(
                            ocrSDKResult?.dataModel_hologram?.mandatory_holograms_to_detect
                        ),
                        key: "Mandatory_Holograms_To_Detect",
                    },
                    {
                        value: JSON.stringify(ocrSDKResult?.dataModel_hologram?.categories_found),
                        key: "Categories_Found",
                    },
                    {
                        value: JSON.stringify(
                            ocrSDKResult?.dataModel_hologram?.categories_found?.nameValuePairs
                        ),
                        key: "Name_Value_Pairs",
                    },
                ];
                holoObj.result = ocrSDKResult.dataModel_hologram.hologram_detection ? 1 : 0;
                commitRequestPayload.security_check.push(holoObj);

                // Hologram Face verify result
                holoFaceObj.sub_cat = "face_holo_recognition";
                holoFaceObj.result = facialRecognitionResults[2];
                holoFaceObj.details = [
                    {
                        value: initAPIResult?.client_config?.face_recognition_from_hologram_image
                            ?.frr,
                        key: "FRR",
                    },
                    {
                        value: initAPIResult?.client_config?.face_recognition_from_hologram_image
                            ?.security_level,
                        key: SECURITY_LEVEL,
                    },
                    {
                        value: predictionValue.hologram,
                        key: "prediction_value",
                    },
                    {
                        value: imageFRRResult.hologram,
                        key: "FRR_Result",
                    },
                ];
                commitRequestPayload.security_check.push(holoFaceObj);

                // Hologram Face Image
                if (ocrSDKResult?.dataModel_hologram?.face_from_hologramImage) {
                    holoFaceImg.img_key = "holo_face_image_0";
                    holoFaceImg.img_value =
                        ocrSDKResult?.dataModel_hologram?.face_from_hologramImage;
                    if (holoFaceImg.img_value) {
                        commitRequestPayload.images.push(holoFaceImg);
                    }
                }

                // Hologram Card Image
                if (ocrSDKResult?.dataModel_hologram?.hologram_images) {
                    // holoDocObj.img_key = "holo_image_0";
                    // holoDocObj.img_value = ocrSDKResult?.dataModel_hologram?.hologram_images.values[0];
                    // commitRequestPayload.images.push(holoDocObj);

                    // holoDocObj1.img_key = "holo_image_1";
                    // holoDocObj1.img_value = ocrSDKResult?.dataModel_hologram?.hologram_images.values[1];
                    // commitRequestPayload.images.push(holoDocObj1);

                    const holoCardImg = ocrSDKResult?.dataModel_hologram?.hologram_images.values;
                    holoCardImg.forEach((img, index) => {
                        const holoDocObj = {
                            img_key: "holo_image_" + index,
                            img_value: img,
                        };
                        commitRequestPayload.images.push(holoDocObj);
                    });
                }
            }

            //Human Face
            // let enrolImgObj = {};
            // enrolImgObj.img_key = "enrollment_image_0";
            // enrolImgObj.img_value = humanFace;
            // commitRequestPayload.images.push(enrolImgObj);

            //Selfie Image
            const enrolImgObj = {
                img_key: "enrollment_image_0",
                img_value: selfieSDKResult,
            };
            commitRequestPayload.images.push(enrolImgObj);

            return eKYCCOMMITAPI(true, commitRequestPayload)
                .then(async (response) => {
                    console.log("[CaptureSelfieScreen][eKYCCommit] >> Success");
                    const result = JSON.parse(response.data.result);
                    // console.log(result);
                    if (result.response_code === "100") {
                        this.setState({ loading: true });
                        //As per FICO need to call the getResults after 3 seconds
                        setTimeout(() => {
                            this.eKYCGetResults();
                        }, 3000);
                    } else {
                        const filledUserDetails = this.state.filledUserDetails;
                        this.props.navigation.navigate(CAPTURE_ID_SCREEN, {
                            filledUserDetails,
                            from: "CaptureSelfieScreen",
                        });
                        throw new Error(result.response_message);
                    }
                })
                .catch((error) => {
                    console.log("[CaptureSelfieScreen] >> [eKYCCommit] >> Failure");
                    showErrorToast({
                        message: error.message,
                    });
                });
        } else {
            //To test in emulator
            const filledUserDetails = this.prepareUserDetails();
            if (filledUserDetails?.onBoardDetails2?.from === APPLY_CARD_INTRO) {
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
            } else if (filledUserDetails?.onBoardDetails2?.from === MAE_REUPLOAD) {
                this.props.navigation.navigate(MAE_REUPLOAD_SUCCESS, {
                    filledUserDetails,
                });
            } else if (
                filledUserDetails?.onBoardDetails2?.from === ZEST_NTB_USER ||
                filledUserDetails?.onBoardDetails2?.from === ZEST_DRAFT_USER
            ) {
                this.props.navigation.navigate(ZEST_CASA_STACK, {
                    screen: ZEST_CASA_ACTIVATE_ACCOUNT,
                    params: {
                        isZest: filledUserDetails?.onBoardDetails2?.isZestI,
                    },
                });
            } else if (
                filledUserDetails?.onBoardDetails2?.from === PM1_NTB_USER ||
                filledUserDetails?.onBoardDetails2?.from === PM1_DRAFT_USER
            ) {
                this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                    screen: PREMIER_ACTIVATE_ACCOUNT,
                    params: {
                        isPM1: filledUserDetails?.onBoardDetails2?.isPM1,
                    },
                });
            } else if (
                filledUserDetails?.onBoardDetails2?.from === PMA_NTB_USER ||
                filledUserDetails?.onBoardDetails2?.from === PMA_DRAFT_USER
            ) {
                this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                    screen: PREMIER_ACTIVATE_ACCOUNT,
                    params: {
                        isPMA: filledUserDetails?.onBoardDetails2?.isPMA,
                    },
                });
            } else if (
                filledUserDetails?.onBoardDetails2?.from === KAWANKU_SAVINGS_NTB_USER ||
                filledUserDetails?.onBoardDetails2?.from === KAWANKU_SAVINGS_DRAFT_USER
            ) {
                this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                    screen: PREMIER_ACTIVATE_ACCOUNT,
                    params: {
                        isKawanku: filledUserDetails?.onBoardDetails2?.isKawanku,
                    },
                });
            } else if (
                filledUserDetails?.onBoardDetails2?.from === KAWANKU_SAVINGSI_NTB_USER ||
                filledUserDetails?.onBoardDetails2?.from === KAWANKU_SAVINGSI_DRAFT_USER
            ) {
                this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                    screen: PREMIER_ACTIVATE_ACCOUNT,
                    params: {
                        isKawankuSavingsI: filledUserDetails?.onBoardDetails2?.isKawankuSavingsI,
                    },
                });
            } else {
                this.props.navigation.navigate(MAE_TERMS_COND, {
                    filledUserDetails,
                });
            }
        }
    };

    eKYCGetResults = () => {
        console.log("[CaptureSelfieScreen] >> [eKYCGetResults]");
        const { initAPIResult, filledUserDetails, selectedIDType } = this.state;
        const reqPayload = {
            uid: initAPIResult.uid,
            ic_no: filledUserDetails?.onBoardDetails2?.idNo,
            doc_type: selectedIDType === PLSTP_UD_MYKAD ? "mykad" : "passport",
        };
        if (filledUserDetails?.onBoardDetails2?.from === APPLY_CARD_INTRO) {
            reqPayload.req_type = "E02";
        } else {
            reqPayload.req_type = "E01";
        }

        eKYCGetResultAPI(true, reqPayload)
            .then((response) => {
                this.setState({ loading: false });
                console.log("[CaptureSelfieScreen][eKYCGetResults] >> Success");
                const result = response.data.result;
                this.setState({ hideButtons: false });
                const filledUserDetails = this.prepareUserDetails(result);
                const from = filledUserDetails?.onBoardDetails2?.from;
                const statusCode = result?.statusCode ?? null;
                const statusDesc = result?.statusDesc ?? null;
                if (from === APPLY_CARD_INTRO) {
                    // Re-route back to Apply Card Flow

                    const ekycRefId = result?.ekycRefId ?? null;
                    this.props.navigation.navigate(filledUserDetails.entryStack, {
                        screen: filledUserDetails.entryScreen,
                        params: {
                            ...filledUserDetails.entryParams,
                            from: "eKYC",
                            ekycRefId,
                            eKycStatus:
                                statusCode === "0000"
                                    ? "05"
                                    : filledUserDetails.entryParams.eKycStatus,
                            ekycSuccess: statusCode === "0000",
                        },
                    });
                } else if (statusCode !== "0000") {
                    if (
                        filledUserDetails?.onBoardDetails2?.from === ZEST_NTB_USER ||
                        filledUserDetails?.onBoardDetails2?.from === ZEST_DRAFT_USER
                    ) {
                        this.onCloseTapZest();
                    } else {
                        this.onCloseTap();
                    }
                    showErrorToast({
                        message: statusDesc || ekycFailed,
                    });
                } else if (from === MAE_REUPLOAD) {
                    this.props.navigation.navigate(MAE_REUPLOAD_SUCCESS, {
                        filledUserDetails,
                    });
                } else if (
                    filledUserDetails?.onBoardDetails2?.from === ZEST_NTB_USER ||
                    filledUserDetails?.onBoardDetails2?.from === ZEST_DRAFT_USER
                ) {
                    const ekycRefId = result?.ekycRefId ?? null;
                    const ekycUpdatePayload = {
                        ekycRefId,
                        ekycIdImage: this.state?.filledUserDetails?.documentImages?.idFrontImgData,
                        ekycIdImageBack:
                            this.state?.filledUserDetails?.documentImages?.idBackImgData,
                        ekycSelfieImage: this.state?.selfieImgData,
                        pan: this.state?.filledUserDetails?.pan,
                        accountNumber: this.state?.filledUserDetails?.accountNumber,
                        idNo: reqPayload?.ic_no,
                    };
                    eKYCGetResultUpdateZestAPI(ekycUpdatePayload)
                        .then((responseUploadEKYC) => {
                            if (responseUploadEKYC) {
                                this.props.navigation.navigate(ZEST_CASA_STACK, {
                                    screen: ZEST_CASA_ACTIVATE_ACCOUNT,
                                    params: {
                                        isZest: filledUserDetails?.onBoardDetails2?.isZestI,
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
                            console.log(
                                "[CaptureSelfieScreen] >> [eKYCGetResultUpdateZestAPI] >> Failure"
                            );
                            if (error?.error?.error !== "suspended") {
                                this.onCloseTapZest();
                                showErrorToast({
                                    message: error.message,
                                });
                            }
                        });
                } else if (this.isCASA) {
                    const ekycRefId = result?.ekycRefId;
                    const ekycUpdatePayload = {
                        ekycRefId,
                        ekycIdImage: this.state?.filledUserDetails?.documentImages?.idFrontImgData,
                        ekycIdImageBack:
                            this.state?.filledUserDetails?.documentImages?.idBackImgData,
                        ekycSelfieImage: this.state?.selfieImgData,
                        pan: this.state?.filledUserDetails?.pan,
                        accountNumber: this.state?.filledUserDetails?.accountNumber,
                        idNo: reqPayload?.ic_no,
                    };
                    eKYCGetResultUpdateZestAPI(ekycUpdatePayload)
                        .then((responseUploadEKYC) => {
                            if (responseUploadEKYC && filledUserDetails?.onBoardDetails2?.isPM1) {
                                this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                                    screen: PREMIER_ACTIVATE_ACCOUNT,
                                    params: {
                                        isPM1: filledUserDetails?.onBoardDetails2?.isPM1,
                                    },
                                });
                            } else if (
                                responseUploadEKYC &&
                                filledUserDetails?.onBoardDetails2?.isPMA
                            ) {
                                this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                                    screen: PREMIER_ACTIVATE_ACCOUNT,
                                    params: {
                                        isPMA: filledUserDetails?.onBoardDetails2?.isPMA,
                                    },
                                });
                            } else if (
                                responseUploadEKYC &&
                                filledUserDetails?.onBoardDetails2?.isKawanku
                            ) {
                                this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                                    screen: PREMIER_ACTIVATE_ACCOUNT,
                                    params: {
                                        isKawanku: filledUserDetails?.onBoardDetails2?.isKawanku,
                                    },
                                });
                            } else if (
                                responseUploadEKYC &&
                                filledUserDetails?.onBoardDetails2?.isKawankuSavingsI
                            ) {
                                this.props.navigation.navigate(PREMIER_MODULE_STACK, {
                                    screen: PREMIER_ACTIVATE_ACCOUNT,
                                    params: {
                                        isKawankuSavingsI:
                                            filledUserDetails?.onBoardDetails2?.isKawankuSavingsI,
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
                            console.log(
                                "[CaptureSelfieScreen] >> [eKYCGetResultUpdateZestAPI] >> Failure"
                            );
                            if (error?.error?.error !== "suspended") {
                                showErrorToast({
                                    message: error.message,
                                });
                            }
                        });
                } else {
                    this.props.navigation.navigate(MAE_TERMS_COND, {
                        filledUserDetails,
                    });
                }
            })
            .catch((error) => {
                console.log("[CaptureSelfieScreen] >> [eKYCGetResults] >> Failure");
                this.setState({ loading: false });
                if (
                    filledUserDetails?.onBoardDetails2?.from === ZEST_NTB_USER ||
                    filledUserDetails?.onBoardDetails2?.from === ZEST_DRAFT_USER
                ) {
                    this.onCloseTapZest();
                }
                if (error?.error?.error !== "suspended") {
                    showErrorToast({
                        message: error.message,
                    });
                }
            });
    };
}

const styles = StyleSheet.create({
    bottomBtnContCls: {
        height: 130,
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    continuebottomBtnCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    fieldContainer: {
        marginTop: 24,
    },
    formContainer: {
        marginHorizontal: 36,
    },
    linearGradient: {
        height: 30,
        left: 0,
        position: "absolute",
        right: 0,
        top: -30,
    },
    profilePicture: {
        alignItems: "center",
        paddingVertical: 28,
    },
    profilePictureCircle: {
        borderRadius: 80,
        overflow: "hidden",
    },
    profilePictureImage: {
        height: 160,
        width: 160,
    },
    retakeBtn: {
        marginTop: 24,
    },
    viewContainer: {
        flex: 1,
    },
});

CaptureSelfieScreen.propTypes = {
    route: PropTypes.any,
    navigation: PropTypes.any,
};

export default withModelContext(CaptureSelfieScreen);
