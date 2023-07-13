import * as React from "react";
import { View, ScrollView, RefreshControl, Text, ImageBackground } from "react-native";
import { ErrorMessage, HeaderPageIndicator } from "@components/Common";
import Styles from "@styles/Wallet/KilaEkspress";
import { DropDownButtonNoIcon } from "@components/Common";
import * as Strings from "@constants/strings";
import * as navigationConstant from "@navigation/navigationConstant";
import * as ModelClass from "@utils/dataModel/modelClass";
import NavigationService from "@navigation/navigationService";
import PlaceLostSelectionList from "@components/Others/PlaceLostSelectionList";
import { goalExistInquiry } from "@services/index";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import Typo from "@components/Text";
import { OFF_WHITE } from "@constants/colors";

export default class ToPlaceScreen extends React.Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            rand: 10,
            showQuickActions: false,
            showMenu: false,
            error: false,
            errorMessage: "",
            errorTitle: "",
            overlayType: "solid",
            showSnackBar: false,
            scrollend: false,
            refreshing: false,
            placeList: ModelClass.KLIA_DATA.fromKlSentral
                ? ModelClass.KLIA_DATA.stationsListKlia
                : ModelClass.KLIA_DATA.stationsKlSenter,
            snackBarText: "Changes Saved",
        };

        this.onOpenBillsMenuClick = this._onOpenBillsMenuClick.bind(this);
        this.closeMenu = this._closeMenu.bind(this);
        this.onSelectPlaceItemClick = this._onSelectPlaceItemClick.bind(this);
    }

    async componentDidMount() {
        console.log("ModelClass.KLIA_DATA.fromKlSentral ==> ", ModelClass.KLIA_DATA.fromKlSentral);
        console.log("placeList ==> ", this.state.placeList);

        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({
            index: 0,
            rand: Math.random(),
            routes: [
                { key: "1", title: Strings.TICKETS },
                { key: "2", title: Strings.PAST },
            ],
        });

        this.focusSubscription = this.props.navigation.addListener("focus", () => {});
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    _updateDataInScreenAlways = async () => {};

    _onOpenBillsMenuClick = async () => {};

    _onSelectPlaceItemClick = (item) => {
        console.log("Selected code ==> ", item.code);
        ModelClass.KLIA_DATA.selectedToStation = item;
        ModelClass.KLIA_DATA.selectedToStationCode = item.code;
        ModelClass.KLIA_DATA.selectedToStationName = item.name;
        NavigationService.navigate("SelectTravelDateScreen");
    };

    _closeMenu = () => {
        this.setState({ showMenu: false });
    };

    onBackPress = () => {
        NavigationService.navigate("FromPlaceScreen");
    };

    _onQuickActionsButtonPressed = () => {
        this.setState({
            showQuickActions: true,
            overlayType: "gradient",
        });
    };

    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    };

    _refresh = () => {
        console.log("pull to refresh");

        this.setState({ loader: true, refreshing: true });
        //this._getReceivedMoneyList();
    };

    render() {
        const { navigation } = this.props;
        const { showOverlay, showErrorModal, errorMessage, index } = this.state;

        return (
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
                backgroundColor={OFF_WHITE}
            >
                <ScreenLayout
                    useSafeArea
                    header={
                        <HeaderPageIndicator
                            showBack={true}
                            showClose={true}
                            showIndicator={false}
                            showTitle={true}
                            showTitleCenter={true}
                            showBackIndicator={false}
                            pageTitle={Strings.STEP2OF4}
                            numberOfPages={0}
                            currentPage={0}
                            onBackPress={this.onBackPress}
                            navigation={navigation}
                            moduleName={navigationConstant.KLIA_EKSPRESS_STACK}
                            routeName={navigationConstant.KLIA_EKSPRESS_DASHBOARD}
                            testID={"header"}
                            accessibilityLabel={"header"}
                            titleFontSize={12}
                            titleFontColor={"#7c7c7d"}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <View style={Styles.containerInner}>
                        <View style={Styles.containerTitle}>
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={28}
                            >
                                <Text>{Strings.WHERE_ARE_YOU_HEADING_TO}</Text>
                            </Typo>
                        </View>

                        <View style={Styles.secondView}>
                            <PlaceLostSelectionList
                                data={this.state.placeList}
                                isSmall={false}
                                showClose={true}
                                showRightView={true}
                                showAmountView={false}
                                callback={(item) => {
                                    this.onSelectPlaceItemClick(item);
                                }}
                            />
                        </View>
                    </View>
                    {this.state.error == true ? (
                        <ErrorMessage
                            onClose={() => {
                                this.setState({ error: false });
                            }}
                            title={this.state.errorTitle}
                            description={this.state.errorMessage}
                            showOk={true}
                            onOkPress={() => {
                                this.setState({ error: false });
                            }}
                        />
                    ) : null}
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}
