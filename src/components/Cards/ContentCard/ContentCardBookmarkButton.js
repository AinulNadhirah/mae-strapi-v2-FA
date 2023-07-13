import React from "react";
import PropTypes from "prop-types";
import GenericImageButton from "@components/Buttons/GenericImageButton";

const ContentCardBookmarkButton = ({ isBookmarked, onBookmarkButtonPressed }) => {
    if (isBookmarked) {
        return (
            <GenericImageButton
                width={21}
                height={20}
                image={require("@assets/icons/ic_bookmark_done.png")}
                onPress={onBookmarkButtonPressed}
            />
        );
    } else {
        return (
            <GenericImageButton
                width={21}
                height={20}
                image={require("@assets/icons/ic_bookmark_no.png")}
                onPress={onBookmarkButtonPressed}
            />
        );
    }
};

ContentCardBookmarkButton.propTypes = {
    isBookmarked: PropTypes.bool,
    onBookmarkButtonPressed: PropTypes.func.isRequired,
};

ContentCardBookmarkButton.defaultProps = {
    isBookmarked: false,
};

const Memoiz = React.memo(ContentCardBookmarkButton);

export default Memoiz;
