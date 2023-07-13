import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import { BottomDissolveCover } from "@components/SSL/BottomDissolveCover.js";
import Typo from "@components/Text";

import { BLACK, WHITE, YELLOW } from "@constants/colors";

import { contactBankcall } from "@utils/dataModel/utility";
import { openWhatsApp } from "@utils/dataModel/utilitySSL";

const ManualContactMerchant = ({ businessContactNo }) => {
    function onPressContact() {
        businessContactNo && businessContactNo !== "N/A" && contactBankcall(businessContactNo);
    }

    function onPressContactWa() {
        if (businessContactNo && businessContactNo !== "N/A") {
            openWhatsApp({
                phone: businessContactNo,
                text: "Saw your shop on Maybank's Sama-Sama Lokal. I would like to place an order with you.",
            });
        }
    }

    return (
        <BottomDissolveCover>
            <View style={styles.buttonView}>
                <ActionButton
                    borderRadius={25}
                    onPress={onPressContact}
                    backgroundColor={WHITE}
                    style={styles.actionButton}
                    componentCenter={
                        <Typo
                            text="Call"
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            color={BLACK}
                        />
                    }
                />

                <ActionButton
                    borderRadius={25}
                    onPress={onPressContactWa}
                    backgroundColor={YELLOW}
                    style={styles.actionButton}
                    componentCenter={
                        <Typo
                            text="WhatsApp"
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            color={BLACK}
                        />
                    }
                />
            </View>
        </BottomDissolveCover>
    );
};
ManualContactMerchant.propTypes = {
    businessContactNo: PropTypes.string,
};

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
    actionButton: {
        // paddingHorizontal: 34,
        width: width * 0.4,
    },
    buttonView: {
        alignItems: "center",
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 36,
        paddingHorizontal: 24,
    },
});

export default React.memo(ManualContactMerchant);
