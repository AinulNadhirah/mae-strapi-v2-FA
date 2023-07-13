import {
    ASB_SEND_NOTIFICATION_LOADING,
    ASB_SEND_NOTIFICATION_ERROR,
    ASB_SEND_NOTIFICATION_SUCCESS,
    ASB_SEND_NOTIFICATION_CLEAR,
} from "@redux/actions/ASBServices/asbSendNotificationAction";

// Reducer Default Value
const initialState = {
    status: "idle",
    data: null,
};

// Reducer
function asbSendNotificationReducer(state = initialState, action) {
    switch (action.type) {
        case ASB_SEND_NOTIFICATION_LOADING:
            return {
                ...state,
                status: "loading",
            };

        case ASB_SEND_NOTIFICATION_ERROR:
            return {
                ...state,
                status: "error",
                error: action.error,
            };

        case ASB_SEND_NOTIFICATION_SUCCESS:
            return {
                ...state,
                status: "success",
                data: action.data,
            };

        case ASB_SEND_NOTIFICATION_CLEAR:
            return {
                ...state,
                status: "idle",
                data: null,
            };

        default:
            return state;
    }
}

export default asbSendNotificationReducer;
