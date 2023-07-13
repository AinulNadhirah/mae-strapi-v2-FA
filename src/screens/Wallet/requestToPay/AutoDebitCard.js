import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";

import { StatusTextView } from "@components/Common";
import Typography from "@components/Text";

import { BLUE, BLACK, GRAY, STATUS_GREEN } from "@constants/colors";
import {
    FREQUENCY,
    LIMIT_PER_TRANSACTION,
    PRODUCT_NAME,
    RECIPIENTS_REFERENCE,
    CURRENCY,
    DUITNOW_AUTODEBIT_ID,
    DUITNOW_AUTODEBIT_SENDER_LABEL,
    PRODUCT_NAME_CAP_FIRST_LETTER,
    APPROVED_STATUS,
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
    item,
}) => {
    const formattedAmount = transferParams?.consentMaxLimit ?? 0;
    const isSendAgainCoupled =
        item?.requestType === "OUTGOING" &&
        item?.coupleIndicator &&
        (item?.originalStatus === "REJECTED" || item?.originalStatus === "EXPIRED");
    const productName = transferParams?.productInfo?.productName ?? item?.productInfo?.productName;

    return (
        <>
            {autoDebitEnabled && (
                <View style={Styles.autoDebitCard}>
                    <View style={Styles.rowChild}>
                        <View style={Styles.wid70}>
                            <View style={Styles.statusPillMargin}>
                                {transferParams?.statusPill && (
                                    <StatusTextView
                                        status={transferParams?.statusPill}
                                        style={
                                            transferParams?.statusPill === APPROVED_STATUS
                                                ? styles.statusTextStyle
                                                : null
                                        }
                                    />
                                )}
                            </View>

                            <Typography
                                fontSize={12}
                                fontWeight="400"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={19}
                                textAlign="left"
                                color={BLACK}
                                text={
                                    transferParams?.hideProduct
                                        ? "Start and end date"
                                        : showProductInfo
                                        ? transferParams?.isProductNameWithCap
                                            ? PRODUCT_NAME_CAP_FIRST_LETTER
                                            : PRODUCT_NAME
                                        : RECIPIENTS_REFERENCE
                                }
                            />
                            {transferParams?.hideProduct ? null : (
                                <Typography
                                    fontSize={14}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={19}
                                    textAlign="left"
                                    color={BLACK}
                                    text={showProductInfo ? productName : transferParams?.reference}
                                />
                            )}

                            <View style={Styles.mt5}>
                                <Typography
                                    fontSize={transferParams?.hideProduct ? 14 : 12}
                                    fontWeight={transferParams?.hideProduct ? "700" : "600"}
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={19}
                                    textAlign="left"
                                    color={transferParams?.hideProduct ? BLACK : GRAY}
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
                                {!showProductInfo && !transferParams?.hideProduct ? (
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
                                {!showProductInfo && !transferParams?.hideProduct ? (
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
                                text={`${CURRENCY} ${numeral(Math.abs(formattedAmount)).format(
                                    "0,0.00"
                                )}`}
                            />
                        </View>
                    </View>

                    {isSendAgainCoupled ||
                    (transferParams?.consentId &&
                        transferFlow !== 25 &&
                        !transferParams?.isConsentOnlineBanking) ? (
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
                                    text={DUITNOW_AUTODEBIT_ID}
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
                                        isSendAgainCoupled
                                            ? item?.originalData?.bizMessageID
                                            : transferParams?.consentId ??
                                              transferParams?.originalData?.bizMessageID
                                    }
                                />
                            </View>
                        </View>
                    ) : null}
                    {transferParams?.transferFlow === 27 || transferParams?.isDuitnowRequest ? (
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
                                    text="Cancellation"
                                />
                                <Typography
                                    fontSize={14}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={19}
                                    textAlign="left"
                                    color={BLACK}
                                    text={transferParams?.allowCancel ? "Allowed" : "Not Allowed"}
                                />
                            </View>
                        </View>
                    ) : null}

                    {transferParams?.autoDebitSender?.name ||
                    transferParams?.autoDebitSender?.accountName ? (
                        <View style={Styles.mt10}>
                            <Typography
                                fontSize={12}
                                fontWeight="400"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={19}
                                textAlign="left"
                                color={BLACK}
                                text={DUITNOW_AUTODEBIT_SENDER_LABEL}
                            />
                            <View>
                                <Typography
                                    fontSize={14}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={19}
                                    textAlign="left"
                                    color={BLACK}
                                    text={
                                        transferParams?.autoDebitSender?.name ??
                                        transferParams?.autoDebitSender?.accountName
                                    }
                                />
                                <Typography
                                    fontSize={12}
                                    fontWeight="400"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={19}
                                    textAlign="left"
                                    color={BLACK}
                                    text={
                                        transferParams?.autoDebitSender?.number ??
                                        transferParams?.autoDebitSender?.accountNumber
                                    }
                                />
                            </View>
                        </View>
                    ) : null}
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
    item: PropTypes.object,
};

export default AutoDebitCard;

const styles = StyleSheet.create({
    statusTextStyle: {
        backgroundColor: STATUS_GREEN,
    },
});
