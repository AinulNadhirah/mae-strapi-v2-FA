import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { TouchableOpacity, Text, View, ScrollView, Image, StyleSheet } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { invokeL3 } from "@services";
import { bankingGetDataMayaM2u, accountInquiry } from "@services/index";

import {
    YELLOW,
    MEDIUM_GREY,
    WHITE,
    DARK_GREY,
    GREY,
    BLACK,
    DISABLED,
    DISABLED_TEXT,
} from "@constants/colors";
import { FA_TABUNG_INVITATION_ACCEPTINVITE_SUCCESSFUL, UNSAVED_CHANGES, UNSAVED_CHANGES_DEC } from "@constants/strings";

import * as Utility from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

import commonStyle from "@styles/main";

import assets from "@assets";

class Summary extends Component {
    static propTypes = {
        params: PropTypes.object,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        resetModel: PropTypes.func,
        navigation: PropTypes.object.isRequired,
        route: PropTypes.shape({
            params: PropTypes.string,
        }),
    };

    state = {
        accountList: null,
        error: false,
        errorTitle: "",
        errorMessage: "",
        account: "Select account",
        accountNo: "",
        dropDownView: false,
        showCloseModal: false,
        selectedIndex: 0,
        refreshing: false,
        inviteData: null,
        participantList: null,
        loading: true,
    };

    componentDidMount() {
        this._initInviteData();
        this._fetchUserAccountsList();

        // this.focusSubscription = this.props.navigation.addListener("focus", () => {
        //     console.log(" focusSubscription ");

        //     this._initInviteData();
        //     this._fetchUserAccountsList();
        // });
    }

    componentWillUnmount() {
        // this.focusSubscription();
        this._toggleDropDownView();
    }

    _initInviteData() {
        // const { getModel } = this.props;
        // const { profileImage, mobileNumber, mayaUserId } = getModel("user");

        this.setState(
            {
                inviteData: this.props.route.params.inviteData,
                participantList: this.props.route.params.inviteData.participants,
                refreshing: !this.state.refreshing,
            },
            () => {
                console.log("[Summary][_initInviteData] this.state:", this.state);
            }
        );
    }

    _onPressContinue = () => {
        console.log("[_onPressContinue] currentState:", this.state);

        const { inviteData, participantList, accountNo, selectedAccountData } = this.state;

        if (accountNo && accountNo !== "") {
            // Account has been selected
            this.props.navigation.navigate("InvitationConfirmationScreen", {
                inviteData,
                participantList,
                selectedAccountData,
            });
        } else {
            // No account was selected
            this.setState({
                error: true,
                errorMessage: "Please select an account to link this goal to.",
                errorTitle: "Link account",
            });
        }
    };

    inquire = async (val, index) => {
        // TODO: use snackbar to throw errors and figure out duplicating logic
        console.log("[Summary][inquire] function called!");
        console.log("[Summary][inquire] val", val);
        console.log("[Summary][inquire] index", index);

        await accountInquiry("/goal/account/inquiry?linkAcctNo=" + val.description)
            .then(async (response) => {
                console.log("[Summary][inquire] RES", response);
                const regObject = await response.data;
                console.log("[Summary][inquire] Object", regObject);

                if (regObject.code === 0) {
                    const { accountList, inviteData } = this.state;
                    // reset every account's "select" property to false
                    accountList.forEach((account, i) => (accountList[i].select = false));
                    // make selected account "select" property to true
                    accountList[index].select = true;

                    // let selectedAccountData = {
                    //     accountName: val.title,
                    //     accountType: val.type,
                    //     accountNo: val.description,
                    //     accountCode: val.acctCode,
                    //     // accountList: accountList,
                    // };

                    inviteData.accountName = val.title;
                    inviteData.accountType = val.type;
                    inviteData.accountNo = val.description;
                    inviteData.accountCode = val.code;
                    inviteData.accountList = accountList;

                    this.setState({
                        dropDownView: false,
                        account: val.title,
                        accountNo: val.description,
                        accountType: val.type,
                        accountGroup: val.group,
                        accountList, //updated accountList
                        inviteData, //updated inviteData
                    });
                } else if (regObject.code === 600) {
                    this.setState({
                        dropDownView: false,
                        account: "Select account",
                        accountNo: "",
                        error: true,
                        errorTitle: "Select Account",
                        errorMessage: regObject.message,
                        selectedAccountData: null,
                    });
                } else if (regObject.code === 700) {
                    // I'm not sure what this means?
                    this.setState({ dropDownView: false, account: "Select account" });

                    const ackData = {
                        created: "",
                        ref: "",
                        success: false,
                        message: regObject.message,
                    };

                    this.props.navigation.navigate("InvitationAcknowledgementScreen", {
                        inviteData: ackData,
                        isGoalCountError: true,
                    });
                } else {
                    this.setState({
                        dropDownView: false,
                        account: "Select account",
                        accountNo: "",
                        error: true,
                        errorTitle: "Select Account",
                        errorMessage: regObject.message,
                        selectedAccountData: null,
                    });
                }
            })
            .catch((err) => {
                console.log("[Summary][inquire] Error", err);
                if (err.status === 400) {
                    if (err.error.code === 600) {
                        this.setState({
                            dropDownView: false,
                            account: "Select account",
                            accountNo: "",
                            error: true,
                            errorTitle: "Select Account",
                            errorMessage: err.message ?? err.error.message,
                            selectedAccountData: null,
                        });
                    } else if (err.error.code === 700) {
                        this.setState({ dropDownView: false, account: "Select account" });

                        const ackData = {
                            created: "",
                            ref: "",
                            success: false,
                            message: err.message ?? err.error.message,
                            selectedAccountData: null,
                        };

                        this.props.navigation.navigate("InvitationAcknowledgementScreen", {
                            inviteData: ackData,
                            isGoalCountError: true,
                        });
                    }
                } else {
                    this.setState({
                        dropDownView: false,
                        account: "Select account",
                        accountNo: "",
                        selectedAccountData: null,
                    });

                    showErrorToast({
                        message:
                            "Your request couldn't be completed at this time. Please try again later.",
                    });
                }
            });

        console.log("[Summary][inquire] function end");
    };

    _requestL3Permission = async () => {
        try {
            const response = await invokeL3(false);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _fetchUserAccountsList = async () => {
        const request = await this._requestL3Permission();
        if (!request) {
            this.props.navigation.goBack();
            return;
        }

        const subUrl = "/summary";
        const params = "?type=A";

        bankingGetDataMayaM2u(subUrl + params, true)
            .then((response) => {
                const result = response.data.result;
                console.log(
                    "[Summary][_fetchUserAccountsList] /summary with param: " + params + " ==> "
                );
                if (result != null) {
                    console.log(result);
                    const newAccountList = [];

                    result.accountListings.map((account) => {
                        const accountDescription = account.number.substring(0, 12);

                        account.title = account.name;
                        account.name =
                            account.name + "\n" + Utility.formateAccountNumber(account.number, 12);
                        account.description = account.number;
                        account.descriptionMasked = accountDescription;

                        newAccountList.push(account);
                    });

                    console.log("[Summary][_fetchUserAccountList] newAccountList:", newAccountList);
                    this.setState({ accountList: newAccountList, loading: false });
                } else {
                    console.log("[Summary][_fetchUserAccountList] No results!");
                    this.props.navigation.goBack();
                }
            })
            .catch((Error) => {
                console.log("[Summary][_fetchUserAccountList] ERROR: ", Error);
                this.props.navigation.goBack();
            });
    };

    _toggleDropDownView = () => {
        this.setState({ dropDownView: !this.state.dropDownView });
    };

    _toggleCloseModal = () => {
        this.setState({ showCloseModal: !this.state.showCloseModal });
    };

    _onClosePress = () => {
        this.setState({ showCloseModal: true });
    };

    _onPressDoneScrollPickerView = (val, index) => {
        // console.log("[Summary][_onPressDoneScrollPickerView] val");
        // console.log("[Summary][_onPressDoneScrollPickerView] index");

        this.inquire(val, index);

        this.setState({ dropDownView: false, selectedIndex: index });
    };

    _onPressCloseScrollPickerView = () => {
        console.log("_onPressCloseScrollPickerView");

        this.setState({
            dropDownView: false,
        });
    };

    _onPressTncLink = () => {
        const params = {
            file: "https://www.maybank2u.com.my/iwov-resources/pdf/upload/maeapp/MAEApp_Terms&Conditions_202009.pdf",
            share: false,
            type: "url",
            title: "Terms & Conditions",
            pdfType: "shareReceipt",
        };

        this.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
            screen: navigationConstant.PDF_VIEW,
            params: { params },
        });
    };

    _cancelTabung = () => {
        this.setState({ showCloseModal: false }, () => {
            this.props.navigation.navigate("Dashboard", {
                screen: "TabungTab",
            });
        });
    };

    _renderTnC() {
        return (
            <View style={styles.tncContainer}>
                <TouchableOpacity onPress={this._onPressTncLink}>
                    <Text style={[styles.tncText, commonStyle.font]}>
                        {"By clicking 'Continue', I confirm that I agree to the Tabung "}
                        <Text
                            style={[
                                styles.tncText,
                                { textDecorationLine: "underline" },
                                commonStyle.font,
                            ]}
                            accessible={true}
                        >
                            Terms & Conditions
                        </Text>
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    _renderMaeTips() {
        return (
            <View style={styles.maeTipsContainer}>
                <Text style={[styles.maeTipsText, { fontWeight: "600" }]}>
                    {"Tip: "}
                    <Text style={styles.maeTipsText}>
                        Choose either a savings or current account, so you can earn interest when
                        you save with us. Don't have one? Open a Maybank2u.Premier account now.
                    </Text>
                </Text>
            </View>
        );
    }

    _renderLinkAccountSection() {
        const { account, accountNo, accountType, accountGroup } = this.state;

        return (
            <View>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    textAlign="left"
                    text="Link this goal to your account"
                />
                <View style={styles.descriptionContainer}>
                    <Typo
                        fontSize={14}
                        lineHeight={20}
                        textAlign="left"
                        text="Just so we know where to transfer your funds to, for when your goal is closed or completed. "
                    />
                </View>

                {accountType === "D" &&
                    (accountGroup === "0YD" || accountGroup === "CCD") &&
                    this._renderMaeTips()}

                <View style={styles.dateView1}>
                    <ActionButton
                        fullWidth
                        height={48}
                        borderWidth={1}
                        borderStyle="solid"
                        borderRadius={24}
                        backgroundColor={WHITE}
                        borderColor="#cfcfcf"
                        componentLeft={
                            <View style={{ marginLeft: 24 }}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={account}
                                    textAlign="left"
                                />
                                {accountNo !== "" && (
                                    <Typo
                                        fontSize={12}
                                        lineHeight={18}
                                        color={DARK_GREY}
                                        text={Utility.formateAccountNumber(accountNo, 12)}
                                        textAlign="left"
                                    />
                                )}
                            </View>
                        }
                        componentRight={
                            <Image source={assets.downArrow} style={styles.dropDownArrowImage} />
                        }
                        onPress={this._toggleDropDownView}
                    />
                </View>

                {this._renderTnC()}
            </View>
        );
    }

    _renderOverlappingPictures(participantList) {
        //picArrayDisplay
        console.log("[_renderOverlappingPictures]", participantList);
        return <View style={styles.avatarContainer}>{this._renderAvatars(participantList)}</View>;
    }

    _dismissErrorPopup = () => {
        this.setState({ error: false, errorMessage: "", errorTitle: "" });
    };

    _renderAvatars(avatarsData) {
        console.log("rendering avatar: ", avatarsData);
        return avatarsData.map((item, index) => {
            if (item.participantName !== "+") {
                // if name isn't "+", turn name into initials instead
                let name = "";
                if (item.participantName == "You") {
                    const { getModel } = this.props;
                    const { fullName } = getModel("user");
                    name = fullName;
                } else {
                    name = item.participantName;
                }

                const initials = name.match(/\b\w/g) || [];
                item.initials = ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();
                if (item.initials.length == 1) {
                    item.initials = name.substring(0, 2).toUpperCase();
                }
                console.log(initials);
            }

            return (
                <View
                    style={
                        index == 0
                            ? pictureStyles.container
                            : [pictureStyles.container, { right: this._getRightPos(index) }] //if 2nd item onwards, have different right pos to overlap
                    }
                    key={`${item.name}-${index}`}
                >
                    <BorderedAvatar backgroundColor={item.initials.startsWith("+") ? YELLOW : GREY}>
                        {item.participantPic && item.participantPic !== ""
? (
                            <Image
                                style={pictureStyles.image}
                                source={{ uri: item.participantPic }}
                            />
                        )
: (
                            <Typo
                                style={pictureStyles.text}
                                fontSize={item.initials === "+" ? 24 : 12}
                                lineHeight={item.initials === "+" ? 26 : 14}
                                text={item.initials}
                                textAlign="center"
                            />
                        )}
                    </BorderedAvatar>
                </View>
            );
        });
    }

    _getRightPos = (index) => {
        switch (index) {
            case 1:
                return 29;
            case 2:
                return 58;
            case 3:
                return 87;
            case 4:
                return 116;
            default:
                return 0;
        }
    };

    render() {
        const {
            dropDownView,
            showCloseModal,
            inviteData,
            selectedIndex,
            accountList,
            participantList,
            loading,
            accountNo,
            error,
            errorTitle,
            errorMessage,
        } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showLoaderModal={loading}
                    analyticScreenName={FA_TABUNG_INVITATION_ACCEPTINVITE_SUCCESSFUL}
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    <HeaderBackButton onPress={this._onClosePress} />
                                }
                                headerRightElement={
                                    <HeaderCloseButton onPress={this._onClosePress} />
                                }
                            />
                        }
                        useSafeArea
                    >
                        <>
                            <ScrollView style={styles.svContainer}>
                                {inviteData && (
                                    <View style={styles.parentContainer}>
                                        <View style={styles.container}>
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

                                        <View style={styles.rowListContainer}>
                                            <View style={styles.rowListItemLeftContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text="Who's saving?"
                                                />
                                            </View>
                                            <View style={styles.rowListItemRightContainer}>
                                                {this._renderOverlappingPictures(participantList)}
                                            </View>
                                        </View>

                                        <View style={styles.line} />

                                        {this._renderLinkAccountSection()}
                                    </View>
                                )}
                            </ScrollView>

                            <FixedActionContainer>
                                <ActionButton
                                    height={48}
                                    fullWidth
                                    backgroundColor={accountNo == "" ? DISABLED : YELLOW}
                                    borderRadius={24}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            text="Continue"
                                            color={accountNo == "" ? DISABLED_TEXT : BLACK}
                                        />
                                    }
                                    onPress={this._onPressContinue}
                                    disabled={accountNo == ""}
                                />
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                </ScreenContainer>

                {accountList && (
                    <ScrollPickerView
                        expandedMode
                        showMenu={dropDownView}
                        list={accountList}
                        selectedIndex={selectedIndex}
                        onRightButtonPress={(val, index) =>
                            this._onPressDoneScrollPickerView(val, index)
                        }
                        onLeftButtonPress={this._onPressCloseScrollPickerView}
                        rightButtonText="Done"
                        leftButtonText="Cancel"
                    />
                )}

                {error && (
                    <Popup
                        visible={true}
                        onClose={this._dismissErrorPopup}
                        title={errorTitle}
                        description={errorMessage}
                        primaryAction={{
                            text: "Ok",
                            onPress: this._dismissErrorPopup,
                        }}
                    />
                )}

                {showCloseModal === true && (
                    <Popup
                        visible
                        onClose={this._toggleCloseModal}
                        title={UNSAVED_CHANGES}
                        description={UNSAVED_CHANGES_DEC}
                        primaryAction={{
                            text: "Discard",
                            onPress: this._cancelTabung,
                        }}
                        secondaryAction={{
                            text: "Cancel",
                            onPress: this._toggleCloseModal,
                        }}
                    />
                )}
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    avatarContainer: { width: 170, height: 36, marginRight: 2 },
    container: {
        marginTop: 10,
    },
    svContainer: { flex: 1 },
    dropDownArrowImage: {
        width: 15,
        height: 8,
        marginRight: 20,
        resizeMode: "contain",
    },
    rowListContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
    },
    rowListItemLeftContainer: {
        flex: 0.4,
    },
    rowListItemRightContainer: {
        flex: 0.6,
        alignItems: "flex-end",
        alignContent: "flex-end",
    },
    titleContainer: {
        justifyContent: "flex-start",
        width: "100%",
    },
    dateView1: {
        justifyContent: "center",
        flexDirection: "row",
        marginTop: 16,
    },
    dateViewInnerBig: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        width: 260,
    },
    descriptionContainer: {
        marginTop: 5,
    },
    tncContainer: {
        marginTop: 20,
        flexDirection: "column",
        width: "100%",
        paddingBottom: 120,
    },
    maeTipsContainer: {
        marginTop: 16,
        marginBottom: 2,
        flexDirection: "column",
    },
    line: {
        marginVertical: 24,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: GREY,
    },
    tncText: {
        fontFamily: "Montserrat",
        fontSize: 12,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 18,
        letterSpacing: 0,
        color: DARK_GREY,
    },
    maeTipsText: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: BLACK,
    },
    parentContainer: { paddingHorizontal: 36 },
});

const pictureStyles = StyleSheet.create({
    container: {
        position: "absolute",
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: YELLOW,
        borderStyle: "solid",
        borderWidth: 2,
        borderColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
    },
    image: {
        borderRadius: 16,
        height: 32,
        resizeMode: "contain",
        width: 32,
    },
    text: { marginLeft: 2, marginTop: 2 },
});

export default withModelContext(Summary);
