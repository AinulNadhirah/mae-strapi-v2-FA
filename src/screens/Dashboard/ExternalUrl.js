import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import Browser from "@components/Specials/Browser";

const ExternalUrl = ({ navigation, route }) => {
    const title = route?.params?.title;
    const url = route?.params?.url;

    function handleClose() {
        navigation.goBack();
    }

    return (
        <View style={styles.container}>
            <Browser source={{ uri: url }} title={title} onCloseButtonPressed={handleClose} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

ExternalUrl.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const Memoiz = React.memo(ExternalUrl);

export default Memoiz;
