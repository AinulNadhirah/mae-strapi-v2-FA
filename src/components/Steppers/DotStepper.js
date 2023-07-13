import React from "react";
import { View, StyleSheet } from "react-native";
import PropTypes from "prop-types";

const DotStepper = ({
    stepperItemActive,
    stepperItemInactive,
    containerStyle,
    currentStep,
    totalStep,
    steppingCheckFunction,
}) => {
    const stepperItems = [];
    for (let x = 1; x <= totalStep; x++) {
        if (steppingCheckFunction(x, currentStep)) {
            if (stepperItemActive) {
                stepperItems.push(
                    React.cloneElement(stepperItemActive, {
                        key: `stepperItem-${x}`,
                    })
                );
            } else {
                stepperItems.push(<View style={styles.item} key={`stepperItem-${x}`} />);
            }
        } else {
            if (stepperItemInactive) {
                stepperItems.push(
                    React.cloneElement(stepperItemInactive, {
                        key: `stepperItem-${x}`,
                    })
                );
            } else {
                stepperItems.push(
                    <View style={[styles.item, styles.itemInactive]} key={`stepperItem-${x}`} />
                );
            }
        }
    }
    return <View style={[styles.container, { ...containerStyle }]}>{stepperItems}</View>;
};

const ACTIVE_COLOR = "#1d1d1d";

const INACTIVE_COLOR = "#e2e2e2";

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    item: {
        backgroundColor: ACTIVE_COLOR,
        borderRadius: 3,
        height: 6,
        marginHorizontal: 2,
        width: 6,
    },
    itemInactive: {
        backgroundColor: INACTIVE_COLOR,
    },
});

DotStepper.propTypes = {
    currentStep: PropTypes.number.isRequired,
    totalStep: PropTypes.number.isRequired,
    steppingCheckFunction: PropTypes.func,
    containerStyle: PropTypes.object,
    stepperItemActive: PropTypes.element,
    stepperItemInactive: PropTypes.element,
};

DotStepper.defaultProps = {
    containerStyle: {},
    stepperItemActive: null,
    stepperItemInactive: null,
    steppingCheckFunction: (index, currentStep) => {
        return index === currentStep;
    },
};

const Memoiz = React.memo(DotStepper);

export default Memoiz;
