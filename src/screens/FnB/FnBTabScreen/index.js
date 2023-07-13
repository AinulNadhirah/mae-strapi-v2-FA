import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Linking,
    Platform,
    Animated,
    Dimensions,
} from "react-native";
import AndroidOpenSettings from "react-native-android-open-settings";
import * as Animatable from "react-native-animatable";
import { TabView } from "react-native-tab-view";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import { LogGesture } from "@components/NetworkLog";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";

import { BLACK, YELLOW, ROYAL_BLUE } from "@constants/colors";
import * as Strings from "@constants/strings";

import Assets from "@assets";

import DiscoverFnBScreen from "../DiscoverFnBScreen";
import MakanManaFnBScreen from "../MakanManaFnBScreen";

const initialLayout = { width: Dimensions.get("window").width };
const width = Dimensions.get("window").width;

class FnBTabScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object,
        route: PropTypes.object,
    };

    state = {
        showPopup: false,
        displayLocationPopup: false,
        merchantData: {},

        index: this.props.route?.params?.index ?? 0,
        routes: [
            { key: Strings.DISCOVER, title: Strings.DISCOVER },
            { key: Strings.MAKAN_MANA, title: Strings.MAKAN_MANA },
        ],
    };

    opacityBg = new Animated.Value(0);

    onBackTap = () => {
        this.props.navigation.goBack();
    };

    componentDidMount() {
        console.log("[FnBTabScreen] >> [loading]");
    }
    displayLocationPopup = () => {
        console.log("displayLocationPopup");
        this.setState({ displayLocationPopup: true });
    };

    showPopup = (isWheel, item) => {
        console.log("[FnBTabScreen] >> [showPopup]", item);
        if (isWheel) {
            return;
        } else if (!isWheel && item.itemName == "list") {
            return;
        }
        this.setState({ showPopup: true, merchantData: item });
    };

    handleClose = () => {
        console.log("[FnBTabScreen] >> [handleClose]");
        this.setState({ showPopup: false });
    };

    handleViewMore = () => {
        this.setState({ showPopup: false }, () => {
            const { merchantData } = this.state;
            this.props.navigation.navigate(navigationConstant.MERCHANT_DETAILS, {
                merchantDetails: merchantData,
                ...(merchantData.mkp && { mkp: merchantData.mkp }),
                ...(merchantData.maya && { maya: merchantData.maya }),
            });
        });
    };

    handleSettingsNavigation = () => {
        console.log("[FnBTabScreen] >> [handleSettingsNavigation]");
        this.setState(
            {
                displayLocationPopup: false,
            },
            () => {
                if (Platform.OS === "ios") {
                    Linking.canOpenURL("app-settings:")
                        .then((supported) => {
                            if (!supported) {
                                console.log("Can't handle settings url");
                            } else {
                                return Linking.openURL("app-settings:");
                            }
                        })
                        .catch((err) => console.error("An error occurred", err));
                    return;
                }
                AndroidOpenSettings.appDetailsSettings();
            }
        );
    };

    handleCancel = () => {
        console.log("[FnBTabScreen] >> [handleCancel]");
        this.setState({ displayLocationPopup: false });
    };

    sendEvent = (tabName) =>
        logEvent(Strings.FA_VIEW_SCREEN, {
            [Strings.FA_SCREEN_NAME]: "Food",
            [Strings.FA_TAB_NAME]: tabName,
        });

    setIndex = (index) => {
        console.log("setIndex!", index);
        this.setState({ index });

        if (index === 0) {
            this.sendEvent("Discover");
        } else {
            this.sendEvent("Makan Mana");
        }
    };

    renderTabBar = (props) => {
        const inputRange = props.navigationState.routes.map((x, i) => i);

        const { index } = this.state;
        return (
            <View style={styles.tabBarView}>
                {props.navigationState.routes.map((route, i) => {
                    if (i === 1) {
                        this.opacityBg = props.position.interpolate({
                            inputRange,
                            outputRange: inputRange.map((inputIndex) => (inputIndex === i ? 1 : 0)),
                        });
                    }

                    const height = props.position.interpolate({
                        inputRange,
                        outputRange: inputRange.map((inputIndex) => (inputIndex === i ? 1 : 0)),
                    });

                    const isFocused = index === i;
                    return (
                        <TouchableOpacity
                            style={styles.tabBarTouchable}
                            // eslint-disable-next-line react/jsx-no-bind
                            onPress={() => this.setIndex(i)}
                            key={`${i}`}
                        >
                            <Typo
                                fontSize={14}
                                lineHeight={23}
                                fontWeight={isFocused ? "600" : "300"}
                                color={BLACK}
                                textAlign="center"
                                text={route.title}
                            />
                            <Animated.View
                                useNativeDriver={false}
                                style={[
                                    styles.bottomBar,
                                    {
                                        transform: [
                                            {
                                                scaleY: height,
                                            },
                                        ],
                                    },
                                ]}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };
    renderScene = (props) => {
        const { navigation, route } = this.props;
        const routes = props.route;
        switch (routes.key) {
            case Strings.DISCOVER:
                return (
                    <DiscoverFnBScreen
                        activeIndex={this.state.index}
                        navigation={navigation}
                        route={route}
                        displayLocationPopup={this.displayLocationPopup}
                    />
                );
            case Strings.MAKAN_MANA:
                return (
                    <MakanManaFnBScreen
                        activeIndex={this.state.index}
                        navigation={navigation}
                        route={route}
                        showPopup={this.showPopup}
                        displayLocationPopup={this.displayLocationPopup}
                        isFocus={this.state.index === 1}
                    />
                );
            default:
                return null;
        }
    };

    renderSelectedMerchant = () => {
        const item = this.state.merchantData;
        const { pills } = item;
        const cuisineTypes = item?.cuisinesTypes?.reduce((accumulator, currentValue, index) => {
            if (index === 0) return (accumulator += currentValue?.cuisineType);
            else return (accumulator += `, ${currentValue?.cuisineType}`);
        }, "");

        return (
            <View>
                <View style={styles.merchantPopupContainer}>
                    <Animatable.Image
                        animation="fadeInUp"
                        duration={200}
                        source={item?.logo ? { uri: item.logo } : Assets.maeFBMerchant}
                        style={styles.merchantPopupImage}
                    />
                    {item?.pills?.promo && (
                        <View style={styles.promotionView}>
                            <Typo fontWeight="bold" fontSize={12} text="Promotion" />
                        </View>
                    )}
                </View>
                <View style={styles.merchantPopupMeta}>
                    <Animatable.View animation="fadeInUp" duration={200} delay={200}>
                        <Typo
                            text={item?.shopName}
                            fontSize={14}
                            lineHeight={18}
                            fontWeight="600"
                        />
                    </Animatable.View>
                    <View style={styles.deliveryTypeView}>
                        {!!pills?.deliveryTypePills?.length &&
                            pills.deliveryTypePills.map((obj) => {
                                return (
                                    <Animatable.View
                                        animation="fadeInUp"
                                        duration={200}
                                        delay={200}
                                        style={styles.merchantPopupDeliveryType}
                                        key={`${obj?.name}`}
                                    >
                                        <View style={styles.merchantPopupDeliveryTypeBordered}>
                                            <Typo fontSize={11} lineHeight={16} text={obj?.name} />
                                        </View>
                                    </Animatable.View>
                                );
                            })}
                    </View>
                    <Animatable.View
                        animation="fadeInUp"
                        duration={200}
                        delay={300}
                        style={styles.merchantPopupMetaSecondary}
                    >
                        {!!item?.priceRange && (
                            <Typo
                                fontWeight="600"
                                textAlign="left"
                                fontSize={12}
                                lineHeight={14}
                                text={item?.priceRange}
                            />
                        )}
                        <View style={styles.dotSeparator} />
                        <Typo
                            fontSize={12}
                            fontWeight="normal"
                            lineHeight={18}
                            text={
                                item?.distance
                                    ? item?.distance?.substring(
                                          0,
                                          item?.distance.indexOf(".") + 2
                                      ) + " km"
                                    : "- km"
                            }
                        />

                        {!!cuisineTypes && (
                            <>
                                <View style={styles.dotSeparator} />
                                <Typo
                                    fontSize={11}
                                    fontWeight="normal"
                                    lineHeight={23}
                                    styles={styles.container}
                                    numberOfLines={1}
                                    text={cuisineTypes}
                                />
                            </>
                        )}
                    </Animatable.View>
                    <View style={styles.merchantPopupAction}>
                        <Animatable.View animation="fadeInUp" duration={200} delay={400}>
                            <ActionButton
                                fullWidth
                                borderRadius={24}
                                height={48}
                                backgroundColor={YELLOW}
                                onPress={this.handleViewMore}
                                componentCenter={
                                    <Typo
                                        text="View More"
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </Animatable.View>
                        <Animatable.View animation="fadeInUp" duration={200} delay={500}>
                            <TouchableOpacity
                                onPress={this.handleClose}
                                style={styles.merchantPopupTextAction}
                            >
                                <Typo
                                    color={ROYAL_BLUE}
                                    text="Spin Again"
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            </TouchableOpacity>
                        </Animatable.View>
                    </View>
                </View>
            </View>
        );
    };

    render() {
        const { displayLocationPopup, index, routes } = this.state;
        return (
            <LogGesture modal>
                <ScreenContainer backgroundType="color">
                    <>
                        <View style={styles.bgContainer}>
                            <Animated.Image
                                source={Assets.discoverBackground}
                                style={styles.bgImage}
                            />
                            <Animated.Image
                                source={Assets.fnbFullBackground}
                                style={[styles.bgImage, { opacity: this.opacityBg }]}
                            />
                        </View>
                        <ScreenLayout
                            header={
                                <HeaderLayout
                                    headerLeftElement={
                                        <HeaderBackButton onPress={this.onBackTap} />
                                    }
                                    headerCenterElement={
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            color={BLACK}
                                            lineHeight={19}
                                            text={Strings.FOOD}
                                        />
                                    }
                                />
                            }
                            paddingTop={16}
                            paddingHorizontal={0}
                            paddingBottom={0}
                        >
                            <TabView
                                lazy
                                navigationState={{ index, routes }}
                                renderScene={this.renderScene}
                                onIndexChange={this.setIndex}
                                initialLayout={initialLayout}
                                renderTabBar={this.renderTabBar}
                            />
                        </ScreenLayout>
                        <Popup
                            visible={this.state.showPopup}
                            hideCloseButton
                            onClose={this.handleClose}
                            ContentComponent={this.renderSelectedMerchant}
                        />
                        <Popup
                            visible={displayLocationPopup}
                            onClose={this.handleCancel}
                            title={Strings.LOCATION_DISABLED_TEXT}
                            description={Strings.LOCATION_DISABLED_DESC}
                            primaryAction={{
                                text: Strings.SETTINGS,
                                onPress: this.handleSettingsNavigation,
                            }}
                            secondaryAction={{
                                text: Strings.CANCEL,
                                onPress: this.handleCancel,
                            }}
                        />
                    </>
                </ScreenContainer>
            </LogGesture>
        );
    }
}
const styles = StyleSheet.create({
    bgContainer: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    bgImage: {
        height: "100%",
        position: "absolute",
        width: "100%",
    },
    bottomBar: {
        backgroundColor: BLACK,
        height: 4,
    },
    container: { flex: 1 },
    deliveryTypeView: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        overflow: "hidden",
        width: width - 40 - 40,
    },
    dotSeparator: {
        backgroundColor: BLACK,
        borderRadius: 2,
        height: 4,
        marginHorizontal: 4,
        width: 4,
    },
    merchantPopupAction: {
        width: "100%",
    },
    merchantPopupContainer: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        height: 232,
        overflow: "hidden",
        width: "100%",
    },
    merchantPopupDeliveryType: {
        alignItems: "center",
        flexDirection: "row",
        marginLeft: 4,
        paddingVertical: 12,
    },
    merchantPopupDeliveryTypeBordered: {
        borderColor: BLACK,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 6,
    },
    merchantPopupImage: {
        height: "100%",
        width: "100%",
    },
    merchantPopupMeta: {
        alignItems: "center",
        paddingHorizontal: 40,
        paddingVertical: 24,
    },
    merchantPopupMetaSecondary: {
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    merchantPopupTextAction: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
    },
    promotionView: {
        alignItems: "center",
        backgroundColor: YELLOW,
        borderRadius: 26 / 2,
        height: 26,
        justifyContent: "center",
        left: 15,
        paddingHorizontal: 9,
        position: "absolute",
        top: 15,
    },
    tabBarTouchable: {
        flexDirection: "column",
        paddingBottom: 20,
        paddingLeft: 24,
    },
    tabBarView: { flexDirection: "row", justifyContent: "flex-start" },
});

export default withModelContext(FnBTabScreen);
