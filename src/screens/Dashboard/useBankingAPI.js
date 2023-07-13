import { useState } from "react";

import { getDashboardWalletBalance } from "@services";

import { toggleUpdateWalletBalance } from "@utils/dataModel/utilityWallet";

const useBankingAPI = (getModel, updateModel) => {
    // const ACCOUNT_PRIMARY = "@account_primary";
    // const [accountPrimary, setAccountPrimary] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { isUpdateBalanceEnabled } = getModel("wallet");

    const getAccountSummaryPrimary = () => {
        setIsLoading(true);
        let result;
        getDashboardWalletBalance()
            .then((response) => {
                result = response?.data?.result;
            })
            .catch(() => {
                result = null;
            })
            .finally(() => {
                setIsLoading(false);
                updateModel({
                    wallet: {
                        primaryAccount: result,
                    },
                });

                if (isUpdateBalanceEnabled) {
                    toggleUpdateWalletBalance(updateModel, false);
                }
            });
    };

    // const saveAccountPrimary = (data) => {
    //     AsyncStorage.setItem(ACCOUNT_PRIMARY, JSON.stringify(data));
    // };
    //
    // const getAccountPrimary = async () => {
    //     const account = JSON.parse(await AsyncStorage.getItem(ACCOUNT_PRIMARY));
    //     setAccountPrimary(account);
    //     return account;
    // };

    return {
        getAccountSummaryPrimary,
        isLoading,
        // saveAccountPrimary,
        // getAccountPrimary,
    };
};

export default useBankingAPI;
