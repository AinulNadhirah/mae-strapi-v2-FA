import PropTypes from "prop-types";
import React from "react";

import Typo from "@components/Text";

import { WHITE } from "@constants/colors";

import SwitchCard from "./SwitchCard";

const SwitchAccountCard = (props) => {
    const { name, number, amount, data } = props || {};
    return (
        <SwitchCard name={name} number={number} item={data} {...props}>
            <>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    text={name}
                    color={WHITE}
                    textAlign="left"
                />
                <Typo
                    fontSize={12}
                    fontWeight="normal"
                    lineHeight={18}
                    text={number}
                    color={WHITE}
                    textAlign="left"
                    style={styles.accountDescription}
                />
                <Typo
                    fontSize={16}
                    fontWeight="600"
                    lineHeight={18}
                    text={amount}
                    color={WHITE}
                    textAlign="left"
                />
            </>
        </SwitchCard>
    );
};

SwitchAccountCard.propTypes = {
    name: PropTypes.string,
    number: PropTypes.string,
    amount: PropTypes.string,
    data: PropTypes.any,
    onPress: PropTypes.func,
    code: PropTypes.any,
    type: PropTypes.string,
    children: PropTypes.any,
    isSelected: PropTypes.any,
};

const styles = {
    accountDescription: {
        paddingBottom: 27,
        paddingTop: 4,
    },
};

export default SwitchAccountCard;
