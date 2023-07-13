import React, { Component } from "react";
import {
    TouchableOpacity,
    Text,
    View,
    ScrollView,
    Alert,
    Image,
    ImageBackground,
    StyleSheet,
    Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import {
    HeaderPageIndicator,
    WalletEnter,
    ErrorMessage,
    ButtonRoundLong,
} from "@components/Common";
import commonStyle from "@styles/main";
import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";
import * as ModelClass from "@utils/dataModel/modelClass";
import WalletScreenStyle from "@styles/Wallet/WalletScreen";
const { width, height } = Dimensions.get("window");
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import Typo from "@components/Text";
import { BLACK, BLUE, YELLOW, WHITE, OFF_WHITE } from "@constants/colors";
import ActionButton from "@components/Buttons/ActionButton";
import assets from "@assets";
class Start extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            currentScreen: 1,
            error: false,
            isSensorAvailable: false,
            pin: "",
            mutVariables: {},
            routeFrom: "",
            routeTo: "",
            nowallet: false,
            nom2u: false,
            showSortAndFilterModal: false,
            showQuickActions: false,
            overlayType: "gradient",
        };

        this.onClosePressHandler = this.onClosePressHandler.bind(this);
    }

    state = {
        currentScreen: 1,
        error: false,
        nowallet: false,
        nom2u: false,
    };

    onClosePressHandler = () => {
        this.props.navigation.goBack();
        // NavigationService.navigateToModule(navigationConstant.TABUNG_STACK, navigationConstant.TABUNG_TAB_SCREEN);
    };

    componentDidMount() {}

    componentWillMount() {
        const { route } = this.props;
        this.state.routeFrom = route.params?.routeFrom ?? "";
        this.state.routeTo = route.params?.routeTo ?? "";
    }

    componentWillUnmount() {}

    onStartPress = () => {
        this.props.navigation.navigate(navigationConstant.GOALS_MODULE, {
            screen: navigationConstant.CREATE_GOALS_SELECT_GOAL_TYPE,
        });
    };

    // startClick = async () => {
    //     let walletId = null;
    //     let m2uUserName = null;
    //     try {
    //         walletId = await AsyncStorage.getItem("walletId");
    //     } catch (error) {
    //         walletId = null;
    //     }

    //     try {
    //         m2uUserName = await AsyncStorage.getItem("m2uUserName");
    //     } catch (error) {
    //         m2uUserName = null;
    //     }

    //     if (walletId === null) {
    //         this.setState({ nowallet: true });
    //     } else if (m2uUserName == null || m2uUserName == "null") {
    //         this.setState({ nom2u: true });
    //     } else {
    //         console.log("ModelClass.TRANSFER_DATA.m2uToken", ModelClass.TRANSFER_DATA.m2uToken);
    //         if (
    //             ModelClass.TRANSFER_DATA.m2uToken === null ||
    //             ModelClass.TRANSFER_DATA.m2uToken === ""
    //         ) {
    //             NavigationService.navigateToModule(
    //                 navigationConstant.GOALS_MODULE,
    //                 navigationConstant.CREATE_GOALS_M2ULOGIN,
    //                 {
    //                     routeFrom: navigationConstant.CREATE_GOALS_START,
    //                     routeTo: navigationConstant.CREATE_GOALS_SELECT_GOAL_TYPE,
    //                 }
    //             );
    //         } else {
    //             NavigationService.navigateToModule(
    //                 navigationConstant.GOALS_MODULE,
    //                 navigationConstant.CREATE_GOALS_SELECT_GOAL_TYPE
    //             );
    //         }
    //     }
    // };

    render() {
        const { showSortAndFilterModal, showQuickActions, overlayType } = this.state;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundImage={assets.tabungOnboardingIllustration}
                    backgroundType="image"
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={16}
                        paddingHorizontal={24}
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    <HeaderBackButton onPress={this.onClosePressHandler} />
                                }
                            />
                        }
                        useSafeArea
                    >
                        <>
                            <View style={styles.block}>
                                <View style={styles.titleContainer}>
                                    <Typo
                                        lineHeight={19}
                                        fontSize={16}
                                        fontWeight="600"
                                        text="Tabung together-gether"
                                    />
                                </View>
                                <View style={styles.descriptionContainer}>
                                    <Typo
                                        lineHeight={18}
                                        fontSize={12}
                                        text="Plan a holiday with friends or get that shiny new gadget. Stash money aside for your big or small moments with Tabung and get there faster!"
                                    />
                                </View>
                            </View>

                            <View style={styles.footer}>
                                <ActionButton
                                    fullWidth
                                    // disabled={loading}
                                    // isLoading={loading}
                                    borderRadius={25}
                                    onPress={this.onStartPress}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typo
                                            text="Next"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </View>
                        </>
                    </ScreenLayout>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    container: { backgroundColor: "transparent", flex: 1, width: "100%" },
    block: { flex: 1, justifyContent: "flex-end", marginBottom: 20 },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        marginBottom: 68,
    },
    titleContainer: { marginTop: 30 },
    titleText: {
        fontFamily: "Montserrat",
        fontSize: 14,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 18,
        letterSpacing: 0,
        color: "#000000",
    },
    descriptionContainer: {
        marginTop: 10,
        marginHorizontal: 24,
        justifyContent: "flex-start",
    },
    descriptionText: {
        fontFamily: "Montserrat",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: "#000000",
    },
    imageContainer: { marginTop: 20, justifyContent: "center", alignItems: "center" },
    imageText: { color: "#000000", fontWeight: "400", fontSize: 20 },
    setupContainer: { marginLeft: 30, marginTop: 30 },
    bgContainer: { width: "100%", marginTop: 10, marginBottom: 1, backgroundColor: "blue" },
    bg: {
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        width: "100%",
        height: "100%",
    },
});

export default Start;
