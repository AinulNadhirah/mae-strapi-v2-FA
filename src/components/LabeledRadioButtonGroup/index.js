import React from "react";
import { StyleSheet, View } from "react-native";
import PropTypes from "prop-types";
import GroupedRadioButton from "@components/Buttons/GroupedRadioButton";
import Typography from "@components/Text";
import SpaceFiller from "@components/Placeholders/SpaceFiller";

function LabeledRadioButtonGroup({
    options,
    onOptionsChanged,
    containerStyle,
    groupedRadioButtonsProps,
    label,
}) {
    return (
        <View style={containerStyle || styles.container}>
            <Typography text={label} />
            <SpaceFiller height={16} />
            <GroupedRadioButton
                items={options}
                flexDirection="column"
                containerHeight={56}
                containerWidth="100%"
                alignItems="flex-start"
                onItemPressed={onOptionsChanged}
                {...groupedRadioButtonsProps}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },
});

LabeledRadioButtonGroup.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            isSelected: PropTypes.bool.isRequired,
        })
    ).isRequired,
    onOptionsChanged: PropTypes.func.isRequired,
    containerStyle: PropTypes.object,
    groupedRadioButtonsProps: PropTypes.object,
    label: PropTypes.string.isRequired,
};

LabeledRadioButtonGroup.defaultProps = {
    containerStyle: null,
    groupedRadioButtonsProps: {},
};

export default React.memo(LabeledRadioButtonGroup);
