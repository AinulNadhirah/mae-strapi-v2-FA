import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, Image, StyleSheet, FlatList } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";
import { getGoalDetailsAPI, rejectGoalAPI } from "@services/index";

// import { ErrorMessage } from "@components/Common";
import { YELLOW, WHITE, MEDIUM_GREY, GREY, DARK_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import * as Utility from "@utils/dataModel/utility";

class InvitationDetails extends Component {
    static propTypes = {
        route: PropTypes.object,
    };

    state = {
        inviteData: null,
        goalId: null,
        showRejectConfirm: false,
    };

    componentDidMount() {
        console.log("[InvitationDetails] componentDidMount with state: ", this.state);
        this._initData();
    }

    _initData = () => {
        // console.log(this.props);
        this.setState({ goalId: this.props.route.params.goalId }, () => {
            console.log("[InvitationDetails] this.state", this.state);
            this._getGoalDetailsData();
        });
    };

    _onPressClose = () => {
        this.props.navigation.goBack();
    };

    _onPressReject = () => {
        this.setState({ showRejectConfirm: true });
        //need to log event here
        logEvent(Strings.FA_VIEW_SCREEN, {
            [Strings.FA_SCREEN_NAME]: Strings.FA_TABUNG_INVITATION_REJECTINVITE,
        });
    };

    _onConfirmReject = () => {
        // eslint-disable-next-line react/prop-types
        //this.props.navigation.pop();
        logEvent(Strings.FA_FORM_COMPLETE, {
            [Strings.FA_SCREEN_NAME]: Strings.FA_TABUNG_INVITATION_REJECTINVITE_SUCCESSFUL,
        });
        this.setState({ showRejectConfirm: false });
        this._rejectGoalAPI();
    };

    _getGoalDetailsData = async () => {
        console.log("_getGoalDetailsData==> ");

        const id = this.state.goalId;

        this.setState({ loader: true });

        const subUrl = `/goal/participants/pending/${id}`;
        let params = {};

        params = JSON.stringify({});
        getGoalDetailsAPI(subUrl, JSON.parse(params))
            .then((response) => {
                let responseObject = response.data;
                console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                // ModelClass.TABUNG_GOALS_DATA.acctDetailsObj = responseObject.result;
                if (
                    responseObject !== null &&
                    responseObject !== undefined &&
                    responseObject.result !== null &&
                    responseObject.result !== undefined
                ) {
                    this._updateDetailsScreenData(responseObject.result);
                } else if (
                    responseObject !== null &&
                    responseObject !== undefined &&
                    responseObject.result !== null &&
                    responseObject.result !== undefined
                ) {
                    this.setState({ inviteData: null, loader: false, refreshing: false });
                } else {
                    this.setState({ inviteData: null, loader: false, refreshing: false });
                }
            })
            .catch((error) => {
                console.log(subUrl + "  ERROR==> ", error);
                this.setState({ loader: false, refreshing: false });
            });
    };

    _updateDetailsScreenData = (data) => {
        console.log("_updateDetailsScreenData : ", data);

        let participants = data.participants;
        let participantsData = [];
        let userDetails = data.userDetails;
        let currentUserID = 0;
        let ownerDetails = data.ownerDetails;
        if (userDetails != undefined) {
            currentUserID = userDetails.userId;
        }

        if (participants != undefined) {
            console.log("participants : ", participants);

            for (let k = 0; k < participants.length; k++) {
                let participantObj = participants[k];
                let participantName =
                    currentUserID === participantObj.userId ? "You" : participantObj.name;
                // get initials based on name
                let initials = participantObj.name.match(/\b\w/g) || [];
                initials = ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();
                if (initials.length == 1) {
                    initials = participantObj.name.substring(0, 2).toUpperCase();
                }

                let obj = {
                    participantPic: participantObj.imageUrl,
                    contributionAmount: participantObj.contributionAmount,
                    formattedContributionAmount: participantObj.formattedContributionAmount,
                    goalId: participantObj.goalId,
                    id: participantObj.id,
                    picArrayDisplay: [
                        {
                            participantPic: participantObj.imageUrl,
                            participantName: participantName
                                .split(/\s/)
                                .reduce((response, word) => (response += word.slice(0, 2)), "")
                                .toUpperCase()
                                .substring(0, 2),
                        },
                    ],
                    participantName: participantName,
                    initials: initials,
                    key: k,
                    amount: Strings.CURRENCY + participantObj.formattedContributionAmount,
                    imageUrl: participantObj.imageUrl,
                    name: participantObj.name,
                    owner: participantObj.owner,
                    totalAmount: participantObj.totalAmount,
                    totalBoosterAmount: participantObj.totalBoosterAmount,
                    status: "Pending",
                    backgroundImage: participantObj.imageUrl,
                    userImage: participantObj.imageUrl,
                    isMaya: true,
                };

                participantsData.push(obj);
            }

            data.participants = participantsData;
            // ModelClass.TABUNG_GOALS_DATA.invitedParticipants = participantsData;
            // ModelClass.GOAL_DATA.friendList = participantsData;

            this.setState(
                {
                    inviteData: data,
                    // goalSelectedDetails: data,
                    // goalParticipant: participantsData,
                    loader: false,
                    refreshing: false,
                    // picArrayDisplay: participantsData,
                    // rand: Math.random(),
                },
                () => {
                    console.log("[InvitationDetails] State: ", this.state);
                }
            );
        }
    };

    _rejectGoalAPI = async () => {
        console.log("_rejectGoalAPI==> ");
        this.setState({ loader: true });

        const { inviteData } = this.state;

        let subUrl = `/goal/participants/reject?goalId=${inviteData.id}`;
        let params = {};

        params = JSON.stringify({});

        rejectGoalAPI(subUrl, JSON.parse(params))
            .then((response) => {
                let responseObject = response.data;
                console.log(subUrl + " RESPONSE RECEIVED: ", response.data);
                if (
                    responseObject !== null &&
                    responseObject !== undefined &&
                    responseObject.message !== null &&
                    responseObject.message !== undefined &&
                    responseObject.message === "success"
                ) {
                    this.props.navigation.goBack();
                } else if (
                    responseObject !== null &&
                    responseObject !== undefined &&
                    responseObject.message !== null &&
                    responseObject.message !== undefined &&
                    responseObject.message === "failed"
                ) {
                    this.setState({ loader: false });
                } else {
                    this.setState({ loader: false });
                }
            })
            .catch((error) => {
                console.log(subUrl + "  ERROR==> ", error);
                this.setState({ loader: false });
            });
    };

    _onCloseRejectConfirmation = () => {
        this.setState({ showRejectConfirm: false });
    };

    _onPressJoin = () => {
        const { inviteData } = this.state;

        this.props.navigation.navigate("InvitationSummaryScreen", { inviteData });
    };

    renderWhosSaving() {
        console.log("renderWhosSaving");
        const { inviteData } = this.state;

        return (
            <View style={styles.whosSavingContainer}>
                <View style={styles.whosSavingTitleContainer}>
                    <Typo
                        fontSize={16}
                        lineHeight={18}
                        fontWeight="600"
                        textAlign="left"
                        text="Who's saving?"
                    />
                </View>
                <View style={styles.whosSavingListContainer}>
                    <FlatList
                        data={inviteData.participants}
                        showIndicator={false}
                        keyExtractor={(item, index) => `${item.contentId}-${index}`}
                        renderItem={({ item }) => this.renderWhosSavingItem(item)}
                    />
                </View>
            </View>
        );
    }

    renderWhosSavingItem(item) {
        return (
            <View style={styles.whosSavingItemContainer}>
                <BorderedAvatar width={44} height={44} borderRadius={22} backgroundColor={GREY}>
                    {item.imageUrl && item.imageUrl !== "" ? (
                        <View style={styles.avatarContainer}>
                            <Image style={styles.avatarImage} source={{ uri: item.imageUrl }} />
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

                <View style={styles.whosSavingInnerContainerLeft}>
                    <Typo
                        fontSize={14}
                        lineHeight={19}
                        textAlign="left"
                        text={item.participantName}
                        fontWeight={item.owner ? "600" : "normal"}
                    />
                </View>
                <View style={styles.whosSavingInnerContainerRight}>
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        textAlign="right"
                        text={
                            (Utility.numberWithCommas(item.amount).indexOf("RM") === -1
                                ? " RM"
                                : " ") + Utility.numberWithCommas(item.amount)
                        }
                    />
                </View>
            </View>
        );
    }

    render() {
        const { inviteData, dropDownView } = this.state;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showOverlay={dropDownView}
                    overlayType="gradient"
                    analyticScreenName={Strings.FA_TABUNG_INVITATION_VIEW}
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerRightElement={
                                    <HeaderCloseButton onPress={this._onPressClose} />
                                }
                            />
                        }
                        useSafeArea
                    >
                        {inviteData && (
                            <>
                                <ScrollView
                                    // style={{ paddingBottom: 100 }}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <View style={styles.container}>
                                        <View style={styles.headerContainer}>
                                            <View style={styles.titleContainer}>
                                                <Typo
                                                    fontSize={20}
                                                    fontWeight="600"
                                                    lineHeight={28}
                                                    text={inviteData.ownerDetails.name}
                                                />
                                                <Typo
                                                    fontSize={20}
                                                    fontWeight="300"
                                                    lineHeight={28}
                                                    text={` has invited you`}
                                                />
                                            </View>
                                            <Typo
                                                fontSize={20}
                                                fontWeight="300"
                                                lineHeight={28}
                                                text={`to join a Tabung!`}
                                            />
                                        </View>

                                        <View style={styles.rowListContainer}>
                                            <View style={styles.rowListItemLeftContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text="Name"
                                                />
                                            </View>
                                            <View style={styles.rowListItemRightContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={inviteData.name}
                                                />
                                            </View>
                                        </View>
                                        <View style={styles.rowListContainer}>
                                            <View style={styles.rowListItemLeftContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text="Target amount"
                                                />
                                            </View>
                                            <View style={styles.rowListItemRightContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={
                                                        "RM " +
                                                        numeral(inviteData.totalAmount).format(
                                                            "0,0.00"
                                                        )
                                                    }
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.rowListContainer}>
                                            <View style={styles.rowListItemLeftContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text="Start date"
                                                />
                                            </View>
                                            <View style={styles.rowListItemRightContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={inviteData.formattedStartDate}
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.rowListContainer}>
                                            <View style={styles.rowListItemLeftContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text="End date"
                                                />
                                            </View>

                                            <View style={styles.rowListItemRightContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={inviteData.formattedEndDate}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    {inviteData.participants &&
                                        inviteData.participants.length > 1 &&
                                        this.renderWhosSaving()}

                                    <View style={{ height: 50 }} />
                                </ScrollView>

                                <FixedActionContainer>
                                    <View style={{ flex: 1 }}>
                                        <ActionButton
                                            backgroundColor={WHITE}
                                            height={48}
                                            borderRadius={24}
                                            borderStyle="solid"
                                            borderWidth={1}
                                            borderColor={GREY}
                                            componentCenter={
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    text="Reject"
                                                />
                                            }
                                            onPress={this._onPressReject}
                                        />
                                    </View>
                                    <View style={styles.separatorContainer} />
                                    <View style={{ flex: 1 }}>
                                        <ActionButton
                                            backgroundColor={YELLOW}
                                            height={48}
                                            borderRadius={24}
                                            componentCenter={
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    text="Join"
                                                />
                                            }
                                            onPress={this._onPressJoin}
                                        />
                                    </View>
                                </FixedActionContainer>
                            </>
                        )}
                    </ScreenLayout>
                </ScreenContainer>
                {this.state.showRejectConfirm === true && (
                    <Popup
                        visible
                        title="Reject Invite"
                        description="Are you sure you want to reject the invite for this Tabung?"
                        onClose={this._onCloseRejectConfirmation}
                        primaryAction={{
                            text: "Yes",
                            onPress: this._onConfirmReject,
                        }}
                        secondaryAction={{
                            text: "Cancel",
                            onPress: this._onCloseRejectConfirmation,
                        }}
                    />
                )}
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    avatarContainer: {
        alignItems: "center",
        borderRadius: 20,
        height: 40,
        justifyContent: "center",
        overflow: "hidden",
        width: 40,
    },
    avatarImage: {
        borderRadius: 20,
        height: 40,
        resizeMode: "contain",
        width: 40,
    },
    container: {
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
        paddingHorizontal: 36,
    },
    headerContainer: {
        marginBottom: 35,
    },
    titleContainer: {
        marginTop: 16,
        marginHorizontal: 50,
        flexDirection: "row",
    },
    footerContainer: {
        bottom: 16,
        flexDirection: "row",
        height: 48,
        left: 24,
        position: "absolute",
        right: 24,
    },
    separatorContainer: {
        width: 16,
    },
    rowListContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    rowListItemLeftContainer: {
        flex: 0.4,
    },
    rowListItemRightContainer: {
        alignContent: "flex-end",
        alignItems: "flex-end",
        flex: 0.6,
    },
    whosSavingContainer: {
        marginTop: 36,
    },
    whosSavingTitleContainer: {
        paddingHorizontal: 36,
    },
    whosSavingListContainer: {
        marginTop: 20,
        overflow: "visible",
    },
    whosSavingItemContainer: {
        alignItems: "center",
        flexDirection: "row",
        height: 50,
        justifyContent: "center",
        marginBottom: 15,
        overflow: "visible",
        paddingHorizontal: 36,
    },
    whosSavingInnerContainerLeft: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        marginLeft: 14,
    },
    whosSavingInnerContainerRight: {
        alignItems: "flex-end",
        flexDirection: "column",
        justifyContent: "center",
    },
});

export default InvitationDetails;
