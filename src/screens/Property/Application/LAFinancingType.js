/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";

import {
    BANKINGV2_MODULE,
    LA_PRODUCT_PLANS,
    LA_FINANCING_TYPE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getFinancingPlan } from "@services";
import { logEvent } from "@services/analytics";

import {
    MEDIUM_GREY,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    FADE_GREY,
    DARK_GREY,
    WHITE,
} from "@constants/colors";
import {
    SAVE_NEXT,
    COMMON_ERROR_MSG,
    EXIT_POPUP_TITLE,
    LA_EXIT_POPUP_DESC,
    SAVE,
    DONT_SAVE,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
} from "@constants/strings";

import Assets from "@assets";

import { useResetNavigation, getEncValue } from "../Common/PropertyController";
import { saveLAInput } from "./LAController";

function LAFinancingType({ route, navigation }) {
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const [loading, setLoading] = useState(true);
    const [headerText, setHeaderText] = useState("");

    const [stepperInfo, setStepperInfo] = useState("");

    const [financeTypes, setFinanceTypes] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});

    const [isContinueDisabled, setContinueDisabled] = useState(true);
    const [showExitPopup, setShowExitPopup] = useState(false);
    const [editFlow, setEditFlow] = useState(false);

    useEffect(() => {
        init();
    }, [init]);

    useEffect(() => {
        const screenName = route.params?.editFlow
            ? "Property_ApplyLoan_Confirmation_EditProductDetails"
            : "Property_ApplyLoan_FinancingType";
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    }, [route.params?.editFlow]);

    const init = useCallback(() => {
        console.log("[LAFinancingType] >> [init]");

        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;
        const paramsEditFlow = navParams?.editFlow ?? false;
        const headerText = navParams?.headerText ?? "";
        const masterData = navParams?.masterData ?? {};
        const allFinanceTypes = masterData?.financeType ?? [];

        setHeaderText(headerText);
        setFinanceTypes(allFinanceTypes);

        //Set stepper info
        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;
        const totalSteps = navParams?.totalSteps;
        const stepperInfo =
            currentStep && totalSteps && !paramsEditFlow && currentStep <= totalSteps
                ? `Step ${currentStep} of ${totalSteps}`
                : "";
        setStepperInfo(stepperInfo);

        // Pre-populate data for resume OR edit flow
        if (resumeFlow || paramsEditFlow) {
            populateSavedData();
        } else {
            // default selected first item for new screen
            setSelectedItem(allFinanceTypes?.[0]);
            setContinueDisabled(false);
        }
        setLoading(false);
    }, [populateSavedData, route.params]);

    function onBackPress() {
        console.log("[LAFinancingType] >> [onBackPress]");

        navigation.canGoBack() && navigation.goBack();
    }

    function onCloseTap() {
        console.log("[LAFinancingType] >> [onCloseTap]");

        setShowExitPopup(true);
    }

    const populateSavedData = useCallback(() => {
        console.log("[LAFinancingType] >> [populateSavedData]");

        const navParams = route?.params ?? {};
        const paramsEditFlow = navParams?.editFlow ?? false;
        const masterData = navParams?.masterData ?? {};
        const savedData = navParams?.savedData ?? {};

        const savedFinancingType = savedData?.financingType ?? null;
        const editFinancingType = navParams?.financingType ?? null;
        const financingTypeSelected = paramsEditFlow ? editFinancingType : savedFinancingType;

        const allFinanceTypes = masterData?.financeType ?? [];
        const financingTypeObj = financingTypeSelected
            ? allFinanceTypes.find(({ type }) => type === financingTypeSelected)
            : allFinanceTypes?.[0];

        if (financingTypeObj) {
            setSelectedItem(financingTypeObj);
            setContinueDisabled(false);
        }

        // Changes specific to edit flow
        if (paramsEditFlow) {
            setEditFlow(paramsEditFlow);
            setStepperInfo("Step 1 of 2");
            setHeaderText("Edit product details");
        }
    }, [route?.params]);

    function onFinanceTypePress(data) {
        console.log("[LAFinancingType] >> [onFinanceTypePress]");

        // Update data of Selected finance Type
        setSelectedItem(data);
        setContinueDisabled(false);
    }

    async function onExitPopupSave() {
        console.log("[LAFinancingType] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveLAInput({
            screenName: LA_FINANCING_TYPE,
            formData,
            navParams: route?.params,
        });

        if (success) {
            resetToApplication();
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }
    }

    function onExitPopupDontSave() {
        console.log("[LAFinancingType] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();
    }

    function closeExitPopup() {
        console.log("[LAFinancingType] >> [closeExitPopup]");

        setShowExitPopup(false);
    }

    async function getRecommendedPlan() {
        console.log("[LAFinancingType] >> [getRecommendedPlan]");
        const encSyncId = await getEncValue(route?.params?.syncId ?? "");

        // Request object
        const params = {
            syncId: encSyncId,
            financingType: selectedItem?.type ?? "",
        };

        // Call getFinancingPlan based on finance type selected
        const httpResp = await getFinancingPlan(params, false).catch((error) => {
            console.log("[LAProductPlans][getFinancingPlan] >> Exception: ", error);
        });
        const result = httpResp?.data?.result ?? {};
        const statusCode = result?.statusCode ?? null;
        const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;

        if (statusCode !== "0000") showErrorToast({ message: statusDesc });

        return httpResp?.data?.result?.recommendedPlan ?? null;
    }

    async function onContinue() {
        console.log("[LAFinancingType] >> [onContinue]");
        setLoading(true);
        const navParams = route?.params ?? {};

        // Retrieve form data
        const formData = getFormData();

        if (!editFlow) {
            // Save Form Data in DB before moving to next screen
            await saveLAInput(
                {
                    screenName: LA_FINANCING_TYPE,
                    formData,
                    navParams,
                },
                false
            );
        }

        // Fetch recommended plan data
        const recommendedPlan = await getRecommendedPlan();
        if (!recommendedPlan) {
            setLoading(false);
            return;
        }

        if (editFlow) {
            // Navigate to Product Selection plan
            navigation.push(BANKINGV2_MODULE, {
                screen: LA_PRODUCT_PLANS,
                params: {
                    ...navParams,
                    ...formData,
                    recommendedPlan,
                },
            });
        } else {
            // Navigate to Product Selection plan
            navigation.navigate(BANKINGV2_MODULE, {
                screen: LA_PRODUCT_PLANS,
                params: {
                    ...navParams,
                    ...formData,
                    recommendedPlan,
                },
            });
        }
        setLoading(false);
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Property_ApplyLoan_FinancingType",
        });
    }

    function getFormData() {
        console.log("[LAFinancingType] >> [getFormData]");
        const navParams = route?.params ?? {};
        let currentStep = navParams?.currentStep;
        currentStep = currentStep + 1;

        return {
            financingType: selectedItem?.type ?? "",
            financingTypeTitle: selectedItem?.display ?? "",
            currentStep,
        };
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                            headerCenterElement={
                                <Typo
                                    text={stepperInfo}
                                    lineHeight={16}
                                    fontSize={12}
                                    fontWeight="600"
                                    color={FADE_GREY}
                                />
                            }
                            headerRightElement={
                                editFlow ? <></> : <HeaderCloseButton onPress={onCloseTap} />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={24}
                    useSafeArea
                >
                    <>
                        <View style={styles.wrapper}>
                            {/* Title */}
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={headerText}
                                textAlign="left"
                            />

                            {/* subheader text */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text="Please select your preferred financing type"
                                textAlign="left"
                            />

                            {/* financing types */}
                            {financeTypes.map((item, index) => (
                                <FinanceType
                                    key={index}
                                    index={index}
                                    data={item}
                                    onPress={onFinanceTypePress}
                                    selectedItem={selectedItem}
                                />
                            ))}
                        </View>

                        {/* Bottom Container */}
                        <FixedActionContainer>
                            <ActionButton
                                disabled={isContinueDisabled}
                                activeOpacity={isContinueDisabled ? 1 : 0.5}
                                backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo
                                        color={isContinueDisabled ? DISABLED_TEXT : BLACK}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={SAVE_NEXT}
                                    />
                                }
                                onPress={onContinue}
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Exit confirmation popup */}
            <Popup
                visible={showExitPopup}
                title={EXIT_POPUP_TITLE}
                description={LA_EXIT_POPUP_DESC}
                onClose={closeExitPopup}
                primaryAction={{
                    text: SAVE,
                    onPress: onExitPopupSave,
                }}
                secondaryAction={{
                    text: DONT_SAVE,
                    onPress: onExitPopupDontSave,
                }}
            />
        </>
    );
}

LAFinancingType.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const FinanceType = ({ data, onPress, index, selectedItem }) => {
    const onTilePress = () => {
        console.log("[FinanceType] >> [onTilePress]", data);
        if (onPress) onPress(data, index);
    };

    return (
        <View style={[styles.detailFieldCont, styles.detailPrimaryCont]}>
            <TouchableOpacity onPress={onTilePress} activeOpacity={0.8}>
                <View style={styles.textTickRow}>
                    <Typo
                        fontSize={16}
                        textAlign="left"
                        fontWeight="600"
                        lineHeight={18}
                        text={data?.title ?? ""}
                    />
                    <Image
                        style={styles.radioImage}
                        source={
                            data.id === selectedItem.id
                                ? Assets.icRadioChecked
                                : Assets.icRadioUnchecked
                        }
                    />
                </View>
                {data.points.map((item, index) => (
                    <FeatureRow text={item} key={index} />
                ))}
            </TouchableOpacity>
        </View>
    );
};

FinanceType.propTypes = {
    data: PropTypes.object,
    onPress: PropTypes.func,
    index: PropTypes.number,
    selectedItem: PropTypes.object,
};

const FeatureRow = ({ text }) => {
    return (
        <View style={styles.metaViewCls}>
            <View style={styles.circularView} />
            <Typo lineHeight={20} textAlign="left" text={text} style={styles.metaText} />
        </View>
    );
};

FeatureRow.propTypes = {
    text: PropTypes.string,
};

const styles = StyleSheet.create({
    circularView: {
        backgroundColor: DARK_GREY,
        borderRadius: 2,
        height: 4,
        marginRight: 8,
        marginTop: 10,
        width: 4,
    },

    detailFieldCont: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 5,
    },

    detailPrimaryCont: {
        backgroundColor: WHITE,
        borderRadius: 8,
        paddingVertical: 20,
    },

    label: {
        paddingTop: 8,
    },

    metaText: {
        paddingRight: 16,
    },

    metaViewCls: {
        flexDirection: "row",
    },

    radioImage: {
        height: 20,
        width: 20,
    },

    textTickRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 20,
    },

    wrapper: {
        flex: 1,
        paddingHorizontal: 36,
    },
});

export default LAFinancingType;
