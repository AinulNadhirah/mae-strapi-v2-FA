import PropTypes from "prop-types";
import { connect } from "react-redux";

import { DOWNTIME_CLEAR } from "@redux/actions/services/downTimeAction";
import { checkDownTime } from "@redux/services/apiCheckDownTime";
import { checkDownTimePremier } from "@redux/services/Premier/apiCheckDownTime";

const mapStateToProps = function (state) {
    const { downTimeReducer } = state;

    return {
        statusDownTime: downTimeReducer.status,
        errorDownTime: downTimeReducer.error,
        dataDownTime: downTimeReducer.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        checkDownTime: (subURL, callback) => {
            dispatch(checkDownTime(subURL, callback));
        },
        checkDownTimePremier: (subURL, callback) => {
            dispatch(checkDownTimePremier(subURL, callback));
        },
        clearDownTimeReducer: () => dispatch({ type: DOWNTIME_CLEAR }),
    };
};

const downTimeStateTypes = (mapStateToProps.propTypes = {
    statusDownTime: PropTypes.string,
    errorDownTime: PropTypes.any,
    dataDownTime: PropTypes.any,
});

const downTimeDispatchTypes = (mapDispatchToProps.propTypes = {
    checkDownTime: PropTypes.func,
    clearDownTimeReducer: PropTypes.func,
});

export const downTimeServicePropTypes = {
    ...downTimeStateTypes,
    ...downTimeDispatchTypes,
};

const downTimeServiceProps = connect(mapStateToProps, mapDispatchToProps);
export default downTimeServiceProps;
