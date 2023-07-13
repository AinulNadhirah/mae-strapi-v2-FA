import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";

import Typography from "@components/Text";

import { BLUE, BLACK, DARK_GREY } from "@constants/colors";
import {
    FREQUENCY,
    LIMIT_PER_TRANSACTION,
    PRODUCT_NAME,
    RECIPIENTS_REFERENCE,
} from "@constants/strings";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

import Assets from "@assets";

const AutoDebitCard = ({
    autoDebitEnabled,
    showProductInfo,
    transferParams,
    transferFlow,
    handleInfoPress,
    onToggle,
    showTooltip,
}) => {
    const formattedAmount = transferParams?.consentMaxLimit ?? 0;
    return (
        <>
            {autoDebitEnabled && (
                <View style={Styles.autoDebitCard}>
                    <View style={Styles.rowChild}>
                        <View>
                            <Typography
                                fontSize={12}
                                fontWeight="400"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={19}
                                textAlign="left"
                                color={BLACK}
                                text={showProductInfo ? PRODUCT_NAME : RECIPIENTS_REFERENCE}
                            />
                            <Typography
                                fontSize={14}
                                fontWeight="600"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={19}
                                textAlign="left"
                                color={BLACK}
                                text={
                                    showProductInfo
                                        ? transferParams?.productInfo?.productName
                                        : transferParams?.reference
                                }
                            />
                            <View style={Styles.mt5}>
                                <Typography
                                    fontSize={12}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={19}
                                    textAlign="left"
                                    color={DARK_GREY}
                                    text={`${moment(transferParams?.consentStartDate).format(
                                        "DD MMM YYYY"
                                    )} to ${moment(transferParams?.consentExpiryDate).format(
                                        "DD MMM YYYY"
                                    )}`}
                                />
                            </View>
                        </View>
                        {transferFlow === 25 ? (
                            <TouchableOpacity onPress={() => onToggle(true)}>
                                <Typography
                                    fontSize={14}
                                    fontWeight="700"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={19}
                                    textAlign="left"
                                    color={BLUE}
                                    text="Edit"
                                />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    <View style={Styles.rowChild}>
                        <View>
                            <View style={Styles.cardChild}>
                                <Typography
                                    fontSize={12}
                                    fontWeight="400"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={19}
                                    textAlign="left"
                                    color={BLACK}
                                    text={FREQUENCY}
                                />
                                {showTooltip ? (
                                    <TouchableOpacity onPress={() => handleInfoPress(FREQUENCY)}>
                                        <Image
                                            style={Styles.infoIcon}
                                            source={Assets.icInformation}
                                        />
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                            <Typography
                                fontSize={14}
                                fontWeight="600"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={19}
                                textAlign="left"
                                color={BLACK}
                                text={transferParams?.consentFrequencyText}
                            />
                        </View>
                        <View>
                            <View style={Styles.cardChild}>
                                <Typography
                                    fontSize={12}
                                    fontWeight="400"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={19}
                                    textAlign="left"
                                    color={BLACK}
                                    text={LIMIT_PER_TRANSACTION}
                                />
                                {showTooltip ? (
                                    <TouchableOpacity
                                        onPress={() => handleInfoPress(LIMIT_PER_TRANSACTION)}
                                    >
                                        <Image
                                            style={Styles.infoIcon}
                                            source={Assets.icInformation}
                                        />
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                            <Typography
                                fontSize={14}
                                fontWeight="600"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={19}
                                textAlign="left"
                                color={BLACK}
                                text={`RM ${numeral(Math.abs(formattedAmount)).format("0,0.00")}`}
                            />
                        </View>
                    </View>
                </View>
            )}
        </>
    );
};

AutoDebitCard.propTypes = {
    transferParams: PropTypes.object,
    autoDebitEnabled: PropTypes.bool,
    showProductInfo: PropTypes.bool,
    transferFlow: PropTypes.number,
    handleInfoPress: PropTypes.func,
    onToggle: PropTypes.func,
    showTooltip: PropTypes.bool,
};

export default AutoDebitCard;
