import PropTypes from "prop-types";
import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";

import { ATM_CASHOUT_STACK, ATM_PREFERRED_AMOUNT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showSuccessToast } from "@components/Toast";

import { withModelContext } from "@context";

import { GASettingsScreen } from "@services/analytics/analyticsSettings";

import { MEDIUM_GREY, DARK_GREY, YELLOW } from "@constants/colors";

import Images from "@assets";

const CloseButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.closeButton}>
        <Image source={Images.icCloseBlack} style={styles.closeButtonIcon} />
    </TouchableOpacity>
);

CloseButton.propTypes = {
    onPress: PropTypes.func,
};

const styles = StyleSheet.create({
    btn: {
        alignItems: "flex-end",
        bottom: 20,
        flex: 1,
        marginHorizontal: 25,
        position: "absolute",
        width: "100%",
    },
    closeButton: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        width: 44,
    },
    closeButtonIcon: {
        height: 17,
        width: 17,
    },
    image: {
        height: 64,
        marginBottom: 24,
        marginTop: 56,
        width: 64,
    },
    layout: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: 25,
    },
    mt10: { marginTop: 10 },
    note: { marginTop: 20 },
    notesContainer: { flexDirection: "row", paddingRight: 25 },
    status: {
        flex: 4,
    },
});

class CashoutStatus extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
    };
    constructor(props) {
        super(props);
        this.state = {
            pressed: false,
        };
    }
    goBack = () => {
        console.log("[GatewayScreen] >> [goBack]");

        this.props.navigation.goBack();
    };

    handleDone = () => {
        if (this.props.route?.params?.settings) {
            showSuccessToast({
                message: "ATM Cash-out setup successfully!",
            });
            this.props.navigation.navigate("Dashboard", {
                screen: "Settings",
            });
            GASettingsScreen.onEnableATMCashout();
        } else {
            this.props.navigation.navigate(ATM_CASHOUT_STACK, {
                screen: ATM_PREFERRED_AMOUNT,
                params: {
                    ...this.props.route.params,
                },
            });
        }
    };
    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    text="ATM Cash-out"
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <View style={styles.layout}>
                        <View style={styles.status}>
                            <Image source={Images.icTickNew} style={styles.image} />
                            <Typo
                                text="ATM Cash-out set up successful"
                                fontSize={20}
                                fontWeight="400"
                                lineHeight={20}
                                textAlign="left"
                            />
                            <Typo
                                text="Note :"
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={20}
                                textAlign="left"
                                style={styles.note}
                                color={DARK_GREY}
                            />
                            <View style={styles.notesContainer}>
                                <Typo
                                    text="1.  "
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={20}
                                    textAlign="left"
                                    color={DARK_GREY}
                                    style={styles.mt10}
                                />
                                <Typo
                                    text="For security purposes, there will be 24-hour waiting period after
                            set up before you can use the ATM Cash-out feature to withdraw cash."
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={20}
                                    textAlign="left"
                                    color={DARK_GREY}
                                    style={styles.mt10}
                                />
                            </View>

                            <View style={styles.notesContainer}>
                                <Typo
                                    text="2.  "
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={20}
                                    textAlign="left"
                                    color={DARK_GREY}
                                    style={styles.mt10}
                                />
                                <Typo
                                    text="No changes have been made to daily withdrawal limit, which can be
                                managed at the ATM."
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={20}
                                    textAlign="left"
                                    color={DARK_GREY}
                                    style={styles.mt10}
                                />
                            </View>
                        </View>
                        <View style={styles.btn}>
                            <ActionButton
                                fullWidth
                                // disabled={!pressed}
                                // isLoading={loading}
                                borderRadius={25}
                                onPress={this.handleDone}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        text="Done"
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </View>
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}
export default withModelContext(CashoutStatus);
