import PropTypes from "prop-types";
import React from "react";

import { formateAccountNumber, cardPressedNavigate } from "@utils/dataModel/utility";

import Assets from "@assets";

import ProductCard from "../Cards/ProductCard";

const TransferProductCard = ({
    accountNo,
    balanceFormatted,
    beneficiaryId,
    beneficiaryFlag,
    accountName,
    onCardPressed,
}) => {
    const accountBalance = balanceFormatted
        ? parseFloat(balanceFormatted.replace(/[,.]/g, "")) / 100
        : 0;

    const onProductCardPressed = cardPressedNavigate(
        onCardPressed,
        accountName,
        beneficiaryId,
        accountNo,
        accountBalance,
        beneficiaryFlag
    );

    return (
        <ProductCard
            title={accountName}
            desc={formateAccountNumber(accountNo, 16)}
            amount={accountBalance}
            onCardPressed={onProductCardPressed}
            image={Assets.investmentCardBackground}
            isWhite
        />
    );
};

TransferProductCard.propTypes = {
    accountName: PropTypes.string.isRequired,
    accountNo: PropTypes.string.isRequired,
    balanceFormatted: PropTypes.string.isRequired,
    beneficiaryId: PropTypes.string.isRequired,
    beneficiaryFlag: PropTypes.string.isRequired,
    onCardPressed: PropTypes.func.isRequired,
};

export default TransferProductCard;
