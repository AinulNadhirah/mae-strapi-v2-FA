import PropTypes from "prop-types";
import React, { useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import Modal from "react-native-modal";

import Browser from "@components/Specials/Browser";

import { ROYAL_BLUE } from "../../constants/colors";
import Typo from "../Text";

const FundFactSheetURL = ({ url, title }) => {
    const [showBrowser, setShowBrowser] = useState(showBrowser);

    function _onCloseBrowser() {
        setShowBrowser(false);
    }

    function onPress() {
        setShowBrowser(true);
    }

    return (
        <>
            <TouchableOpacity style={styles.padding10} onPress={onPress}>
                <Typo
                    text={title}
                    fontSize={12}
                    fontWeight="600"
                    lineHeight={18}
                    textAlign="left"
                    color={ROYAL_BLUE}
                />
            </TouchableOpacity>
            <Modal isVisible={showBrowser} hasBackdrop={false} useNativeDriver style={styles.modal}>
                <Browser
                    source={{ uri: url }}
                    title={title}
                    onCloseButtonPressed={_onCloseBrowser}
                />
            </Modal>
        </>
    );
};

FundFactSheetURL.propTypes = {
    url: PropTypes.string,
    title: PropTypes.string,
};

const styles = StyleSheet.create({
    modal: {
        margin: 0,
    },
    padding10: { paddingTop: 10 },
});

export default FundFactSheetURL;
