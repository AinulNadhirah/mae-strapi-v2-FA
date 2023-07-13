import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, StyleSheet, Image, FlatList, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";

import {
    VIEW_BREAKDOWN,
    ASB_CONSENT,
    ON_BOARDING_M2U_USERNAME,
    ON_BOARDING_MODULE,
} from "@navigation/navigationConstant";

import Spring from "@components/Animations/Spring";
import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { invokeL3 } from "@services";
import { logEvent } from "@services/analytics";

import { prePostQual } from "@redux/services/ASBServices/apiPrePostQual";

import { WHITE, STATUS_GREEN, GREY, YELLOW, BLACK, ROYAL_BLUE } from "@constants/colors";
import {
    BREAKDOWN,
    PLSTP_INTRO_APPLYNOW_BTN,
    TOTAL_PAYMENT,
    TOTAL_DIVIDEND,
    RECOMMENDED,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

import {
    ARTICLE_COMPARE_EARNINGS,
    FA_ACTION_NAME,
    FA_FIELD_INFORMATION,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
} from "../../constants/strings";

const InvertCard = ({
    data,
    infoLabel,
    navigate,
    isRecommended,
    tenure,
    rateOfDividend,
    rateOfInterest,
}) => {
    const [isViewInvert, setIsViewInvert] = useState(null);

    const dispatch = useDispatch();
    const { getModel } = useModelController();
    const navigationViewBreakDown = (item) => {
        navigate(VIEW_BREAKDOWN, {
            data: item,
        });
    };

    async function onApplyNow() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: ARTICLE_COMPARE_EARNINGS,
            [FA_ACTION_NAME]: "Apply Now",
            [FA_FIELD_INFORMATION]: `product: ASB Financing/-i`,
        });
        const userDetails = getModel("user");
        const { isOnboard } = userDetails;
        if (isOnboard) {
            const httpResp = await invokeL3(true);
            const result = httpResp.data;
            const { code } = result;
            if (code !== 0) return;
            const body = {
                msgBody: {
                    logonInfo: "Y",
                },
            };
            dispatch(
                prePostQual("asb/v1/asb/prequal", body, (data, mdmData) => {
                    if (data) {
                        navigate(ASB_CONSENT);
                    }
                })
            );
        } else {
            navigate(ON_BOARDING_MODULE, {
                screen: ON_BOARDING_M2U_USERNAME,
                params: {
                    screenName: "ApplyLoans",
                },
            });
        }
    }

    const textFormat = (text) => {
        if (text) {
            const str = text.replace(/_/g, " ");
            const words = str.split(" ");
            for (let i = 1; i < words.length; i++) {
                const temp = words[i].toLowerCase();
                words[i] = temp[0].toUpperCase() + temp.substr(1);
            }
            return words.join(" ");
        }
    };

    function isNegative(num) {
        return Math.sign(num) === -1;
    }

    const renderItem = ({ item, index }) => {
        return (
            <View style={styles.shadow}>
                <Spring style={styles.container} activeOpacity={0.9}>
                    <View style={styles.invertCard}>
                        <View style={styles.invertCardHead}>
                            <View
                                style={
                                    isRecommended === item?.totalProfit && styles.invertCardHeadCol
                                }
                            >
                                <Typo
                                    fontSize={16}
                                    lineHeight={20}
                                    fontWeight="600"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={textFormat(item?.type)}
                                    style={styles.invertTitle}
                                    numberOfLines={1}
                                />
                                {infoLabel()}
                            </View>
                            {isRecommended === item?.totalProfit && (
                                <View style={styles.invertCardHeadCol}>
                                    <View style={styles.recTextAlign}>
                                        <Typo
                                            fontSize={12}
                                            lineHeight={20}
                                            fontWeight="600"
                                            letterSpacing={0}
                                            text={RECOMMENDED}
                                            style={styles.recText}
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setIsViewInvert(index);
                            }}
                            activeOpacity={0.9}
                        >
                            <View style={styles.invertCardBody}>
                                <Typo
                                    fontSize={28}
                                    lineHeight={28}
                                    fontWeight="600"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={"RM " + numeral(item?.totalProfit).format("0,0.00")}
                                />
                                <Image
                                    source={
                                        isViewInvert === index
                                            ? Assets.dropUpIcon
                                            : Assets.downArrow
                                    }
                                    style={styles.dropDownArrowImage}
                                />
                            </View>
                            {isViewInvert === index ? (
                                <View style={styles.invertCardBodyViewContent}>
                                    <View style={styles.invertCardBodyView}>
                                        <View style={styles.invertCardBodyViewColOne}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={19}
                                                fontWeight="600"
                                                letterSpacing={0}
                                                textAlign="left"
                                                text={TOTAL_PAYMENT}
                                            />
                                            <Typo
                                                fontSize={12}
                                                lineHeight={16}
                                                fontWeight="400"
                                                letterSpacing={0}
                                                textAlign="left"
                                                text={
                                                    tenure +
                                                    " year tenure at " +
                                                    rateOfInterest +
                                                    "% p.a."
                                                }
                                            />
                                        </View>
                                        <View style={styles.invertCardBodyViewColTwo}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="600"
                                                letterSpacing={0}
                                                textAlign="right"
                                                text={
                                                    isNegative(item?.totalPayment)
                                                        ? "RM (" +
                                                          numeral(item?.totalPayment).format(
                                                              "0,0.00"
                                                          ) +
                                                          ")"
                                                        : "RM " +
                                                          numeral(item?.totalPayment).format(
                                                              "0,0.00"
                                                          )
                                                }
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.invertCardBodyView}>
                                        <View style={styles.invertCardBodyViewColOne}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={19}
                                                fontWeight="600"
                                                letterSpacing={0}
                                                textAlign="left"
                                                text={TOTAL_DIVIDEND}
                                            />
                                            <Typo
                                                fontSize={12}
                                                lineHeight={16}
                                                fontWeight="400"
                                                letterSpacing={0}
                                                textAlign="left"
                                                text={rateOfDividend + "% p.a."}
                                            />
                                        </View>
                                        <View style={styles.invertCardBodyViewColTwo}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="600"
                                                letterSpacing={0}
                                                textAlign="right"
                                                text={
                                                    "RM " +
                                                    numeral(item?.totalDividend).format("0,0.00")
                                                }
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.invertCardFooter}>
                                        <View style={styles.invertCardFooterColOne}>
                                            <TouchableOpacity
                                                onPress={() => navigationViewBreakDown(item)}
                                            >
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                    letterSpacing={0}
                                                    textAlign="center"
                                                    text={BREAKDOWN}
                                                    color={ROYAL_BLUE}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.invertCardFooterColTwo}>
                                            <ActionButton
                                                width={116}
                                                height={30}
                                                onPress={onApplyNow}
                                                backgroundColor={YELLOW}
                                                componentCenter={
                                                    <Typo
                                                        fontSize={12}
                                                        fontWeight="600"
                                                        lineHeight={21}
                                                        color={BLACK}
                                                        text={PLSTP_INTRO_APPLYNOW_BTN}
                                                    />
                                                }
                                            />
                                        </View>
                                    </View>
                                </View>
                            ) : null}
                        </TouchableOpacity>
                    </View>
                </Spring>
            </View>
        );
    };

    return (
        <>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
            />
        </>
    );
};

InvertCard.propTypes = {
    data: PropTypes.object,
    infoLabel: PropTypes.func,
    navigate: PropTypes.func,
    item: PropTypes.object,
    index: PropTypes.any,
    onApplyNow: PropTypes.func,
    isRecommended: PropTypes.any,
    tenure: PropTypes.any,
    rateOfDividend: PropTypes.any,
    rateOfInterest: PropTypes.any,
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        borderRadius: 10,
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 16,
        overflow: "hidden",
        width: "100%",
    },
    dropDownArrowImage: {
        height: 24,
        marginLeft: "auto",
        resizeMode: "contain",
        width: 24,
    },
    invertCard: {
        flex: 1,
        padding: 20,
    },
    invertCardBody: {
        flexDirection: "row",
        paddingTop: 15,
    },
    invertCardBodyView: {
        flex: 1,
        flexDirection: "row",
        paddingBottom: 15,
    },
    invertCardBodyViewColOne: {
        width: "60%",
    },
    invertCardBodyViewColTwo: {
        width: "40%",
    },
    invertCardBodyViewContent: {
        borderTopColor: GREY,
        borderTopWidth: 1,
        marginTop: 25,
        paddingTop: 25,
    },
    invertCardFooter: {
        flexDirection: "row",
        paddingBottom: 5,
        paddingTop: 15,
    },
    invertCardFooterColOne: {
        alignItems: "baseline",
        justifyContent: "center",
        width: "50%",
    },
    invertCardFooterColTwo: {
        alignItems: "flex-end",
        width: "50%",
    },
    invertCardHead: {
        flex: 1,
        flexDirection: "row",
    },
    invertCardHeadCol: {
        paddingBottom: 0,
        width: "50%",
    },
    invertTitle: {
        paddingBottom: 10,
    },
    recText: {
        backgroundColor: STATUS_GREEN,
        borderRadius: 10,
        color: WHITE,
        width: 120,
    },
    recTextAlign: {
        alignItems: "flex-end",
    },
    shadow: {
        ...getShadow({}),
    },
});

export default React.memo(InvertCard);
