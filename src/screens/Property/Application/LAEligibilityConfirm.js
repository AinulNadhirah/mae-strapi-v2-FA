/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable radix */
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    LA_ELIGIBILITY_CONFIRM,
    BANKINGV2_MODULE,
    LA_UNIT_NUMBER,
    CE_UNIT_SELECTION,
    LA_CUST_ADDRESS,
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

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    EXIT_POPUP_TITLE,
    LA_EXIT_POPUP_DESC,
    SAVE,
    TITLE,
    DONT_SAVE,
    PROP_PURCHASE_LBL,
    ONGOING_LOAN_LBL,
    CANCEL,
    EDIT,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FIRST_TIME_PURCHASING_HOUSE,
} from "@constants/strings";

import { getExistingData, useResetNavigation } from "../Common/PropertyController";
import SummaryContainer from "../Common/SummaryContainer";
import { saveLAInput } from "./LAController";

const EDIT_POPUP_TITLE = "Edit details";
const EDIT_POPUP_DESC = "Your eligibility will be reassessed when you edit your details.";

function LAEligibilityConfirm({ route, navigation }) {
    const safeAreaInsets = useSafeAreaInsets();
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const [data, setData] = useState([]);

    const [showExitPopup, setShowExitPopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);

    useEffect(() => {
        init();
    }, []);

    const init = useCallback(() => {
        console.log("[LAEligibilityConfirm] >> [init]");

        // Populate Eligibility details
        setDetails();
    }, [route, navigation]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Property_Review_LoanDetails",
        });
    }, []);

    function onBackTap() {
        console.log("[LAEligibilityConfirm] >> [onBackTap]");

        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[LAEligibilityConfirm] >> [onCloseTap]");

        setShowExitPopup(true);
    }

    function setDetails() {
        console.log("[LAEligibilityConfirm] >> [setDetails]");

        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};
        const propertyName = navParams?.propertyName ?? "";
        const unitTypeName = navParams?.unitTypeName ?? "";
        const propertyPrice = navParams?.propertyPrice ?? "";
        const propertyPriceDisp = getFormattedAmount(propertyPrice);
        const downPaymentAmount = navParams?.downPaymentAmount;
        const downPaymentAmountDisp = getFormattedAmount(downPaymentAmount);
        const loanAmount = navParams?.eligibilityResult?.aipAmount ?? navParams?.loanAmount;
        const loanAmountDisp = getFormattedAmount(loanAmount);
        const tenure = (() => {
            if (navParams?.eligibilityResult?.tenure)
                return `${navParams?.eligibilityResult?.tenure} years`;
            else if (navParams?.tenure) return `${navParams?.tenure} years`;
            else return "";
        })();
        const title = navParams?.title ?? "";
        const titleSelect = getExistingData(title, masterData?.title ?? null, "");
        const residentStatus = navParams?.residentStatus ?? "";
        const residentSelect = getExistingData(
            residentStatus,
            masterData?.customerGroup ?? null,
            ""
        );
        const education = navParams?.education ?? "";
        const educationSelect = getExistingData(education, masterData?.education ?? null, "");
        const employmentStatus = navParams?.employmentStatus ?? "";
        const empTypeSelect = getExistingData(
            employmentStatus,
            masterData?.employmentType ?? null,
            ""
        );
        const businessType = navParams?.businessType ?? "";
        const bizClassificationSelect = getExistingData(
            businessType,
            masterData?.businessClassification ?? null,
            ""
        );
        const occupation = navParams?.occupation ?? "";
        const occupationSelect = getExistingData(occupation, masterData?.occupation ?? null, "");
        const grossIncome = navParams?.grossIncome ?? "";
        const grossIncomeDisp = getFormattedAmount(grossIncome);
        const maritalStatus = navParams?.maritalStatus ?? "";
        const maritalSelect = getExistingData(maritalStatus, masterData?.maritalStatus ?? null, "");
        const religion = navParams?.religion ?? "";
        const religionSelect = getExistingData(religion, masterData?.religion ?? null, "");
        const spouseIncome = navParams?.spouseIncome ?? "";
        const spouseIncomeDisp = getFormattedAmount(spouseIncome);
        const isFirstTimeBuyHomeIndc = navParams?.isFirstTimeBuyHomeIndc === "Y" ? "Yes" : "No";
        const houseLoan = navParams?.houseLoan ?? "";
        const nonBankCommitments = navParams?.nonBankCommitments ?? "";
        const nonBankCommitmentsDisp = getFormattedAmount(nonBankCommitments);
        const ccrisLoanCount = navParams?.ccrisLoanCount ?? "";
        const showFinDeclarationDetails =
            !isNaN(parseInt(ccrisLoanCount)) && parseInt(ccrisLoanCount) > 0;
        const propertyPurchase = navParams?.propertyPurchase ?? "";
        const propertyPurchaseText = propertyPurchase === "Y" ? "Yes" : "No";
        const ongoingLoan = navParams?.ongoingLoan ?? "";
        const ongoingLoanText = ongoingLoan === "Y" ? "Yes" : "No";

        const finDeclarationDetails = [
            {
                label: PROP_PURCHASE_LBL,
                value: propertyPurchaseText,
            },
            {
                label: ONGOING_LOAN_LBL,
                value: ongoingLoanText,
            },
        ];
        const detailsArray = [
            {
                label: "Property name",
                value: propertyName,
            },
            {
                label: "Unit type",
                value: unitTypeName,
            },
            {
                label: "Property price",
                value: propertyPriceDisp,
            },
            {
                label: "Downpayment",
                value: downPaymentAmountDisp,
            },
            {
                label: "Property Financing amount",
                value: loanAmountDisp,
            },
            {
                label: "Financing period",
                value: tenure,
            },
            {
                label: TITLE,
                value: titleSelect?.name,
            },
            {
                label: "Resident status",
                value: residentSelect?.name,
            },
            {
                label: "Education",
                value: educationSelect?.name,
            },
            {
                label: "Employment status",
                value: empTypeSelect?.name,
            },
            {
                label: "Employment business type",
                value: bizClassificationSelect?.name,
            },
            {
                label: "Occupation",
                value: occupationSelect?.name,
            },
            {
                label: "Gross monthly income",
                value: grossIncomeDisp,
            },
            {
                label: "Marital status",
                value: maritalSelect?.name,
            },
            {
                label: "Religion",
                value: religionSelect?.name,
            },
            {
                label: "Spouse gross income",
                value: spouseIncomeDisp,
            },
            {
                label: FIRST_TIME_PURCHASING_HOUSE,
                value: isFirstTimeBuyHomeIndc,
            },
            {
                label: "Existing housing financing",
                value: houseLoan,
            },
            {
                label: "Non-bank commitments",
                value: nonBankCommitmentsDisp,
            },
        ];

        if (showFinDeclarationDetails) {
            setData([...detailsArray, ...finDeclarationDetails]);
        } else {
            setData(detailsArray);
        }
    }

    async function onExitPopupSave() {
        console.log("[LAEligibilityConfirm] >> [onExitPopupSave]");

        // Hide popup
        closeExitPopup();

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before exiting the flow
        const { success, errorMessage } = await saveLAInput({
            screenName: LA_ELIGIBILITY_CONFIRM,
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
        console.log("[LAEligibilityConfirm] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();
    }

    function closeExitPopup() {
        console.log("[LAEligibilityConfirm] >> [closeExitPopup]");

        setShowExitPopup(false);
    }

    function onEditPopupEdit() {
        console.log("[LAEligibilityConfirm] >> [onEditPopupEdit]");

        // Hide popup
        closeEditPopup();

        // Navigate to Unit Selection screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_UNIT_SELECTION,
            params: {
                ...route.params,
                editFlow: true,
            },
        });
    }

    function closeEditPopup() {
        console.log("[LAEligibilityConfirm] >> [closeEditPopup]");

        setShowEditPopup(false);
    }

    function onEdit() {
        console.log("[LAEligibilityConfirm] >> [onEdit]");

        setShowEditPopup(true);

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Property_Review_LoanDetails",
            [FA_ACTION_NAME]: "Edit Financing Details",
        });
    }

    function getFormattedAmount(amount) {
        return amount ? `RM ${numeral(amount).format("0,0.00")}` : "";
    }

    async function onContinue() {
        console.log("[LAEligibilityConfirm] >> [onContinue]");

        const navParams = route?.params ?? {};

        // Retrieve form data
        const formData = getFormData();

        // Save Form Data in DB before moving to next screen
        await saveLAInput({
            screenName: LA_ELIGIBILITY_CONFIRM,
            formData,
            navParams,
        });

        const eligibilityStatus = navParams?.eligibilityStatus ?? "";
        if (eligibilityStatus === "GREEN") {
            // Navigate to Unit Number screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: LA_UNIT_NUMBER,
                params: {
                    ...navParams,
                    ...formData,
                    currentStep: 0,
                    totalSteps: 7,
                },
            });
        } else {
            // AMBER STATUS - BAU flow
            // Navigate to Customer Address screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: LA_CUST_ADDRESS,
                params: {
                    ...navParams,
                    ...formData,
                    currentStep: 0,
                    totalSteps: 3,
                },
            });
        }

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Property_Review_LoanDetails",
            [FA_ACTION_NAME]: "Confirm",
        });
    }

    const getFormData = () => {
        console.log("[LAEligibilityConfirm] >> [getFormData]");

        const navParams = route?.params ?? {};
        const propertyName = navParams?.propertyName;
        const unitTypeName = navParams?.unitTypeName;
        const headerText =
            propertyName && unitTypeName
                ? `${propertyName} (${unitTypeName})`
                : propertyName || unitTypeName;

        return {
            headerText,
        };
    };

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text="Apply Financing"
                                />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={24}
                >
                    <ScrollView style={Style.scrollContainer} showsVerticalScrollIndicator={false}>
                        {/* Header */}
                        <Typo
                            lineHeight={18}
                            text="Please make sure your details are accurate before continuing."
                            textAlign="left"
                            style={Style.horizontalMargin}
                        />

                        {/* Summary section */}
                        <SummaryContainer
                            headerText="Eligibility details"
                            data={data}
                            sectionEdit
                            editPress={onEdit}
                            style={Style.summaryContCls}
                        />

                        {/* Bottom  button container */}
                        <View
                            style={[
                                Style.horizontalMargin,
                                Style.bottomBtnContCls(safeAreaInsets.bottom),
                            ]}
                        >
                            <ActionButton
                                fullWidth
                                componentCenter={
                                    <Typo lineHeight={18} fontWeight="600" text="Confirm" />
                                }
                                onPress={onContinue}
                            />
                        </View>
                    </ScrollView>
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

            {/* Edit confirmation popup */}
            <Popup
                visible={showEditPopup}
                title={EDIT_POPUP_TITLE}
                description={EDIT_POPUP_DESC}
                onClose={closeEditPopup}
                primaryAction={{
                    text: EDIT,
                    onPress: onEditPopupEdit,
                }}
                secondaryAction={{
                    text: CANCEL,
                    onPress: closeEditPopup,
                }}
            />
        </>
    );
}

LAEligibilityConfirm.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const Style = StyleSheet.create({
    bottomBtnContCls: (paddingBottom) => ({
        marginVertical: 30,
        paddingBottom,
    }),

    editCTA: {
        marginVertical: 25,
    },

    headerTwo: {
        marginTop: 20,
    },

    horizontalMargin: {
        marginHorizontal: 24,
    },

    scrollContainer: {
        flex: 1,
    },

    summaryContCls: {
        marginBottom: 0,
    },
});

export default LAEligibilityConfirm;
