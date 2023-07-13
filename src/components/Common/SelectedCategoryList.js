import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import DynamicImage from "@components/Others/DynamicImage";
import Typo from "@components/Text";

import { formatMobileNumber } from "@utils/dataModel/utility";

const SelectedCategoryList = ({ item, textKey, subTextKey, mobileNumber, style }) => {
    return (
        <View style={[styles.amtSelectHeaderIconBlock, style]}>
            <DynamicImage item={item} type="CategoryList" />
            <View style={styles.amtSelectTextBlockCls}>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    fontStyle="normal"
                    lineHeight={18}
                    textAlign="left"
                    text={item[textKey]}
                />
                {subTextKey && (
                    <Typo
                        fontSize={12}
                        fontWeight="normal"
                        fontStyle="normal"
                        lineHeight={19}
                        textAlign="left"
                        text={formatMobileNumber(mobileNumber)}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    amtSelectHeaderIconBlock: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 20,
        minHeight: 80,
    },
    amtSelectTextBlockCls: {
        flexDirection: "column",
        flex: 1,
        justifyContent: "center",
        marginLeft: 7,
    },
});

SelectedCategoryList.propTypes = {
    item: PropTypes.array,
    imageKey: PropTypes.string,
    textKey: PropTypes.string,
    subTextKey: PropTypes.string,
    mobileNumber: PropTypes.string,
    style: PropTypes.object,
};

SelectedCategoryList.defaultProps = {
    style: {},
};

export { SelectedCategoryList };
