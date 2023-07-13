import React, { Component } from "react";
import {
    View,
    RefreshControl,
    ScrollView,
    Platform,
    TouchableOpacity,
    Image,
    FlatList,
    StyleSheet,
} from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { getPendingGoalsList } from "@services/index";

import { MEDIUM_GREY, GREY, WHITE, SHADOW_LIGHT, DARK_GREY } from "@constants/colors";
import { FA_TABUNG_PENDINGINVITATIOIN, CURRENCY } from "@constants/strings";

import * as Utility from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TabungStyle";

export const IS_IOS = Platform.OS === "ios";

class PendingInvitationsScreen extends Component {
    state = {
        referenceText: "",
        loader: false,
        pendingData: null,
        refreshing: false,
        feedsCount: 5,
        noDataMessage: "",
    };

    componentDidMount() {
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this._initData();
        });
    }

    _initData = () => {
        // reset state
        this.setState(
            {
                referenceText: "",
                pendingData: null,
                feedsCount: 5,
                noDataMessage: "",
            },
            () => {
                // fetch pending goals from API
                this._getPendingGoalsList();
            }
        );
    };

    componentWillUnmount() {
        this.focusSubscription();
    }

    _getPendingGoalsList = async () => {
        console.log("_getPendingGoalsList==> ");
        this.setState({ loader: true });

        let subUrl = "/goal/participants/pending?pageSize=5000&page=0";
        let params = {};
        params = JSON.stringify({});
        getPendingGoalsList(subUrl, JSON.parse(params))
            .then((response) => {
                let responseObject = response.data;
                console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                // ModelClass.TABUNG_GOALS_DATA.acctDetailsObj = responseObject.result;
                if (
                    responseObject !== null &&
                    responseObject !== undefined &&
                    responseObject.resultList != null
                ) {
                    if (responseObject.resultList.length >= 1) {
                        // Invites available
                        this._updateScreenData(responseObject.resultList);
                    } else {
                        // No invites
                        this.setState({
                            loader: false,
                            refreshing: false,
                            noDataMessage: "No pending invitations.",
                        });
                    }
                } else {
                    // No response object
                    this.setState({
                        loader: false,
                        refreshing: false,
                        noDataMessage: "Something went wrong. Please try again later.",
                    });
                }
            })
            .catch((error) => {
                console.log(subUrl + "  ERROR==> ", error);
                this.setState({
                    loader: false,
                    refreshing: false,
                    noDataMessage: "Something went wrong. Please try again later.",
                });
            });
    };

    _updateScreenData = (data) => {
        console.log("_updateScreenData : ", data);

        let pendingList = [];
        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            let picArrayDisplay = [];
            let userDetails = item.userDetails;
            let currentUserID = 0;

            if (userDetails != undefined) {
                currentUserID = userDetails.userId;
            }
            //console.log(" item ", item);
            //console.log(" item.participants ", item.participants);
            let progress;
            let contributedAmount = item.contributedAmount;

            try {
                progress = contributedAmount / item.totalAmount;
                if (progress < 1 && contributedAmount >= 1) {
                    progress = 0.1;
                }
            } catch (e) {
                progress = "0." + item.totalAmount;
                // console.log(e)
            }
            if (isNaN(progress) || progress === undefined || progress === null) {
                progress = "0." + item.totalAmount;
            }
            let progressDisplay = Utility.toFixed(parseFloat(progress), 1);
            console.log("progress  ", progressDisplay);
            // if (progressDisplay <= 0) {
            // 	progressDisplay = 0.1;
            // }
            if (item.participants != undefined) {
                for (let k = 0; k < item.participants.length; k++) {
                    let participantsObj = item.participants[k];
                    // let totalUsers = item.participants.length;
                    if (participantsObj != null) {
                        let participantPic =
                            participantsObj.imageUrl == null ||
                            participantsObj.imageUrl == "null" ||
                            participantsObj.imageUrl == undefined
                                ? ""
                                : participantsObj.imageUrl;

                        let userId = participantsObj.userId;
                        let userType = participantsObj.userType;
                        let paid = participantsObj.paid;
                        let participantName =
                            currentUserID === userId ? "You" : participantsObj.name;
                        let status = participantsObj.status;
                        let formattedAmount = participantsObj.formattedAmount;
                        let image = participantsObj.image;
                        let amount = participantsObj.amount;

                        let picObj = {
                            participantPic: participantPic,
                            participantName: participantName,
                            userId: userId,
                            userType: userType,
                            paid: paid,
                            status: status,
                            key: k,
                            formattedAmount: formattedAmount,
                            image: image,
                            amount: amount,
                            participants: item.participants,
                            paymentDetail: item.paymentDetail,
                            userDetail: item.userDetail,
                        };

                        picArrayDisplay.push(picObj);
                    }
                }

                // console.log('participantsObj ', participantsObj)
            }
            console.log("ownerDetails : ", item.ownerDetails);
            let goalObj = {
                id: item.id,
                title:
                    (item.ownerDetails != undefined && item.ownerDetails.name != undefined
                        ? item.ownerDetails.name
                        : "") +
                    " invited you to join the '" +
                    item.name +
                    "' Tabung.",
                collectedText: "Saved so far",
                amountText:
                    CURRENCY + item.contributedAmount + " of " + CURRENCY + item.totalAmount,
                createdText: item.formattedStartDate,
                rightText: item.boosterCount + " active booster(s)",
                progress: progressDisplay,
                progress2: 0.0,
                backgroundImage: "",
                boosterCount: item.boosterCount,
                picArrayDisplay: picArrayDisplay,
                contributedAmount: item.contributedAmount,
                duration: item.duration,
                endDate: item.endDate,
                goalType: item.goalType,
                name: item.name,
                participants: item.participants,
                remainingAmount: item.remainingAmount,
                startDate: item.startDate,
                status: item.status,
                totalAmount: item.totalAmount,
                // ownerImage:
                // 	item.ownerDetails != undefined && item.ownerDetails.imageUrl != undefined
                // 		? item.ownerDetails.imageUrl
                // 		: "",
                ownerImage: "",
                ownerName: item.ownerDetails.name,
                formattedContributedAmount: item.formattedContributedAmount,
                formattedEndDate: item.formattedEndDate,
                formattedStartDate: item.formattedStartDate,
                formattedTotalAmount: item.formattedTotalAmount,
                imageUrl: item.imageUrl,
                prettyStartDate: item.prettyStartDate,
                userDetails: item.userDetails,
                ownerDetails: item.ownerDetails,
            };
            pendingList.push(goalObj);
        }

        console.log(" _updatePendingScreenData pendingList : ", pendingList);

        this.setState({
            loader: false,
            refreshing: false,
            pendingData: pendingList,
        });
    };

    _onRefresh = () => {
        console.log("pull to refresh");

        this.setState({ refreshing: true });
        this._initData();
    };

    _onClosePress = () => {
        this.props.navigation.goBack();

        // this.props.route.params.refresh(); - this is causing the app to crash when coming from notification, should rely on screen focus instead
    };

    _onInvitePress = (item) => {
        console.log("[_onInvitePress] item", item);

        this.props.navigation.navigate("goalsModule", {
            screen: "InvitationDetailsScreen",
            params: {
                goalId: item.id,
            },
        });
    };

    renderInviteListItem(item) {
        console.log("[renderInviteListItem] item: ", item);

        const initials = item.ownerName.match(/\b\w/g) || [];
        item.initials = ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();
        if (item.initials.length == 1) {
            item.initials = item.ownerName.substring(0, 2).toUpperCase();
        }
        console.log(initials);

        return (
            <View style={invitationItemStyles.invitationItemContainer}>
                <View style={invitationItemStyles.leftContainer}>
                    <BorderedAvatar width={40} height={40} borderRadius={20} backgroundColor={GREY}>
                        {item.ownerDetails &&
                        item.ownerDetails.imageUrl &&
                        item.ownerDetails.imageUrl !== "" ? (
                            <View style={invitationItemStyles.imageContainer}>
                                <Image
                                    style={invitationItemStyles.imageFull}
                                    source={{ uri: item.ownerDetails.imageUrl }}
                                />
                            </View>
                        ) : (
                            <Typo
                                fontSize={14}
                                fontWeight="300"
                                lineHeight={18}
                                text={item.initials}
                                textAlign="center"
                                color={DARK_GREY}
                            />
                        )}
                    </BorderedAvatar>
                </View>
                <View style={invitationItemStyles.rightContainer}>
                    <Typo text={item.title} fontSize={13} lineHeight={20} textAlign="left" />
                    <View style={invitationItemStyles.viewDetailsContainer}>
                        <Typo
                            text="View details"
                            fontSize={13}
                            fontWeight="600"
                            lineHeight={19}
                            color="#2892e9"
                            textAlign="left"
                        />
                    </View>
                </View>
            </View>
        );
    }

    render() {
        const { pendingData, refreshing, noDataMessage } = this.state;

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_TABUNG_PENDINGINVITATIOIN}
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={this._onClosePress} />}
                            headerCenterElement={
                                <Typo
                                    text="Pending Invitation"
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <ScrollView
                        // style={{ flex: 1 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={this._onRefresh} />
                        }
                        scrollEventThrottle={10}
                        refreshing={false}
                    >
                        <View style={Styles.containerInnerView1}>
                            {pendingData && pendingData.length >= 1 ? (
                                <View style={styles.container}>
                                    {/* <TabungGoalInvitedList
                                        data={pendingData}
                                        extraData={pendingData}
                                        callback={this._onListItemClick}
                                        length={pendingData.length}
                                    /> */}
                                    <FlatList
                                        data={pendingData}
                                        refreshing={refreshing}
                                        scrollEnabled={false}
                                        style={styles.flatListStyle}
                                        // ref={ref => { this.newsFeedListRef = ref; }}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                onPress={() => this._onInvitePress(item)}
                                                activeOpacity={0.8}
                                            >
                                                {this.renderInviteListItem(item)}
                                            </TouchableOpacity>
                                        )}
                                        keyExtractor={(item, index) => `item_${index}`}
                                    />
                                </View>
                            ) : (
                                <View style={styles.container}>
                                    <Typo fontWeight="300" text={noDataMessage} />
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flatListStyle: {
        overflow: "visible",
    },
});

const invitationItemStyles = StyleSheet.create({
    imageContainer: {
        alignItems: "center",
        borderRadius: 18,
        height: 36,
        justifyContent: "center",
        overflow: "hidden",
        width: 36,
    },
    imageFull: {
        borderRadius: 18,
        height: 36,
        resizeMode: "contain",
        width: 36,
    },
    initialsContainer: { marginLeft: 2, marginTop: 2, width: 30 },
    invitationItemContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        justifyContent: "center",
        flexDirection: "row",
        marginVertical: 8,
        paddingTop: 20,
        elevation: 8,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        overflow: "visible",
        marginHorizontal: 24,
    },
    rightContainer: {
        marginTop: -2,
        marginRight: 20,
        flex: 1,
    },
    leftContainer: {
        marginHorizontal: 20,
    },
    viewDetailsContainer: {
        marginTop: 8,
        marginBottom: 16,
    },
});

export default PendingInvitationsScreen;
