import _ from "lodash";

/**
 * Check if item/product with same option(s) and customer request already exists in the current checkout cart.
 * If exists, returns the order, else returns null
 *
 * @param {object} item
 * @param {string} customerRequest
 * @param {array} options
 * @param {array} cartProducts
 */
export function getSameOrderInCart({ item, customerRequest, options, cartProducts }) {
    const cartProductIds = cartProducts?.map((obj) => obj.productId);
    if (cartProductIds?.includes(item.productId)) {
        let prevOrder = null;
        const sameProducts = cartProducts.filter(
            (obj) => obj.productId === item.productId && obj.customerRequest === customerRequest
        );
        const sortedOptions = options.sort((a, b) => a.optionId - b.optionId);
        sameProducts?.map((element) => {
            const sortedSelectedOptions = element?.selectedOptions.sort(
                (a, b) => a.optionId - b.optionId
            );
            if (_.isEqual(sortedSelectedOptions, sortedOptions)) {
                prevOrder = element;
            }
        });
        return prevOrder;
    }
    return false;
}

/**
 * Retrieve only mandatory option group(s) and reset each selectedCount to 0.
 * selectedCount is added to check if option group has met the min/max selection condition.
 *
 * @param {array} optGroups
 * @returns {array}
 */
export function filterMandatoryOptGroup(optGroups) {
    return optGroups
        ?.filter((item) => item.isRequired === 1)
        .map((optGroup) => ({
            ...optGroup,
            selectedCount: 0,
        }));
}

/**
 * Define option group type, either RADIO or CHECKBOX
 *
 * @param {object} optGroup
 * @returns {object} {isRadio: boolean, text: string}
 */
export function defineOptGroupType(optGroup) {
    const { isRequired, minSelection, maxSelection } = optGroup;
    if (isRequired === 1 && maxSelection === "1") {
        return {
            isRadio: true,
            text:
                minSelection === maxSelection
                    ? ` (Pick ${minSelection})`
                    : ` (Pick ${minSelection} to ${maxSelection})`,
        };
    } else if (isRequired === 1) {
        return {
            isRadio: false,
            text:
                minSelection === maxSelection
                    ? ` (Pick ${minSelection})`
                    : ` (Pick ${minSelection} to ${maxSelection})`,
        };
    } else {
        return { isRadio: false, text: ` (Optional, max ${maxSelection})` };
    }
}

/**
 * Calculate final amount based on SST (or not based on SST), applies to product item and option
 *
 * @param {boolean} isSst
 * @param {number} amount
 * @param {number} sstPercentage
 * @returns {number}
 */
export function priceFinalAmount({ isSst = false, amount = 0, sstPercentage = 0 }) {
    return isSst
        ? Math.round(Number(amount) * (1 + Number(sstPercentage) / 100) * 100) / 100
        : Number(amount);
}
