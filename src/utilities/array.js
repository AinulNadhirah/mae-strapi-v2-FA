// TODO: rename method name
export const contactsMultiSelectOperation = (selectedItem, array, maxLimit, reachMaxCallback) => {
    let returnVal = array;
    if (array.find((item) => item.id == selectedItem.id)) {
        // remove toggle
        returnVal = array.filter((item) => item.id != selectedItem.id);
    } else {
        if (maxLimit && array.length === maxLimit) {
            if (reachMaxCallback) reachMaxCallback();
            return returnVal;
        }
        // push
        returnVal = [...returnVal, selectedItem];
    }
    return returnVal;
};

// TODO: rename method name
export const contactsSingleSelectOperation = (selectedItem) => {
    return [selectedItem];
};

export const sortByPropName = (array, propName) => {
    array.sort(function (a, b) {
        var nameA = a[propName].toUpperCase();
        var nameB = b[propName].toUpperCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    });

    return array;
};

export const arraySearchByObjProp = (array, keyword, propsName) => {
    return keyword
        ? array.filter((item) =>
              propsName.find(
                  (propName) =>
                      item[propName] &&
                      item[propName].toLowerCase().indexOf(keyword.toLowerCase()) > -1
              )
          )
        : array;
};

export const insertSeparators = (array, separator: (index: number) => any) => {
    return array?.reduce(
        (runningArray, item, index) => [
            ...runningArray,
            ...(index === 0 ? [] : [separator(index)]),
            item,
        ],
        []
    );
};
