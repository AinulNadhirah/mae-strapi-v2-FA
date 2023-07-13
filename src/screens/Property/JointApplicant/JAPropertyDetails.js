import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, View, Platform, TouchableOpacity, Image, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    BANKINGV2_MODULE,
    JA_ACCEPTANCE,
    PROPERTY_DETAILS,
    PROPERTY_DASHBOARD,
    JA_PERSONAL_INFO,
    JA_PROPERTY_DETAILS,
} from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import {
    showErrorToast,
    showInfoToast,
    showSuccessToast,
    successToastProp,
} from "@components/Toast";

import { useModelController } from "@context";

import { getGroupChat, JointApplicationInviteResponse } from "@services";
import { logEvent } from "@services/analytics";

import { DARK_GREY, MEDIUM_GREY, SEPARATOR, WHITE, YELLOW, ROYAL_BLUE } from "@constants/colors";
import { PROP_LA_INPUT } from "@constants/data";
import {
    FA_ACCEPT_INVITATION,
    APPLICATION,
    APPLICATION_REMOVE_DESCRIPTION,
    APPLICATION_REMOVE_TITLE,
    FA_DECLINE_INVITATION,
    FA_ACTION_NAME,
    FA_ADD_BOOKMARK,
    FA_FIELD_INFORMATION,
    FA_FORM_COMPLETE,
    FA_REMOVE_BOOKMARK,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_SELECT_PROPERTY,
    FA_TAB_NAME,
    FA_VIEW_SCREEN,
    FA_JA_PROPERTYDETAILS,
    OKAY,
    FA_PROPERTY,
    FA_PROPERTY_JACEJA_APPLICATIONREMOVED,
    FA_PROPERTY_JA_REQUEST,
    FA_PROPERTY_JA_REQUEST_DECLINE,
    FA_PROPERTY_JA_REQUEST_PROCEED,
    FA_PROPERTY_JA_REQUEST_SUCCESSFULLYDECLINED,
    ADDITIONAL_FINANCING_INFO,
    MONTHLY_INSTALMENT_INFO,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utilityPartial.2";

import Assets from "@assets";

import { fetchGetApplicants } from "../Application/LAController";
import DetailField from "../Common/DetailField";
import {
    fetchCCRISReport,
    getEncValue,
    getExistingData,
    getMasterData,
    getMDMData,
    useResetNavigation,
} from "../Common/PropertyController";
import PropertyTile from "../Common/PropertyTile";
import OfferDisclaimerPopup from "../Eligibility/OfferDisclaimerPopup";
import { getJEligibilityBasicNavParams } from "./JAController";

const JAPropertyDetails = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const [resetToApplication] = useResetNavigation(navigation);
    const [saveData, setSaveData] = useState({});
    const [propertyAddress, setPropertyAddress] = useState(null);
    const [propertyData, setPropertyData] = useState(null);
    const [baseRateLabel, setBaseRateLabel] = useState("");
    const [showPopUp, setShowPopUp] = useState(false);
    const { getModel } = useModelController();

    const [deviceToRemove, setDeviceToRemove] = useState(false);
    const [applicationRemoved, setApplicationRemoved] = useState(false);
    let propAddress = null;

    let loading = false;
    const scrollRef = useRef();
    const onCloseTap = () => {
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: PROPERTY_DASHBOARD,
                    params: {
                        activeTabIndex: 1,
                        reload: true,
                    },
                },
            ],
        });
    };
    useEffect(() => {
        init();

        if (route?.params?.propertyData === null) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_JA_REQUEST_PROCEED,
            });
        }
    }, []);
    const init = async () => {
        setSaveData(route?.params?.savedData);
        setPropertyData(route?.params?.propertyData);
        const baseRateLabel = route?.params?.savedData?.baseRateLabel ?? "Base rate";
        setBaseRateLabel(baseRateLabel);

        const masterData = await getMasterData(true);
        const custState = route?.params?.savedData?.propState ?? "";
        let state;
        // State
        if (custState) {
            state = getExistingData(custState, masterData?.state ?? null);
        }
        if (
            route?.params?.savedData?.propAddr1 !== null &&
            route?.params?.savedData?.propAddr2 !== null &&
            route?.params?.savedData?.propAddr3 !== null &&
            route?.params?.savedData?.propPostCode !== null &&
            state?.name !== null
        ) {
            propAddress = `${route?.params?.savedData?.propAddr1}, ${route?.params?.savedData?.propAddr2}, ${route?.params?.savedData?.propAddr3}, ${route?.params?.savedData?.propPostCode}, ${state?.name}`;
            setPropertyAddress(propAddress);
        }
        if (route?.params?.propertyData !== null) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_JA_REQUEST,
            });
        } else {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_JA_REQUEST_PROCEED,
            });
        }
    };
    const onPressBookmark = useCallback((item) => {
        console.log("[JAPropertyDetails] >> [onBookmarkPress]");

        const eventName = item?.bookmarkAction === "ADD" ? FA_ADD_BOOKMARK : FA_REMOVE_BOOKMARK;
        logEvent(eventName, {
            [FA_SCREEN_NAME]: FA_JA_PROPERTYDETAILS,
            [FA_TAB_NAME]: APPLICATION,
            [FA_FIELD_INFORMATION]: item?.property_name,
        });
    }, []);
    const onBookmarkError = () => {
        showInfoToast({
            message: "Your request could not be proccessed at this time. Please try again later.",
        });
    };
    const onBookmarkDone = () => {
        // reloadBookmark();
    };

    const acceptInvitation = async (isAccepted) => {
        const syncId = saveData?.syncId;
        const { JAAcceptance } = getModel("property");
        const latitude = route?.params?.latitude ?? "";
        const longitude = route?.params?.longitude ?? "";

        const encSyncId = await getEncValue(syncId);
        const { success, errorMessage, jointApplicantDetails } = await fetchGetApplicants(
            encSyncId,
            false
        );
        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (!jointApplicantDetails) {
            setApplicationRemoved(true);
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_JACEJA_APPLICATIONREMOVED,
            });
            return;
        }

        if (isAccepted === "Y") {
            const masterData = await getMasterData(true);
            const mdmData = await getMDMData(true);
            const navParams = getJEligibilityBasicNavParams({
                masterData,
                mdmData,
                propertyData,
                saveData,
                latitude,
                longitude,
            });

            const params = {
                propertyId: propertyData?.property_id,
                progressStatus: PROP_LA_INPUT,
                syncId: encSyncId,
            };
            const { success, errorMessage } = await fetchCCRISReport(params, true);
            if (!success) {
                loading = false;
                // Show error message
                showErrorToast({ message: errorMessage });
                return;
            }

            if (saveData?.staffPfNo != null) {
                const params = {
                    propertyId: propertyData?.property_id,
                    stpId: saveData?.stpId ? saveData?.stpId : null,
                    operatorId: saveData?.staffPfNo,
                    syncId: encSyncId,
                    groupChatIndicator: "ADD_MEMBER",
                };

                await getGroupChat(params, true).catch((error) => {
                    console.log("[JAPropertyDetails][getGroupChat] >> Exception: ", error);
                });
            }

            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: FA_PROPERTY_JA_REQUEST,
                [FA_ACTION_NAME]: FA_ACCEPT_INVITATION,
            });

            navigation.navigate(BANKINGV2_MODULE, {
                screen: JAAcceptance ? JA_PERSONAL_INFO : JA_ACCEPTANCE,
                params: {
                    ...navParams,
                    syncId: syncId,
                },
            });

            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_JA_REQUEST_PROCEED,
            });
        } else {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: PROPERTY_DASHBOARD,
                params: {
                    activeTabIndex: 1,
                    reload: true,
                },
            });

            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY,
                [FA_TAB_NAME]: APPLICATION,
            });

            showSuccessToast(
                successToastProp({
                    message: `You've declined to be a joint applicant for ${saveData?.propertyName}`,
                })
            );

            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: FA_PROPERTY_JA_REQUEST_SUCCESSFULLYDECLINED,
            });
        }
        await JointApplicationInviteResponse({
            syncId: encSyncId,
            isAccepted: isAccepted,
        });
    };
    const onPropertyPress = (data) => {
        console.log("[getGroupChat] >> [onPropertyPress]");
        navigation.navigate(BANKINGV2_MODULE, {
            screen: PROPERTY_DETAILS,
            params: {
                syncId: saveData?.syncId,
                propertyId: saveData?.propertyId,
                latitude: route?.params?.latitude,
                longitude: route?.params?.longitude,
                saveData,
                from: JA_PROPERTY_DETAILS, // Note: from is used to trigger refresh from bookmark by using useFocusEffect;
                tab: "discoverTab",
            },
        });

        logEvent(FA_SELECT_PROPERTY, {
            [FA_SCREEN_NAME]: FA_PROPERTY_JA_REQUEST,
            [FA_FIELD_INFORMATION]: saveData?.propertyName,
        });
    };
    const declineInvitationHandler = async () => {
        const syncId = saveData?.syncId;
        const encSyncId = await getEncValue(syncId);
        const { success, errorMessage, jointApplicantDetails } = await fetchGetApplicants(
            encSyncId,
            false
        );
        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        if (!jointApplicantDetails) {
            setApplicationRemoved(true);
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: FA_PROPERTY_JACEJA_APPLICATIONREMOVED,
            });
            return;
        }
        setDeviceToRemove(true);

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_PROPERTY_JA_REQUEST_DECLINE,
        });

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_PROPERTY_JA_REQUEST,
            [FA_ACTION_NAME]: FA_DECLINE_INVITATION,
        });
    };
    const handleClosePopup = () => {
        setDeviceToRemove(false);
    };

    function proceedRemoveDevice() {
        acceptInvitation("N");
    }

    function closeCancelRemovePopup() {
        setApplicationRemoved(false);
        reloadApplicationDetails();
    }
    function closeRemoveAppPopup() {
        setApplicationRemoved(false);
        reloadApplicationDetails();
    }

    async function reloadApplicationDetails() {
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: PROPERTY_DASHBOARD,
                    params: {
                        activeTabIndex: 1,
                        reload: true,
                    },
                },
            ],
        });
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={<View />}
                    useSafeArea
                    neverForceInset={["top"]}
                >
                    <ScrollView showsVerticalScrollIndicator={false} ref={scrollRef}>
                        <View style={Style.imageContainer}>
                            <View style={Style.toolbarContainer(insets.top)}>
                                <View style={Style.closeBtnCont}>
                                    <HeaderCloseButton onPress={onCloseTap} />
                                </View>
                            </View>
                        </View>
                        <View style={Style.horizontalMarginBig}>
                            {/* Header Text */}
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={"Home financing"}
                                textAlign="left"
                            />
                            {/* Sub Text 1 */}
                            <Typo lineHeight={28} textAlign="left" style={Style.subText1}>
                                <Typo
                                    fontWeight="600"
                                    textAlign="left"
                                    lineHeight={28}
                                    fontSize={20}
                                    style={Style.propertyNameBold}
                                >
                                    {saveData?.mainApplicantName}
                                </Typo>
                                <Typo fontSize={20} lineHeight={28}>
                                    {` invited you to be a joint applicant`}
                                </Typo>
                                {/* <Text>{` invited you to be a joint applicant`}</Text> */}
                                {propertyData !== null && (
                                    <>
                                        <Typo fontSize={20} lineHeight={28}>
                                            {` for `}
                                        </Typo>
                                        <Typo
                                            fontWeight="600"
                                            textAlign="left"
                                            lineHeight={28}
                                            fontSize={20}
                                            style={Style.propertyNameBold}
                                        >
                                            {`${
                                                saveData?.propertyName
                                                    ? saveData?.propertyName
                                                    : " "
                                            }`}
                                        </Typo>
                                    </>
                                )}
                            </Typo>

                            <Typo
                                lineHeight={18}
                                textAlign="left"
                                text="View offer conditions."
                                fontWeight="bold"
                                style={Style.textUnderline}
                                onPress={() => {
                                    setShowPopUp(!showPopUp);
                                }}
                            />
                        </View>

                        <View style={Platform.OS === "ios" ? Style.shadow : {}}>
                            <View
                                style={[
                                    Platform.OS === "ios" ? {} : Style.shadow,
                                    Style.loanDetailsContainer,
                                    Style.horizontalMargin,
                                ]}
                            >
                                {/* <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={saveData?.propertyName}
                                    style={Style.propertyName}
                                /> */}
                                {/* Loan Amount Label */}
                                <Typo
                                    lineHeight={19}
                                    style={Style.loanAmountLabel}
                                    text={"Property financing amount"}
                                />

                                {/* Loan Amount value */}
                                <Typo
                                    fontSize={24}
                                    lineHeight={29}
                                    fontWeight="bold"
                                    style={Style.loanAmount}
                                    text={`RM ${numeral(saveData?.propertyFinancingAmt).format(
                                        "0,0.00"
                                    )}`}
                                />

                                <View style={Style.infoNoteContainer}>
                                    <Image
                                        source={Assets.noteInfo}
                                        style={Style.infoIcon}
                                        resizeMode="contain"
                                    />

                                    <Typo
                                        fontSize={12}
                                        textAlign="left"
                                        lineHeight={15}
                                        text={ADDITIONAL_FINANCING_INFO}
                                        color={DARK_GREY}
                                        style={Style.infoText}
                                    />
                                </View>

                                <DetailField
                                    label={"Effective profit rate"}
                                    value={
                                        saveData?.effectiveProfitRate
                                            ? `${parseFloat(saveData?.effectiveProfitRate).toFixed(
                                                  2
                                              )}% p.a`
                                            : ""
                                    }
                                    valueSubText1={
                                        saveData?.baseRate
                                            ? `${baseRateLabel}: ${parseFloat(
                                                  saveData?.baseRate
                                              ).toFixed(2)}%`
                                            : `Base rate: `
                                    }
                                    valueSubText2={
                                        saveData?.spread
                                            ? `Spread: ${parseFloat(saveData?.spread).toFixed(2)}%`
                                            : `Spread: `
                                    }
                                    style={Style.firstDetailField}
                                />
                                <DetailField
                                    label="Financing period"
                                    value={
                                        saveData?.financingPeriod
                                            ? `${saveData?.financingPeriod} years`
                                            : ``
                                    }
                                />
                                <DetailField
                                    label="Monthly instalment"
                                    value={`RM ${numeral(saveData?.monthlyInstalment).format(
                                        "0,0.00"
                                    )}`}
                                />
                                <View style={Style.infoNoteContainer}>
                                    <Image
                                        source={Assets.noteInfo}
                                        style={Style.infoIcon}
                                        resizeMode="contain"
                                    />

                                    <Typo
                                        fontSize={12}
                                        textAlign="left"
                                        lineHeight={15}
                                        text={MONTHLY_INSTALMENT_INFO}
                                        color={DARK_GREY}
                                        style={Style.infoText}
                                    />
                                </View>

                                {/* Gray separator line */}

                                <View style={Style.graySeparator} />

                                {/* Property Price */}
                                <DetailField
                                    label="Property price"
                                    value={`RM ${numeral(saveData?.propertyPrice).format(
                                        "0,0.00"
                                    )}`}
                                    style={Style.firstDetailField}
                                />

                                {/* Downpayment */}
                                <DetailField
                                    label="Downpayment"
                                    value={`RM ${numeral(saveData?.downPayment).format("0,0.00")}`}
                                />
                            </View>
                        </View>

                        {propertyData !== null ? (
                            <>
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                    text={"Property details"}
                                    textAlign="left"
                                    style={Style.horizontalMargin}
                                />
                                <PropertyTile
                                    data={propertyData}
                                    token={route.params.token}
                                    onPressBookmark={onPressBookmark}
                                    onBookmarkError={onBookmarkError}
                                    onBookmarkDone={onBookmarkDone}
                                    isBookmarked={propertyData?.isBookMarked}
                                    onPress={onPropertyPress}
                                />
                            </>
                        ) : propertyAddress !== null && propertyAddress !== undefined ? (
                            <>
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                    text={"Property Address"}
                                    textAlign="left"
                                    style={Style.horizontalMargin}
                                />
                                <View
                                    style={[
                                        Platform.OS === "ios" ? {} : Style.shadow,
                                        Style.loanDetailsContainer,
                                        Style.horizontalMargin,
                                    ]}
                                >
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={propertyAddress}
                                        style={Style.propertyName}
                                        textAlign="left"
                                    />
                                </View>
                            </>
                        ) : (
                            <>
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                    text={"Property Details"}
                                    textAlign="left"
                                    style={Style.horizontalMargin}
                                />
                                <View
                                    style={[
                                        Platform.OS === "ios" ? {} : Style.shadow,
                                        Style.loanDetailsContainer,
                                        Style.horizontalMargin,
                                    ]}
                                >
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={saveData?.propertyName}
                                        style={Style.propertyName}
                                        textAlign="left"
                                    />
                                </View>
                            </>
                        )}

                        {/* {<Typo
                            fontSize={16}
                            fontWeight="600"
                            lineHeight={20}
                            text={"Property addresss"}
                            textAlign="left"
                            style={Style.horizontalMargin}
                        />} */}
                        {/* { <View style={Platform.OS === "ios" ? Style.shadow : {}}>
                            <View
                                style={[
                                    Platform.OS === "ios" ? {} : Style.shadow,
                                    Style.loanDetailsContainer,
                                    Style.horizontalMargin,
                                ]}
                            >
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                    text={"Property addresss"}
                                    textAlign="left"
                                    style={Style.propertyName}
                                />
                            </View>
                        </View>} */}
                        <View style={[Style.horizontalMargin, Style.additionalIncomeTile]}>
                            <ActionButton
                                fullWidth
                                backgroundColor={YELLOW}
                                style={Style.viewOtherBtn}
                                componentCenter={
                                    <Typo
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Accept Invitation"
                                    />
                                }
                                onPress={() => {
                                    acceptInvitation("Y");
                                }}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    declineInvitationHandler();
                                }}
                                activeOpacity={0.8}
                            >
                                <Typo
                                    color={ROYAL_BLUE}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Decline Invitation"
                                    style={{
                                        marginTop: 24,
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </ScreenLayout>
            </ScreenContainer>
            <OfferDisclaimerPopup
                visible={showPopUp}
                onClose={() => {
                    setShowPopUp(!showPopUp);
                }}
            />

            {!!deviceToRemove && (
                <Popup
                    visible
                    title="Decline Invitation"
                    description={`You've declined ${saveData?.mainApplicantName}'s invitation to be a joint applicant. He/She will be notified on this. This action cannot be undone.`}
                    onClose={handleClosePopup}
                    primaryAction={{
                        text: "Decline",
                        onPress: proceedRemoveDevice,
                    }}
                    secondaryAction={{
                        text: "Cancel",
                        onPress: handleClosePopup,
                    }}
                />
            )}

            {/*Application Removed popup */}
            {!!applicationRemoved && (
                <Popup
                    visible
                    title={APPLICATION_REMOVE_TITLE}
                    description={APPLICATION_REMOVE_DESCRIPTION}
                    onClose={closeRemoveAppPopup}
                    primaryAction={{
                        text: OKAY,
                        onPress: closeCancelRemovePopup,
                    }}
                />
            )}
        </>
    );
};
JAPropertyDetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};
const Style = StyleSheet.create({
    addPromoContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "row",
        height: 25,
        justifyContent: "space-between",
        marginHorizontal: 18,
        marginTop: 6,
    },

    addPromoInnerCont: {
        flexDirection: "row",
    },

    additionalIncomeTile: {
        marginBottom: 25,
        marginTop: 25,
    },

    closeBtnCont: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },

    graySeparator: {
        borderColor: SEPARATOR,
        borderTopWidth: 1,
        flex: 1,
        height: 1,
        marginVertical: 15,
    },

    horizontalMargin: {
        marginHorizontal: 24,
        marginTop: 15,
    },

    horizontalMarginBig: {
        marginHorizontal: 36,
    },

    imageCls: {
        height: "100%",
        width: "100%",
    },

    imageContainer: {
        alignItems: "center",
        height: 100,
    },

    infoIcon: {
        height: 16,
        width: 16,
    },

    infoNotch: {
        height: 13,
        left: "50%",
        top: 2,
        width: 34,
    },

    infoNoteContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        marginBottom: 5,
        marginHorizontal: 20,
        marginTop: 15,
    },

    infoText: {
        marginHorizontal: 12,
    },

    infoToolTipContainer: {
        flex: 1,
        height: "auto",
        left: 0,
        top: 0,
        width: "100%",
    },

    infoToolTipText: {
        flexGrow: 0,
        margin: 16,
    },

    jointApplicantHeader: {
        marginLeft: 40,
        marginTop: 5,
    },

    jointApplicantName: {
        position: "relative",
        right: 26,
        textAlign: "left",
    },

    jointApplicantStyle: {
        fontSize: 14,
        marginLeft: 20,
        textDecorationColor: "black",
        textDecorationLine: "underline",
        textDecorationStyle: "solid",
    },

    jointApplicanthorizontalMargin: {
        marginHorizontal: 10,
    },

    loanAmount: {
        marginTop: 10,
    },

    loanAmountLabel: {
        marginTop: 5,
    },

    loanDetailsContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginVertical: 25,
        paddingVertical: 25,
    },

    optionHeader: {
        marginTop: 10,
    },

    promoRowArrowIcon: {
        height: 24,
        marginLeft: 10,
        width: 24,
    },

    promoTagIcon: {
        height: 21,
        marginRight: 10,
        width: 21,
    },

    propertyName: {
        marginHorizontal: 16,
    },
    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },

    subText1: {
        marginTop: 10,
    },
    subText2: {
        marginTop: 20,
    },
    subText2Hide: {
        height: 0,
        width: 0,
    },
    textUnderline: {
        marginBottom: 20,
        marginTop: 20,
        textDecorationLine: "underline",
    },
    toolbarContainer: (safeAreaInsetTop) => ({
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: 16,
        width: "100%",
        zIndex: 1,
        top: 0,
        position: "absolute",
        paddingTop: safeAreaInsetTop,
        height: 70 + safeAreaInsetTop,
    }),
    viewOtherBtn: {
        marginBottom: 16,
    },
    propertyNameBold: {
        fontWeight: "600",
    },
});
export default JAPropertyDetails;
