import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useDispatch, useSelector } from "react-redux";

import { APPLY_LOANS, JOINT_APPLICANT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import FileUploaderCamera from "@components/Common/Fileuploadercamera";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import {
    MEDIUM_GREY,
    NEUTRAL_GEY,
    BLACK,
    YELLOW,
    WHITE,
    BLUE,
    DISABLED,
    DISABLED_TEXT,
} from "@constants/colors";
import { UNSAVED_CHANGES, UNSAVED_CHANGES_DEC } from "@constants/strings";

import { currentUnixTimeStamp } from "@utils/momentUtils";

import Assets from "@assets";

import {
    nricFrontApplicantbookingreducer,
    nricFrontApplicantbookingDeletereducer,
} from "../../../../../redux/reducers/ASBFinance/SingleApplicantbookingform";

const ApplicantSingle = ({ navigation }) => {
    const [visible, setVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [id, setId] = useState(0);
    const [keytype, setKeytype] = useState("");
    const [showExceedSizePopup, setShowExceedSizePopup] = useState(false);
    const [showUnsupportedFormatPopup, setShowUnsupportedFormatPopup] = useState(false);

    const KeyType = "others";
    const Max = 2;
    const Min = 1;
    const dispatch = useDispatch();

    useEffect(() => {
        setKeytype(KeyType);
    }, []);

    //Accessing Redux State
    const { Data: Singleapplicantbooking } = useSelector(
        (state) => state.SingleApplicantbookingform
    );

    const handleDelete = () => {
        dispatch(nricFrontApplicantbookingDeletereducer(id));
        setShowModal(false);
        showErrorToast({
            message: "Document deleted",
        });
    };

    async function onConfirm() {
        navigation.navigate(JOINT_APPLICANT);
    }

    function handleImage(dataRes, Date, Filetype, Filename, size) {
        if (size <= 5242880) {
            if (Filetype === "png" || Filetype === "jpeg") {
                const Data = {
                    ...dataRes,
                    Date,
                    Keytype: keytype,
                    id: `${Filename}_${currentUnixTimeStamp()}`,
                    Filetype,
                    Filename,
                };
                dispatch(nricFrontApplicantbookingreducer([Data]));
            } else if (Filetype === "pdf") {
                const Data = {
                    dataRes,
                    Date,
                    Keytype: keytype,
                    id: `${Filename}_${currentUnixTimeStamp()}`,
                    Filetype,
                    Filename,
                    mime: "application/pdf",
                    path: dataRes,
                };
                dispatch(nricFrontApplicantbookingreducer([Data]));
            } else {
                setShowUnsupportedFormatPopup(true);
            }
        } else {
            setShowExceedSizePopup(true);
        }
    }

    function grabbingIdfordeleting(id) {
        setId(id);
        setShowModal(true);
    }

    const handleFilename = (data) => {
        if (data.Filetype === "png" || data.Filetype === "jpg") {
            const Output = data.path.split("/");
            return Output[Output.length - 1];
        } else {
            return data.Filename;
        }
    };

    const specificData = (data) => {
        if (data.Filetype === "png" || data.Filetype === "jpg") {
            return data.data;
        } else {
            return data.dataRes;
        }
    };

    function onBackTap() {
        navigation.goBack();
    }

    function handleClose() {
        setShowModal(false);
    }
    function onCloseTap() {
        setShowPopupConfirm(true);
    }
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }
    const handleLeaveBtn = async () => {
        setShowPopupConfirm(false);
        navigation.navigate(APPLY_LOANS);
    };
    const onSizePopupCloseConfirm = () => {
        setShowExceedSizePopup(false);
    };

    function handleSizePopupClose() {
        setShowExceedSizePopup(false);
    }

    function onUnsupportedPopupCloseConfirm() {
        setShowUnsupportedFormatPopup(false);
    }

    function onClickSetVisibility() {
        setVisible(false);
    }

    function onClickVisibility() {
        setVisible(true);
    }

    return (
        <>
            {Singleapplicantbooking.nricFrontImages.length > 0 ? (
                <ScreenContainer backgroundType="color" backgroundColor={WHITE}>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                                headerCenterElement={
                                    <Typo
                                        text="Upload Documents"
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
                            {visible && (
                                <FileUploaderCamera
                                    visible={visible}
                                    onTap={onClickSetVisibility}
                                    handleImage={handleImage}
                                    max={Max}
                                    min={Min}
                                    images={Singleapplicantbooking.nricFrontImages.length}
                                    setVisible={setVisible}
                                />
                            )}
                            <ScrollView>
                                <View style={styles.container}>
                                    <Typo
                                        text={
                                            "Please snap a photo of both the front and back of the applicant's ID."
                                        }
                                        fontWeight="600"
                                        fontSize={16}
                                        lineHeight={20}
                                        textAlign="left"
                                    />
                                    <Typo
                                        text={
                                            Singleapplicantbooking.nricFrontImages.length +
                                            " out of " +
                                            Max +
                                            " files uploaded"
                                        }
                                        fontWeight="400"
                                        fontSize={12}
                                        lineHeight={18}
                                        textAlign="left"
                                        style={styles.snapText}
                                    />
                                    <View>
                                        {Singleapplicantbooking.nricFrontImages.map(
                                            (data) =>
                                                data.id !== 0 && (
                                                    <View key={data.id}>
                                                        <TouchableOpacity
                                                            onPress={() =>
                                                                navigation.navigate(
                                                                    "DocumentViewer",
                                                                    {
                                                                        name: handleFilename(data),
                                                                        Data: specificData(data),
                                                                        Id: data.id,
                                                                        From: "Applicantsingle",
                                                                    }
                                                                )
                                                            }
                                                        >
                                                            <View style={styles.listRow}>
                                                                <View style={styles.listCol1}>
                                                                    <Image
                                                                        source={Assets.Imagephoto}
                                                                    />
                                                                </View>
                                                                <View style={styles.listCol2}>
                                                                    <Typo
                                                                        text={handleFilename(data)}
                                                                        fontWeight="400"
                                                                        fontSize={15}
                                                                        lineHeight={20}
                                                                        textAlign="left"
                                                                    />
                                                                    <Typo
                                                                        text={data.Date}
                                                                        fontWeight="400"
                                                                        fontSize={11}
                                                                        lineHeight={20}
                                                                        textAlign="left"
                                                                    />
                                                                </View>
                                                                <View style={styles.listCol3}>
                                                                    <TouchableOpacity
                                                                        onPress={() =>
                                                                            grabbingIdfordeleting(
                                                                                data.id
                                                                            )
                                                                        }
                                                                    >
                                                                        <Image
                                                                            source={Assets.More}
                                                                        />
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </View>
                                                            <View>
                                                                <Image
                                                                    source={
                                                                        Assets.RectangleManagerseparator
                                                                    }
                                                                />
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                )
                                        )}
                                    </View>
                                </View>
                            </ScrollView>
                        </ScrollView>
                        <View style={styles.bottomBtnContCls}>
                            <LinearGradient colors={["#efeff300", MEDIUM_GREY]} />
                            <ActionButton
                                fullWidth
                                onPress={onConfirm}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={20}
                                        color={BLACK}
                                        text="Upload"
                                    />
                                }
                            />
                            <View style={styles.viewStyle} />

                            <ActionButton
                                fullWidth
                                onPress={onClickVisibility}
                                backgroundColor={
                                    Singleapplicantbooking.nricFrontImages.length === 2
                                        ? DISABLED
                                        : WHITE
                                }
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={20}
                                        color={
                                            Singleapplicantbooking.nricFrontImages.length === 2
                                                ? DISABLED_TEXT
                                                : BLUE
                                        }
                                        text="Add Another Document"
                                    />
                                }
                                disabled={Singleapplicantbooking.nricFrontImages.length === 2}
                            />
                        </View>
                    </ScreenLayout>
                </ScreenContainer>
            ) : (
                <ScreenContainer backgroundType="color" backgroundColor={WHITE}>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                                headerCenterElement={
                                    <Typo
                                        text="Upload Documents"
                                        fontWeight="600"
                                        fontSize={16}
                                        lineHeight={19}
                                    />
                                }
                            />
                        }
                        neverForceInset={["bottom"]}
                        paddingLeft={0}
                        paddingRight={0}
                    >
                        {visible && (
                            <FileUploaderCamera
                                visible={visible}
                                handleImage={handleImage}
                                max={Max}
                                min={Min}
                                images={Singleapplicantbooking.nricFrontImages.length}
                                setVisible={setVisible}
                                onTap={onClickSetVisibility}
                            />
                        )}
                        <View style={styles.noDocSection}>
                            <Typo
                                fontSize={12}
                                lineHeight={16}
                                fontWeight="400"
                                text="You have not uploaded any files yet"
                                color={NEUTRAL_GEY}
                            />
                        </View>
                    </ScreenLayout>
                    <View style={styles.bottomBtnContCls}>
                        <LinearGradient colors={["#efeff300", MEDIUM_GREY]} />
                        <ActionButton
                            fullWidth
                            onPress={onClickVisibility}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    color={BLACK}
                                    text="Upload"
                                />
                            }
                        />
                    </View>
                </ScreenContainer>
            )}

            <Popup
                visible={showModal}
                onClose={handleClose}
                title="Delete Document?"
                description="You will not be able to recover the deleted document. Are you sure you want to delete?"
                primaryAction={{
                    text: "Delete",
                    onPress: handleDelete,
                }}
                secondaryAction={{
                    text: "Cancel",
                    onPress: handleClose,
                }}
            />
            <Popup
                visible={showExceedSizePopup}
                onClose={handleSizePopupClose}
                title="File Size Exceeded 5MB"
                description="The selected file size must be less than 5MB."
                primaryAction={{
                    text: "Okay",
                    onPress: onSizePopupCloseConfirm,
                }}
            />
            <Popup
                visible={showUnsupportedFormatPopup}
                onClose={onUnsupportedPopupCloseConfirm}
                title="Unsupported File Format"
                description="The selected file format must be either in png, jpg or pdf"
                primaryAction={{
                    text: "Okay",
                    onPress: onUnsupportedPopupCloseConfirm,
                }}
            />
            <Popup
                visible={showPopupConfirm}
                onClose={onPopupCloseConfirm}
                title={UNSAVED_CHANGES}
                description={UNSAVED_CHANGES_DEC}
                primaryAction={{
                    text: "Leave",
                    onPress: handleLeaveBtn,
                }}
                secondaryAction={{
                    text: "Cancel",
                    onPress: onPopupCloseConfirm,
                }}
            />
        </>
    );
};

ApplicantSingle.propTypes = {
    navigation: PropTypes.any,
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        justifyContent: "space-around",
        paddingBottom: 40,
        paddingLeft: 25,
        paddingRight: 25,
        paddingTop: 20,
    },
    container: {
        paddingHorizontal: 25,
    },
    listCol1: {
        justifyContent: "center",
    },
    listCol2: {
        paddingHorizontal: 15,
        width: "80%",
    },
    listCol23: {
        padding: 0,
    },
    listRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: 15,
        width: "100%",
    },
    noDoc: {
        paddingBottom: 10,
        paddingTop: 35,
    },
    noDocSection: {
        alignItems: "center",
        height: "99%",
        justifyContent: "center",
    },
    snapText: {
        paddingBottom: 20,
        paddingTop: 10,
    },
    uploadTitle: {
        paddingBottom: 15,
        paddingTop: 10,
    },
    viewStyle: {
        paddingTop: 15,
    },
});

export default ApplicantSingle;
