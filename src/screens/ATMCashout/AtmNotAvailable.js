import PropTypes from "prop-types";
import React from "react";
import { StyleSheet } from "react-native";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import EmptyState from "@components/DefaultState/EmptyState";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";

import { withModelContext } from "@context";

const AtmNotAvailable = ({ navigation, route, getModel }) => {
    console.info("AtmNotAvailable ", route?.params);
    const { statusMsg, statusHeader } = getModel("atm");

    function goBack() {
        navigation.navigate("Tab", {
            screen: "Dashboard",
            params: {
                refresh: false,
            },
        });
    }

    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                header={
                    <HeaderLayout headerRightElement={<HeaderCloseButton onPress={goBack} />} />
                }
                useSafeArea
                neverForceInset={["bottom"]}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <EmptyState
                    title={
                        statusHeader ? statusHeader : route?.params?.statusHeader ?? "ATM Cash-out"
                    }
                    subTitle={route?.params?.statusMsg ?? statusMsg}
                    titleContainerStyle={styles.container}
                />
            </ScreenLayout>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({ container: { paddingTop: "35%" } });
//     title: PropTypes.string,
//     subTitle: PropTypes.string,
//     buttonLabel: PropTypes.string,
//     onActionBtnClick: PropTypes.func,

AtmNotAvailable.propTypes = {
    route: PropTypes.any,
    navigation: PropTypes.any,
    getModel: PropTypes.any,
};

export default withModelContext(AtmNotAvailable);
