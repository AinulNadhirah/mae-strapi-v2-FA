import { combineReducers } from "redux";

import asbApplicationDetailsReducer from "@redux/reducers/ASBServices/asbApplicationDetailsReducer";
import asbBecomeAGuarantorReducer from "@redux/reducers/ASBServices/asbBecomeAGuarantorReducer";
import asbDeclineBecomeAGuarantorReducer from "@redux/reducers/ASBServices/asbDeclineBecomeAGuarantorReducer";
import asbGuarantorPrePostQualReducer from "@redux/reducers/ASBServices/asbGuarantorPrePostQualReducer";
import asbSendNotificationReducer from "@redux/reducers/ASBServices/asbSendNotificationReducer";
import asbUpdateCEPReducer from "@redux/reducers/ASBServices/asbUpdateCEPReducer";
import masterDataReducer from "@redux/reducers/ASBServices/masterDataReducer";
import prePostQualReducer from "@redux/reducers/ASBServices/prePostQualReducer";

const asbServicesReducer = combineReducers({
    asbGuarantorPrePostQualReducer,
    asbUpdateCEPReducer,
    asbSendNotificationReducer,
    asbApplicationDetailsReducer,
    asbBecomeAGuarantorReducer,
    asbDeclineBecomeAGuarantorReducer,
    masterDataReducer,
    prePostQualReducer,
});

export default asbServicesReducer;
