import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";
import { useDispatch, useSelector } from "react-redux";

import { RECEIVED_DOCUMENT_SCREEN, APPLY_LOANS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { getdocumentUploadURL, asbDocumentUpload } from "@services";
import { logEvent } from "@services/analytics";

import {
    MEDIUM_GREY,
    BLACK,
    YELLOW,
    BLUE,
    APPROX_SUVA_GREY,
    TRANSPARENT,
    DISABLED,
} from "@constants/colors";
import {
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
    UNSAVED_CHANGES,
    UNSAVED_CHANGES_DEC,
    LEAVE,
    CANCEL,
} from "@constants/strings";

import Assets from "@assets";

import {
    ASB_FINANCING,
    PLSTP_UD_DESC,
    PLSTP_UD_HEADER,
    PLSTP_UD_LATER,
    SNAP_A_PIC,
    SUBMIT_DOC,
} from "../../../../constants/strings";
import { doneWithDataPush } from "../../../../redux/reducers/ASBFinance/SingleApplicantbookingform";

const JointApplicantScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const resumeReducer = useSelector((state) => state.resumeReducer);
    const stpReferenceNumber =
        prePostQualReducer?.data?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;

    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    logEvent(FA_VIEW_SCREEN, {
        [FA_SCREEN_NAME]: "Apply_ASBFinancing_UploadDocuments",
    });

    const hardCoded = {
        salesforceEKYCJoint: {
            objectStore: "WOLOCOS",
            documentClass: "WOLOC",
            contacts: ["chew.tungjin@maybank.com", "selvakumar.a@maybank.com"],
            mdip: {
                scc: "salesforceEKYCJoint",
                fpt: "fpt",
                aud: "MDIP",
                exp: 1209600,
                source: "uploader",
            },
            upload: {
                header: "",
                preface: "",
                title: "Required documents for KYC",
                info: "",
                label: "Please snap photo of your documents and ensure each file size is less than 10MB.",
                expiryTitle: "This page has expired due to inactivity. Please try again.",
                expiryMessage:
                    "Please login to the salesforce app to upload the required documents.",
                submitButtonTemplate:
                    '<button class="btn" style="background-color: #FFDE00; color: black; box-shadow: none; border-radius: 48px; font-weight: bold;">Submit</button>',
                successLabel:
                    '<div><h4>Documents Submitted</h4></div><div class="text-secondary">Your KYC documents have been submitted. Please close this page and go back to Sales Force to check your document status.</div>',
                successButtonTemplate:
                    '<div><a class="btn App-upload-success-link mt-4" style="background-color: #FFDE00; color: black; box-shadow: none; border-radius: 48px; font-weight: bold" href="<%-misc.closeLink%>">Close</a></div>',
                uploadButtonTemplate:
                    '<button class="btn" style="background-color: #FFDE00; color: black; font-size: 12px; border-radius: 48px; font-weight: bold;">Take Photo</button>',
                uploadErrorMessage:
                    "We're currently facing a connection time out. Please try again later.",
                maxFileSizeBytes: 10485760,
                mimeTypes: ["image/png", "image/jpeg"],
                files: {
                    nric: {
                        title: "Copy of NRIC (Front & back)",
                        label: "",
                        min: 2,
                        max: 2,
                        capture: "environment",
                        properties: {
                            DocumentType: "Identification",
                        },
                    },
                    nricJoint: {
                        title: "Copy of NRIC (Back)",
                        label: "",
                        min: 2,
                        max: 2,
                        capture: "environment",
                        properties: {
                            DocumentType: "Identification",
                        },
                    },
                    bookingforms: {
                        title: "Latest 3 months salary slip, \nOR BE form and tax receipt, \nOR EPF statement",
                        label: "",
                        min: 0,
                        max: 10,
                        capture: "environment",
                        properties: {
                            DocumentType: "PBF",
                        },
                    },
                },
                sharedProperties: {},
            },
        },
        salesforceOthers: {
            objectStore: "WOLOCOS",
            documentClass: "WOLOC",
            contacts: ["chew.tungjin@maybank.com", "selvakumar.a@maybank.com"],
            mdip: {
                scc: "salesforceOthers",
                fpt: "fpt",
                aud: "MDIP",
                exp: 1209600,
                source: "uploader",
            },
            upload: {
                header: "",
                preface: "",
                title: "Add any relevant documents",
                info: "",
                label: "Please ensure your documents' file size is less than 10MB.",
                expiryTitle: "This page has expired due to inactivity. Please try again.",
                expiryMessage:
                    "Please login to the salesforce app to upload the required documents.",
                submitButtonTemplate:
                    '<button class="btn" style="background-color: #FFDE00; color: black; box-shadow: none; border-radius: 48px; font-weight: bold;">Submit</button>',
                successLabel:
                    '<div><h4>In Progress</h4></div><div class="text-secondary">Please wait while your documents are being uploaded. Click on the button after a few seconds.</div>',
                successButtonTemplate:
                    '<div><a class="btn App-upload-success-link mt-4" style="background-color: #FFDE00; color: black; box-shadow: none; border-radius: 48px; font-weight: bold" href="<%-misc.closeLink%>">Check Document Status</a></div>',
                uploadButtonTemplate:
                    '<button class="btn" style="background-color: #FFDE00; color: black; font-size: 12px; border-radius: 48px; font-weight: bold;">Add Document</button>',
                uploadErrorMessage:
                    "We're currently facing a connection time out. Please try again later.",
                maxFileSizeBytes: 10485760,
                mimeTypes: ["image/png", "image/jpeg", "application/pdf"],

                files: {
                    bookingforms: {
                        title: "Latest 3 months salary slip, \nOR BE form and tax receipt, \nOR EPF statement",
                        label: "",
                        min: 0,
                        max: 10,
                        properties: {
                            DocumentType: "Misc",
                        },
                    },
                    nric: {
                        title: "Copy of NRIC (Front & back)",
                        label: "",
                        min: 2,
                        max: 2,
                        capture: "environment",
                        properties: {
                            DocumentType: "Identification",
                        },
                    },
                    nricJoint: {
                        title: "Copy of NRIC (Back)",
                        label: "",
                        min: 2,
                        max: 2,
                        capture: "environment",
                        properties: {
                            DocumentType: "Identification",
                        },
                    },
                },
                sharedProperties: {},
            },
        },
    };

    const { salesforceOthers } = hardCoded;
    const { bookingforms, nric } = salesforceOthers.upload.files;

    const filesContent = [{ ...nric }, { ...bookingforms }];

    const { Data: Singleapplicantbooking } = useSelector(
        (state) => state.SingleApplicantbookingform
    );

    const Jointapplicant = {
        images: [
            {
                id: 1,
                images: "https://picsum.photos/200/300",
                Date: "06-Jul-2022, 04:50 PM ",
                Filename: "Document-1.jpg",
            },
            {
                id: 2,
                images: "https://picsum.photos/200/300",
                Date: "06-07-2022, 05:10 PM",
                Filename: "Document-2.jpg",
            },
        ],
        statusSuccessfull: false,
    };

    const NricjointApplicant = {
        images: [
            {
                id: 1,
                images: "https://picsum.photos/200/300",
                Date: "06-Jul-2022, 04:50 PM ",
                Filename: "Document-1.jpg",
            },
            {
                id: 2,
                images: "https://picsum.photos/200/300",
                Date: "06-07-2022, 05:10 PM",
                Filename: "Document-2.jpg",
            },
        ],
        statusSuccessfull: false,
    };

    const JointApplicantbookingform = Singleapplicantbooking;

    const handleSingleBooking = (title, max, min) => {
        if (
            title ===
            "Latest 3 months salary slip, \nOR BE form and tax receipt, \nOR EPF statement"
        ) {
            navigation.navigate("OtherApplicantSingle", {
                Max: `${max}`,
                Min: `${min}`,
                Keytype: "bookingforms",
            });
        } else if (title === "Copy of NRIC (Front & back)") {
            navigation.navigate("ApplicantSingle", {
                Max: `${max}`,
                Min: `${min}`,
                Keytype: "nric",
            });
        } else if (title === "Copy of NRIC (Back)") {
            navigation.navigate("KYCApplicant", {
                Max: `${max}`,
                Min: `${min}`,
                Keytype: "nricJoint",
            });
        }
    };

    async function submit() {
        try {
            const images = [...Singleapplicantbooking.images];

            const nricImages = [...Singleapplicantbooking.nricFrontImages];

            setLoading(true);

            const body = {
                data: {
                    stpId: stpReferenceNumber,
                },
            };
            const response = await getdocumentUploadURL(body);
            const race = response?.data;

            const formdata = new FormData();
            if (images.length > 0) {
                images.forEach((item) => {
                    formdata.append("income", {
                        name: item.Filename,
                        uri: item.path,
                        type: item.mime,
                    });
                });

                nricImages.forEach((item) => {
                    formdata.append("nric", {
                        uri: item.path,
                        type: item.mime,
                        name: item.Filename,
                    });
                });

                const url = race.uploadUrl;
                const result = await asbDocumentUpload(formdata, url);
                if (result) {
                    const isSuccess = result.data;
                    if (isSuccess) {
                        navigation.navigate(RECEIVED_DOCUMENT_SCREEN);
                    }
                }
            }
        } catch (error) {
            console.log("error, ", error);
        } finally {
            setLoading(false);
        }
    }

    const handleCount = (title, count) => {
        if (
            title ===
            "Latest 3 months salary slip, \nOR BE form and tax receipt, \nOR EPF statement"
        ) {
            return `${JointApplicantbookingform.images.length} out of ${count} documents uploaded`;
        } else if (title === "Copy of NRIC (Front & back)") {
            return `${JointApplicantbookingform?.nricFrontImages?.length} out of ${count} documents uploaded`;
        } else if (title === "Copy of NRIC (Back)") {
            return `${JointApplicantbookingform?.nricBackImages?.length} out of ${count} documents uploaded`;
        }
    };

    const executeFunction = () => {
        if (Jointapplicant.images.length === 2 && NricjointApplicant.images.length === 2) {
            return (
                <View style={styles.bottomBtnContCls}>
                    <LinearGradient colors={["#efeff300", MEDIUM_GREY]} />
                    <ActionButton
                        fullWidth
                        onPress={submit}
                        backgroundColor={
                            JointApplicantbookingform.nricFrontImages.length === 2 &&
                            JointApplicantbookingform.images.length !== 0
                                ? YELLOW
                                : DISABLED
                        }
                        isLoading={loading}
                        componentCenter={
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                color={BLACK}
                                text={SUBMIT_DOC}
                            />
                        }
                        disabled={
                            JointApplicantbookingform.nricFrontImages.length !== 2 ||
                            JointApplicantbookingform.images.length === 0
                        }
                    />
                    <ActionButton
                        style={styles.laterBtn}
                        fullWidth
                        onPress={onCloseTap}
                        backgroundColor={TRANSPARENT}
                        isLoading={loading}
                        componentCenter={
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                color={BLUE}
                                text={PLSTP_UD_LATER}
                            />
                        }
                    />
                </View>
            );
        } else {
            return (
                <View style={styles.bottomBtnContCls}>
                    <LinearGradient colors={["#efeff300", MEDIUM_GREY]} />
                    <ActionButton
                        fullWidth
                        backgroundColor={YELLOW}
                        componentCenter={
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                color={BLACK}
                                text="Submit Documents"
                            />
                        }
                    />
                </View>
            );
        }
    };
    const handleLeaveBtn = async () => {
        setShowPopupConfirm(false);
        dispatch(doneWithDataPush());
        navigation.navigate(APPLY_LOANS);
    };
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }
    function onCloseTap() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_UploadDocuments",
            [FA_ACTION_NAME]: "Upload Later",
        });
        setShowPopupConfirm(true);
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                useSafeArea
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo
                                text={PLSTP_UD_HEADER}
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={19}
                            />
                        }
                        headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                    />
                }
                neverForceInset={["bottom"]}
                paddingLeft={0}
                paddingRight={0}
            >
                <ScrollView>
                    <View style={styles.mainSection}>
                        <Typo
                            text={ASB_FINANCING}
                            fontWeight="400"
                            fontSize={14}
                            lineHeight={20}
                            textAlign="left"
                        />
                        <Typo
                            text={PLSTP_UD_DESC}
                            fontWeight="600"
                            fontSize={16}
                            lineHeight={20}
                            textAlign="left"
                            style={styles.uploadTitle}
                        />
                        <Typo
                            text={`Reference ID: ${stpReferenceNumber}`}
                            fontWeight="400"
                            fontSize={14}
                            lineHeight={18}
                            textAlign="left"
                            color={APPROX_SUVA_GREY}
                        />
                        <Typo
                            text={SNAP_A_PIC}
                            fontWeight="600"
                            fontSize={14}
                            lineHeight={17}
                            textAlign="left"
                            style={styles.snapText}
                        />
                        {filesContent.map((data, key) => (
                            <TouchableOpacity
                                key={key}
                                onPress={() => handleSingleBooking(data.title, data.max, data.min)}
                            >
                                <View style={styles.uploadRow}>
                                    <View style={styles.uCol1}>
                                        <Image source={Assets.NRIC} />
                                    </View>
                                    <View style={styles.uCol2}>
                                        <Typo
                                            text={data.title}
                                            fontWeight="400"
                                            fontSize={14}
                                            lineHeight={17}
                                            textAlign="left"
                                            style={styles.uCol2Title}
                                        />
                                        <Typo
                                            text={handleCount(data.title, data.max)}
                                            fontWeight="400"
                                            fontSize={12}
                                            lineHeight={15}
                                            textAlign="left"
                                        />
                                    </View>
                                    <View>
                                        <Image source={Assets.Right} />
                                    </View>
                                </View>
                                <View style={styles.uCol3}>
                                    <Image source={Assets.RectangleManagerseparator} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                <View style={styles.container}>{executeFunction()}</View>
                <Popup
                    visible={showPopupConfirm}
                    onClose={onPopupCloseConfirm}
                    title={UNSAVED_CHANGES}
                    description={UNSAVED_CHANGES_DEC}
                    primaryAction={{
                        text: `${LEAVE}`,
                        onPress: handleLeaveBtn,
                    }}
                    secondaryAction={{
                        text: `${CANCEL}`,
                        onPress: onPopupCloseConfirm,
                    }}
                />
            </ScreenLayout>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 25,
        paddingVertical: 25,
    },
    laterBtn: {
        marginTop: 10,
    },
    mainSection: {
        paddingHorizontal: 25,
        paddingTop: 20,
        width: "100%",
    },
    snapText: {
        paddingTop: 35,
    },
    uCol1: {
        padding: 1,
    },
    uCol2: {
        alignContent: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    uCol2Title: {
        paddingBottom: 5,
    },
    uCol3: {
        padding: 0,
    },
    uploadRow: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: 25,
        paddingVertical: 25,
    },
    uploadTitle: {
        paddingBottom: 15,
        paddingTop: 10,
    },
});

JointApplicantScreen.propTypes = {
    route: PropTypes.any,
    navigation: PropTypes.any,
};

export default JointApplicantScreen;
