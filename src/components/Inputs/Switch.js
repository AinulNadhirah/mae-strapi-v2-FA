import React, { useEffect, useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import SwitchToggle from "react-native-switch-toggle";
import PropTypes from "prop-types";

const Switch = ({ onTogglePressed, value, ...props }) => {
    const [toggleValue, setToggleValue] = useState(false);

    const onToggle = useCallback(() => onTogglePressed(toggleValue), [
        onTogglePressed,
        toggleValue,
    ]);

    useEffect(() => {
        setToggleValue(value);
    }, [value]);

    return (
        <SwitchToggle
            switchOn={toggleValue.active}
            onPress={onToggle}
            backgroundColorOff="#cccccc"
            backgroundColorOn="#4cd863"
            circleColorOn="#ffffff"
            circleColorOff="#ffffff"
            containerStyle={styles.container}
            circleStyle={styles.circle}
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    circle: {
        borderRadius: 10,
        height: 19,
        width: 19,
    },
    container: {
        borderRadius: 11,
        height: 22,
        padding: 1,
        width: 39,
    },
});

Switch.propTypes = {
    onTogglePressed: PropTypes.func.isRequired,
    value: PropTypes.object.isRequired,
};

export default React.memo(Switch);
