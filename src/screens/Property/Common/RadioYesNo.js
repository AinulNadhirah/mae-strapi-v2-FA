import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import Typo from "@components/Text";

import { BLACK } from "@constants/colors";

function RadioYesNo({ label, onChange, defaultValue }) {
    const [value, setValue] = useState(null);

    useEffect(() => {
        setDefaultValue();
    }, [defaultValue]);

    useEffect(() => {
        if (onChange) onChange(value);
    }, [value]);

    function setDefaultValue() {
        if (defaultValue && (defaultValue === "Y" || defaultValue === "N")) setValue(defaultValue);
    }

    function onYes() {
        setValue("Y");
    }

    function onNo() {
        setValue("N");
    }

    return (
        <>
            {label && <Typo lineHeight={20} text={label} textAlign="left" />}
            <View style={Style.radioSelectView}>
                <TouchableOpacity style={Style.radioBtnView} activeOpacity={1} onPress={onYes}>
                    {value === "Y" ? (
                        <RadioChecked
                            label="Yes"
                            paramLabelCls={Style.radioLabelCls}
                            checkType="color"
                        />
                    ) : (
                        <RadioUnchecked label="Yes" paramLabelCls={Style.radioLabelCls} />
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={Style.radioBtnView} activeOpacity={1} onPress={onNo}>
                    {value === "N" ? (
                        <RadioChecked
                            label="No"
                            paramLabelCls={Style.radioLabelCls}
                            checkType="color"
                        />
                    ) : (
                        <RadioUnchecked label="No" paramLabelCls={Style.radioLabelCls} />
                    )}
                </TouchableOpacity>
            </View>
        </>
    );
}

RadioYesNo.propTypes = {
    label: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    defaultValue: PropTypes.string,
};

RadioYesNo.defaultProps = {
    label: null,
    onChange: () => {},
    defaultValue: null,
};

const Style = StyleSheet.create({
    radioBtnView: {
        flex: 1,
        paddingVertical: 15,
    },

    radioLabelCls: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: 18,
        paddingLeft: 10,
    },

    radioSelectView: {
        flexDirection: "row",
        flexWrap: "nowrap",
        marginBottom: 15,
    },
});

const Memoiz = React.memo(RadioYesNo);
export default Memoiz;
