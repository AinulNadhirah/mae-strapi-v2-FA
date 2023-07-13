import PropTypes from "prop-types";
import React from "react";

import Popup from "@components/Popup";

import { PROCEED } from "@constants/strings";

const GoalMatrixWarningPopUp = ({
    visible,
    title,
    description,
    cancelMatrixPopUp,
    showActionButtons,
    onPressProceedMatrix,
}) => {
    return (
        <>
            <Popup
                visible={visible}
                title={title}
                description={description}
                onClose={cancelMatrixPopUp}
                primaryAction={
                    showActionButtons
                        ? {
                              text: PROCEED,
                              onPress: onPressProceedMatrix,
                          }
                        : null
                }
            />
        </>
    );
};

GoalMatrixWarningPopUp.propTypes = {
    visible: PropTypes.bool,
    title: PropTypes.string,
    description: PropTypes.string,
    cancelMatrixPopUp: PropTypes.func,
    showActionButtons: PropTypes.bool,
    onPressProceedMatrix: PropTypes.func,
};

export default GoalMatrixWarningPopUp;
