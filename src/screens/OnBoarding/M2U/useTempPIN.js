import PropTypes from "prop-types";
import React, { useState } from "react";
import Config from "react-native-config";

import OtpDisplay from "@components/OtpDisplay";

const useTempPIN = () => {
    const defaultPIN = "111111";
    const isDevEnable = Config.ENV_FLAG === "UAT" || Config.ENV_FLAG === "SIT";
    const tempPIN = isDevEnable ? defaultPIN : "";
    const [tempPin, setTempPin] = useState(tempPIN);

    const TempPINDisplay = ({ onPinPress }) => {
        return tempPin ? (
            <OtpDisplay text={`Your PIN no. is ${tempPin}`} onPress={onPinPress} />
        ) : null;
    };

    TempPINDisplay.propTypes = {
        onPinPress: PropTypes.func,
    };

    const setEmptyPIN = () => isDevEnable && setTempPin("");

    return {
        tempPin,
        TempPINDisplay,
        setEmptyPIN,
    };
};

export default useTempPIN;
