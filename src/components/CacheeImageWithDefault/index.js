import { CacheeImage } from "cachee";
import PropTypes from "prop-types";
import React, { useState, useCallback } from "react";

import { useModelController } from "@context";

const CacheeImageWithDefault = ({ image, defaultImage, ...props }) => {
    const { getModel } = useModelController();
    const { campaignAssetsUrl, isTapTasticReady } = getModel("misc");
    const [isError, setIsError] = useState(false);
    const imageUrl = image ? { uri: `${campaignAssetsUrl}/${image}` } : defaultImage;
    const onError = useCallback(() => {
        setIsError(true);
    }, []);

    if (isError && !defaultImage) return null;

    if (campaignAssetsUrl) {
        return (
            <CacheeImage
                source={isError || !isTapTasticReady ? defaultImage : imageUrl}
                onError={onError}
                {...props}
                cache="web"
            />
        );
    }
    return null;
};

CacheeImageWithDefault.propTypes = {
    image: PropTypes.string,
    defaultImage: PropTypes.any,
    style: PropTypes.object,
};

CacheeImageWithDefault.defaultProps = {
    defaultImage: "",
};

const Memoiz = React.memo(CacheeImageWithDefault);

export default Memoiz;
