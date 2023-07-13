import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { Alert } from "react-native";

import {
    BANKINGV2_MODULE,
    COMMON_MODULE,
    FINANCIAL_GOAL_OVERVIEW,
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
    FA_ACTION_NAME,
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_SHARE_RECEIPT,
    FA_FIN_GOAL_TOPUP_SUCCESS,
    FA_VIEW_SCREEN,
    SHARE_RECEIPT,
    TO_ACCOUNT,
} from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

const TopupComplete = ({ navigation, route }) => {
    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_TOPUP_SUCCESS,
        });

        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_TOPUP_SUCCESS,
            ["transaction_id"]: route?.params?.referenceId,
        });
    }, [route?.params?.referenceId]);

    function onDoneTap() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_GOAL_OVERVIEW,
        });
    }

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
            [FA_SCREEN_NAME]: FA_FIN_GOAL_TOPUP_SUCCESS,
            [FA_ACTION_NAME]: FA_SHARE_RECEIPT,
        });

        try {
            // const fileName = "FinancialGoalReceipt";
            const statusType = "success";
            const statusText = "Successful";
            const receiptTitle = route?.params?.receiptTitle ?? "Top up Goal";
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
                    value: `RM ${numberWithCommas(route?.params?.amount?.toFixed(2))}`,
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
            showErrorToast({ message: error?.message });
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

TopupComplete.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default TopupComplete;
