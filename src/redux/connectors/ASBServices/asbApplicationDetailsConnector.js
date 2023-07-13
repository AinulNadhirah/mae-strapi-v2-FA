import PropTypes from "prop-types";
import { connect } from "react-redux";

import { asbApplicationDetails } from "@redux/services/ASBServices/asbApiApplicationDetails";

const mapStateToProps = function (state) {
    const { asbApplicationDetailsReducer } = state.asbServicesReducer;

    return {
        data: asbApplicationDetailsReducer.data,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        asbApplicationDetails: (data, callback) => {
            dispatch(asbApplicationDetails(data, callback));
        },
    };
};

const asbApplicationDetailsDispatchTypes = (mapDispatchToProps.propTypes = {
    asbApplicationDetails: PropTypes.func,
});

export const prePostQualServicePropTypes = {
    ...asbApplicationDetailsDispatchTypes,
};

const asbApplicationDetailsProps = connect(mapStateToProps, mapDispatchToProps);
export default asbApplicationDetailsProps;
