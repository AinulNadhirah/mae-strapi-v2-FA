import React from "react";
import { View } from "react-native";

import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";

import TransferOwnAccountsStyles from "@styles/Wallet/TransferOwnAccountsStyles";

const OwnAccountShimmerView = () => {
    return (
        <View style={TransferOwnAccountsStyles.newTransferView}>
            <View style={TransferOwnAccountsStyles.itemInner2View}>
                <View style={TransferOwnAccountsStyles.itemInnerView}>
                    <View style={TransferOwnAccountsStyles.itemInnerView}>
                        <View style={TransferOwnAccountsStyles.newTransferViewInner1}>
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={TransferOwnAccountsStyles.circleImageNewView}
                            />
                        </View>
                        <View style={TransferOwnAccountsStyles.newTransferViewInnerHalf}>
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={[TransferOwnAccountsStyles.emptyTextRow, { width: "70%" }]}
                            />
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={[TransferOwnAccountsStyles.emptyTextRow, { width: "30%" }]}
                            />

                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={[TransferOwnAccountsStyles.emptyTextRow, { width: "50%" }]}
                            />
                        </View>
                    </View>
                </View>
                <View style={TransferOwnAccountsStyles.line} />
            </View>
        </View>
    );
};

export default React.memo(OwnAccountShimmerView);
