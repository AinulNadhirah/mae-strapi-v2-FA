import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component, useCallback } from "react";
import { TouchableOpacity, View, ScrollView, Image, StyleSheet, FlatList } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import {
    YELLOW,
    MEDIUM_GREY,
    LIGHT_GREY,
    WHITE,
    GREY,
    BLACK,
    DARK_GREY,
    ROYAL_BLUE,
} from "@constants/colors";
import { FA_TABUNG_MANAGETABUNG_CONFIRMMEMBERS } from "@constants/strings";

const EditAmountButton = ({ item, index, onPress }) => {
    const onPressButton = useCallback(() => onPress(item, index), [index, item, onPress]);

    return (
        <TouchableOpacity onPress={onPressButton}>
            <Typo
                fontSize={12}
                lineHeight={18}
                color={ROYAL_BLUE}
                text={"RM " + numeral(item.amount).format("0,0.00")}
                textAlign="left"
                fontWeight="600"
            />
        </TouchableOpacity>
    );
};

EditAmountButton.propTypes = {
    item: PropTypes.object,
    index: PropTypes.number,
    onPress: PropTypes.func,
};
class ParticipantsSummary extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            addListener: PropTypes.func,
            navigate: PropTypes.func,
            pop: PropTypes.func,
        }),
        resetModel: PropTypes.func,
        route: PropTypes.shape({
            params: PropTypes.string,
        }),
        updateModel: PropTypes.func,
    };

    state = {
        // List of selected contacts, passed via params from select contacts screen (AddFriends.js)
        selectedContact: this.props.route.params?.selectedContact ?? [],
        selectedContactKeys: this.props.route.params?.selectedContactKeys ?? [],
        refreshing: false,
        fullContactsList: [],
        error: false,
        errorTitle: "",
        errorMessage: "",
    };

    componentDidMount() {
        console.log("[ParticipantsSummary] >> [componentDidMount]");
        this.props.navigation.addListener("focus", this.onScreenFocus);
    }

    _onBackPress = () => {
        // this.props.navigation.goBack();
        const { selectedContact, selectedContactKeys } = this.state;

        this.props.navigation.navigate("CreateGoalsAddFriendsScreen", {
            selectedContact,
            selectedContactKeys,
        });
    };

    _onClosePress = () => {
        this.props.navigation.pop(2);
    };

    onScreenFocus = () => {
        console.log(
            "[ParticipantsSummary] >> [onScreenFocus] with params",
            this.props.route.params
        );

        const params = this.props.route?.params ?? "";
        if (!params) return;

        const { participantIndex, newAmount, selectedContact } = params;

        if (participantIndex >= 0 && newAmount) {
            const contactsList = [...this.state.fullContactsList];
            contactsList[participantIndex].amount = newAmount;

            // TODO: recalculate target goal amount
            const { goalData } = this.state;
            // goalData.goalAmount = contactsList.reduce((sum, item) => sum + item.amount, 0);

            this.setState({
                fullContactsList: contactsList,
                goalData: {
                    ...goalData,
                    goalAmount: contactsList.reduce((sum, item) => sum + item.amount, 0),
                },
                refreshing: !this.state.refreshing,
            });
        } else {
            if (selectedContact) {
                console.log("selectedContact", selectedContact);

                this.setState({
                    selectedContact,
                    fullContactsList: [],
                    refreshing: !this.state.refreshing,
                });

                this._getGoalDataFromContext();
            }
        }
    };

    _getGoalDataFromContext = () => {
        const { getModel } = this.props;
        const { goalData } = getModel("goals");

        this.setState({ goalData }, () => {
            console.log("[_getGoalDataFromContext]");
            this._setupFullContactsList();
        });
    };

    _updateGoalDataContext = async (goalData, callback) => {
        const { updateModel } = this.props;

        this.setState({ goalData }, async () => {
            await updateModel({
                goals: {
                    goalData,
                },
            });

            callback();
            console.log("[_updateGoalDataContext] updated goalData state", this.state.goalData);
        });
    };

    _setupFullContactsList = () => {
        const { goalData, selectedContact } = this.state;

        this.setState({ fullContactsList: [] }, () => {
            // Calculate amount for each person
            // console.log("[_setupFullContactsList] ", goalData.goalAmount);

            const money = goalData.goalAmount;
            const piles = selectedContact.length + 1;

            let participantContribution = Math.floor((money / piles) * 100) / 100;
            let selfContribution = money - participantContribution * (piles - 1);
            selfContribution = parseFloat(selfContribution.toFixed(2));

            // Create new contact list with amount (newList)
            let newList = selectedContact.slice();

            const found = newList.some((contact) => contact.name === "You");
            if (!found) {
                const { getModel } = this.props;
                const { mayaUserId, profileImage, mobileNumber } = getModel("user");

                let self = {
                    mayaUserName: "You",
                    name: "You",
                    profilePicUrl: profileImage,
                    mayaUserId: mayaUserId,
                    phoneNumber: mobileNumber,
                };

                newList.splice(0, 0, self);
            }

            console.log("[_setupFullContactsList] newlist 1", newList);

            // Iterate through array to attach amount property to each contact
            newList = newList.map((data, index) => ({
                ...data,
                amount: index == 0 ? selfContribution : participantContribution,
                mayaUserId: parseInt(data.mayaUserId),
            }));

            this.setState({ fullContactsList: newList, refreshing: !this.state.refreshing }, () =>
                console.log("[_setupFullContactsList] state", this.state)
            );
        });
    };

    _removeContact(index) {
        const { selectedContact, selectedContactKeys, refreshing } = this.state;

        selectedContact.splice(index, 1);
        selectedContactKeys.splice(index, 1);

        this.setState(
            {
                selectedContact,
                selectedContactKeys,
                refreshing: !refreshing,
            },
            () => this._setupFullContactsList()
        );
    }

    _onAddMorePress = () => {
        this._onBackPress();
    };

    _onContinuePress = () => {
        const { selectedContact, selectedContactKeys, fullContactsList, goalData } = this.state;

        // goalData.selectedContact = selectedContact;
        // goalData.selectedContactKeys = selectedContactKeys;
        // goalData.fullContactsList = fullContactsList;

        // // Calculate new goalAmount
        // goalData.goalAmount = fullContactsList.reduce((sum, item) => sum + item.amount, 0);
        // goalData.youAmount = fullContactsList[0].amount;

        const goalAmount = fullContactsList.reduce((sum, item) => sum + item.amount, 0);

        if (goalAmount <= 999999.99) {
            this._updateGoalDataContext(
                {
                    ...goalData,
                    selectedContact,
                    selectedContactKeys,
                    fullContactsList,
                    goalAmount: fullContactsList.reduce((sum, item) => sum + item.amount, 0),
                    youAmount: fullContactsList[0].amount,
                },
                () => {
                    this.props.navigation.navigate("CreatGoalsSummaryScreen", { recalc: false });
                }
            );
        } else {
            // show error
            this.setState({
                error: true,
                errorMessage: "Maximum goal target amount is\nRM 999,999.99",
                errorTitle: "Goal Amount",
            });
        }
    };

    onPopupClosePress = () => {
        this.setState({
            error: false,
            errorTitle: "",
            errorMessage: "",
        });
    };

    renderContactsList() {
        const { fullContactsList } = this.state;

        console.log("[ParticipantsSummary][renderContactsList] fullContactsList", fullContactsList);

        return (
            <View style={{ overflow: "visible" }}>
                {/* {this.renderContactItem({ item: selfContact, index: 0 })} */}
                <FlatList
                    data={fullContactsList}
                    refreshing={this.state.refreshing}
                    scrollEnabled={false}
                    // ref={ref => { this.newsFeedListRef = ref; }}
                    renderItem={this.renderContactItem}
                    keyExtractor={this.keyExtractor}
                    onPress={this._onContactPressed}
                />
            </View>
        );
    }

    keyExtractor = (item, index) => `item_${index}`;

    _onContactPressed = (item, index) => {
        console.log("_onContactPressed!");
        this.props.navigation.navigate("CreateGoalsEditParticipantAmountScreen", {
            participantName: item.mayaUserName,
            participantAmount: item.amount,
            participantIndex: index,
        });
    };

    renderContactItem = ({ item, index }) => {
        console.log("[ParticipantsSummary][renderContactItem] contact", item);

        if (item.name !== "+") {
            // if name isn't "+", turn name into initials instead
            let name = "";
            if (item.name == "You") {
                const { getModel } = this.props;
                const { fullName } = getModel("user");
                name = fullName;
            } else {
                name = item.mayaUserName;
            }
            const initials = name.match(/\b\w/g) || [];
            item.initials = ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();
            if (item.initials.length == 1) {
                item.initials = name.substring(0, 2).toUpperCase();
            }
            console.log(name);
        }

        return (
            <View style={{ paddingHorizontal: 24 }}>
                <View style={contactItemStyles.container}>
                    <BorderedAvatar width={64} height={64} borderRadius={32} backgroundColor={GREY}>
                        <View style={contactItemStyles.imageContainer}>
                            {item.profilePicUrl ? (
                                <Image
                                    style={contactItemStyles.imageFull}
                                    source={{ uri: item.profilePicUrl }}
                                />
                            ) : (
                                <Typo
                                    style={contactItemStyles.initialsContainer}
                                    fontSize={24}
                                    fontWeight="300"
                                    lineHeight={29}
                                    text={item.initials}
                                    textAlign="center"
                                    color={DARK_GREY}
                                />
                            )}
                        </View>
                    </BorderedAvatar>
                    <View style={contactItemStyles.textContainer}>
                        <Typo
                            fontSize={14}
                            lineHeight={18}
                            fontWeight="600"
                            text={item.mayaUserName}
                            textAlign="left"
                        />
                        <EditAmountButton
                            item={item}
                            index={index}
                            onPress={this._onContactPressed}
                        />
                    </View>
                    <View>
                        {item.name != "You" && (
                            <HeaderCloseButton onPress={() => this._removeContact(index - 1)} />
                        )}
                    </View>
                </View>
                <View style={contactItemStyles.line} />
            </View>
        );
    };

    render() {
        const { goalData, fullContactsList, error, errorTitle, errorMessage } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showErrorModal={error}
                    errorTitle={errorTitle}
                    errorMessage={errorMessage}
                    analyticScreenName={FA_TABUNG_MANAGETABUNG_CONFIRMMEMBERS}
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                                headerRightElement={
                                    <HeaderCloseButton onPress={this._onClosePress} />
                                }
                            />
                        }
                        useSafeArea
                        // neverForceInset={["bottom", "left", "right"]}
                    >
                        <ScrollView style={styles.scrollViewContainer}>
                            {goalData && (
                                <>
                                    <View style={styles.headerContainer}>
                                        <View style={styles.titleContainer}>
                                            <Typo
                                                lineHeight={18}
                                                fontSize={14}
                                                fontWeight="600"
                                                text={goalData ? goalData.goalName : "Tabung"}
                                                textAlign="left"
                                            />
                                        </View>
                                        <View style={styles.descContainer}>
                                            <Typo
                                                text="You can add up to 4 friends"
                                                textAlign="left"
                                                lineHeight={28}
                                                fontSize={20}
                                                fontWeight="300"
                                            />
                                            <View style={styles.descSubContainer}>
                                                <Typo
                                                    text="Tabung amount is "
                                                    textAlign="left"
                                                    lineHeight={28}
                                                    fontSize={14}
                                                />
                                                <Typo
                                                    text={
                                                        "RM " +
                                                        numeral(goalData.goalAmount).format(
                                                            "0,0.00"
                                                        )
                                                    }
                                                    textAlign="left"
                                                    lineHeight={28}
                                                    fontSize={14}
                                                    fontWeight="600"
                                                />
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.participantListContainer}>
                                        {fullContactsList && this.renderContactsList()}
                                    </View>
                                </>
                            )}
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
                                    disabled={fullContactsList.length === 5 ? true : false}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            text="Add More"
                                            color={
                                                fullContactsList.length === 5 ? LIGHT_GREY : BLACK
                                            }
                                        />
                                    }
                                    onPress={this._onBackPress}
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
                                            text="Continue"
                                        />
                                    }
                                    onPress={this._onContinuePress}
                                />
                            </View>
                        </FixedActionContainer>
                    </ScreenLayout>
                </ScreenContainer>
                <Popup
                    visible={this.state.error}
                    title={this.state.errorTitle}
                    description={this.state.errorMessage}
                    onClose={this.onPopupClosePress}
                    primaryAction={{
                        text: "Ok",
                        onPress: this.onPopupClosePress,
                    }}
                />
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    descContainer: {
        marginTop: 8,
    },
    descSubContainer: { flexDirection: "row" },
    headerContainer: { marginHorizontal: 24 },
    participantListContainer: { marginTop: 40, overflow: "visible" },
    scrollViewContainer: {
        flex: 1,
    },
    separatorContainer: {
        width: 16,
    },
    titleContainer: { marginTop: 30 },
});

const contactItemStyles = StyleSheet.create({
    container: {
        alignItems: "center",
        flexDirection: "row",
        height: 96,
        overflow: "visible",
        paddingLeft: 2,
        paddingRight: 20,
    },
    imageContainer: {
        alignItems: "center",
        borderRadius: 30,
        height: 60,
        justifyContent: "center",
        overflow: "hidden",
        width: 60,
    },
    imageFull: {
        height: "100%",
        resizeMode: "contain",
        width: "100%",
    },
    initialsContainer: { marginLeft: 1, marginTop: 1, width: 60 },
    line: {
        backgroundColor: GREY,
        height: 1,
        width: "100%",
    },
    textContainer: { flex: 1, marginHorizontal: 18 },
});

export default withModelContext(ParticipantsSummary);
