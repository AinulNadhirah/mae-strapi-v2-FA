import { Viewport } from "@skele/components";
import PropTypes from "prop-types";
import React from "react";
import { View } from "react-native";

const ViewportAwareView = Viewport.Aware(View);

const DashboardViewPortAware = ({ children, callback, preTriggerRatio }) => {
    return (
        <ViewportAwareView onViewportEnter={callback} preTriggerRatio={preTriggerRatio}>
            {children}
        </ViewportAwareView>
    );
};

DashboardViewPortAware.propTypes = {
    callback: PropTypes.func,
    children: PropTypes.node,
    preTriggerRatio: PropTypes.number,
};

export default DashboardViewPortAware;
