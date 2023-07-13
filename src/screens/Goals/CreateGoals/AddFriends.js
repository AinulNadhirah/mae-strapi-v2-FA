import PropTypes from "prop-types";
import React, { Component } from "react";
import { View } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderRefreshButton from "@components/Buttons/HeaderRefreshButton";
import ContactPicker from "@components/ContactPicker";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { MEDIUM_GREY } from "@constants/colors";
import { FA_TABUNG_MANAGETABUNG_ADDCONTACT } from "@constants/strings";

import * as Utility from "@utils/dataModel/utility";

class AddFriends extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            addListener: PropTypes.func,
            goBack: PropTypes.func,
            navigate: PropTypes.func,
        }),
        resetModel: PropTypes.func,
        route: PropTypes.shape({
            params: PropTypes.shape({
                selectContactCount: PropTypes.number,
                selectedContact: PropTypes.array,
                selectedContactKeys: PropTypes.array,
            }),
        }),
        updateModel: PropTypes.func,
    };

    state = {
        // Contact list - add participant related
        maxContactCount: 4,
        selectContactCount: this.props.route.params?.selectContactCount ?? 0,
        selectedContact: this.props.route.params?.selectedContact ?? [],
        selectedContactKeys: this.props.route.params?.selectedContactKeys ?? [],
        callSync: false,
        mobileNumber: null,
    };

    componentDidMount() {
        console.log("[AddFriends] >> [componentDidMount]");
        // Fetch details of logged in user
        this.retrieveLoggedInUserDetails();

        // Screen Focus
        this.props.navigation.addListener("focus", this.onScreenFocus);
    }

    retrieveLoggedInUserDetails = () => {
        console.log("[AddFriends] >> [retrieveLoggedInUserDetails]");

        const { getModel } = this.props;
        const { mobileNumber } = getModel("user");
        const userMayaFormatNum = Utility.convertMayaMobileFormat(mobileNumber);

        this.setState({
            mobileNumber: userMayaFormatNum,
        });
    };

    _onBackPress = () => {
        this.props.navigation.goBack();
    };

    _onRefreshPress = () => {
        // Refresh contact list
        this.onSync();
    };

    onScreenFocus = () => {
        console.log("[AddFriends] >> [onScreenFocus]");

        const { getModel } = this.props;
        const { goalData } = getModel("goals");

        // const params = this.props.route?.params ?? "";
        if (this.props.route.params) {
            console.log("params were passed", this.props.route.params);
            const { selectedContact, selectedContactKeys } = this.props.route.params;
            this.setState({
                selectedContact,
                selectedContactKeys,
            });
        } else {
            console.log("params were NOT passed", goalData);
            this.setState({
                selectedContact: goalData?.selectedContact ?? [],
                selectedContactKeys: goalData?.selectedContactKeys ?? [],
            });
        }

        // Refresh contact list
        this.onSync();
    };

    onSync = () => {
        console.log("[AddFriends] >> [onSync]");

        // Update callSync state to initiate contact sync call
        this.setState({ callSync: true }, () => {
            this.setState({ callSync: false });
        });
    };

    onContactSelected = (contact) => {
        const { maxContactCount } = this.state;

        const selectedContact = [...this.state.selectedContact];
        const selectedContactKeys = [...this.state.selectedContactKeys];

        const uniqueKey = contact.phoneNumber;
        const elementIndex = selectedContactKeys.indexOf(uniqueKey);

        if (elementIndex == -1) {
            // Select Contact

            // Avoid selection after max limit
            if (selectedContact.length === maxContactCount) {
                return;
            }

            selectedContact.push(contact);
            selectedContactKeys.push(uniqueKey);
        } else {
            // Deselect Contact

            selectedContact.splice(elementIndex, 1);
            selectedContactKeys.splice(elementIndex, 1);
        }

        this.setState({
            selectedContact,
            selectedContactKeys,
        });
    };

    onContactDone = () => {
        const { selectedContact, selectedContactKeys } = this.state;

        this.props.navigation.navigate("CreateGoalsParticipantsSummaryScreen", {
            selectedContact,
            selectedContactKeys,
        });
    };

    // TODO: LATER ON... CHECK IF EACH CONTACT SELECTED HAS LESS THAN 10 GOALS OR NOT
    // validateParticipents = async SELECTED_CONTACT => {
    // 	let participentsList = [];
    // 	for (let i = 0; i < SELECTED_CONTACT.length; i++) {
    // 		let object = {};
    // 		let phoneNumbers = SELECTED_CONTACT[i].phoneNumbers;
    // 		let givenName = SELECTED_CONTACT[i].givenName;
    // 		object.hpNo = phoneNumbers[0].number;
    // 		object.name = givenName.indexOf("+") === -1 && givenName.indexOf("-") === -1 ? givenName : "#";
    // 		participentsList.push(object);
    // 	}

    // 	await goalValidateParticipants("/goal/validateParticipants", JSON.stringify(participentsList))
    // 		.then(async response => {
    // 			console.log("RES", response);
    // 			const regObject = await response.data;
    // 			console.log("Object", regObject);
    // 			for (let i = 0; i < SELECTED_CONTACT.length; i++) {
    // 				SELECTED_CONTACT[i].valid = false;
    // 			}
    // 		})
    // 		.catch(err => {
    // 			console.log("ERR", err);
    // 		});

    // 	return SELECTED_CONTACT;
    // };

    render() {
        const { selectedContact, mobileNumber, callSync } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    analyticScreenName={FA_TABUNG_MANAGETABUNG_ADDCONTACT}
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                                headerCenterElement={
                                    <Typo
                                        text="Add Friends"
                                        fontWeight="600"
                                        fontSize={16}
                                        lineHeight={19}
                                    />
                                }
                                headerRightElement={
                                    <HeaderRefreshButton onPress={this._onRefreshPress} />
                                }
                            />
                        }
                        useSafeArea
                        // neverForceInset={["bottom", "left", "right"]}
                    >
                        <View style={{ flex: 1 }}>
                            {mobileNumber && (
                                <ContactPicker
                                    buttonLabel={"Add"}
                                    hideHeader={true}
                                    selectedContact={selectedContact}
                                    bottomInfo={`${selectedContact.length}/4 friends selected`}
                                    onSelect={this.onContactSelected}
                                    onDoneEvent={this.onContactDone}
                                    callSync={callSync}
                                    userMobileNumber={mobileNumber}
                                    filter="maya"
                                />
                            )}
                        </View>
                    </ScreenLayout>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}

export default withModelContext(AddFriends);
