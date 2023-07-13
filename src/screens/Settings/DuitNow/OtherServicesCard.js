import { isEmpty } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";

import Typo from "@components/Text";

import { GREY, WHITE } from "@constants/colors";

import Images from "@assets";

const OtherServicesCard = ({ onPress, items }) => {
    if (!items && isEmpty(items)) {
        return null;
    }
    return items.map((item, key) => (
        <TouchableOpacity key={key} onPress={() => onPress(item)}>
            <View style={styles.containerView}>
                <View style={styles.contentView}>
                    <View>
                        <Typo
                            text={item.text}
                            fontWeight="normal"
                            fontSize={14}
                            lineHeight={18}
                            textAlign="left"
                            style={styles.titleText}
                        />
                    </View>
                    <View style={styles.iconView}>
                        <Image style={styles.chevronButton} source={Images.icChevronRight24Black} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    ));
};

OtherServicesCard.propTypes = {
    onPress: PropTypes.func.isRequired,
    items: PropTypes.array,
};
OtherServicesCard.defaultProps = {
    isSelectButton: false,
    isDisplayStatus: true,
    ishideIcon: false,
};
export default React.memo(OtherServicesCard);

const styles = StyleSheet.create({
    chevronButton: {
        height: 24,
        width: 24,
    },
    containerView: {
        backgroundColor: WHITE,
        borderBottomColor: GREY,
        borderBottomWidth: 1,
        height: 90,
    },
    contentView: {
        alignItems: "center",
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        marginLeft: 24,
        marginRight: 24,
    },
});
