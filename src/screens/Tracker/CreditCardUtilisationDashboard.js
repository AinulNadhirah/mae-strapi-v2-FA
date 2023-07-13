import React, { Component } from "react";
import { Text, ImageBackground, View, Dimensions, StyleSheet } from "react-native";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import moment from "moment";

import Modal from "react-native-modal";
import Browser from "@components/Specials/Browser";
import { BLACK, YELLOW, WHITE, OFF_WHITE } from "@constants/colors";
import TabView from "@components/Specials/TabView";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import CreditCardUtilisationL1Screen from "../Tracker/CreditCardUtilisationL1Screen";
import ActionButton from "@components/Buttons/ActionButton";

const { width } = Dimensions.get("window");

class CreditCardUtilisationDashboard extends Component {
    static navigationOptions = () => ({
        title: "",
        header: null,
    });

    state = {
        showEmpty: false,
        showBrowser: false,
        browserUrl: "",
        browserTitle: "",
    };

    componentWillMount() {}

    _onBackPress = () => {
        // console.log("_onBackPress");
        this.props.navigation.goBack();
    };

    _onApplyNowPress = () => {
        this.setState({
            browserTitle: "Maybank - Credit Card Application",
            browserUrl:
                "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/cards_landing.page",
            showBrowser: true,
        });
    };

    _onCloseBrowser = () => this.setState({ showBrowser: false, browserTitle: "", browserUrl: "" });

    renderNoTransactions() {
        return (
            <View style={{ alignItems: "center", flex: 1 }}>
                <View style={{ marginTop: 130, marginBottom: 8 }}>
                    <Typo lineHeight={32} fontSize={18} fontWeight={"bold"}>
                        <Text>No Cards Yet</Text>
                    </Typo>
                </View>
                <View style={{ width: 280 }}>
                    <Typo lineHeight={18} fontSize={12}>
                        <Text>
                            View all credit card information here once you sign up for a card with
                            Maybank.
                        </Text>
                    </Typo>
                </View>
                <View
                    style={{
                        marginTop: 30,
                        marginBottom: 30,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ActionButton
                        height={48}
                        width={186}
                        backgroundColor={YELLOW}
                        borderRadius={16}
                        componentCenter={
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                fontStyle="normal"
                                lineHeight={18}
                                color={BLACK}
                            >
                                <Text>Apply Now</Text>
                            </Typo>
                        }
                        onPress={this._onApplyNowPress}
                    />
                </View>
                <ImageBackground
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        width: width,
                        height: 280,
                    }}
                    source={require("@assets/icons/Tracker/illustration.png")}
                    imageStyle={{
                        resizeMode: "cover",
                        alignSelf: "flex-end",
                    }}
                />
            </View>
        );
    }

    render() {
        const { overlayType, showEmpty, showBrowser, browserTitle, browserUrl } = this.state;
        const { navigation } = this.props;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showOverlay={showBrowser}
                    overlayType={overlayType}
                >
                    <React.Fragment>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={0}
                            useSafeArea={true}
                            header={
                                <HeaderLayout
                                    headerLeftElement={
                                        <HeaderBackButton onPress={this._onBackPress} />
                                    }
                                    headerCenterElement={
                                        <Typo fontSize={16} fontWeight="600" lineHeight={19}>
                                            <Text>Credit Card Limit</Text>
                                        </Typo>
                                    }
                                />
                            }
                        >
                            <React.Fragment>
                                {showEmpty ? (
                                    this.renderNoTransactions()
                                ) : (
                                    <CreditCardUtilisationL1Screen navigation={navigation} />
                                )}
                            </React.Fragment>
                        </ScreenLayout>
                        <Modal
                            isVisible={showBrowser}
                            hasBackdrop={false}
                            useNativeDriver
                            style={styles.modal}
                        >
                            <Browser
                                source={{ uri: browserUrl }}
                                title={browserTitle}
                                onCloseButtonPressed={this._onCloseBrowser}
                            />
                        </Modal>
                    </React.Fragment>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}
export default CreditCardUtilisationDashboard;

const styles = StyleSheet.create({
    modal: {
        margin: 0,
    },
});
