import { CacheeImage } from "cachee";
import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, View, ScrollView, Image } from "react-native";
import HTML from "react-native-render-html";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { getPromotionDetails } from "@services";

import { BLACK, MEDIUM_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import { formatMobileNumber } from "@utils/dataModel/utility";

import Assets from "@assets";

class PromotionDetails extends Component {
    static propTypes = {
        route: PropTypes.object,
        navigation: PropTypes.object,
    };

    state = {
        source: this.props.route?.params?.source,
        PromotionData: {},
        outletsData: [],
        outletName: "",
        address: "",
        email: "",
        mobileNumber: "",
        displayPicker: false,
        cuisineType: "",
        selectedOutlet: 0,
    };

    componentWillMount() {
        this.getPromotionDetails();
    }

    getPromotionDetails = () => {
        console.log("[PromotionDetails] >> [getMerchantOutlets]");
        console.log(this.props.route?.params?.promotionDetails);
        const contentID = this.props.route?.params?.promotionDetails?.id ?? "";
        getPromotionDetails(contentID)
            .then((respone) => {
                const result = respone.data?.result;
                console.log("Data isss", result);
                this.setState({
                    PromotionData: result,
                    outletsData: result?.merchantOutlets,
                    outletName: result?.merchantOutlets[0]?.outletName,
                    address: result?.merchantOutlets[0]?.outletAddress,
                    mobileNumber: result?.merchantOutlets[0]?.mobileNo,
                    cuisineType: result?.categoryType,
                    email: result?.email,
                });
            })
            .catch((error) => {
                console.log(`is Error`, error);
                showErrorToast({
                    message: error.message,
                });
            });
    };

    onBackTap = () => {
        console.log("[PromotionDetails] >> [BackTap]");
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[PromotionDetails] >> [CloseTap]");
        this.props.navigation.navigate(navigationConstant.FNB_TAB_SCREEN);
    };

    onOutletPressed = () => {
        console.log("[PromotionDetails] >> [onOutletPressed]");
        this.setState({ displayPicker: true });
    };

    onDoneButtonPress = (data) => {
        if (data) {
            const { value } = data;
            const selectedOutlet = this.state.outletsData.findIndex(
                (outletAddress) => outletAddress.outletId === value
            );
            const outletData = this.state.outletsData.find(
                (outletName) => outletName.outletId === value
            );

            this.setState({
                displayPicker: false,
                outletName: outletData.outletName,
                address: outletData.outletAddress,
                mobileNumber: outletData.mobileNo,
                selectedOutlet,
            });
        }
    };

    onCancelButtonPress = () => {
        console.log("[PromotionDetails] >> [_onLeftButtonModePress]");
        this.setState({ displayPicker: false });
    };

    scrollPickerData = () => {
        const { outletsData } = this.state;

        return outletsData.map((obj) => {
            const { outletName, outletId } = obj;
            return {
                name: outletName,
                value: outletId,
            };
        });
    };

    _renderFullTextHTMLContent = () => {
        const { PromotionData } = this.state;

        if (!PromotionData?.fullText) return null;

        const htmlText =
            PromotionData?.fullText?.indexOf("<") === -1
                ? `<p>${PromotionData?.fullText}</p>`
                : PromotionData?.fullText;

        return (
            <>
                <View style={styles.fullTextView}>
                    <HTML
                        html={htmlText}
                        tagsStyles={{
                            p: {
                                fontFamily: "montserrat",
                                fontSize: 14,
                                fontWeight: "normal",
                                lineHeight: 20,
                                color: BLACK,
                            },
                        }}
                        onLinkPress={this._handleContentLinkPress}
                    />
                </View>
            </>
        );
    };

    _renderSummaryTextHTMLContent = () => {
        const { PromotionData } = this.state;
        if (!PromotionData?.summary) return null;

        return (
            <React.Fragment>
                <View style={styles.fullTextView}>
                    <HTML
                        html={PromotionData?.summary}
                        tagsStyles={{
                            p: {
                                fontFamily: "montserrat",
                                fontSize: 14,
                                fontWeight: "normal",
                                lineHeight: 20,
                                color: BLACK,
                            },
                        }}
                        onLinkPress={this._handleContentLinkPress}
                    />
                </View>
            </React.Fragment>
        );
    };

    render() {
        const {
            PromotionData,
            outletName,
            address,
            mobileNumber,
            displayPicker,
            cuisineType,
            email,
            selectedOutlet,
        } = this.state;
        const pickerData = this.scrollPickerData();

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                                headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        color={BLACK}
                                        lineHeight={19}
                                        text={Strings.PROMOTION_DETAIL}
                                    />
                                }
                            />
                        }
                        useSafeArea
                        paddingLeft={0}
                        paddingRight={0}
                        paddingBottom={0}
                        paddingTop={0}
                    >
                        <View style={styles.container}>
                            <ScrollView>
                                <CacheeImage
                                    style={styles.promotionImage}
                                    source={{ uri: PromotionData.imageUrl }}
                                />
                                <View style={styles.contentView}>
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        lineHeight={23}
                                        letterSpacing={0}
                                        textAlign="left"
                                        text="Promotions"
                                        style={styles.titleText}
                                    />
                                    <View style={styles.cuisineContainer}>
                                        <View style={styles.foodTypeView}>
                                            <Typo
                                                fontSize={10}
                                                fontWeight="normal"
                                                lineHeight={16}
                                                text={cuisineType}
                                            />
                                        </View>
                                    </View>

                                    <Typo
                                        fontSize={18}
                                        fontWeight="600"
                                        textAlign="left"
                                        lineHeight={23}
                                        text={PromotionData?.title}
                                    />
                                    {PromotionData?.merchantName && (
                                        <View style={styles.promotionMerchant}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                textAlign="left"
                                                lineHeight={17}
                                                text={PromotionData?.merchantName}
                                                numberOfLines={1}
                                            />
                                        </View>
                                    )}
                                    <Typo
                                        fontSize={12}
                                        lineHeight={17}
                                        style={styles.promotionDate}
                                        fontWeight="normal"
                                        textAlign="left"
                                        text={`Valid until ${
                                            PromotionData?.promoValidDate?.end
                                                ? moment(PromotionData?.promoValidDate?.end).format(
                                                      "DD MMM YYYY"
                                                  )
                                                : "-"
                                        }`}
                                    />
                                    {this._renderFullTextHTMLContent()}
                                    <View style={styles.dropDownView}>
                                        <Dropdown
                                            title={outletName}
                                            align="left"
                                            onPress={this.onOutletPressed}
                                        />
                                        {/* <TouchableOpacity
                                        style={styles.touchableView}
                                        onPress={this.onOutletPressed}
                                    >
                                        <View>
                                            <Typo
                                                fontSize={13}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                lineHeight={23}
                                                letterSpacing={0}
                                                color={BLACK}
                                                textAlign="left"
                                                text={outletName}
                                                style={styles.dropDownText}
                                            />

                                            <Image
                                                style={styles.dropDownIcon}
                                                source={Assets.downArrow}
                                            />
                                        </View>
                                    </TouchableOpacity> */}
                                    </View>

                                    <View style={styles.contactsView}>
                                        <Image style={styles.imageIcon} source={Assets.mapIcon} />
                                        <Typo
                                            fontSize={13}
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            textAlign="left"
                                            lineHeight={23}
                                            color={BLACK}
                                            style={styles.addressText}
                                            text={address}
                                        />
                                    </View>
                                    <View style={styles.contactsView}>
                                        <Image style={styles.imageIcon} source={Assets.webIcon} />
                                        <Typo
                                            fontSize={13}
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            textAlign="left"
                                            lineHeight={23}
                                            color={BLACK}
                                            style={styles.addressText}
                                            text={email}
                                        />
                                    </View>
                                    <View style={styles.contactsView}>
                                        <Image style={styles.imageIcon} source={Assets.callIcon} />
                                        <Typo
                                            fontSize={13}
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            textAlign="left"
                                            lineHeight={23}
                                            color={BLACK}
                                            style={styles.addressText}
                                            text={formatMobileNumber(mobileNumber)}
                                        />
                                    </View>
                                    {this._renderSummaryTextHTMLContent()}
                                </View>
                            </ScrollView>
                        </View>
                    </ScreenLayout>
                    <ScrollPickerView
                        showMenu={displayPicker}
                        list={pickerData}
                        rightButtonText="Done"
                        leftButtonText="Cancel"
                        onLeftButtonPress={this.onCancelButtonPress}
                        onRightButtonPress={this.onDoneButtonPress}
                        selectedIndex={selectedOutlet}
                    />
                </>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    addressText: {
        marginLeft: 15,
        width: 200,
    },
    contactsView: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 20,
    },
    container: {
        flex: 1,
    },
    contentView: {
        marginTop: 24,
        paddingHorizontal: 24,
    },
    cuisineContainer: {
        flexDirection: "row",
        paddingBottom: 24,
        paddingTop: 14,
    },
    dropDownView: {
        marginTop: 20,
    },

    foodTypeView: {
        borderColor: BLACK,
        borderRadius: 8,
        borderStyle: "solid",
        borderWidth: 1,
        paddingHorizontal: 8,
        textAlign: "center",
    },
    fullTextView: {
        marginTop: 20,
    },
    imageIcon: {
        height: 20,
        width: 20,
    },
    promotionDate: {
        marginTop: 4,
    },
    promotionImage: {
        height: 250,
        width: "100%",
    },
    promotionMerchant: {
        marginTop: 4,
    },
    titleText: {
        marginTop: 5,
    },
});

export default PromotionDetails;
