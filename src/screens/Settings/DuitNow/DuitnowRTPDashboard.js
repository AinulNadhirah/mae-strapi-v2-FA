import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import DuitnowRTPCard from "@screens/Settings/DuitNow/DuitnowRTPCard";

import { DUITNOW_DETAILS_RTP } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getRtpList } from "@services";

import { MEDIUM_GREY, YELLOW, GREY, WHITE } from "@constants/colors";
import * as Strings from "@constants/strings";

class DuitnowRTPDashboard extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            duitNowList: [],
        };
        this.retrievalRefNo = "x";
        this.isLoading = false;
    }
    componentDidMount = () => {
        this.props.navigation.addListener("focus", this.onScreenFocus);
    };

    onScreenFocus = () => {
        this.getRTPBlockList();
    };

    handleBack = () => {
        this.props.navigation.goBack();
    };

    rtpUnblockTap = (item) => {
        this.props.navigation.navigate(DUITNOW_DETAILS_RTP, { proxyDetails: item });
    };

    getRTPBlockList = (isLoadMore = false) => {
        this.setState({
            isLoading: true,
        });
        this.isLoading = true;
        const subUrl = "/rtp/list";
        const datalist = isLoadMore ? this.state.duitNowList : [];
        const params = {
            listType: "BLOCKED",
        };

        if (isLoadMore) {
            params.retrievalRefNo = this.retrievalRefNo;
        }
        getRtpList(subUrl, params)
            .then((response) => {
                this.retrievalRefNo = response?.data?.result?.retrievalRefNo;
                const data = response?.data?.result?.data ?? [];
                this.setState({
                    duitNowList: [...datalist, ...data],
                });
            })
            .catch((error) => {
                showErrorToast({
                    message: error?.error?.error?.message ?? Strings.COMMON_ERROR_MSG,
                });
            })
            .finally(() => {
                this.setState({
                    duitNowList: datalist,
                    isLoading: false,
                });
                this.isLoading = false;
            });
    };

    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    };

    onScroll = ({ nativeEvent }) => {
        if (this.isCloseToBottom(nativeEvent) && this.retrievalRefNo && !this.isLoading) {
            this.getRTPBlockList(true);
        }
    };

    render() {
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={this.state.isLoading}
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            backgroundColor={YELLOW}
                            headerCenterElement={
                                <Typography
                                    text={Strings.BLOCKED_REQUESTORS}
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={this.handleBack} />}
                        />
                    }
                    useSafeArea
                >
                    <View style={styles.container}>
                        <Typography
                            text={Strings.UNBLOCK_REQUESTORS}
                            fontWeight="300"
                            fontStyle="normal"
                            fontSize={20}
                            lineHeight={28}
                            textAlign="left"
                            style={styles.linkAccountText}
                        />
                        <ScrollView onScroll={this.onScroll} scrollEventThrottle={400}>
                            <View>
                                <View style={styles.accoutsListView}>
                                    <DuitnowRTPCard
                                        items={this.state.duitNowList}
                                        idTypeKey="text"
                                        valueKey="value"
                                        idValue="idVal"
                                        statusKey="isregisteredProxy"
                                        bankNameKey="bankName"
                                        isSelectButton={true}
                                        isDisplayStatus={true}
                                        onPress={this.rtpUnblockTap}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    accoutsListView: {
        backgroundColor: WHITE,
        borderTopColor: GREY,
        borderTopWidth: 1,
        marginTop: 20,
    },

    container: {
        flex: 1,
    },

    linkAccountText: {
        marginLeft: 24,
        marginRight: 48,
        marginTop: 20,
    },
});

export default withModelContext(DuitnowRTPDashboard);
