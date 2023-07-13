import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import ImagePicker from "react-native-image-crop-picker";

import {
    PLSTP_PREQUAL2_FAIL,
    PLSTP_UPLOAD_DOCS_NOTE,
    TAB_NAVIGATOR,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import InlineTypography from "@components/FormComponents/InlineTypography";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { plstpUploadDoc } from "@services";
import { logEvent } from "@services/analytics";

import { DISABLED, ROYAL_BLUE, YELLOW } from "@constants/colors";
import {
    PLSTP_UD_HEADER,
    PLSTP_UD_TITLE,
    PLSTP_UD_DESC,
    PLSTP_UD_SUB_DESC,
    PLSTP_UD_MYKAD,
    PLSTP_UD_SUB_DESC_1,
    PLSTP_UD_SALARY_SLIP,
    PLSTP_UD_EA_FORM,
    PLSTP_UD_3MSA,
    PLSTP_UD_BE,
    PLSTP_UD_SUB_DESC_3,
    PLSTP_UD_BR,
    PLSTP_UD_BTR,
    PLSTP_UD_BS,
    PLSTP_UD_LATER,
    SUBMIT,
    PLSTP_IC_TITLE,
    PLSTP_UD_NOTE_BP,
    PLSTP_UD_NOTE_CR,
    PLSTP_UD_NOTE_PIB,
    FA_FORM_PROCEED,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import Assets from "@assets";

function PLSTPUploadDocs({ route, navigation }) {
    const { initParams } = route?.params ?? {};
    const { customerInfo, stpRefNum } = initParams;
    const [isEmployee, setIsEmployee] = useState(false);
    const [mykad, setmykad] = useState(false);
    const [ed, setEd] = useState(false); //ed: employee documents
    const [bd, setBd] = useState(false); //bd: business documents
    const [latestSal, setLatestSal] = useState(false);
    const [ea, setEa] = useState(false);
    const [be, setBe] = useState(false);
    const [btr, setBtr] = useState(false);
    const [br, setBr] = useState(false);
    const [bs, setBs] = useState(false);
    const [submit, setsubmit] = useState(false);
    const notes = [PLSTP_UD_NOTE_BP, PLSTP_UD_NOTE_CR, PLSTP_UD_NOTE_PIB];
    const [icImage] = useState(Assets.plstpcamera);
    const [icImageBase64, setICImageBase64] = useState("");
    const [salImageBase64, setSalImageBase64] = useState("");
    const [eaImageBase64, setEAImageBase64] = useState("");
    const [beImageBase64, setBEImageBase64] = useState("");
    const [tmsaImageBase64, setTMSAImageBase64] = useState("");
    const [brImageBase64, setBRImageBase64] = useState("");
    const [btrImageBase64, setBTRImageBase64] = useState("");
    const [bsImageBase64, setBSImageBase64] = useState("");

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", onFocusHandler);
        return unsubscribe;
    }, [navigation, route]);

    function onFocusHandler() {
        loadImages();
    }

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_UploadDocuments",
        });
        if (customerInfo?.employmentTypeValue) {
            const id = customerInfo?.employmentTypeValue;
            setIsEmployee(id !== "SMP" ? true : false);
        }
    }, []);

    useEffect(() => {
        if (ed) {
            setsubmit(mykad && ed);
        }
    }, [mykad, ed]);

    useEffect(() => {
        if (bd) {
            setsubmit(mykad && bd);
        }
    }, [mykad, bd]);

    useEffect(() => {
        setEd(latestSal || ea || be);
    }, [latestSal, ea, be]);

    useEffect(() => {
        setBd(br && (btr || bs));
    }, [br, btr, bs]);

    function loadImages() {
        const { docType, docs, docsArray, from } = route?.params;
        if (from === "close") {
            navigation.setParams({
                ...route?.params,
                from: "",
            });
            return;
        } else if (from === "camera") {
            navigation.setParams({
                ...route?.params,
                from: "",
                docsArray: [],
            });
        }
        switch (docType) {
            case "IC":
                navigation.setParams({
                    ...route?.params,
                    ICArray: [...docsArray],
                });
                if (docsArray?.length == 2) {
                    setICImageBase64(docsArray[0]);
                    setmykad(true);
                }
                break;
            case "SALARY":
                setSalImageBase64(docs?.salaryURL);
                setLatestSal(true);
                break;
            case "EA":
                setEAImageBase64(docs?.eaURL);
                setEa(true);
                break;
            case "BE":
                navigation.setParams({
                    ...route?.params,
                    BEArray: [...docsArray],
                });
                if (docsArray?.length == 6) {
                    setBEImageBase64(docsArray[0]);
                    setBe(true);
                }
                break;
            case "TMSA":
                navigation.setParams({
                    ...route?.params,
                    TMSAArray: [...docsArray],
                });
                if (docsArray?.length == 3) {
                    setTMSAImageBase64(docsArray[0]);
                }
                break;
            case "BR":
                setBRImageBase64(docs?.brURL);
                setBr(true);
                break;
            case "BTR":
                navigation.setParams({
                    ...route?.params,
                    BTRArray: [...docsArray],
                });
                if (docsArray?.length == 6) {
                    setBTRImageBase64(docsArray[0]);
                    setBtr(true);
                }
                break;
            case "BS":
                navigation.setParams({
                    ...route?.params,
                    BSArray: [...docsArray],
                });
                if (docsArray?.length == 6) {
                    setBSImageBase64(docsArray[0]);
                    setBs(true);
                }
                break;
            default:
                break;
        }
    }

    function onMyKadPress() {
        console.log("[PLSTPUploadDocs] >> [onMyKadPress]");

        navigation.navigate(PLSTP_UPLOAD_DOCS_NOTE, {
            ...route?.params,
            notes,
            title: PLSTP_IC_TITLE,
            img: Assets.plstpIC,
            docType: "IC",
            docCount: route?.params?.ICArray ? route?.params?.ICArray?.length : 0,
            noOfDocs: 2,
            docsArray: route?.params?.ICArray ? [...route?.params?.ICArray] : ["", ""],
            analyticScreenName: "Apply_PersonalLoan_UploadDocuments_MyKad",
        });
    }

    function onSalPress() {
        console.log("[PLSTPUploadDocs] >> [onSalPress]");

        navigation.navigate(PLSTP_UPLOAD_DOCS_NOTE, {
            ...route?.params,
            notes,
            title: PLSTP_UD_SALARY_SLIP,
            img: Assets.plstpPayslip,
            docType: "SALARY",
            analyticScreenName: "Apply_PersonalLoan_UploadDocuments_SalarySlip",
        });
    }

    function onEAPress() {
        console.log("[PLSTPUploadDocs] >> [onEAPress]");
        navigation.navigate(PLSTP_UPLOAD_DOCS_NOTE, {
            ...route?.params,
            notes,
            title: PLSTP_UD_EA_FORM,
            img: Assets.plstpEAForm,
            docType: "EA",
            analyticScreenName: "Apply_PersonalLoan_UploadDocuments_EAForm",
        });
    }

    function onBEPress() {
        console.log("[PLSTPUploadDocs] >> [onBEPress]");
        navigation.navigate(PLSTP_UPLOAD_DOCS_NOTE, {
            ...route?.params,
            notes,
            title: PLSTP_UD_BE,
            img: Assets.plstpBE,
            docType: "BE",
            docCount: route?.params?.BEArray ? route?.params?.BEArray.length : 0,
            noOfDocs: 6,
            docsArray: route?.params?.BEArray || [],
            analyticScreenName: "Apply_PersonalLoan_UploadDocuments_BEForm",
        });
    }

    function onTMSAPress() {
        console.log("[PLSTPUploadDocs] >> [onTMSAPress]");
        navigation.navigate(PLSTP_UPLOAD_DOCS_NOTE, {
            ...route?.params,
            notes,
            title: PLSTP_UD_3MSA,
            img: Assets.plstpBE, //TODO need to get image
            docType: "TMSA",
            docCount: route?.params?.TMSAArray ? route?.params?.TMSAArray?.length : 0,
            noOfDocs: 3,
            docsArray: route?.params?.TMSAArray || [],
            analyticScreenName: "Apply_PersonalLoan_UploadDocuments_ThreeMonthsSalaryAccount",
        });
    }

    function onBRPress() {
        console.log("[PLSTPUploadDocs] >> [onBRPress]");
        navigation.navigate(PLSTP_UPLOAD_DOCS_NOTE, {
            ...route?.params,
            notes,
            title: PLSTP_UD_BR,
            img: Assets.plstpBR, //TODO need to get image
            docType: "BR",
            analyticScreenName: "Apply_PersonalLoan_UploadDocuments_SSM",
        });
    }

    function onBTRPress() {
        console.log("[PLSTPUploadDocs] >> [onBTRPress]");
        navigation.navigate(PLSTP_UPLOAD_DOCS_NOTE, {
            ...route?.params,
            notes,
            title: PLSTP_UD_BTR,
            img: Assets.plstpBE, //TODO need to get image
            docType: "BTR",
            docCount: route?.params?.BTRArray ? route?.params?.BTRArray.length : 0,
            noOfDocs: 6,
            docsArray: route?.params?.BTRArray || [],
            analyticScreenName: "Apply_PersonalLoan_UploadDocuments_BForm",
        });
    }

    function onBSPress() {
        console.log("[PLSTPUploadDocs] >> [onBSPress]");
        navigation.navigate(PLSTP_UPLOAD_DOCS_NOTE, {
            ...route?.params,
            notes,
            title: PLSTP_UD_BS,
            img: Assets.plstBS, //TODO need to get image
            docType: "BS",
            docCount: route?.params?.BSArray ? route?.params?.BSArray.length : 0,
            noOfDocs: 6,
            docsArray: route?.params?.BSArray || [],
            analyticScreenName: "Apply_PersonalLoan_UploadDocuments_BankStatement",
        });
    }

    function cleanImagesFromTmpFolder() {
        //Clean images if any
        ImagePicker.clean()
            .then(() => {
                console.log("removed all tmp images from tmp directory");
            })
            .catch((e) => {
                console.log("Unable to removed all tmp images from tmp directory");
            });
    }

    function onSubmitTap() {
        if (!submit) return;
        const { docs, ICArray, TMSAArray, BEArray, BTRArray, BSArray } = route?.params;
        let data = {};
        let formdata = new FormData();
        // {\n "stpRefNo": "2263098023258", "documentTypeIDs": ["ID8", "ID7"] }
        data.stpRefNo = stpRefNum || "";
        data.documentTypeIDs = [];

        // ID8 – Copy of NRIC (both Sides)
        // ID3 – Latest Salary Slip
        // ID5 – EA Form
        // ID1 – BE Form and Tax Receipt
        // ID12 – Others
        // ID2 – 6 Months Bank Statement
        // ID9 – Copy of Business Registration
        // ID10 – Qualification Certificate
        // ID4 – EPF Statement
        // ID7 – Rental Document
        // ID6 – Commission Statement
        // ID11 – Appointment Letter
        // const documentTypeIDs = ["ID8"];

        // Object.keys(docs).forEach(key=>{
        //     if(key.indexOf("URL") !== -1){
        //     //    console.log(`${key} : ${a[key]}`);
        //        const img = a[key];
        //        formdata.append("images", { uri: img, name: key, type: "image/jpeg" });
        //     }
        // });
        if (ICArray?.length == 2) {
            ICArray.forEach((img, i) => {
                formdata.append("images", { uri: img, name: `icImg${i}`, type: "image/jpeg" });
                data.documentTypeIDs.push("ID8");
            });
        }

        if (TMSAArray?.length == 3) {
            TMSAArray.forEach((img, i) => {
                formdata.append("images", { uri: img, name: `tmsaImg${i}`, type: "image/jpeg" });
                data.documentTypeIDs.push("ID12");
            });
        }

        if (BEArray?.length == 6) {
            BEArray.forEach((img, i) => {
                formdata.append("images", { uri: img, name: `beImg${i}`, type: "image/jpeg" });
                data.documentTypeIDs.push("ID1");
            });
        }

        if (BSArray?.length == 6) {
            BSArray.forEach((img, i) => {
                formdata.append("images", { uri: img, name: `bsImg${i}`, type: "image/jpeg" });
                data.documentTypeIDs.push("ID2");
            });
        }

        if (BTRArray?.length == 6) {
            BTRArray.forEach((img, i) => {
                formdata.append("images", { uri: img, name: `btrImg${i}`, type: "image/jpeg" });
                data.documentTypeIDs.push("ID1");
            });
        }

        if (docs?.salaryURL) {
            formdata.append("images", { uri: docs?.salaryURL, name: `salary`, type: "image/jpeg" });
            data.documentTypeIDs.push("ID3");
        }
        if (docs?.eaURL) {
            formdata.append("images", { uri: docs?.eaURL, name: `ea`, type: "image/jpeg" });
            data.documentTypeIDs.push("ID5");
        }
        if (docs?.brURL) {
            formdata.append("images", { uri: docs?.brURL, name: `br`, type: "image/jpeg" });
            data.documentTypeIDs.push("ID9");
        }

        formdata.append("entity", JSON.stringify(data));

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_UploadDocuments",
        });

        plstpUploadDoc(formdata)
            .then((response) => {
                if (response?.data?.code === 200) {
                    cleanImagesFromTmpFolder();
                    const result = response?.data?.result;
                    const custInfo = {
                        ...customerInfo,
                        shortRefNo: result.stpRefNo,
                        dateTime: result.dateTime,
                    };
                    const initData = {
                        ...initParams,
                        customerInfo: custInfo,
                    };
                    navigation.navigate(PLSTP_PREQUAL2_FAIL, {
                        ...route.params,
                        initParams: initData,
                        from: "upload",
                        refresh: true,
                        loanType: customerInfo?.loanTypeValue,
                    });
                } else {
                    showErrorToast({
                        message: response?.data?.message,
                    });
                }
            })
            .catch((error) => {
                console.log("[LoyaltyCardConfirm][loadCards] >> Failure", error);
            });
    }

    function onLaterTap() {
        console.log("[PLSTPUploadDocs] >> [onLaterTap]");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Apply_PersonalLoan_UploadDocuments",
            [FA_ACTION_NAME]: "Upload Later",
        });
        cleanImagesFromTmpFolder();
        navigation.navigate(TAB_NAVIGATOR, {
            screen: "Tab",
            params: {
                screen: "Maybank2u",
            },
        });
    }

    function employedDocs() {
        return (
            <React.Fragment>
                <Typo
                    text={PLSTP_UD_SUB_DESC_1}
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    textAlign="left"
                />
                <SpaceFiller height={30} />
                <InlineTypography
                    label={PLSTP_UD_SALARY_SLIP}
                    componentID="sal"
                    style={styles.inlineTypographyFieldCls}
                    isImage={true}
                    img={Assets.plstpcamera}
                    isBase64={salImageBase64}
                    onValuePress={onSalPress}
                />
                <SpaceFiller height={30} />
                <InlineTypography
                    label={PLSTP_UD_EA_FORM}
                    componentID="ea"
                    style={styles.inlineTypographyFieldCls}
                    isImage={true}
                    img={Assets.plstpcamera}
                    isBase64={eaImageBase64}
                    onValuePress={onEAPress}
                />
                <SpaceFiller height={30} />
                <InlineTypography
                    label={PLSTP_UD_BE}
                    componentID="be"
                    style={styles.inlineTypographyFieldCls}
                    isImage={true}
                    img={Assets.plstpcamera}
                    isBase64={beImageBase64}
                    onValuePress={onBEPress}
                />
                <SpaceFiller height={30} />
                <InlineTypography
                    label={PLSTP_UD_3MSA}
                    componentID="tmsa"
                    style={styles.inlineTypographyFieldCls}
                    isImage={true}
                    img={Assets.plstpcamera}
                    isBase64={tmsaImageBase64}
                    onValuePress={onTMSAPress}
                    labelNumberOfLines={3}
                />
            </React.Fragment>
        );
    }

    function businessDocs() {
        return (
            <React.Fragment>
                <Typo
                    text={PLSTP_UD_SUB_DESC_3}
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    textAlign="left"
                />
                <SpaceFiller height={30} />
                <InlineTypography
                    label={PLSTP_UD_BR}
                    componentID="btr"
                    style={styles.inlineTypographyFieldCls}
                    isImage={true}
                    img={Assets.plstpcamera}
                    isBase64={brImageBase64}
                    onValuePress={onBRPress}
                />
                <SpaceFiller height={30} />
                <Typo
                    text={PLSTP_UD_SUB_DESC_1}
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    textAlign="left"
                />
                <SpaceFiller height={30} />
                <InlineTypography
                    label={PLSTP_UD_BTR}
                    componentID="btr"
                    style={styles.inlineTypographyFieldCls}
                    isImage={true}
                    img={Assets.plstpcamera}
                    isBase64={btrImageBase64}
                    onValuePress={onBTRPress}
                />
                <SpaceFiller height={30} />
                <InlineTypography
                    label={PLSTP_UD_BS}
                    componentID="bs"
                    style={styles.inlineTypographyFieldCls}
                    isImage={true}
                    img={Assets.plstpcamera}
                    isBase64={bsImageBase64}
                    onValuePress={onBSPress}
                />
            </React.Fragment>
        );
    }

    return (
        <ScreenContainer
            backgroundType="color"
            analyticScreenName="Apply_PersonalLoan_UploadDocuments"
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={PLSTP_UD_HEADER}
                            />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <ScrollView>
                    <View style={styles.container}>
                        <View style={styles.counterTitle}>
                            <Typo
                                text={PLSTP_UD_TITLE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                textAlign="left"
                            />
                            <SpaceFiller height={30} />
                            <Typo
                                text={PLSTP_UD_DESC}
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                textAlign="left"
                            />
                            <SpaceFiller height={24} />
                            <Typo
                                text={PLSTP_UD_SUB_DESC}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                textAlign="left"
                            />
                            <SpaceFiller height={25} />
                            <InlineTypography
                                label={PLSTP_UD_MYKAD}
                                componentID="mykad"
                                style={styles.inlineTypographyFieldCls}
                                isImage={true}
                                img={icImage}
                                isBase64={icImageBase64}
                                onValuePress={onMyKadPress}
                            />
                            <SpaceFiller height={30} />
                            {/* 
                            [
                                {
                                    "id": "EYR",
                                    "type": "EMPLOYER"
                                },
                                {
                                    "id": "GMP",(Employee)
                                    "type": "GOVERNMENT EMPLOYEE"
                                },
                                {
                                    "id": "OLF",
                                    "type": "OUTSIDE LABOUR FORCE"
                                },
                                {
                                    "id": "PMP",(Employee)
                                    "type": "PRIVATE EMPLOYEE"
                                },
                                {
                                    "id": "REE",(Employee)
                                    "type": "REPORTING ENTITY (RE) EMPLOYEE"
                                },
                                {
                                    "id": "SMP",
                                    "type": "SELF-EMPLOYED/ OWN ACCOUNT WORKER"
                                },
                                {
                                    "id": "UMP",
                                    "type": "UNEMPLOYED"
                                },
                                {
                                    "id": "UFW",
                                    "type": "UNPAID FAMILY WORKER"
                                }
                                ]
                            */}
                            {isEmployee ? employedDocs() : businessDocs()}
                            {/* {businessDocs()} */}
                        </View>
                    </View>
                </ScrollView>
                <FixedActionContainer>
                    <View style={styles.bottomBtnContCls}>
                        <ActionButton
                            activeOpacity={submit ? 1 : 0.5}
                            backgroundColor={submit ? YELLOW : DISABLED}
                            fullWidth
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={SUBMIT}
                                />
                            }
                            onPress={onSubmitTap}
                        />
                        <TouchableOpacity
                            onPress={onLaterTap}
                            activeOpacity={0.8}
                            style={styles.buttonMargin}
                        >
                            <Typo
                                color={ROYAL_BLUE}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={PLSTP_UD_LATER}
                            />
                        </TouchableOpacity>
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
    },
    buttonMargin: {
        marginTop: 30,
    },
    container: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "flex-start",
        marginBottom: 36,
        marginHorizontal: 24,
        marginTop: 10,
    },
    counterTitle: {
        paddingHorizontal: 20,
    },

    inlineTypographyFieldCls: {
        alignItems: "center",
        flexDirection: "row",
        height: 40,
    },
});

export default PLSTPUploadDocs;
