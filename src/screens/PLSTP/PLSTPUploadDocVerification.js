import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
} from "react-native";
import ActionSheet from "react-native-actionsheet";

import { PLSTP_CAMERA, PLSTP_UPLOAD_DOCS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { GREY, WHITE, YELLOW, NEARYLY_DARK_GREY } from "@constants/colors";
import {
    PLSTP_UD_HEADER,
    PLSTP_VER_IC_DESC,
    FRONT,
    BACK,
    TAKE_PHOTO,
    CONTINUE,
} from "@constants/strings";

import { checkCamPermission } from "@utils/dataModel/utility";

import Assets from "@assets";

export const { width, height } = Dimensions.get("window");
const screenHeight = Dimensions.get("window").height;

function PLSTPUploadDocVerification({ route, navigation }) {
    const params = route?.params ?? {};
    const { docType, docs, docCount, noOfDocs, docsArray } = params;
    const actionsheet = useRef();
    const [clickImage, setClickImage] = useState("");
    const [showActionBtn, setShowActionBtn] = useState(false);
    const [images, setImages] = useState(docsArray || []);
    const title = params?.title ?? "";

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", onFocusHandler);
        return unsubscribe;
    }, [navigation, route]);

    function onFocusHandler() {
        init();
    }

    useEffect(() => {
        navigation.setParams({
            ...route?.params,
            docsCamArray: [...route.params?.docsArray],
        });
    }, []);

    useEffect(() => {
        if (clickImage) {
            actionsheet.current.show();
        }
    }, [clickImage]);

    function init() {
        if (route.params.from === "camera") {
            navigation.setParams({
                ...route?.params,
                from: "",
            });
            loadImages(route?.params?.docsCamArray);
            setImages(route?.params?.docsCamArray);
        } else {
            loadImages(route?.params?.docsArray);
        }
    }

    function loadImages(docsArr) {
        if (!docsArr) return;
        if (route?.params?.imgBase64) {
            let showBtn = false;
            switch (docType) {
                case "IC":
                    if (docsArr[0] && docsArr[1]) {
                        showBtn = true;
                    }
                    break;
                case "SALARY":
                    if (docs.salaryURL) {
                        showBtn = true;
                    }
                    break;
                case "EA":
                    if (docs.eaURL) {
                        showBtn = true;
                    }
                    break;
                case "TMSA":
                case "BE":
                case "BTR":
                case "BS":
                    if (docsArr.length === noOfDocs) {
                        showBtn = true;
                    }
                    break;
                case "BR":
                    if (docs.brURL) {
                        showBtn = true;
                    }
                    break;
                default:
                    break;
            }
            setShowActionBtn(showBtn);
        }
    }

    function onBackTap() {
        console.log("[PLSTPUploadDocVerification] >> [onBackTap]");
        navigation.pop();
    }

    function onCloseTap() {
        console.log("[PLSTPUploadDocVerification] >> [onCloseTap]");
        navigation.navigate(PLSTP_UPLOAD_DOCS, {
            ...route.params,
            docsArray: [],
            from: "close",
        });
    }

    function imageClick(type) {
        console.log("[PLSTPUploadDocVerification] >> [frontImagePressed]");
        setClickImage(type); //invoke useeffect
    }

    async function handleOnPressActionsheet(index) {
        if (index < 2) {
            if (index !== 1) {
                const permission = await checkCamPermission();
                if (permission) {
                    navigateToCamera(index);
                }
            } else {
                navigateToCamera(index);
            }
        } else {
            setClickImage("");
        }
    }

    function navigateToCamera(index) {
        navigation.navigate(PLSTP_CAMERA, {
            ...route.params,
            imagePicker: index === 1,
            clickImage,
        });
        setClickImage("");
    }

    function onContinueTap() {
        console.log("[PLSTPUploadDocVerification] >> [onContinueTap]");

        navigation.navigate(PLSTP_UPLOAD_DOCS, {
            ...route.params,
            docsArray: route.params?.docsCamArray,
        });
    }

    function salarySlip() {
        return (
            <React.Fragment>
                {images &&
                    images.map((doc, index) => {
                        return (
                            <React.Fragment key={`${docType}-${index}`}>
                                <TouchableOpacity
                                    style={styles.captureButton}
                                    onPress={() => imageClick(Number(`${index}`) + 1)}
                                >
                                    <View>
                                        <ImageBackground
                                            style={styles.capturedImage}
                                            imageStyle={styles.capturedImageStyle}
                                            source={{
                                                uri: doc,
                                            }}
                                        ></ImageBackground>
                                    </View>
                                </TouchableOpacity>
                            </React.Fragment>
                        );
                    })}
                {docCount !== noOfDocs && (
                    <View style={styles.captureMainView}>
                        <TouchableOpacity
                            style={styles.camerabuttonView}
                            onPress={() => imageClick("otherDocs")}
                        >
                            <Image style={styles.cameraImage} source={Assets.icCameraWhiteBG} />
                            <SpaceFiller height={30} />
                            <Typo
                                fontSize={12}
                                lineHeight={23}
                                fontWeight="600"
                                text={TAKE_PHOTO}
                                color={NEARYLY_DARK_GREY}
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </React.Fragment>
        );
    }

    function myKadDocs() {
        return (
            <React.Fragment>
                <View style={styles.captureMainView}>
                    <TouchableOpacity
                        style={styles.camerabuttonView}
                        onPress={() => imageClick("icFront")}
                    >
                        {images[0] ? (
                            <ImageBackground
                                style={styles.capturedImageIC}
                                imageStyle={styles.capturedImageStyle}
                                source={{
                                    uri: images[0],
                                }}
                            />
                        ) : (
                            <React.Fragment>
                                <Image style={styles.cameraImage} source={Assets.icCameraWhiteBG} />
                                <SpaceFiller height={30} />
                                <Typo
                                    fontSize={12}
                                    lineHeight={23}
                                    fontWeight="600"
                                    text={FRONT}
                                    color={NEARYLY_DARK_GREY}
                                />
                            </React.Fragment>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.captureMainView}>
                    <TouchableOpacity
                        style={styles.camerabuttonView}
                        onPress={() => imageClick("icBack")}
                    >
                        {images[1] ? (
                            <ImageBackground
                                style={styles.capturedImageIC}
                                imageStyle={styles.capturedImageStyle}
                                source={{
                                    uri: images[1],
                                }}
                            />
                        ) : (
                            <React.Fragment>
                                <Image style={styles.cameraImage} source={Assets.icCameraWhiteBG} />
                                <SpaceFiller height={30} />
                                <Typo
                                    fontSize={12}
                                    lineHeight={23}
                                    fontWeight="600"
                                    text={BACK}
                                    color={NEARYLY_DARK_GREY}
                                />
                            </React.Fragment>
                        )}
                    </TouchableOpacity>
                </View>
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
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={PLSTP_UD_HEADER}
                            />
                        }
                        headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
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
                                text={title}
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={23}
                                textAlign="left"
                            />
                            {docType === "IC" && (
                                <React.Fragment>
                                    <SpaceFiller height={8} />
                                    <Typo
                                        text={PLSTP_VER_IC_DESC}
                                        fontSize={20}
                                        fontWeight="300"
                                        lineHeight={30}
                                        textAlign="left"
                                    />
                                </React.Fragment>
                            )}
                            <SpaceFiller height={10} />
                            <View>
                                {/* Bottom Image Capture Tab */}
                                {docType === "IC" && myKadDocs()}
                                {(docType === "TMSA" ||
                                    docType === "BE" ||
                                    docType === "BTR" ||
                                    docType === "BS") &&
                                    salarySlip()}
                            </View>
                        </View>
                    </View>
                </ScrollView>
                {showActionBtn && (
                    <FixedActionContainer>
                        <View style={styles.bottomBtnContCls}>
                            <ActionButton
                                activeOpacity={1}
                                backgroundColor={YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={CONTINUE}
                                    />
                                }
                                onPress={onContinueTap}
                            />
                        </View>
                    </FixedActionContainer>
                )}
            </ScreenLayout>
            <ActionSheet
                ref={actionsheet}
                options={["Take a photo", "Choose from library", "Cancel"]}
                cancelButtonIndex={2}
                onPress={handleOnPressActionsheet}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
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
        height: (screenHeight * 22) / 100,
        marginTop: (screenHeight * 3) / 100,
        width: "100%",
    },
    captureMainView: {
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 1,
        borderStyle: "dashed",
        borderWidth: 2.5,
        height: (screenHeight * 22) / 95,
        marginTop: (screenHeight * 3) / 100,
        position: "relative",
        width: "100%",
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
        position: "relative",
        width: "100%",
    },
    capturedImageIC: {
        alignItems: "center",
        borderColor: GREY,
        // borderRadius: 1,
        // borderStyle: "dashed",
        // borderWidth: 2.5,
        flexDirection: "row",
        height: "100%",
        justifyContent: "center",
        position: "relative",
        width: "100%",
    },

    capturedImageStyle: {
        borderRadius: 5,
        height: "100%",
        width: "100%",
    },
    container: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "flex-start",
        marginHorizontal: 24,
        marginBottom: 36,
        marginTop: 10,
    },
    counterTitle: {
        paddingHorizontal: 20,
        width: "100%",
    },
});

export default PLSTPUploadDocVerification;
