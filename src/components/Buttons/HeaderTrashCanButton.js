import React from "react";
import GenericImageButton from "@components/Buttons/GenericImageButton";
import Assets from "@assets";

const HeaderShareButton = (props) => (
    <GenericImageButton
        width={24}
        height={24}
        image={Assets.icTrashCanBlack}
        hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
        {...props}
    />
);

export default React.memo(HeaderShareButton);
