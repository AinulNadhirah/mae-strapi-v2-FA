import React from "react";

import Typo from "@components/Text";

import { TimeContext } from "./Timer";

const DisplayTimer = () => {
    const [seconds, minutes] = React.useContext(TimeContext);
    return <Typo text={`${minutes} : ${seconds}`} fontWeight="600" fontSize={18} lineHeight={19} />;
};

export default DisplayTimer;
