import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import DuitnowRTPCard from "@screens/Settings/DuitNow/DuitnowRTPCard";

import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { getRtpListV1 } from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import { GREY, WHITE } from "@constants/colors";
import * as Strings from "@constants/strings";

const DuitNowBlockedList = ({ updateDuitNow, unBlockProxyAction }) => {
    const [filteredList, setFilteredList] = useState([]);
    const [retrievalRefNo, setRetrivalRefNo] = useState(0);

    useEffect(() => {
        RTPanalytics.viewBlockedRequestID();
        isRtpEnabled();
    }, []);

    useEffect(() => {
        if (updateDuitNow) {
            getRTPBlockList();
        }
    }, [updateDuitNow]);

    const isRtpEnabled = async () => {
        try {
            getRTPBlockList();
        } catch (ex) {}
    };

    const getRTPBlockList = async (isLoadMore = false) => {
        try {
            const subUrl = "/rtp/list";
            const datalist = isLoadMore ? filteredList : [];
            const params = {
                listType: "BLOCKED",
            };
            if (isLoadMore) {
                params.retrievalRefNo = retrievalRefNo;
            }
            const response = await getRtpListV1(subUrl, params);
            const data = response?.data?.result?.data ?? [];
            const refNo = response?.data?.result?.retrievalRefNo;
            setRetrivalRefNo(refNo);
            setFilteredList([...datalist, ...data]);
        } catch (error) {
            showErrorToast({
                message: error?.error?.error?.message ?? Strings.COMMON_ERROR_MSG,
            });
        }
    };

    const unBlockProxyActionHandler = (item) => {
        RTPanalytics.settingsUnblock();
        unBlockProxyAction(item);
    };

    return (
        <View style={styles.container}>
            {filteredList?.length > 0 ? (
                <View>
                    <View style={styles.accoutsListView}>
                        <DuitnowRTPCard
                            items={filteredList}
                            idTypeKey="text"
                            valueKey="value"
                            idValue="idVal"
                            statusKey="isregisteredProxy"
                            bankNameKey="bankName"
                            isSelectButton={true}
                            isDisplayStatus={true}
                            onPress={unBlockProxyActionHandler}
                            showBtn={true}
                        />
                    </View>
                </View>
            ) : (
                <View style={styles.emptyListView}>
                    <Typo
                        text={Strings.BLOCKED_DUITNOW_REQUEST_TITLE}
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
            )}
        </View>
    );
};

DuitNowBlockedList.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
    unBlockProxyAction: PropTypes.func,
    index: PropTypes.any,
    updateDuitNow: PropTypes.bool,
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
export default withModelContext(DuitNowBlockedList);
