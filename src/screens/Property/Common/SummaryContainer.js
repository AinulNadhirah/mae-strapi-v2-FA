import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import Typo from "@components/Text";

import { ROYAL_BLUE, WHITE } from "@constants/colors";

function SummaryContainer({ headerText, sectionEdit, editText, editPress, data, style }) {
    return (
        <View style={[Style.container, style]}>
            {/* Header */}
            <View style={Style.headerContainer}>
                <Typo fontWeight="600" lineHeight={24} text={headerText} textAlign="left" />

                {sectionEdit && (
                    <Typo
                        fontWeight="600"
                        text={editText}
                        textAlign="right"
                        color={ROYAL_BLUE}
                        onPress={editPress}
                    />
                )}
            </View>

            {/* Details */}
            {data.map((item, index) => {
                return <SummaryField key={index} label={item.label} value={item.value} />;
            })}
        </View>
    );
}

function SummaryField({ label, value }) {
    if (!value) return null;

    return (
        <View style={Style.fieldContainer}>
            {/* Label */}
            <Typo
                fontSize={13}
                lineHeight={18}
                text={label}
                textAlign="left"
                style={Style.labelCls}
            />

            {/* Spacer */}
            <View style={Style.spacerCls} />

            {/* Value */}
            <Typo
                fontWeight="600"
                lineHeight={18}
                text={value}
                textAlign="right"
                style={Style.valueCls}
            />
        </View>
    );
}

SummaryContainer.propTypes = {
    headerText: PropTypes.string.isRequired,
    sectionEdit: PropTypes.bool,
    editText: PropTypes.string,
    editPress: PropTypes.func,
    data: PropTypes.array,
};

SummaryContainer.defaultProps = {
    sectionEdit: false,
    editText: "Edit",
    editPress: () => {},
    data: [],
    style: {},
};

const Style = StyleSheet.create({
    container: {
        backgroundColor: WHITE,
        marginVertical: 25,
        paddingBottom: 20,
        paddingHorizontal: 24,
        paddingTop: 24,
    },

    fieldContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },

    headerContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },

    labelCls: {
        flexShrink: 0.6,
        maxWidth: "70%",
        opacity: 0.5,
    },

    spacerCls: {
        width: 20,
    },

    valueCls: {
        flexShrink: 0.6,
        maxWidth: "70%",
    },
});

const Memoiz = React.memo(SummaryContainer);
export default Memoiz;
