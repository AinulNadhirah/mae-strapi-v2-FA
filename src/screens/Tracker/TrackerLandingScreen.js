import React from "react";
import { AsyncStorage } from "react-native";
import PropTypes from "prop-types";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import moment from "moment";

import * as ModelClass from "@utils/dataModel/modelClass";
import { TOKEN_TYPE_MAYA } from "@constants/api";
import NavigationService from "@navigation/navigationService";
import * as navigationConstant from "@navigation/navigationConstant";
import { ErrorMessageV2 } from "@components/Common";
import { isWalletExits } from "@services/index";

export default class TrackerLandingScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
    };

    state = {
        m2uLinkedError: false,
        m2uCheckEnabled: true,
        currentMonth: "201910",
        walletExists: true,
    };

    async componentDidMount() {
        // const isTrackerLandingCompleted = await AsyncStorage.getItem("trackerLandingCompleted");
        // if (isTrackerLandingCompleted) {
        // Completed intro sequence, check wallet status first
        this._checkWalletExists();
        // this.props.navigation.navigate("TrackerStack");
        // } else {
        // 	this.props.navigation.navigate("TrackerIntroductionStack");
        // }
    }

    _checkAccounts = async () => {
        console.log("_checkAccounts");
        let accountsLinked = false;
        let accountadded = await AsyncStorage.getItem("walletAccountAdded");
        let m2uUserName = await AsyncStorage.getItem("m2uUserName");

        if (accountadded != null && m2uUserName != null) {
            accountsLinked = true;
        } else {
            accountsLinked = false;
        }

        console.log("_checkAccounts", accountsLinked);
        return accountsLinked;
    };

    _checkWalletExists = async () => {
        let variables = {
            mayaAuthorization: ModelClass.COMMON_DATA.serverAuth + ModelClass.COMMON_DATA.mayaToken,
            tokenType: TOKEN_TYPE_MAYA,
        };

        isWalletExits(variables)
            .then(async (response) => {
                console.log(`is Wallet Exits`, response.data.data.isWalletExists.exists);
                // console.log("wallet data", response.data);

                const m2uLinked = response.data.data.isWalletExists.m2uLinked;
                AsyncStorage.setItem(
                    "m2uLinked",
                    response.data.data.isWalletExists.m2uLinked.toString()
                );

                const isWalletExists = response.data.data.isWalletExists.exists;
                AsyncStorage.setItem(
                    "walletExists",
                    response.data.data.isWalletExists.exists.toString()
                );
                AsyncStorage.setItem(
                    "hasPrimaryAccount",
                    response.data.data.isWalletExists.hasPrimaryAccount.toString()
                );

                ModelClass.COMMON_DATA.walletScreenIndex = 0;

                if (isWalletExists !== null && isWalletExists) {
                    this.setState({ walletExists: true });

                    let m2uUserName = await AsyncStorage.getItem("m2uUserName");

                    // Check if m2u linked or not
                    // if (m2uLinked !== null && m2uLinked) {
                    if (m2uUserName != null) {
                        // m2u account linked, do nothing
                        console.log("m2u linked!");
                        this.setState({ m2uLinkedError: false });

                        ModelClass.settings.moduleName = navigationConstant.TRACKER_MODULE;
                        ModelClass.settings.routeName = navigationConstant.TRACKER_LANDING;

                        // clear m2u token to reset session
                        ModelClass.TRANSFER_DATA.m2uToken = null;

                        // trigger login to m2u flow
                        if (
                            ModelClass.TRANSFER_DATA.m2uToken != null &&
                            ModelClass.TRANSFER_DATA.m2uToken.length >= 1
                        ) {
                            // m2u token available!
                            console.log("m2u token available!");

                            // Continue to tracker dashboard & pull user data using token stored
                            this.props.navigation.navigate("TrackerStack");
                        } else {
                            console.log("m2u token NOT available! going to m2u login flow now");

                            //navigate to M2U Login screen
                            NavigationService.navigateToModule(
                                navigationConstant.WALLET_MODULE,
                                navigationConstant.WALLET_LOGIN,
                                {
                                    onSuccess: this._navigateToTrackerDashboard,
                                }
                            );
                            // NavigationService.navigateToModule(
                            // 	navigationConstant.WALLET_MODULE,
                            // 	navigationConstant.WALLET_LOGIN,
                            // 	{
                            // 		onSuccesss: () => {
                            // 			NavigationService.resetAndNavigateToModule(
                            // 				navigationConstant.TRACKER_MODULE,
                            // 				navigationConstant.TRACKER_DASHBOARD
                            // 			);
                            // 		}
                            // 	}
                            // );
                        }
                    } else {
                        // m2u account not linked

                        //reset onboarding completed flag
                        AsyncStorage.removeItem("trackerLandingCompleted");

                        //show popup modal
                        console.log("m2u NOT linked!");
                        this.setState({ m2uLinkedError: true, showLoader: false });
                    }
                } else {
                    //reset onboarding completed flag
                    AsyncStorage.removeItem("trackerLandingCompleted");

                    this.setState({ walletExists: false });

                    // go thru wallet intro
                    NavigationService.navigateToModule(
                        navigationConstant.WALLET_MODULE,
                        navigationConstant.WALLET_START
                    );
                }
            })
            .catch((error) => {
                console.log(`is Wallet Exits Error`, error);
                // go back to dashboard
                NavigationService.resetAndNavigateToModule(navigationConstant.HOME_DASHBOARD);
            });
    };

    _navigateToTrackerDashboard = () => {
        NavigationService.resetAndNavigateToModule(
            navigationConstant.TRACKER_MODULE,
            navigationConstant.TRACKER_DASHBOARD
        );
    };

    _onPressLoginNow() {
        const { walletExists } = this.state;

        //hide modal
        this.setState({ m2uLinkedError: false });

        // set redirection property so that user is redirected back to PFM module once account has been linked
        ModelClass.PFM_DATA.startFrom = true;

        //decide on flow based on wallet status
        if (walletExists) {
            NavigationService.navigateToModule(
                navigationConstant.WALLET_MODULE,
                navigationConstant.WALLET_LOGIN
            );
        } else {
            NavigationService.navigateToModule(
                navigationConstant.WALLET_MODULE,
                navigationConstant.WALLET_START
            );
        }
    }

    _onPressCreateMAE() {
        const { walletExists } = this.state;

        //hide modal
        this.setState({ m2uLinkedError: false });

        if (walletExists) {
            NavigationService.navigateToModule(
                navigationConstant.MAE_MODULE_STACK,
                navigationConstant.MAE_ACC_DASHBOARD
            );
        } else {
            ModelClass.GOAL_DATA.startFrom = false;
            NavigationService.navigateToModule(
                navigationConstant.WALLET_MODULE,
                navigationConstant.WALLET_START
            );
        }
    }

    render() {
        return (
            <React.Fragment>
                <ScreenLoader showLoader />

                {this.state.m2uLinkedError && this.state.m2uCheckEnabled && (
                    <ErrorMessageV2
                        onClose={() => {
                            NavigationService.resetAndNavigateToModule(
                                navigationConstant.HOME_DASHBOARD
                            );
                        }}
                        title={"Link Account"}
                        description={
                            "Looks like your Maybank2u account isn't linked yet. To proceed, log in or create a MAE account."
                        }
                        customParam1={"Login Now"}
                        onParam1Press={() => this._onPressLoginNow()}
                        customParam2={"Create a MAE account"}
                        onParam2Press={() => this._onPressCreateMAE()}
                    />
                )}
            </React.Fragment>
        );
    }
}
