import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import DuitnowRTPCard from "@screens/Settings/DuitNow/DuitnowRTPCard";

import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getAutoDebitBlockedList } from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import { GREY, WHITE } from "@constants/colors";
import * as Strings from "@constants/strings";

const AutoDebitBlockedList = ({ updateAutoDebit, unBlockProxyAction, unblockFlag }) => {
    const [filteredList, setFilteredList] = useState([]);
    const [duitNowList, setDuitNowList] = useState([]);
    const [retrievalRefNo, setRetrivalRefNo] = useState(0);

    useEffect(() => {
        RTPanalytics.viewDNSettingsBlockedList();
        if (updateAutoDebit) {
            getRTPBlockList();
        }
    }, [updateAutoDebit]);

    async function getRTPBlockList(isLoadMore = false) {
        try {
            const datalist = isLoadMore ? duitNowList : [];
            const params = {
                offSet: 1,
            };

            if (isLoadMore) {
                params.retrievalRefNo = retrievalRefNo;
            }

            const response = await getAutoDebitBlockedList(params);

            const data = response?.data?.result?.data ?? [];
            const refNo = response?.data?.result?.retrievalRefNo;
            setRetrivalRefNo(refNo);
            setDuitNowList([...datalist, ...data]);
            setFilteredList([...datalist, ...data]);
        } catch (error) {
            showErrorToast({
                message: error?.error?.error?.message ?? Strings.COMMON_ERROR_MSG,
            });
        }
    }

    function unBlockProxyActionFn(item) {
        unBlockProxyAction(item);
        RTPanalytics.popUpDNSettingsBlockedList();
    }

    return (
        <View style={styles.container}>
            {filteredList?.length > 0 ? (
                <>
                    <View>
                        <View style={styles.accoutsListView}>
                            <DuitnowRTPCard
                                items={filteredList}
                                idTypeKey="text"
                                valueKey="value"
                                idValue="idVal"
                                statusKey="isregisteredProxy"
                                bankNameKey="bankName"
                                isSelectButton
                                isDisplayStatus
                                onPress={unBlockProxyActionFn}
                                isAutoDebit
                                showBtn={unblockFlag}
                            />
                        </View>
                    </View>
                </>
            ) : filteredList?.length === 0 ? (
                <>
                    <View style={styles.emptyListView}>
                        <Typo
                            text={Strings.BLOCKED_DUITNOW_AB_REQUEST_TITLE}
                            fontWeight="600"
                            fontStyle="normal"
                            adjustsFontSizeToFit
                            fontSize={19}
                            lineHeight={28}
                            textAlign="left"
                            style={styles.linkAccountText2}
                        />
                        <Typo
                            text={Strings.BLOCKED_DUITNOW_REQUEST_BODY}
                            fontWeight="300"
                            fontStyle="normal"
                            adjustsFontSizeToFit
                            fontSize={11}
                            lineHeight={20}
                            textAlign="center"
                            style={styles.linkAccountText2}
                        />
                    </View>
                </>
            ) : null}
        </View>
    );
};

AutoDebitBlockedList.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
    unBlockProxyAction: PropTypes.func,
    index: PropTypes.any,
    updateAutoDebit: PropTypes.bool,
    unblockFlag: PropTypes.bool,
};
const styles = StyleSheet.create({
    accoutsListView: {
        backgroundColor: WHITE,
        borderTopColor: GREY,
        borderTopWidth: 1,
    },
    container: {
        flex: 1,
    },
    emptyListView: {
        alignContent: "center",
        alignItems: "center",
        display: "flex",
        flex: 1,
        justifyContent: "center",
        margin: "auto",
    },
    linkAccountText2: {
        marginLeft: 5,
        marginRight: 5,
        marginTop: 20,
    },
});
export default withModelContext(AutoDebitBlockedList);
