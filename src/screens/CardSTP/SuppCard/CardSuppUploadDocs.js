import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
    ImageBackground,
} from "react-native";
import ImagePicker from "react-native-image-crop-picker";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { cardsUploadDoc } from "@services";

import {
    MEDIUM_GREY,
    YELLOW,
    BLACK,
    LIGHT_YELLOW,
    LIGHT_BLACK,
    ROYAL_BLUE,
} from "@constants/colors";
import { REFERENCE_ID, DATE_AND_TIME } from "@constants/strings";

import { checkCamPermission } from "@utils/dataModel/utility";

import assets from "@assets";

import CardsCamera from "../Card/CardsCamera";

function CardSuppUploadDocs({ navigation, route }) {
    const [refID, setRefId] = useState(route?.params?.stpRefNo);
    const [isEnable, setEnable] = useState(false);
    const [showCamera, setCamera] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [pickerType, setPickerType] = useState(false);
    const [currentItem, setCurrentItem] = useState("");
    const [currentObj, setCurrentObj] = useState({
        ICFT: { path: "", show: true, outputFile: [], fileData: {}, size: 0 },
        ICBK: { path: "", show: true, outputFile: [], fileData: {}, size: 0 },
    });

    useEffect(() => {
        const isSelected = currentObj?.ICFT?.path === "" || currentObj?.ICBK?.path === "";
        setEnable(isSelected);
    }, [currentObj]);

    function handleClose() {
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    }

    function handleInfoPress() {
        setShowInfo(true);
    }
    function onPopupClose() {
        setShowInfo(false);
    }
    async function handleImageUpUpload(item) {
        const id = item?.id;
        setCurrentItem(id);
        if (id === "ICFT" || id === "ICBK") {
            const permission = await checkCamPermission();
            if (permission) {
                navigateToCamera(3);
            }
        }
    }
    function navigateToCamera(index) {
        setPickerType(index);
        setCamera(true);
    }

    function onCallback(image) {
        let newObj = {};
        const totalSize = currentObj.ICFT.size + currentObj.ICBK.size + image?.size;

        if (totalSize >= 3999999) {
            showErrorToast({
                message: "Sorry, File size should be maximum 4MB",
            });
            return;
        }

        switch (currentItem) {
            case "ICFT":
                newObj = {
                    ...currentObj,
                    ICFT: {
                        ...currentObj.ICFT,
                        path: image.path,
                        fileData: { ...image },
                        size: image.size,
                    },
                };
                break;
            case "ICBK":
                newObj = {
                    ...currentObj,
                    ICBK: {
                        ...currentObj.ICBK,
                        path: image.path,
                        fileData: { ...image },
                        size: image.size,
                    },
                };
                break;
            default:
                break;
        }
        setCamera(false);
        setCurrentObj(newObj);
    }

    function onCancel() {
        setCamera(false);
    }

    function cleanImagesFromTmpFolder() {
        //Clean images if any
        ImagePicker.clean()
            .then(() => {
                console.log("removed all tmp images from tmp directory");
            })
            .catch(() => {
                console.log("Unable to removed all tmp images from tmp directory");
            });
    }

    function DocItem(props) {
        const isDoc = props?.base64 === "";
        const url = props?.base64;
        return (
            <View style={styles.docItemContainer}>
                <View style={styles.infoView}>
                    {!isDoc && <Image source={assets.icTickNew} style={styles.imageTick} />}
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        textAlign="left"
                        text={props.text}
                    />
                </View>
                <TouchableOpacity onPress={() => handleImageUpUpload(props)}>
                    {url ? (
                        <ImageBackground
                            style={styles.cardCaptureImg}
                            imageStyle={styles.backgroundImgView}
                            source={{
                                uri: url,
                            }}
                        />
                    ) : (
                        <Image source={assets.icSelectCamera} style={styles.imageCapture} />
                    )}
                </TouchableOpacity>
            </View>
        );
    }

    DocItem.propTypes = { text: PropTypes.string, id: PropTypes.string, base64: PropTypes.string };

    async function updateDocumentApi() {
        const params = route?.params ?? {};
        let formdata = new FormData();
        const data = {
            stpRefNo: refID,
            documentTypeIDs: ["ID8", "ID8"],
        };

        formdata.append("images", {
            uri: currentObj?.ICFT?.path,
            name: `newcardnricfront`,
            type: "image/jpeg",
        });
        formdata.append("images", {
            uri: currentObj?.ICBK?.path,
            name: `newcardnricback`,
            type: "image/jpeg",
        });
        formdata.append("entity", JSON.stringify(data));
        try {
            const url = `img/${params?.postLogin ? "v1" : "ntb/v1"}/loan/uploadDoc`;
            const httpResp = await cardsUploadDoc(formdata, url);
            const result = httpResp?.data?.result ?? null;
            if (!result) {
                return;
            }
            const { dateTime, stpRefNo } = result;
            stpRefNo && setRefId(stpRefNo);
            cleanImagesFromTmpFolder();
            if (httpResp?.data?.code === 200) {
                navigation.navigate("CardsSuccess", {
                    ...params,
                    serverDate: dateTime,
                    serverData: { stpRefNo },
                    docsValid: true,
                    headerTxt: "We will notify you on your application status via SMS or email",
                    cardsEntryPointScreen: "SupplementaryCard",
                });
            } else {
                handleFail(dateTime, httpResp?.data?.message);
            }
        } catch (e) {
            handleFail("", "");
            cleanImagesFromTmpFolder();
        }
    }

    function handleFail(txnDate, statusDesc) {
        navigation.navigate("CardsFail", {
            ...route.params,
            isSuccess: false,
            headerTxt: `Credit card application unsuccessful. Please try again. `,
            isSubMessage: false,
            errorMessage: statusDesc,
            detailsData: [
                {
                    title: REFERENCE_ID,
                    value: refID,
                },
                {
                    title: DATE_AND_TIME,
                    value: txnDate,
                },
            ],
            cardsEntryPointScreen: "Supplementary Card",
        });
    }

    async function handleProceedButton() {
        updateDocumentApi();
    }

    function onDeactivatePress() {
        const params = route?.params ?? {};
        navigation.navigate("CardsSuccess", {
            ...params,
            docsValid: false,
            headerTxt:
                "Upload your document in the next 3 days to complete your application through the 'Apply' section",
            cardsEntryPointScreen: "SupplementaryCard",
        });
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={8}
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    text="Upload Documents"
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView
                            style={styles.scrollViewCls}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.container}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    textAlign="left"
                                    text="Supplementary Card Application"
                                />

                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={28}
                                    style={styles.heading}
                                    textAlign="left"
                                    text="Upload your supporting documents to complete your application."
                                />

                                <Typo
                                    fontSize={14}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={25}
                                    style={styles.referenceIDText}
                                    textAlign="left"
                                    text={`Reference ID: ${refID}`}
                                />

                                <View style={styles.subContainer}>
                                    <View style={styles.infoView}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="left"
                                            text="Snap a picture of your documents"
                                        />
                                        <TouchableOpacity onPress={handleInfoPress}>
                                            <Image
                                                style={styles.infoIcon}
                                                source={assets.icInformation}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.docTextSubContainer}>
                                        <DocItem
                                            text="Copy of NRIC (Front)"
                                            id="ICFT"
                                            type="ID8"
                                            base64={currentObj.ICFT.path}
                                        />
                                        <DocItem
                                            text="Copy of NRIC (Back)"
                                            id="ICBK"
                                            type="ID8"
                                            base64={currentObj.ICBK.path}
                                        />
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={0.5}
                                    backgroundColor={!isEnable ? YELLOW : LIGHT_YELLOW}
                                    fullWidth
                                    disabled={isEnable}
                                    componentCenter={
                                        <Typo
                                            text="Submit Documents"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            color={!isEnable ? BLACK : LIGHT_BLACK}
                                        />
                                    }
                                    onPress={handleProceedButton}
                                />
                                <TouchableOpacity onPress={onDeactivatePress}>
                                    <Typo
                                        color={ROYAL_BLUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        style={styles.laterBtn}
                                        text="Upload Later"
                                        textAlign="center"
                                    />
                                </TouchableOpacity>
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
                <Popup
                    visible={showInfo}
                    title="Upload Documents"
                    description={`Note:\n 1. Copy of NRIC (both sides). \n * Total file size must not exceed 4MB`}
                    onClose={onPopupClose}
                />
                {showCamera && (
                    <CardsCamera
                        onCallback={onCallback}
                        onClose={onCancel}
                        pickerType={pickerType}
                    />
                )}
            </>
        </ScreenContainer>
    );
}

CardSuppUploadDocs.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    backgroundImgView: {
        borderRadius: 25,
        height: 50,
        width: 50,
    },
    bottomBtnContCls: {
        alignItems: "center",
        flex: 1,
        justifyContent: "space-around",
        width: "100%",
    },
    cardCaptureImg: {
        height: 40,
        width: 40,
    },
    container: { height: "100%", padding: 24 },
    docItemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginRight: 10,
        marginVertical: 14,
    },

    docTextSubContainer: { marginTop: 10 },
    heading: { marginVertical: 10 },
    imageCapture: {
        height: 30,
        resizeMode: Platform.OS !== "ios" ? "center" : "contain",
        width: 30,
    },
    imageTick: {
        height: 24,
        marginRight: 10,
        resizeMode: Platform.OS !== "ios" ? "center" : "contain",
        width: 24,
    },
    infoIcon: {
        height: 18,
        marginLeft: 10,
        width: 18,
    },
    infoView: {
        alignItems: "center",
        flexDirection: "row",
    },
    laterBtn: {
        paddingVertical: 24,
    },
    referenceIDText: { marginVertical: 10, opacity: 0.7 },
    subContainer: { marginTop: 20 },
});

export default CardSuppUploadDocs;
