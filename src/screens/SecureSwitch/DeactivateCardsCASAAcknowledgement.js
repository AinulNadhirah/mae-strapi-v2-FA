import PropTypes from "prop-types";
import React, { useState } from "react";

import ActionButton from "@components/Buttons/ActionButton";
import CallUsNowModel from "@components/CallUsNowModel";
import AcknowledgementScreenTemplate from "@components/ScreenTemplates/AcknowledgementScreenTemplate";
import Typo from "@components/Text";

import { DARK_YELLOW, WHITE, VERY_LIGHT_GREY } from "@constants/colors";
import {
    CALL_US_NOW,
    DONE,
    REFERENCE_ID,
    DATE_AND_TIME,
    CASA,
    CARDS,
    REASON_TO_BLOCK,
    SUSPEND_ACCOUNTS,
    TRANSACTION_TYPE,
    ACC_SUCCESSFULLY_SUSPENDED,
    ACC_SUCCESSFULLY_SUSPENDED_DESC,
    SUSPEND_ACC_UNSUCCESSFUL,
    REQ_CANT_BE_PROCESSED,
    CARD_SUCCESSFULLY_BLOCKED,
    REPORT_TO_US,
    BLOCK_CARD_UNSUCCESSFUL,
    DEBIT_CARD,
    CARD,
} from "@constants/strings";

import { maskAccount } from "@utils/dataModel/utility";
import { DEBIT_CARD_DETAIL } from "@navigation/navigationConstant";

const DeactivateCardsCASAAcknowledgement = ({ route, navigation }) => {
    const {
        fromModule,
        fromScreen,
        serverDate,
        formattedReferenceNumber,
        statusDesc,
        ackStatusSuccess,
        itemToDeactivate,
        reasonForBlocking,
        accDetails,
    } = route.params;
    let message, errorMessage;

    const [isShowCallUsNowModel, setIsShowCallUsNowModel] = useState(false);

    function onCloseHandler() {
        if (fromModule && fromScreen) {
            if (fromScreen === DEBIT_CARD_DETAIL) {
                navigation.navigate(fromModule, { screen: fromScreen, params: { isAccountSuspended: ackStatusSuccess } });
            } else {
                navigation.navigate(fromModule, { screen: fromScreen });
            }
        }
    }

    const detailsData = [
        {
            title: REFERENCE_ID,
            value: formattedReferenceNumber,
        },
        {
            title: DATE_AND_TIME,
            value: serverDate,
        },
    ];

    switch (itemToDeactivate) {
        case CASA:
            if (ackStatusSuccess) {
                message = ACC_SUCCESSFULLY_SUSPENDED;
                errorMessage = ACC_SUCCESSFULLY_SUSPENDED_DESC;
            } else {
                message = SUSPEND_ACC_UNSUCCESSFUL;
                errorMessage = statusDesc || REQ_CANT_BE_PROCESSED;
                detailsData.push({
                    title: TRANSACTION_TYPE,
                    value: SUSPEND_ACCOUNTS,
                });
            }
            break;
        case CARDS:
            if (ackStatusSuccess) {
                message = CARD_SUCCESSFULLY_BLOCKED;
                errorMessage = REPORT_TO_US;
            } else {
                message = BLOCK_CARD_UNSUCCESSFUL;
                errorMessage = statusDesc || REQ_CANT_BE_PROCESSED;
            }
            detailsData.push({
                title: REASON_TO_BLOCK,
                value: reasonForBlocking,
            });
            break;
        case DEBIT_CARD: {
            const [{ name, number }] = accDetails;
            if (ackStatusSuccess) {
                message = CARD_SUCCESSFULLY_BLOCKED;
                errorMessage = REPORT_TO_US;
            } else {
                message = BLOCK_CARD_UNSUCCESSFUL;
                errorMessage = statusDesc || REQ_CANT_BE_PROCESSED;
            }
            detailsData.push({
                title: CARD,
                value: `${name}\n${maskAccount(number, 12)}`,
            });
            break;
        }
        default:
            break;
    }

    function onClickCallUsNow() {
        setIsShowCallUsNowModel(true);
    }

    function onCloseCallUsNow() {
        setIsShowCallUsNowModel(false);
    }

    function getCtaComponents() {
        const components = [
            <ActionButton
                key="2"
                fullWidth
                onPress={onCloseHandler}
                backgroundColor={DARK_YELLOW}
                componentCenter={
                    <Typo text={DONE} fontSize={14} fontWeight="600" lineHeight={21} />
                }
            />,
        ];
        if (ackStatusSuccess) {
            components.unshift(
                <ActionButton
                    key="1"
                    fullWidth
                    borderColor={VERY_LIGHT_GREY}
                    borderWidth={1}
                    borderStyle="solid"
                    backgroundColor={WHITE}
                    componentCenter={
                        <Typo text={CALL_US_NOW} fontSize={14} fontWeight="600" lineHeight={18} />
                    }
                    onPress={onClickCallUsNow}
                />
            );
        }

        return components;
    }

    return (
        <>
            <AcknowledgementScreenTemplate
                isSuccessful={ackStatusSuccess}
                message={message}
                detailsData={detailsData}
                isSubMessage={true}
                errorMessage={errorMessage}
                showLoader={false}
                ctaComponents={getCtaComponents()}
            />
            <CallUsNowModel visible={isShowCallUsNowModel} onClose={onCloseCallUsNow} />
        </>
    );
};

DeactivateCardsCASAAcknowledgement.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default DeactivateCardsCASAAcknowledgement;
