import PropTypes from "prop-types";
import React from "react";

import WidgetRow from "@screens/Dashboard/QuickActions/WidgetRow";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

const Header = ({ list }) => {
    return (
        <>
            <Typo
                textAlign="left"
                text="Simply hold and drag to rearrange the actions."
                fontSize={20}
                lineHeight={28}
            />
            <SpaceFiller height={6} />
            <Typo
                textAlign="left"
                text="Your current favourite actions"
                fontSize={12}
                lineHeight={28}
            />
            <SpaceFiller height={6} />
            {list.map((widget, index) => (
                <WidgetRow key={widget.id} index={index} {...widget} />
            ))}
        </>
    );
};

Header.propTypes = {
    list: PropTypes.any,
};

export default React.memo(Header);
