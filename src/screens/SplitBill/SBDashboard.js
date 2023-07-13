import React from "react";
import { useSafeArea } from "react-native-safe-area-context";

import SBDashboardList from "./SBDashboardList";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import TabView from "@components/Specials/TabView";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";

import {
    getOwnBillsApi,
    getInvitedBillsApi,
    getPastBillsAPI,
    getGroupsApi,
    invokeL2,
} from "@services";
import {
    TAB_NAVIGATOR,
    TAB,
    MORE,
    DASHBOARD,
    ACCOUNT_DETAILS_SCREEN,
    BANKINGV2_MODULE,
} from "@navigation/navigationConstant";
import { MEDIUM_GREY } from "@constants/colors";
import {
    To_COLLECT_CAP,
    To_PAY_CAP,
    PAST,
    GROUP_CAP,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_TAB_NAME,
    SPLIT_BILL,
} from "@constants/strings";
import {
    SB_COLLECT_TAB_KEY,
    SB_GROUP_TAB_KEY,
    SB_PAST_TAB_KEY,
    SB_PAY_TAB_KEY,
    SB_PG_SIZE,
} from "@constants/data";
import {
    OWN_SPLITBILL_LIST,
    INVITED_SPLITBILL_LIST,
    EXPIRED_SPLITBILL_LIST,
    GROUP_LIST,
} from "@constants/url";
import { withModelContext } from "@context";
import {
    massageCollectListData,
    massagePayListData,
    massagePastListData,
    massageGroupListData,
} from "./SBController";
import { logEvent } from "@services/analytics";

// Static data used for Tabs
const tabs = [
    {
        tabTitle: To_COLLECT_CAP,
        tabKey: SB_COLLECT_TAB_KEY,
        analyticsTabName: "To Collect",
    },
    { tabTitle: To_PAY_CAP, tabKey: SB_PAY_TAB_KEY, analyticsTabName: "To Pay" },
    { tabTitle: PAST, tabKey: SB_PAST_TAB_KEY, analyticsTabName: "Past" },
    { tabTitle: GROUP_CAP, tabKey: SB_GROUP_TAB_KEY, analyticsTabName: "Group" },
];

class SBDashboardRoot extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // Active Tab details
            selectedCategoryTab: To_PAY_CAP,
            activeTabIndex: props?.route?.params?.activeTabIndex ?? 1,

            // Tab data
            collectData: [],
            payData: [],
            pastData: [],
            groupData: [],
            isLoading: true,
            collectDataFetch: false,
            payDataFetch: false,
            pastDataFetch: false,
            groupDataFetch: false,

            // Default account details
            accountNo: "",
            accountCode: "",

            // User details
            loggedInUserId: "",
            token: "",

            // Route details
            routeFrom: props?.route?.params?.routeFrom ?? null,
        };

        this.props.updateModel({
            ui: {
                onCancelLogin: this.onPINLoginCancel,
            },
        });
    }

    onPINLoginCancel = () => {
        console.log("[SBDashboard] >> [onPINLoginCancel]");

        this.props.navigation.goBack();
    };

    componentDidMount = async () => {
        console.log("[SBDashboard] >> [componentDidMount]");

        const { activeTabIndex } = this.state;
        const { getModel } = this.props;
        const { isPostLogin, isPostPassword } = getModel("auth");

        if (!isPostPassword && !isPostLogin) {
            // L2 call to invoke login page
            const httpResp = await invokeL2(true).catch((error) => {
                console.log("[SBDashboard][invokeL2] >> Exception: ", error);
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) {
                // this.props.navigation.goBack();
                this.onBackTap();
                return;
            }
        }

        // Fetch user details
        this.retrieveLoggedInUserDetails();

        // Update the account number to be used for Split Bill
        this.updateAccountNum();

        // Using Focus to handle props with new values
        this.props.navigation.addListener("focus", this.onScreenFocus);

        // By default, call analytics for the active tab
        this.callAnalytics(activeTabIndex);
    };

    onScreenFocus = () => {
        console.log("[SBDashboard] >> [onScreenFocus]");

        // Fetch user details
        this.retrieveLoggedInUserDetails();

        const params = this.props?.route?.params ?? null;
        if (!params) return;

        const { activeTabIndex, detailsUpdated } = params;

        if (detailsUpdated) {
            this.fetchAllBillsData();
        }

        if (typeof activeTabIndex == "number" && activeTabIndex >= 0 && activeTabIndex <= 3) {
            console.log("[SBDashboard][onScreenFocus] >> activeTabIndex: " + activeTabIndex);

            // Use this to dynamically change tab based on the passes params
            this.setState({ activeTabIndex });

            switch (activeTabIndex) {
                case 0:
                    if (!detailsUpdated) this.fetchCollectTabList(true);
                    break;
                case 1:
                    if (!detailsUpdated) this.fetchPayTabList(true);
                    break;
                case 2:
                    if (!detailsUpdated) this.fetchPastTabList(true);
                    break;
                case 3:
                    this.fetchGroupTabList(true);
                    break;
                default:
                    break;
            }
        }

        // Reset nav params
        this.props.navigation.setParams({
            activeTabIndex: null,
            detailsUpdated: null,
        });
    };

    updateAccountNum = () => {
        console.log("[SBDashboard] >> [updateAccountNum]");

        const params = this.props?.route?.params ?? {};
        const refId = params?.refId ?? null;
        const prevData = params?.prevData ?? "";
        const { getModel } = this.props;
        const { primaryAccount } = getModel("wallet");

        // From selected account
        const number = prevData?.number ?? null;
        const code = prevData?.code ?? null;

        // From primary account
        const acctNo = primaryAccount?.number ?? null;
        const acctCode = primaryAccount?.code ?? null;

        // Choose whichever is available
        const accountNo = number || acctNo || "";
        const accountCode = code || acctCode || "";

        this.setState({ accountNo, accountCode }, () => {
            if (refId) {
                // Call APIs to fetch data for all 4 tabs
                this.fetchAllData();
            } else {
                // Fetch data of default tab initially
                this.fetchPayTabList(true);
            }
        });
    };

    retrieveLoggedInUserDetails = () => {
        console.log("[SBDashboard] >> [retrieveLoggedInUserDetails]");

        const { getModel } = this.props;
        const { mayaUserId } = getModel("user");
        const { token } = getModel("auth");

        this.setState({
            loggedInUserId: mayaUserId,
            token: token ? `bearer ${token}` : "",
        });

        return mayaUserId;
    };

    refreshTabData = () => {
        console.log("[SBDashboard] >> [refreshTabData]");

        const { activeTabIndex } = this.state;

        switch (activeTabIndex) {
            case 0:
                this.fetchCollectTabList(true);
                break;
            case 1:
                this.fetchPayTabList(true);
                break;
            case 2:
                this.fetchPastTabList(true);
                break;
            case 3:
                this.fetchGroupTabList(true);
                break;
            default:
                break;
        }
    };

    fetchAllData = () => {
        console.log("[SBDashboard] >> [fetchAllData]");

        this.fetchAllBillsData();
        this.fetchGroupTabList();
    };

    fetchAllBillsData = () => {
        console.log("[SBDashboard] >> [fetchAllBillsData]");

        this.fetchCollectTabList(true);
        this.fetchPayTabList();
        this.fetchPastTabList();
    };

    fetchCollectTabList = async (loader = false, pageSize = SB_PG_SIZE, page = 1) => {
        console.log("[SBDashboard] >> [fetchCollectTabList]");
        try {
            const { accountNo, accountCode } = this.state;
            this.setLoading(0, true);

            const result = await getOwnBillsApi(
                OWN_SPLITBILL_LIST.replace("{pageSize}", pageSize).replace("{page}", page),
                loader
            ).catch((error) => {
                console.log("[SBDashboard][getOwnBillsApi] >> Exception: ", error);
            });
            const resultList = result?.data?.resultList ?? [];
            const massagedData = massageCollectListData(resultList, accountNo, accountCode);

            this.setState({
                collectData: massagedData || [],
                collectDataFetch: massagedData.length > 0,
            });
            this.setLoading(0, false);
        } catch (error) {
            console.log("[SBDashboard][fetchCollectTabList] >> Exception: ", error);
        }
    };

    fetchPayTabList = async (loader = false, pageSize = SB_PG_SIZE, page = 1) => {
        console.log("[SBDashboard] >> [fetchPayTabList]");
        try {
            this.setLoading(1, true);

            const result = await getInvitedBillsApi(
                INVITED_SPLITBILL_LIST.replace("{pageSize}", pageSize).replace("{page}", page),
                loader
            ).catch((error) => {
                console.log("[SBDashboard][getInvitedBillsApi] >> Exception: ", error);
            });
            const resultList = result?.data?.resultList ?? [];
            const massagedData = massagePayListData(resultList, "PAY");

            this.setState({
                payData: massagedData || [],
                payDataFetch: massagedData.length > 0,
            });
            this.setLoading(1, false);
        } catch (error) {
            console.log("[SBDashboard][fetchPayTabList] >> Exception: ", error);
        }
    };

    fetchPastTabList = async (loader = false, pageSize = SB_PG_SIZE, page = 1) => {
        console.log("[SBDashboard] >> [fetchPastTabList]");
        try {
            this.setLoading(2, true);

            const result = await getPastBillsAPI(
                EXPIRED_SPLITBILL_LIST.replace("{pageSize}", pageSize).replace("{page}", page),
                loader
            ).catch((error) => {
                console.log("[SBDashboard][getPastBillsAPI] >> Exception: ", error);
            });
            const resultList = result?.data?.resultList ?? [];
            const loggedInUserId = await this.retrieveLoggedInUserDetails();
            const massagedData = massagePastListData(resultList, loggedInUserId);

            this.setState({
                pastData: massagedData || [],
                pastDataFetch: massagedData.length > 0,
            });
            this.setLoading(2, false);
        } catch (error) {
            console.log("[SBDashboard][fetchPastTabList] >> Exception: ", error);
        }
    };

    fetchGroupTabList = async (loader = false, pageSize = SB_PG_SIZE, page = 1) => {
        console.log("[SBDashboard] >> [fetchGroupTabList]");
        try {
            this.setLoading(3, true);

            const result = await getGroupsApi(
                GROUP_LIST.replace("{pageSize}", pageSize).replace("{page}", page),
                loader
            ).catch((error) => {
                console.log("[SBDashboard][getGroupsApi] >> Exception: ", error);
            });
            const resultList = result?.data?.resultList ?? [];
            const massagedData = massageGroupListData(resultList);

            this.setState({
                groupData: massagedData || [],
                groupDataFetch: massagedData.length > 0,
            });
            this.setLoading(3, false);
        } catch (error) {
            console.log("[SBDashboard][fetchGroupTabList] >> Exception: ", error);
        }
    };

    setLoading = (paramTabIndex, value = false) => {
        console.log("[SBDashboard][setLoading] >> value: " + value);

        const { activeTabIndex } = this.state;

        if (paramTabIndex == activeTabIndex) {
            this.setState({
                isLoading: value,
            });
        }
    };

    handleTabChange = (activeTabIndex) => {
        console.log("[SBDashboard][handleTabChange] >> activeTabIndex: " + activeTabIndex);

        const { collectDataFetch, payDataFetch, pastDataFetch, groupDataFetch } = this.state;

        // Added this to handle the delay in tab loading experience
        this.setState({ isLoading: true, activeTabIndex }, () => {
            if (
                (activeTabIndex === 0 && !collectDataFetch) ||
                (activeTabIndex === 1 && !payDataFetch) ||
                (activeTabIndex === 2 && !pastDataFetch) ||
                (activeTabIndex === 3 && !groupDataFetch)
            ) {
                this.refreshTabData();
                return;
            }

            setTimeout(() => {
                this.setState({ isLoading: false });
            }, 200);
        });

        // Call method to update analytics
        this.callAnalytics(activeTabIndex);
    };

    callAnalytics = (activeTabIndex) => {
        console.log("[SBDashboard] >> [callAnalytics]");

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "M2U - Split Bill",
            [FA_TAB_NAME]: tabs[activeTabIndex].analyticsTabName,
        });
    };

    onBackTap = () => {
        const { routeFrom } = this.state;

        console.log("[SBDashboard][onBackTap] >> routeFrom: ", routeFrom);

        switch (routeFrom) {
            case "ACCOUNT_DETAILS":
                this.props.navigation.navigate(BANKINGV2_MODULE, {
                    screen: ACCOUNT_DETAILS_SCREEN,
                });
                break;
            case "WALLET_DASHBOARD":
            case "NOTIFICATION":
                this.props.navigation.navigate(TAB_NAVIGATOR, {
                    screen: TAB,
                    params: {
                        screen: MORE,
                    },
                });
                break;
            case "SortToWin":
                this.props.navigation.navigate("GameStack", {
                    screen: "Main",
                });
                break;
            // case "ABOVE_FOLD":
            // case "DASHBOARD":
            default:
                this.props.navigation.navigate(TAB_NAVIGATOR, {
                    screen: TAB,
                    params: {
                        screen: DASHBOARD,
                        params: { refresh: true },
                    },
                });
                break;
        }
    };

    render() {
        const {
            selectedCategoryTab,
            activeTabIndex,
            collectData,
            payData,
            pastData,
            groupData,
            accountNo,
            accountCode,
            isLoading,
            token,
        } = this.state;
        const { navigation, route, safeArea } = this.props;

        const screens = tabs.map((item, index) => {
            return (
                <SBDashboardList
                    index={index}
                    navigation={navigation}
                    route={route}
                    tabName={item.tabTitle}
                    tabKey={item.tabKey}
                    selectedCategoryTab={selectedCategoryTab}
                    activeTabIndex={activeTabIndex}
                    collectData={collectData}
                    payData={payData}
                    pastData={pastData}
                    groupData={groupData}
                    accountNo={accountNo}
                    accountCode={accountCode}
                    key={item.tabKey}
                    safeArea={safeArea}
                    refreshTabData={this.refreshTabData}
                    isLoading={isLoading}
                    token={token}
                />
            );
        });

        const titles = tabs.map((item) => {
            return item.tabTitle;
        });

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    neverForceInset={["bottom"]}
                    useSafeArea
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={SPLIT_BILL}
                                />
                            }
                        />
                    }
                >
                    <TabView
                        titles={titles}
                        screens={screens}
                        defaultTabIndex={activeTabIndex}
                        onTabChange={this.handleTabChange}
                    />
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const SBDashboard = (props) => {
    const safeArea = useSafeArea();

    return <SBDashboardRoot {...props} safeArea={safeArea} />;
};

export default withModelContext(SBDashboard);
