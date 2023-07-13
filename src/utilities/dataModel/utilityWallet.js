function updateWalletBalance(updateModel, wallet = null) {
    console.log("[[UPDATE_BALANCE]] >> updateWalletBalance utility called / wallet - ", wallet);
    if (wallet) {
        updateModel({
            wallet: {
                primaryAccount: wallet,
                isUpdateBalanceRequired: false,
            },
        });
    } else {
        toggleUpdateWalletBalance(updateModel, true);
    }
}

function toggleUpdateWalletBalance(updateModel, value) {
    updateModel({
        wallet: {
            isUpdateBalanceRequired: value,
        },
    });
}

export { updateWalletBalance, toggleUpdateWalletBalance };
