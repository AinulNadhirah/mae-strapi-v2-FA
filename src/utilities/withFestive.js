import React from "react";

import useFestive from "@utils/useFestive";

function withFestive(Component) {
    return function WrappedComponent(props) {
        const { festiveAssets } = useFestive();
        return <Component {...props} festiveAssets={festiveAssets} />;
    };
}

export default withFestive;
