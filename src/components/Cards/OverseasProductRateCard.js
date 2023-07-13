import numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { BLACK, DISABLED, DUSTY_GRAY, MEDIUM_GREY, RED, WHITE, YELLOW } from "@constants/colors";

import { getExchangeRate } from "@utils/dataModel/utilityRemittance";

import assets from "@assets";

const OverseasCardWithInput = ({
    isSelected,
    index,
    cardVdNo,
    onChangeText,
    vdInquiry,
    onSelect,
    onPressInfo,
    disableInput,
}) => {
    function selectCard() {
        onSelect(index);
    }
    function unSelect() {
        onSelect(-1);
    }
    return (
        <View
            style={[
                Styles.cardContainer,
                isSelected ? Styles.cardStylesSelected : Styles.cardStyles,
            ]}
        >
            <View style={Styles.cardHeaderContainer} onTouchEnd={selectCard}>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    text="Visa Direct"
                    color={BLACK}
                    textAlign="left"
                />
                <TouchableOpacity style={Styles.selectionDotButton} onPress={unSelect}>
                    <View style={[isSelected && Styles.selected, Styles.selectionIndicator]} />
                </TouchableOpacity>
            </View>
            <View style={Styles.vdCardContainer}>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    text="Enter your recipient's Visa card number to view transfer details"
                    color={BLACK}
                    textAlign="left"
                />

                <View style={Styles.vdCardNoContainer}>
                    <View style={Styles.vdCardNoSubContainer}>
                        <Typo
                            fontSize={14}
                            fontWeight="normal"
                            lineHeight={18}
                            text="Recipient Card Number"
                            textAlign="left"
                        />
                        <TouchableOpacity
                            style={Styles.infoIcon}
                            onPress={() => {
                                onPressInfo({
                                    type: "recipientCardNo",
                                    productType: "VD",
                                });
                            }}
                        >
                            <Image style={Styles.infoIconMicro} source={assets.icInformation} />
                        </TouchableOpacity>
                    </View>
                    <SpaceFiller height={4} />
                    <TextInput
                        autoCorrect={false}
                        onChangeText={(text) => {
                            onChangeText(text?.length > 16 ? text?.substring(0, 16) : text);
                        }}
                        editable={!disableInput}
                        onFocus={unSelect}
                        minLength={16}
                        maxLength={16}
                        placeholder="e.g. 2233445566"
                        keyboardType="number-pad"
                        enablesReturnKeyAutomatically
                        returnKeyType="next"
                        value={cardVdNo}
                    />
                    <SpaceFiller height={10} />
                    <View style={Styles.VDButtonContainer}>
                        <ActionButton
                            width={120}
                            borderRadius={25}
                            onPress={vdInquiry}
                            disabled={disableInput || cardVdNo?.length < 16}
                            backgroundColor={cardVdNo?.length < 16 ? DISABLED : YELLOW}
                            componentCenter={
                                <Typo
                                    color={BLACK}
                                    text="Enter"
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

OverseasCardWithInput.propTypes = {
    isSelected: PropTypes.bool,
    index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cardVdNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChangeText: PropTypes.func,
    vdInquiry: PropTypes.func,
    onSelect: PropTypes.func,
    onPressInfo: PropTypes.func,
    disableInput: PropTypes.bool,
};
const OverseasProductRateCard = ({
    onSelect,
    isSelected,
    index,
    isVD,
    data,
    onPressInfo,
    onChangeText,
    cardVdNo,
    vdInquiry,
    isError,
    disableInput,
}) => {
    if (isVD) {
        return (
            <View style={Styles.vdInput}>
                <OverseasCardWithInput
                    isSelected={isSelected}
                    index={index}
                    cardVdNo={cardVdNo}
                    onChangeText={onChangeText}
                    vdInquiry={vdInquiry}
                    onSelect={() => {
                        onSelect(-1);
                    }}
                    isVD
                    onPressInfo={onPressInfo}
                    disableInput={disableInput}
                />
            </View>
        );
    }
    function getName2(name) {
        switch (name) {
            case "MOT":
            case "RT":
                return "Maybank Overseas";
            case "FTT":
                return "Foreign Telegraphic";
            case "VD":
                return "Visa Direct";
            case "WU":
                return "Western Union";
            default:
                return "Bakong";
        }
    }
    const agentFeePopup = {
        type: "agent_bank_fee",
        productType: data?.productType,
        trxName: getName2(data?.productType),
    };
    const durationPopup = {
        type: "duration",
        productType: data?.productType,
        trxName: getName2(data?.productType),
    };
    const dailyLimitPopup = {
        type: "dailyLimit",
        productType: data?.productType,
        trxName: getName2(data?.productType),
    };

    const receivePopupWuVd =
        data?.productType === "WU"
            ? {
                  type: "text",
                  productType: data?.productType,
                  trxName: getName2(data?.productType),
                  amount: data?.serviceFee,
              }
            : null;

    function selectCard() {
        onSelect(index);
    }
    const prodName = getName2(data?.productType);
    const rate = getExchangeRate(data);
    return (
        <View style={Styles.cardContainer}>
            <View
                style={
                    isSelected
                        ? isError
                            ? Styles.cardStylesSelectedError
                            : Styles.cardStylesSelected
                        : Styles.cardStyles
                }
            >
                <View style={Styles.cardHeaderContainer} onTouchEnd={selectCard}>
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        text={
                            data?.productType === "FTT" || data?.productType === "RT"
                                ? prodName + " Transfer"
                                : prodName
                        }
                        color={BLACK}
                        textAlign="left"
                    />
                    <TouchableOpacity style={Styles.selectionDotButton} onPress={selectCard}>
                        <View style={[isSelected && Styles.selected, Styles.selectionIndicator]} />
                    </TouchableOpacity>
                </View>
                <View style={Styles.centeredDetailsView}>
                    <Typo
                        fontSize={24}
                        fontWeight="600"
                        lineHeight={26}
                        text={`${
                            data?.fromCurrency === "MYR" ? "RM" : data?.fromCurrency
                        } ${numeral(data?.amountInRM).format("0,0.00")}`}
                        color={isError && isSelected ? RED : BLACK}
                        textAlign="center"
                    />
                    <Typo
                        fontSize={14}
                        fontWeight="500"
                        lineHeight={16}
                        text={`${data?.fromCurrency !== "MYR" ? "RM" : data?.toCurrency} ${numeral(
                            data?.toCurrencyAmount
                        ).format("0,0.00")}`}
                        color={isError && isSelected ? RED : BLACK}
                        textAlign="center"
                    />
                </View>
                <View style={Styles.rateAndLimitView}>
                    <View style={Styles.rateAndLimitTextContainer}>
                        <Typo
                            fontSize={10}
                            fontWeight="500"
                            lineHeight={14}
                            text="Indicative exchange rate"
                            color={BLACK}
                            textAlign="left"
                        />
                        <Typo
                            fontSize={12}
                            fontWeight="500"
                            lineHeight={16}
                            text={rate}
                            color={DUSTY_GRAY}
                            textAlign="left"
                        />
                    </View>
                    <View style={Styles.rateAndLimitTextContainer}>
                        <View style={[Styles.detailsRowText, Styles.transferLimit]}>
                            <Typo
                                fontSize={10}
                                fontWeight="500"
                                lineHeight={14}
                                text="Daily transfer limit"
                                color={BLACK}
                                textAlign="center"
                            />
                            {dailyLimitPopup && (
                                <TouchableOpacity
                                    style={Styles.infoIconSmall}
                                    onPress={() => {
                                        onPressInfo(dailyLimitPopup);
                                    }}
                                >
                                    <Image source={assets.info} style={Styles.infoIconMicro} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Typo
                            fontSize={12}
                            fontWeight="500"
                            lineHeight={16}
                            text={`RM ${numeral(data?.dailyLimit).format("0,0.00")}`}
                            color={isError && isSelected ? RED : DUSTY_GRAY}
                            textAlign="left"
                        />
                    </View>
                </View>
                <View style={Styles.detailsRowContainer}>
                    <View style={Styles.detailsRowText2}>
                        <Typo
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                            text="Service fee"
                            color={BLACK}
                            textAlign="left"
                        />
                    </View>
                    <View style={Styles.detailsRowText}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            text={`RM ${numeral(data?.serviceFee).format("0,0.00")}`}
                            color={BLACK}
                            textAlign="right"
                        />
                    </View>
                </View>
                <View style={Styles.detailsRowContainer}>
                    <View style={Styles.detailsRowText2}>
                        <Typo
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                            text={`Agent/Beneficiary\nBank fee`}
                            color={BLACK}
                            textAlign="left"
                        />
                        {agentFeePopup && (
                            <TouchableOpacity
                                style={Styles.infoIcon}
                                onPress={() => {
                                    onPressInfo(agentFeePopup);
                                }}
                            >
                                <Image source={assets.info} style={Styles.infoIconMicro} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={Styles.detailsRowText}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            text={data?.productType === "FTT" ? "Applicable" : "No fee"}
                            color={BLACK}
                            textAlign="right"
                        />
                    </View>
                </View>
                <View style={Styles.detailsRowContainer}>
                    <View style={Styles.detailsRowText2}>
                        <Typo
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                            text="Receive method"
                            color={BLACK}
                            textAlign="left"
                        />

                        {receivePopupWuVd && (
                            <TouchableOpacity
                                style={Styles.infoIcon}
                                onPress={() => {
                                    onPressInfo(receivePopupWuVd);
                                }}
                            >
                                <Image source={assets.info} style={Styles.infoIconMicro} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={Styles.detailsRowText}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            text={
                                data?.productType === "VD"
                                    ? "Credit to Overseas Issued Visa Card"
                                    : data?.receiveMethod ?? "Cash"
                            }
                            color={BLACK}
                            textAlign="right"
                        />
                    </View>
                </View>

                <View style={Styles.detailsRowContainer}>
                    <View style={Styles.detailsRowText2}>
                        <Typo
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                            text="Transfer duration"
                            color={BLACK}
                            textAlign="left"
                        />

                        <TouchableOpacity
                            style={Styles.infoIcon}
                            onPress={() => {
                                onPressInfo(durationPopup);
                            }}
                        >
                            <Image source={assets.info} style={Styles.infoIconMicro} />
                        </TouchableOpacity>
                    </View>
                    <View style={Styles.detailsRowText}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            text={data?.processingPeriod?.replace("DAYS", "Days")}
                            color={BLACK}
                            textAlign="right"
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

OverseasProductRateCard.propTypes = {
    onSelect: PropTypes.func,
    isSelected: PropTypes.bool,
    index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isVD: PropTypes.bool,
    data: PropTypes.object,
    onPressInfo: PropTypes.func,
    onChangeText: PropTypes.func,
    cardVdNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    vdInquiry: PropTypes.func,
    isError: PropTypes.bool,
    disableInput: PropTypes.bool,
};

const Styles = StyleSheet.create({
    VDButtonContainer: {
        alignItems: "center",
    },
    cardContainer: {
        paddingHorizontal: 24,
        width: "100%",
    },
    cardHeaderContainer: {
        borderBottomColor: MEDIUM_GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 15,
        width: "100%",
    },
    cardStyles: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginVertical: 12,
        paddingHorizontal: 24,
        paddingVertical: 20,
        width: "100%",
        zIndex: 100,
    },
    cardStylesSelected: {
        backgroundColor: WHITE,
        // borderColor: RED,
        borderRadius: 8,
        // borderWidth: 1,
        marginVertical: 12,
        paddingHorizontal: 24,
        paddingVertical: 20,
        width: "100%",
    },
    cardStylesSelectedError: {
        backgroundColor: WHITE,
        borderColor: RED,
        borderRadius: 8,
        borderWidth: 1,
        marginVertical: 12,
        paddingHorizontal: 16,
        paddingVertical: 20,
        width: "100%",
    },
    centeredDetailsView: {
        justifyContent: "center",
        paddingVertical: 16,
        width: "100%",
    },
    detailsRowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
        width: "100%",
    },
    detailsRowText: {
        //borderWidth: 1,
        flex: 0.4,
        // borderRadius: 10,
        // borderWidth: 1,
    },
    detailsRowText2: {
        // borderWidth: 1,
        // borderColor: BLACK,
        flex: 0.6,
        flexDirection: "row",
        zIndex: 10,
    },
    infoIcon: { height: 15, left: 5, top: 2.5, width: 30 },
    infoIconMicro: { height: 13, width: 13 },
    infoIconSmall: { height: 20, left: 5, top: 0, width: 20, zIndex: 30 },
    rateAndLimitTextContainer: {
        justifyContent: "flex-start",
    },
    rateAndLimitView: {
        borderBottomColor: MEDIUM_GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 15,
        width: "100%",
    },
    selected: { backgroundColor: YELLOW, borderRadius: 7, height: 14, width: 14 },
    selectionDotButton: {
        alignItems: "center",
        borderColor: BLACK,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        justifyContent: "center",
        width: 20,
    },
    selectionIndicator: {
        borderRadius: 7,
        height: 14,
        width: 14,
    },
    transferLimit: { flexDirection: "row" },
    vdCardContainer: { paddingTop: 10 },
    vdCardNoContainer: { flexDirection: "column" },
    vdCardNoSubContainer: { flexDirection: "row", top: 7.5 },
    vdInput: { paddingHorizontal: 24 },
});
export { OverseasProductRateCard };
