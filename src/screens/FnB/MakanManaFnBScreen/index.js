import _ from "lodash";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, View, TouchableOpacity, Image, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";

import * as navigationConstant from "@navigation/navigationConstant";

import MerchantsCard from "@components/Cards/MerchantsCard";
import NoResults from "@components/FnB/NoResults";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { checkS2WSpinWheelChances, getAllFnBMerchantsCloud } from "@services";

import {
    DARK_GREY,
    BLACK,
    WHITE,
    LIGHT_GREY,
    GREY_200,
    SHADOW_LIGHT,
    YELLOW,
} from "@constants/colors";
import * as Strings from "@constants/strings";

import { generateHaptic } from "@utils";
import { getLocationDetails, promisedSetState } from "@utils/dataModel/utility";

import Assets from "@assets";

import { fnBDefaultSelectedFilterIds } from "../FilterScreen";
import SpinWheel from "../SpinWheel";

const { width } = Dimensions.get("window");

class MakanManaFnBScreen extends Component {
    static propTypes = {
        activeIndex: PropTypes.number,
        updateModel: PropTypes.func,
        getModel: PropTypes.func,
        showPopup: PropTypes.func,
        navigation: PropTypes.object,
        route: PropTypes.object,
        isFocus: PropTypes.bool,
        displayLocationPopup: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            isWheelSelected: true,
            isListSelected: false,
            isLoading: true,
            merchantsData: [],
            wheelData: [],
            isDisableSpin: true,
            isFilterActive: false,
            selectedFilterIds: fnBDefaultSelectedFilterIds,
            fnbCurrLocation: this.props.getModel("fnb")?.fnbCurrLocation ?? {},
            sandboxUrl: this.props.getModel("ssl")?.sandboxUrl ?? "",
        };
        this.promisedSetState = promisedSetState.bind(this);
    }

    componentDidUpdate(prevProps) {
        // If Discover screen location changed to different location, we need to re-init
        if (
            !_.isEqual(
                prevProps.getModel("fnb")?.fnbCurrLocation,
                this.props.getModel("fnb")?.fnbCurrLocation
            )
        ) {
            this.setState(
                {
                    fnbCurrLocation: this.props.getModel("fnb")?.fnbCurrLocation ?? {},
                },
                () => {
                    this.checkLocationPermission();
                }
            );
        }
    }

    componentDidMount() {
        this.checkLocationPermission();
        this.focusListener = this.props.navigation.addListener("focus", this.onFocus);
    }

    componentWillUnmount() {
        this.focusListener();
    }

    onFocus = () => {
        console.log("MakanManaFnBScreen onFocus");

        if (this.props.route?.params?.selectedFilterIds) {
            const { selectedFilterIds } = this.props.route.params;

            if (!_.isEqual(selectedFilterIds, this.state.selectedFilterIds)) {
                this.setState({ isLoading: true }, () => {
                    let latitude;
                    let longitude;
                    if (
                        this.state.fnbCurrLocation?.latitude &&
                        this.state.fnbCurrLocation?.longitude
                    ) {
                        (latitude = this.state.fnbCurrLocation.latitude),
                            (longitude = this.state.fnbCurrLocation.longitude);
                    } else {
                        latitude = this.props.getModel("location")?.latitude;
                        longitude = this.props.getModel("location")?.longitude;
                    }

                    let params = {
                        radius: parseInt(
                            selectedFilterIds.distance === -1
                                ? 0
                                : selectedFilterIds.distance.replace(" km", "")
                        ),
                        cuisinesTypes: selectedFilterIds.categoryArr || [],
                        priceRange: parseInt(selectedFilterIds.priceId),
                        location: selectedFilterIds.locationString || "",
                        newest: selectedFilterIds.isNewest,
                        ...(selectedFilterIds.deliveryType && {
                            dining_option: selectedFilterIds.deliveryType,
                        }),
                        ...(selectedFilterIds.promotionType && {
                            promotion: selectedFilterIds.promotionType,
                        }),
                        pageSize: 10,
                        page: 1,
                    };
                    if (latitude && longitude) {
                        params = {
                            ...params,
                            latitude,
                            longitude,
                        };
                    }

                    this.getAllMerchants(params);
                });
            }
            this.setState({
                selectedFilterIds,
                isFilterActive: !_.isEqual(selectedFilterIds, fnBDefaultSelectedFilterIds),
            });
        }
    };

    checkLocationPermission = async () => {
        console.log("MakanManaFnBScreen checkLocationPermission");
        let location = {};
        if (this.state.fnbCurrLocation?.latitude && this.state.fnbCurrLocation?.longitude) {
            location = {
                latitude: this.state.fnbCurrLocation.latitude,
                longitude: this.state.fnbCurrLocation.longitude,
            };
        } else {
            try {
                const locations = await getLocationDetails();
                location.latitude = locations?.location?.latitude;
                location.longitude = locations?.location?.longitude;

                const { updateModel } = this.props;
                updateModel({
                    location: {
                        latitude: locations?.location?.latitude ?? "",
                        longitude: locations?.location?.longitude ?? "",
                    },
                });
            } catch (e) {
                this.props.displayLocationPopup();
            }
        }
        this.initData(location.latitude, location.longitude);
    };

    initData = async (latitude, longitude) => {
        console.log("[MakanManaFnBScreen] >> [initData]");

        this.setState({
            isWheelSelected: true,
            isListSelected: false,
            isLoading: true,
            merchantsData: [],
            wheelData: [],
            isDisableSpin: true,
            isFilterActive: false,
            selectedFilterIds: fnBDefaultSelectedFilterIds,
        });

        let params = {
            page: 1,
            pageSize: 10,
        };
        if (latitude && longitude) {
            params = {
                ...params,
                latitude,
                longitude,
            };
        }
        this.getAllMerchants(params);
    };

    getAllMerchants = async (params) => {
        const { isWheelSelected, isListSelected } = this.state;

        try {
            const response = await getAllFnBMerchantsCloud({
                sandboxUrl: this.state.sandboxUrl,
                params,
            });

            const result = response.data.result;
            const disableWheel = result.length < 10;
            const wheelTopTen = result
                .map((x) => ({ x, r: Math.random() }))
                .sort((a, b) => a.r - b.r)
                .map((a) => a.x)
                .slice(0, 10);

            await this.promisedSetState({
                merchantsData: result,
                isDisableSpin: disableWheel,
                isListSelected: isWheelSelected && disableWheel ? true : isListSelected,
                isWheelSelected: isWheelSelected && disableWheel ? false : isWheelSelected,
                wheelData: wheelTopTen,
            });
            // this.props.showPopup(this.state.isWheelSelected, {
            //     itemName: this.state.isWheelSelected ? "wheel" : "list",
            // });

            // Quick test on merchantPopup
            // this.spinWheelComplete(this.state.wheelData[0]);
        } catch (e) {
            this.setState({ isLoading: false }, () => {
                showErrorToast({
                    message: e.message,
                });
            });
        } finally {
            this.setState({
                isLoading: false,
            });
        }
    };

    onWheelPressed = () => {
        console.log("[MakanManaFnBScreen] >> [onWheelPressed]");
        this.props.showPopup(true, { itemName: "wheel" });
        if (this.state.merchantsData.length >= 10) {
            // Get random 10 Items from merchants
            const tempData = this.state.merchantsData
                .map((x) => ({ x, r: Math.random() }))
                .sort((a, b) => a.r - b.r)
                .map((a) => a.x)
                .slice(0, 10);
            console.log("Ramdon Merchants", tempData);
            this.setState({ isWheelSelected: true, isListSelected: false, wheelData: tempData });

            generateHaptic("selection", true);

            return;
        }
        this.setState({ isWheelSelected: true, isListSelected: false });
    };

    onListPressed = () => {
        console.log("[MakanManaFnBScreen] >> [onListPressed]");
        this.props.showPopup(false, { itemName: "list" });
        this.setState({ isListSelected: true, isWheelSelected: false });

        generateHaptic("selection", true);
    };

    onMerchantPressed = (item) => {
        this.props.navigation.navigate(navigationConstant.MERCHANT_DETAILS, {
            merchantDetails: item,
            source: "Discover",
            ...(item.mkp && { mkp: item.mkp }),
            ...(item.maya && { maya: item.maya }),
        });
    };

    onFilterPress = () => {
        console.log("[MakanManaFnBScreen] >> [onFilterPress]");
        this.props.navigation.navigate(navigationConstant.FILTER_SCREEN, {
            from: "MakanMana",
            selectedFilterIds: this.state.selectedFilterIds,
        });
    };

    checkForEarnedChances = async (item) => {
        const response = await checkS2WSpinWheelChances().catch(() => {
            // fail, probably nothing to do.
            this.props.showPopup(false, item);

            generateHaptic("impactLight", true);
        });
        /**
         * if response added > 1 we could show popup here.
         * check if campaign is running and check if it matched the list
         * delayed the check a lil bit to let user see the acknowledge screen
         */
        if (response && response.data.s2w) {
            const {
                misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
                s2w: { txnTypeList },
            } = this.props.getModel(["misc", "s2w"]);

            const { txnType, displayPopup, chance } = response.data.s2w;

            if (
                (isCampaignPeriod || isTapTasticReady) &&
                (txnTypeList.includes(txnType) || txnTypeList.includes("MAESPINWHEEL")) &&
                displayPopup
            ) {
                this.props.navigation.push("TabNavigator", {
                    screen: "CampaignChancesEarned",
                    params: {
                        chances: chance,
                        isTapTasticReady,
                        tapTasticType,
                    },
                });
            } else {
                this.props.showPopup(false, item);
                generateHaptic("impactLight", true);
            }
        } else {
            this.props.showPopup(false, item);
            generateHaptic("impactLight", true);
        }
    };

    spinWheelComplete = (item) => {
        const { isFocus, getModel } = this.props;
        const {
            user: { isOnboard },
            misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
        } = getModel(["user", "misc"]);

        if (isFocus) {
            this.setState({ isSpinning: false }, () => {
                /**
                 * Check for s2w earned chances, probably only during the campaign
                 */
                if (isOnboard && (isCampaignPeriod || isTapTasticReady)) {
                    this.checkForEarnedChances(item);
                } else {
                    this.props.showPopup(false, item);

                    generateHaptic("impactLight", true);
                }
            });
        }
    };

    onWheelSpin = () => {
        this.setState({
            isSpinning: true,
        });
    };

    _renderMerchantsContent = () => {
        const { isFocus } = this.props; // Seems like not doing much. Access if able to remove in future
        const { merchantsData, wheelData, isLoading, isWheelSelected } = this.state;

        return (
            <View style={styles.merchantContainer}>
                {isWheelSelected ? (
                    <View style={styles.container}>
                        {!merchantsData.length && !isLoading && isFocus ? (
                            <NoResults
                                onPrimary={this.onFilterPress}
                                onSecondary={this.checkLocationPermission}
                            />
                        ) : isLoading || !isFocus ? (
                            <LoadingWheel />
                        ) : (
                            merchantsData.length >= 10 && (
                                <SpinWheel
                                    isLoading={isLoading}
                                    isFocus={isFocus}
                                    restaurantsData={wheelData}
                                    onCompleteSpin={this.spinWheelComplete}
                                    onWheelSpin={this.onWheelSpin}
                                />
                            )
                        )}
                    </View>
                ) : (
                    <View style={styles.container}>
                        {isFocus && !merchantsData.length && !isLoading ? (
                            <NoResults
                                onPrimary={this.onFilterPress}
                                onSecondary={this.checkLocationPermission}
                            />
                        ) : isLoading ? (
                            <LoadingMerchant />
                        ) : (
                            <MerchantsCard
                                items={merchantsData}
                                onItemPressed={this.onMerchantPressed}
                                // onEndReached={this.onEndReachedMerchant}
                            />
                        )}
                    </View>
                )}
            </View>
        );
    };

    _renderSuggestionsContent = () => {
        const { merchantsData } = this.state;

        if (!merchantsData.length) return null;

        return (
            <View style={styles.suggestionView}>
                <Animatable.View animation="fadeInDown" duration={250}>
                    <Typo
                        color={BLACK}
                        fontSize={25}
                        fontWeight="600"
                        lineHeight={30}
                        text={Strings.SPIN_WHEEL_SUGGESTION}
                        textAlign="left"
                    />
                </Animatable.View>
                <Animatable.View animation="fadeInDown" duration={250} delay={250}>
                    <Typo
                        color={BLACK}
                        fontSize={14}
                        fontWeight="500"
                        lineHeight={23}
                        letterSpacin={0}
                        text="10 places near you"
                        textAlign="left"
                        style={styles.suggestionText}
                    />
                </Animatable.View>
            </View>
        );
    };
    _renderOptionsContent = () => {
        const { isFocus } = this.props;
        const { merchantsData, isLoading, isWheelSelected, isSpinning } = this.state;

        if (isLoading || !isFocus) return <LoadingOption />;

        if (!merchantsData.length) return null;

        return (
            <>
                {this.state.isWheelSelected && this._renderSuggestionsContent()}
                <View style={styles.headerButtonsView}>
                    <View style={styles.optionsContainer}>
                        <Animatable.View
                            animation="bounceIn"
                            duration={250}
                            delay={isWheelSelected ? 300 : 0}
                        >
                            <TouchableOpacity
                                style={styles.wheelView}
                                onPress={this.onWheelPressed}
                                disabled={this.state.isDisableSpin || isSpinning}
                            >
                                <View style={styles.wheelImgContainer}>
                                    <View style={styles.wheelImageIConView}>
                                        <Image
                                            source={
                                                this.state.isWheelSelected
                                                    ? Assets.spinWheelSelectedIcon
                                                    : Assets.spinWheelUnSelectedIcon
                                            }
                                            style={styles.imageIcon}
                                        />
                                    </View>

                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={24}
                                        color={this.state.isWheelSelected ? BLACK : DARK_GREY}
                                        textAlign="left"
                                        text="Wheel"
                                    />
                                </View>
                            </TouchableOpacity>
                        </Animatable.View>
                        {/* <View style={styles.listView}> */}
                        <Animatable.View
                            animation="bounceIn"
                            duration={250}
                            delay={isWheelSelected ? 550 : 0}
                        >
                            <TouchableOpacity
                                style={styles.listTextView}
                                onPress={this.onListPressed}
                                disabled={isSpinning}
                            >
                                <View style={styles.listIconView}>
                                    <Image
                                        source={
                                            this.state.isListSelected
                                                ? Assets.listSelectedIcon
                                                : Assets.listUnSelectedIcon
                                        }
                                        style={styles.listIcon}
                                    />
                                </View>

                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={24}
                                    color={this.state.isListSelected ? BLACK : DARK_GREY}
                                    textAlign="left"
                                    text="List"
                                />
                            </TouchableOpacity>
                        </Animatable.View>
                    </View>
                    {/* </View> */}
                    <Animatable.View
                        animation="bounceIn"
                        duration={250}
                        delay={isWheelSelected ? 800 : 0}
                    >
                        <TouchableOpacity
                            style={styles.filterView}
                            onPress={this.onFilterPress}
                            disabled={isSpinning}
                        >
                            <Image source={Assets.funnelIcon} style={styles.filterIcon} />
                            {this.state.isFilterActive && <View style={styles.yellowDot} />}
                        </TouchableOpacity>
                    </Animatable.View>
                </View>
            </>
        );
    };
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.container}>
                    {this._renderOptionsContent()}
                    {this._renderMerchantsContent()}
                </View>
            </View>
        );
    }
}

function MerchantItemLoading() {
    return (
        <View style={styles.merchantItemLoading}>
            <View style={styles.merchantItemLoadingInner}>
                <ShimmerPlaceHolder style={styles.merchantItemLoadingImg} />
                <View style={styles.merchantItemLoadingMetaContainer}>
                    <View>
                        <ShimmerPlaceHolder
                            autoRun
                            visible={false}
                            style={styles.itemLoadingMetaTitle}
                        />
                        <ShimmerPlaceHolder
                            autoRun
                            visible={false}
                            style={styles.merchantItemLoadingSecondary}
                        />
                    </View>
                    <ShimmerPlaceHolder style={styles.loadingText} />
                </View>
            </View>
        </View>
    );
}

function LoadingMerchant() {
    return (
        <View style={styles.merchantLoader}>
            <MerchantItemLoading />
            <MerchantItemLoading />
            <MerchantItemLoading />
        </View>
    );
}

function LoadingWheel() {
    return (
        <View style={styles.loadingWheelContainer}>
            <View style={styles.loadingWheelInner}>
                <ShimmerPlaceHolder style={styles.loadingWheel} />
            </View>
        </View>
    );
}

function LoadingOption() {
    return (
        <View style={[styles.headerButtonsView, styles.loadingOptionSpacing]}>
            <View style={styles.optionsContainer}>
                <View style={styles.loadingOptionButtonGutter}>
                    <ShimmerPlaceHolder style={styles.loadingButtonText} />
                </View>
                <View style={styles.loadingOptionButton}>
                    <ShimmerPlaceHolder style={styles.loadingButtonText} />
                </View>
            </View>
            <View style={styles.loadingOptionButtonFilter}>
                <ShimmerPlaceHolder
                    autoRun
                    visible={false}
                    style={styles.loadingOptionButtonFilterIcon}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filterIcon: {
        height: 24,
        width: 24,
    },
    filterView: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: LIGHT_GREY,
        borderRadius: 20,
        borderStyle: "solid",
        borderWidth: 1,
        flexDirection: "row",
        justifyContent: "center",
        paddingHorizontal: width * 0.05,
        paddingVertical: 8,
    },
    headerButtonsView: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
    },
    imageIcon: {
        height: 24,
        width: 24,
    },
    itemLoadingMetaTitle: {
        backgroundColor: GREY_200,
        height: 4,
        marginBottom: 8,
        width: "100%",
    },
    listIcon: {
        height: 15,
        width: 24,
    },
    listIconView: {
        marginRight: 8,
    },
    listTextView: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: LIGHT_GREY,
        borderRadius: 20,
        borderStyle: "solid",
        borderWidth: 1,
        flexDirection: "row",
        justifyContent: "center",
        paddingHorizontal: width * 0.05,
        paddingVertical: 8,
    },
    loadingButtonText: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        width: "100%",
    },
    loadingOptionButton: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 20,
        height: 40,
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 8,
        width: 120,
    },
    loadingOptionButtonFilter: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 20,
        height: 40,
        justifyContent: "center",
        paddingHorizontal: 18,
        paddingVertical: 8,
        width: 60,
    },
    loadingOptionButtonFilterIcon: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 24,
        width: 24,
    },
    loadingOptionButtonGutter: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 20,
        height: 40,
        justifyContent: "center",
        marginRight: 8,
        paddingHorizontal: 20,
        paddingVertical: 8,
        width: 120,
    },
    loadingOptionSpacing: { marginTop: 132 },
    loadingText: {
        backgroundColor: GREY_200,
        height: 4,
        width: "50%",
    },
    loadingWheel: {
        backgroundColor: GREY_200,
        height: "100%",
        width: "100%",
    },
    loadingWheelContainer: {
        alignItems: "center",
        bottom: -((width * 1.5) / 2),
        left: -((width * 1.5) / 2 / 3),
        position: "absolute",
    },
    loadingWheelInner: {
        backgroundColor: WHITE,
        borderRadius: (width * 1.5) / 2,
        height: width * 1.5,
        overflow: "hidden",
        width: width * 1.5,
    },
    merchantContainer: {
        flex: 1,
        marginTop: 20,
    },
    merchantItemLoading: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        height: 112,
        marginBottom: 16,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: "100%",
    },
    merchantItemLoadingImg: {
        backgroundColor: GREY_200,
        height: 112,
        width: 137,
    },
    merchantItemLoadingInner: {
        borderRadius: 8,
        flexDirection: "row",
        overflow: "hidden",
    },

    merchantItemLoadingMetaContainer: {
        justifyContent: "space-between",
        padding: 16,
    },
    merchantItemLoadingSecondary: {
        backgroundColor: GREY_200,
        height: 4,
        marginBottom: 20,
        width: "50%",
    },
    merchantLoader: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    optionsContainer: {
        flexDirection: "row",
    },
    suggestionText: {
        marginTop: 8,
    },
    suggestionView: {
        marginBottom: 36,
        paddingHorizontal: 24,
    },
    wheelImageIConView: {
        marginRight: 8,
    },
    wheelImgContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    wheelView: {
        backgroundColor: WHITE,
        borderColor: LIGHT_GREY,
        borderRadius: 20,
        borderStyle: "solid",
        borderWidth: 1,
        marginRight: 0.02 * width,
        paddingHorizontal: width * 0.05,
        paddingVertical: 8,
    },
    yellowDot: {
        backgroundColor: YELLOW,
        borderRadius: 8,
        height: 16,
        position: "absolute",
        right: 12,
        top: 0,
        width: 16,
    },
});

export default withModelContext(MakanManaFnBScreen);
