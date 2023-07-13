import assets from "@assets";

/**
 * We only update Filter params one time (the first time)
 * We can't update it everytime because filter params get lesser with more filters applied.
 */
export const populateFilterSectionData = ({
    filterParameterVO,
    isHalalEntryPoint,
    isFavEntryPoint,
}) => {
    console.log("populateFilterSectionData", filterParameterVO, isHalalEntryPoint, isFavEntryPoint);

    const tempFilterSectionData = {};
    try {
        /** Populate filter section values from API data */
        const distanceList = filterParameterVO.distanceList ?? [];
        const deliveryTypeList = filterParameterVO.deliveryTypeList ?? [];
        const priceList = filterParameterVO.priceList ?? [];
        const categoryL3List = filterParameterVO.categoryL3List ?? [];
        // const promotionList = filterParameterVO.promotionList ?? [];

        tempFilterSectionData.distance = distanceList.map((obj) => {
            const { description, radius } = obj;
            return { name: description, value: radius };
        });
        tempFilterSectionData.distance.unshift({ name: "All Distance", value: -1 }); // manually appending All at index 0

        tempFilterSectionData.mode = deliveryTypeList.map((obj) => {
            const { deliveryId, type } = obj;
            return { name: type, value: deliveryId };
        });

        tempFilterSectionData.price = priceList.map((obj) => {
            const { price, description } = obj;
            return { name: description, value: price };
        });

        tempFilterSectionData.categoryL3List = categoryL3List.map((obj) => {
            const { id, category_name, count } = obj;
            return { name: category_name, count, value: id };
        });

        /** Populate filter section values via custom (biz req) */
        tempFilterSectionData.sortBy = [
            { name: "Nearest", value: "Nearest" },
            { name: "Top Rating", value: "TopRating" },
            { name: "Price Low to High", value: "Price Low to High" },
            { name: "Price High to Low", value: "Price High to Low" },
        ];

        tempFilterSectionData.promo = [
            { name: "Promo Code", value: "Promo Code" },
            // { name: "Discounts", value: "discounts" },
        ];

        tempFilterSectionData.others = [
            {
                name: "4.0 and above",
                value: 1,
                img: assets.sslFilterRating,
                isDisabled: false,
            },
            {
                name: "Halal",
                value: 2,
                img: assets.sslFilterHalal,
                isDisabled: isHalalEntryPoint,
            },
            {
                name: "Favourite Merchants",
                value: 3,
                img: assets.sslFilterFavourite,
                isDisabled: isFavEntryPoint,
            },
        ];

        console.log("apiFilterParamToPickerFormat updated PickerData", tempFilterSectionData);
        return tempFilterSectionData;
    } catch (e) {
        console.log("apiFilterParamToPickerFormat err", e);
        return {};
        // There's no filter parameters because the result data is empty []
    }
};
