import { truncateSync } from "graceful-fs";
import cloneDeep from "lodash/cloneDeep";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    Image,
    StyleSheet,
    Picker,
    Text,
    Keyboard,
    Alert,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Modal,
} from "react-native";
import * as Animatable from "react-native-animatable";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import {
    MEDIUM_GREY,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    WHITE,
    GREY,
    GREY_100,
    GREY_200,
    SHADOW_LIGHT,
    FADE_GREY,
} from "@constants/colors";
import * as Strings from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import * as Utility from "@utils/dataModel/utility";
import { formateAccountNumber } from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";
import commonStyle from "@styles/main";

import Images from "@assets";

("use strict");

const { width } = Dimensions.get("window");
const OVERLAY = "rgba(0, 0, 0, 0.4)";

const Card = ({ number, code, type, children, isSelected, valid, onPress }) => {
    if (!valid) {
        return null;
    }
    console.log(number, type, code);
    let accType = type == "S" || type == "D" ? "casa" : "card";
    if (code == "0Y" || code == "CC") {
        accType = "mae";
    }
    const CARD_IMAGE =
        accType == "casa"
            ? Images.casaFullBg
            : accType == "mae"
            ? Images.maeFullBg
            : Images.cardsFullBackground;

    function handlePress() {
        console.log("Press > ", number);
        if (number) onPress(number);
    }

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={handlePress} style={styles.cardButton}>
            <View style={styles.cardContainer}>
                <View style={styles.cardInner}>
                    {isSelected && (
                        <View animation="fadeIn" duration={0} style={styles.selectedOverlay}>
                            <Image
                                animation="bounceIn"
                                duration={0}
                                source={Images.whiteTick}
                                style={styles.selectedCheck}
                            />
                        </View>
                    )}
                    <Image source={CARD_IMAGE} style={styles.cardBg} />
                    <View style={styles.cardChildContainer}>{children}</View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

Card.propTypes = {
    number: PropTypes.string,
    code: PropTypes.string,
    type: PropTypes.string,
    children: PropTypes.element,
    isSelected: PropTypes.bool,
    valid: PropTypes.bool,
    onPress: PropTypes.func,
};

const Account = ({ name, number, amount, type, code, valid, ...props }) => (
    <Card name={name} number={number} type={type} code={code} valid={valid} {...props}>
        <>
            <Typo
                fontSize={14}
                fontWeight="600"
                lineHeight={18}
                text={name}
                color={WHITE}
                textAlign="left"
            />
            <Typo
                fontSize={12}
                fontWeight="normal"
                lineHeight={18}
                text={
                    type == "DC" || type == "J"
                        ? DataModel.maskDCard(number)
                        : type == "R" || type == "C"
                        ? DataModel.maskCard(number)
                        : DataModel.maskAccount(number)
                }
                color={WHITE}
                textAlign="left"
                style={styles.accountDescription}
            />
            {type !== "DC" && (
                <Typo
                    fontSize={16}
                    fontWeight="600"
                    lineHeight={18}
                    text={amount}
                    color={WHITE}
                    textAlign="left"
                />
            )}
        </>
    </Card>
);

Account.propTypes = {
    name: PropTypes.string,
    number: PropTypes.string,
    amount: PropTypes.string,
    type: PropTypes.string,
    code: PropTypes.string,
    valid: PropTypes.bool,
    onPress: PropTypes.func,
};

class QRAccountSelect extends Component {
    static propTypes = {
        accounts: PropTypes.array,
        type: PropTypes.string,
        navigation: PropTypes.object,
        onConfirm: PropTypes.func,
        onCancel: PropTypes.func,
    };

    static defaultProps = {
        accounts: [],
        type: "push",
    };

    constructor(props) {
        super(props);
        this.state = {
            accounts: cloneDeep(this.props.accounts),
            type: this.props.type,
            original: cloneDeep(this.props.accounts),
            selectedAccount: {},
            loading: false,
            filterTabs: ["ACCOUNTS", "CARDS"],
            selectedTab: "ACCOUNTS",
            accountList: [],
            cardList: [],
        };

        console.log("loaded Edit Screen");
    }

    componentDidMount() {
        this.setState({
            accounts: cloneDeep(this.props.accounts),
            original: cloneDeep(this.props.accounts),
        });
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this.setState({
                accounts: cloneDeep(this.props.accounts),
                type: this.props.type,
                original: cloneDeep(this.props.accounts),
            });
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});

        logEvent(Strings.FA_VIEW_SCREEN, {
            [Strings.FA_SCREEN_NAME]: Strings.FA_SCANPAY_SELECTACCOUNT,
        });
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    _onToggleTab = async (tabName) => {
        if (tabName != this.state.selectedTab) {
            this.setState({ selectedTab: tabName });
            switch (tabName) {
                case "ACCOUNTS":
                    break;
                case "CARDS":
                    break;
            }
        }
    };

    confirmClick = () => {
        this.props.onConfirm(this.state.accounts);
    };

    cancellick = () => {
        this.props.onCancel(this.state.original);
    };

    handleSelectAccount = (number) => {
        console.log(">>>>> ", number);
        const accounts = this.state.accounts;
        for (let j = 0; j < accounts.length; j++) {
            let accNo = accounts[j].description;
            console.log(accNo);
            accounts[j].isSelected = false;
            if (accNo == number) {
                accounts[j].isSelected = true;
            }
        }
        this.setState({ accounts });
    };

    render() {
        const { navigation } = this.props;
        const { showErrorModal, errorMessage } = this.state;
        return (
            <Modal animationType="fade" visible={true} presentationStyle="overFullScreen">
                <ScreenContainer
                    backgroundType="color"
                    showErrorModal={showErrorModal}
                    errorMessage={errorMessage}
                    showOverlay={false}
                    backgroundColor={MEDIUM_GREY}
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={Strings.QRPAY}
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={this.cancellick} />}
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{
                                flexDirection: "column",
                                paddingVertical: 18,
                            }}
                        >
                            <View>
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    color={FADE_GREY}
                                    text="Select account"
                                    style={{ marginLeft: 36, marginBottom: 24 }}
                                    textAlign="left"
                                />
                            </View>
                            {this.state.type == "push" ? (
                                <View>
                                    {this.state.accounts.map((account, index) => (
                                        <Account
                                            code={account.code}
                                            key={`${account.description}-${index}`}
                                            name={account.title}
                                            number={account.description}
                                            amount={`RM ${account.value}`}
                                            type={account.type}
                                            code={account.code}
                                            onPress={this.handleSelectAccount}
                                            isSelected={account.isSelected}
                                            valid={account.type == "S" || account.type == "D"}
                                        />
                                    ))}
                                </View>
                            ) : (
                                <View>
                                    <View
                                        style={{
                                            width: width - 30,
                                            height: 50,
                                            borderRadius: 22.5,
                                            marginBottom: 2,
                                            borderStyle: "solid",
                                            borderWidth: 0,
                                            backgroundColor: "transparent",
                                            flexDirection: "row",
                                            alignSelf: "center",
                                        }}
                                    >
                                        <TouchableOpacity
                                            onPress={() =>
                                                this._onToggleTab(this.state.filterTabs[0])
                                            }
                                            style={
                                                this.state.selectedTab == this.state.filterTabs[0]
                                                    ? {
                                                          width: width / 4,
                                                          alignItems: "center",
                                                          justifyContent: "center",
                                                          borderBottomWidth: 5,
                                                          borderBottomColor: "#000000",
                                                          marginLeft: 10,
                                                      }
                                                    : {
                                                          width: width / 4,
                                                          alignItems: "center",
                                                          justifyContent: "center",
                                                          marginLeft: 10,
                                                      }
                                            }
                                        >
                                            <Typo
                                                fontSize={14}
                                                lineHeight={15}
                                                fontWeight={
                                                    this.state.selectedTab ==
                                                    this.state.filterTabs[0]
                                                        ? "600"
                                                        : "normal"
                                                }
                                                color={
                                                    this.state.selectedTab ==
                                                    this.state.filterTabs[0]
                                                        ? "#000000"
                                                        : "#7c7c7d"
                                                }
                                                textAlign={"center"}
                                            >
                                                <Text>
                                                    {this.state.filterTabs[0].toUpperCase()}
                                                </Text>
                                            </Typo>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() =>
                                                this._onToggleTab(this.state.filterTabs[1])
                                            }
                                            style={
                                                this.state.selectedTab == this.state.filterTabs[1]
                                                    ? {
                                                          width: width / 4,
                                                          alignItems: "center",
                                                          justifyContent: "center",
                                                          borderBottomWidth: 5,
                                                          borderBottomColor: "#000000",
                                                          marginLeft: 10,
                                                      }
                                                    : {
                                                          width: width / 4,
                                                          alignItems: "center",
                                                          justifyContent: "center",
                                                          marginLeft: 10,
                                                      }
                                            }
                                        >
                                            <Typo
                                                fontSize={14}
                                                lineHeight={15}
                                                fontWeight={
                                                    this.state.selectedTab ==
                                                    this.state.filterTabs[1]
                                                        ? "600"
                                                        : "normal"
                                                }
                                                color={
                                                    this.state.selectedTab ==
                                                    this.state.filterTabs[1]
                                                        ? "#000000"
                                                        : "#7c7c7d"
                                                }
                                                textAlign={"center"}
                                            >
                                                <Text>
                                                    {this.state.filterTabs[1].toUpperCase()}
                                                </Text>
                                            </Typo>
                                        </TouchableOpacity>
                                    </View>
                                    {this.state.accounts.map((account, index) => (
                                        <Account
                                            code={account.code}
                                            key={`${account.description}-${index}`}
                                            name={account.title}
                                            number={account.description}
                                            amount={`RM ${account.value}`}
                                            type={account.type}
                                            onPress={this.handleSelectAccount}
                                            isSelected={account.isSelected}
                                            valid={
                                                this.state.selectedTab == "ACCOUNTS"
                                                    ? account.type == "S" || account.type == "D"
                                                    : account.type == "DC" ||
                                                      account.type == "J" ||
                                                      account.type == "R" ||
                                                      account.type == "C"
                                            }
                                        />
                                    ))}
                                </View>
                            )}
                        </ScrollView>
                        <FixedActionContainer>
                            <ActionButton
                                disabled={false}
                                isLoading={this.state.loading}
                                fullWidth
                                borderRadius={25}
                                onPress={this.confirmClick}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        color={BLACK}
                                        text={"Proceed"}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </ScreenLayout>
                </ScreenContainer>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    accountDescription: {
        paddingBottom: 27,
        paddingTop: 4,
    },
    accountList: {
        alignItems: "center",
        justifyContent: "center",
    },
    accountNoMaeContainer: {
        width: width < 400 ? "90%" : "75%",
    },
    cardBg: {
        borderRadius: 8,
        bottom: 0,
        height: "105%",
        left: -24,
        position: "absolute",
        right: 0,
        top: 0,
        width,
    },
    cardButton: {
        paddingBottom: 24,
        paddingHorizontal: 24,
        width,
    },
    cardChildContainer: {
        padding: 16,
    },
    cardContainer: {
        elevation: 8,
        position: "relative",
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: "100%",
    },
    cardInner: {
        borderRadius: 8,
        height: 116,
        overflow: "hidden",
        width: "100%",
    },
    cardLoader: {
        paddingHorizontal: 24,
        width: "100%",
    },
    cardLoaderAccount: {
        backgroundColor: GREY_100,
        height: 8,
        marginBottom: 24,
        width: "40%",
    },
    cardLoaderBalance: {
        backgroundColor: GREY_100,
        height: 8,
        width: "30%",
    },
    cardLoaderInner: {
        backgroundColor: GREY_200,
        borderRadius: 8,
        padding: 24,
        width: "100%",
    },
    cardLoaderTitle: {
        backgroundColor: GREY_100,
        height: 8,
        marginBottom: 8,
        width: "30%",
    },
    container: {
        flexDirection: "column",
        paddingVertical: 18,
    },
    instruction: {
        paddingHorizontal: 36,
    },
    label: {
        paddingBottom: 40,
        paddingTop: 8,
    },
    noMaeAction: {
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 15,
        borderWidth: 1,
        paddingHorizontal: width < 400 ? 10 : 16,
        paddingVertical: width < 400 ? 4 : 8,
    },
    noMaeActionContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    noMaeDescription: {
        paddingTop: 4,
    },
    selectedCheck: { height: 38, width: 38 },
    selectedOverlay: {
        alignItems: "center",
        backgroundColor: OVERLAY,
        borderRadius: 8,
        bottom: 0,
        height: "100%",
        justifyContent: "center",
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
        width: width - 48,
        zIndex: 5,
    },
});

export { QRAccountSelect };
