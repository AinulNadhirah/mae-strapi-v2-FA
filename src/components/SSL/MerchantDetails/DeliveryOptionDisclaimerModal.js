import AsyncStorage from "@react-native-community/async-storage";
import React, { forwardRef, useCallback, useImperativeHandle, useState } from "react";

import BaseModalEffect from "@components/Modals/BaseModalEffect";
import Typo from "@components/Text";

import { BLACK } from "@constants/colors";
import {
    MERCHANT_DELIVERY_DISCLAIMER,
    MERCHANT_DELIVERY,
    LOWEST_DELIVERY_FEE,
    LOWEST_DELIVERY_FEE_DESC,
    GOT_IT,
} from "@constants/stringsSSL";

import { arrContainAll } from "@utils/dataModel/utilitySSL";

function DeliveryOptionDisclaimerModal(_props, ref) {
    useImperativeHandle(ref, () => ({
        showDeliveryDisclaimerLowestDelivery: showDeliveryDisclaimerLowestDelivery,
        showDeliveryDisclaimerMerchantDelivery: showDeliveryDisclaimerMerchantDelivery,
        checkIfPromptMerchantDeliveryDisclaimer: checkIfPromptMerchantDeliveryDisclaimer,
    }));

    const [isShow, setIsShow] = useState(false);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    function onDismiss() {
        setIsShow(false);
    }
    function showDeliveryDisclaimerMerchantDelivery() {
        setIsShow(true);
        setTitle(MERCHANT_DELIVERY);
        setMessage(MERCHANT_DELIVERY_DISCLAIMER);
    }
    function showDeliveryDisclaimerLowestDelivery() {
        setIsShow(true);
        setTitle(LOWEST_DELIVERY_FEE);
        setMessage(LOWEST_DELIVERY_FEE_DESC);
    }
    const checkIfPromptMerchantDeliveryDisclaimer = useCallback(async ({ merchantDetail }) => {
        /**
         * Business wants on screen load,
         * show merchant disclaimer to the user Twice, for 2 unique merchant.
         *
         * We want to educate user on merchant delivery (delivery is up to merchant's own arrangement)
         */

        if (arrContainAll(merchantDetail?.deliveryTypes, [1, 3])) {
            // Merchant has both 1 and 3, do nothing
        } else if (merchantDetail?.deliveryTypes.includes(3)) {
            // Get the shown IDs
            let shownMerchantIds =
                JSON.parse(await AsyncStorage.getItem("SSLMerchantDeliveryDisclaimer")) ?? [];
            shownMerchantIds = [...new Set(shownMerchantIds)]; // remove duplicate
            if (shownMerchantIds.length >= 2) {
                // Showed twice. User is educated
                return;
            }
            if (!shownMerchantIds.includes(merchantDetail?.merchantId)) {
                showDeliveryDisclaimerMerchantDelivery();
                shownMerchantIds.push(merchantDetail?.merchantId);
                AsyncStorage.setItem(
                    "SSLMerchantDeliveryDisclaimer",
                    JSON.stringify(shownMerchantIds)
                );
            }
        }
    }, []);

    return (
        <BaseModalEffect
            isShow={isShow}
            title={title}
            onDismiss={onDismiss}
            actionBtnLbl={GOT_IT}
            actionBtnOnClick={onDismiss}
        >
            <Typo fontSize={14} color={BLACK} textAlign="left" lineHeight={22} text={message} />
        </BaseModalEffect>
    );
}
export default forwardRef(DeliveryOptionDisclaimerModal);
