import { AsyncStorage } from "react-native";
import { isWalletExits, getFitRequestWithoutData } from "@services";
import { ErrorLogger } from "@utils/logs";
import { COMMON_DATA, GOAL_DATA, SPLIT_BILL_DATA, USER_DATA } from "@utils/dataModel/modelClass";
import NavigationService from "@navigation/navigationService";
import {
    WALLET_MODULE,
    WALLET_LOGIN,
    WALLET_START,
    UPDATE_PROFILE,
    TABUNG_STACK,
    TABUNG_TAB_SCREEN,
    FITNESS_MODULE,
    FITNESS_LANDING_ONE,
    FITNESS_DASHBOARD,
    FITNESS_LANDING_FOUR,
    EDIT_TARGET,
    DAILY_HUSTLE_CHALLENGE_BOARD,
} from "@navigation/navigationConstant";
import { TOKEN_TYPE_MAYA } from "@constants/api";
import * as ModelClass from "@utils/dataModel/modelClass";

const navigateToWalletStacks = async () => {
    console.log("[CTAController] >> [navigateToWalletStacks]");

    try {
        const variables = {
            mayaAuthorization: COMMON_DATA.serverAuth + COMMON_DATA.mayaToken,
            tokenType: TOKEN_TYPE_MAYA,
        };
        const {
            data: {
                data: {
                    isWalletExists: { exists, hasPrimaryAccount, m2uLinked, walletId },
                },
            },
        } = await isWalletExits(variables);
        await AsyncStorage.multiSet([
            ["walletExists", `${exists}`],
            ["hasPrimaryAccount", `${hasPrimaryAccount}`],
            ["m2uLinked", `${m2uLinked}`],
        ]);
        GOAL_DATA.startFrom = false;
        //FIXME: This variables is flagged by eslint, should be fixed using context
        // eslint-disable-next-line require-atomic-updates
        COMMON_DATA.walletScreenIndex = 0;
        if (exists) {
            AsyncStorage.setItem("walletId", walletId.toString());
            NavigationService.navigateToModule(WALLET_MODULE, WALLET_LOGIN);
        } else {
            NavigationService.navigateToModule(WALLET_MODULE, WALLET_START);
        }
    } catch (error) {
        ErrorLogger(error);
    }
};

const navigateToFitnessPersonalTargetStack = async () => {
    console.log("[CTAController] >> [navigateToFitnessPersonalTargetStack]");

    try {
        const results = await AsyncStorage.multiGet(["isFitReady", "isFitSynced"]);
        const [isFitReady, isFitSynced] = results.map((result) => result[1]);
        if (isFitSynced) {
            NavigationService.navigateToModule(FITNESS_MODULE, FITNESS_DASHBOARD);
        } else {
            if (isFitReady) {
                NavigationService.navigateToModule(FITNESS_MODULE, FITNESS_LANDING_FOUR);
            } else {
                NavigationService.navigateToModule(FITNESS_MODULE, FITNESS_LANDING_ONE);
            }
        }
    } catch (error) {
        ErrorLogger(error);
    }
};

const navigateToFitnessChallengeDashboard = async (challengeId) => {
    console.log("[CTAController] >> [navigateToFitnessChallengeDashboard]");

    try {
        const {
            data: { result },
        } = await getFitRequestWithoutData("/getChallengeDetails?challengeId=" + challengeId);
        const { participantsResources } = result;
        let pending = false;
        for (let x = 0; x < participantsResources.length; x++) {
            const { participantUserId, challengeInviteStatus } = participantsResources[x];
            if (
                participantUserId === USER_DATA.mayaUserId &&
                challengeInviteStatus.toLowerCase() === "P"
            ) {
                pending = true;
                break;
            }
        }
        if (pending)
            NavigationService.navigateToModule(FITNESS_MODULE, "DailyHustleChallengeAccept", {
                challengeData: result,
                backRoute: "Dashboard",
            });
        else
            NavigationService.navigateToModule(FITNESS_MODULE, DAILY_HUSTLE_CHALLENGE_BOARD, {
                challengeData: result,
            });
    } catch (error) {
        ErrorLogger(error);
    }
};

const navigateToFitnessStacks = async (actionKey, challengeId) => {
    console.log("[CTAController] >> [navigateToFitnessStacks]");

    let isFitSynced = await AsyncStorage.getItem("isFitSynced");

    if (actionKey === "fitness_intro") {
        if (isFitSynced == "true") {
            NavigationService.navigateToModule(FITNESS_MODULE, FITNESS_DASHBOARD);
        } else {
            NavigationService.navigateToModule(FITNESS_MODULE, FITNESS_LANDING_ONE);
        }
    } else if (actionKey === "fitness_dashboard" || actionKey === "fitness_syncsteps")
        if (isFitSynced == "true") {
            NavigationService.navigateToModule(FITNESS_MODULE, FITNESS_DASHBOARD);
        } else {
            NavigationService.navigateToModule(FITNESS_MODULE, FITNESS_LANDING_ONE);
        }
    else if (actionKey === "fitness_linkwearable")
        if (isFitSynced == "true") {
            NavigationService.navigateToModule(FITNESS_MODULE, FITNESS_DASHBOARD);
        } else {
            NavigationService.navigateToModule(FITNESS_MODULE, FITNESS_LANDING_ONE);
        }
    else if (actionKey === "fitness_editsteptarget") {
        if (isFitSynced == "true") {
            NavigationService.navigateToModule(FITNESS_MODULE, FITNESS_DASHBOARD);
        } else {
            NavigationService.navigateToModule(FITNESS_MODULE, EDIT_TARGET);
        }
    } else if (actionKey === "fitness_personaltarget") navigateToFitnessPersonalTargetStack();
    else if (actionKey === "fitness_challengedashboard")
        navigateToFitnessChallengeDashboard(challengeId);
    else handleNonExistentActionKey(actionKey);
};

const handleNonExistentActionKey = (actionKey) =>
    ErrorLogger(
        new Error(`CTAController :: action ${actionKey} is currently not mapped to the controller`)
    );

const CTAController = async ({ cta, content }) => {
    console.log("[CTAController] >> [CTAController]");
    try {
        const { action } = cta;
        COMMON_DATA.walletFlow = 1;
        const actionKey = action.toLowerCase();

        if (actionKey == "wallet_activate_mae_card" || actionKey == "wallet_apply_mae_card") {
            handleMAEMoments(actionKey);
        }

        if (actionKey.includes("wallet")) await navigateToWalletStacks();
        else if (actionKey === "no_update_etm" || actionKey === "update_etm")
            NavigationService.navigate(UPDATE_PROFILE, {});
        else if (actionKey.includes("goals"))
            NavigationService.navigateToModule(TABUNG_STACK, TABUNG_TAB_SCREEN);
        else if (actionKey === "view_bill_progress") {
            if (content.context) SPLIT_BILL_DATA.notificationData = content.context;
            if (content.context.billId) SPLIT_BILL_DATA.billId = content.context.billId;
            COMMON_DATA.walletFlow = 4;
            COMMON_DATA.splitBillDetailsFlow = true;
            await navigateToWalletStacks();
        } else if (actionKey.includes("fitness"))
            await navigateToFitnessStacks(actionKey, content.challengeId);
        else {
            handleNonExistentActionKey(actionKey);
        }
    } catch (error) {
        ErrorLogger(error);
    }
};

const handleMAEMoments = (actionKey) => {
    console.log("[CTAController] >> [handleMAEMoments]");
    switch (actionKey) {
        case "wallet_apply_mae_card":
            ModelClass.COMMON_DATA.walletFlow = 7;
            break;
        case "wallet_activate_mae_card":
            ModelClass.COMMON_DATA.walletFlow = 8;
            break;
        default:
            break;
    }
};

export default CTAController;
