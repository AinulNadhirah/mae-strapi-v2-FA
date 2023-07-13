import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";

import RadioButtonModal from "@components/SSL/RadioButtonModal";
import SSLGroupedRadioButton from "@components/SSL/SSLGroupedRadioButton";

DeliveryOptionRadioModal.propTypes = {
    isShow: PropTypes.bool,
    options: PropTypes.array,
    selectedId: PropTypes.any,
    onDismiss: PropTypes.func,
    onApply: PropTypes.func,
};
export function DeliveryOptionRadioModal({ isShow, options = [], selectedId, onDismiss, onApply }) {
    let selectedIndex = options.findIndex((option) => option.id === selectedId);
    if (selectedIndex === -1) selectedIndex = 0;
    const [tempIndex, setTempIndex] = useState(selectedIndex);

    useEffect(() => {
        setTempIndex(selectedIndex);
    }, [isShow, selectedIndex]);

    function onItemPressed(selectedIndex) {
        setTempIndex(selectedIndex);
    }

    function actionBtnOnClick() {
        onApply(options[tempIndex]?.id);
    }

    const updatedOptions = options?.map((item, index) => {
        item.isSelected = false;
        if (index === tempIndex) {
            item.isSelected = true;
        }
        return item;
    });
    return (
        <RadioButtonModal
            isShow={isShow}
            title="Choose a delivery type"
            onDismiss={onDismiss}
            actionBtnLbl="Done"
            actionBtnOnClick={actionBtnOnClick}
        >
            {updatedOptions && (
                <View style={styles.radioContainer}>
                    <SSLGroupedRadioButton
                        items={updatedOptions}
                        flexDirection="row"
                        fontSize={14}
                        onItemPressed={onItemPressed}
                        alignItems="flex-start"
                    />
                </View>
            )}
        </RadioButtonModal>
    );
}

const styles = StyleSheet.create({
    radioContainer: { paddingBottom: 36, paddingTop: 12 },
});
