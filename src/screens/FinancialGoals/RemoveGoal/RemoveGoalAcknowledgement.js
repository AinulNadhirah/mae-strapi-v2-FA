import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { Alert } from "react-native";

import {
    COMMON_MODULE,
    FINANCIAL_GOALS_DASHBOARD_SCREEN,
    PDF_VIEWER,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import { WHITE, YELLOW } from "@constants/colors";
import {
    DONE,
    SHARE_RECEIPT,
    TO_ACCOUNT,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_COMPLETE,
    FA_TRANSACTION_ID,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    COMMON_ERROR_MSG,
} from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

const RemoveGoalAcknowledgement = ({ navigation, route }) => {
    function onDoneTap() {
        navigation.navigate("Dashboard", {
            screen: FINANCIAL_GOALS_DASHBOARD_SCREEN,
        });
    }

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_RemoveGoal_Successful",
        });
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "FinancialGoals_RemoveGoal_Successful",
            [FA_TRANSACTION_ID]: route?.params?.referenceId,
        });
    }, []);

    function detailsData() {
        return [
            {
                title: "Reference ID",
                value: route?.params?.referenceId,
            },
            {
                title: "Date & time",
                value: route?.params?.createdDate,
            },
        ];
    }

    async function onShareReceiptTap() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "FinancialGoals_RemoveGoal_Successful",
            [FA_ACTION_NAME]: "Share Receipt",
        });

        try {
            const statusType = "success";
            const statusText = "Successful";
            const receiptTitle = "Remove Goal";
            const detailsArray = [
                {
                    label: "Reference Id",
                    value: route?.params?.referenceId,
                    showRightText: false,
                },
                {
                    label: "Date & time",
                    value: route?.params?.createdDate,
                    showRightText: false,
                },
                {
                    label: TO_ACCOUNT,
                    value: route?.params?.accountNo,
                    showRightText: false,
                },
                {
                    label: "Amount",
                    value: `RM ${numberWithCommas(route?.params?.amount)}`,
                    showRightText: false,
                },
            ];

            const file = await CustomPdfGenerator.generateReceipt(
                true,
                receiptTitle,
                true,
                "",
                detailsArray,
                true,
                statusType,
                statusText
            );

            if (file === null) {
                Alert.alert("Please allow permission");
                return;
            }

            const navParams = {
                file,
                share: true,
                type: "file",
                pdfType: "shareReceipt",
                title: "Share Receipt",
                transferParams: {},
            };

            navigation.navigate(COMMON_MODULE, {
                screen: PDF_VIEWER,
                params: navParams,
            });
        } catch (error) {
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    }
    return (
        <AcknowledgementScreenTemplate
            isSuccessful={true}
            message="Transfer successful"
            detailsData={detailsData()}
            ctaComponents={[
                <ActionButton
                    key="2"
                    fullWidth
                    onPress={onShareReceiptTap}
                    backgroundColor={WHITE}
                    componentCenter={
                        <Typo text={SHARE_RECEIPT} fontSize={14} fontWeight="600" lineHeight={18} />
                    }
                />,
                <ActionButton
                    key="1"
                    fullWidth
                    onPress={onDoneTap}
                    backgroundColor={YELLOW}
                    componentCenter={
                        <Typo text={DONE} fontSize={14} fontWeight="600" lineHeight={18} />
                    }
                />,
            ]}
        />
    );
};

RemoveGoalAcknowledgement.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default RemoveGoalAcknowledgement;
