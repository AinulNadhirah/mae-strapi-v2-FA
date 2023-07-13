import { callCloudApi } from "@services/ApiManagerCloud";

import { METHOD_GET, METHOD_POST } from "@constants/api";
import { AWS } from "@constants/data";

import { getDigitalIdentityByType } from "@utils/dataModel/utility";

export const getfilterCriteriaCloud = async (cloudEndPointBase) => {
    const uri = `${cloudEndPointBase}/home/v1/property/getfilterCriteria`;
    const response = await callCloudApi({ uri, method: METHOD_GET });
    return { data: response };
};

export const getPreLoginPropertyListCloud = async (cloudEndPointBase, data) => {
    const uri = `${cloudEndPointBase}/home/v1/property/getPreLoginPropertyList`;
    const headers = { "content-type": "application/json" };
    const response = await callCloudApi({
        uri,
        headers,
        method: METHOD_POST,
        body: JSON.stringify(data),
    });
    return { data: response };
};

export const getPostLoginPropertyListCloud = async (cloudEndPointBase, data) => {
    const awsId = await getDigitalIdentityByType(AWS);
    const uri = `${cloudEndPointBase}/home/v1/property/getPropertyList?digital_id=${awsId}`;
    const headers = { "content-type": "application/json" };
    const response = await callCloudApi({
        uri,
        headers,
        method: METHOD_POST,
        body: JSON.stringify(data),
    });
    return { data: response };
};

export const getPreLoginPropertyDetailsCloud = async (cloudEndPointBase, data) => {
    const uri = `${cloudEndPointBase}/home/v1/property/getPreLoginPropertyDetails`;
    const headers = { "content-type": "application/json" };
    const response = await callCloudApi({
        uri,
        headers,
        method: METHOD_POST,
        body: JSON.stringify(data),
    });
    return { data: response };
};

export const getPostLoginPropertyDetailsCloud = async (cloudEndPointBase, data) => {
    const awsId = await getDigitalIdentityByType(AWS);
    const uri = `${cloudEndPointBase}/home/v1/property/getPropertyDetails?digital_id=${awsId}`;
    const headers = { "content-type": "application/json" };
    const response = await callCloudApi({
        uri,
        headers,
        method: METHOD_POST,
        body: JSON.stringify(data),
    });
    return { data: response };
};

export const getPostLoginBookmarkedPropertyList = async (cloudEndPointBase, data) => {
    const awsId = await getDigitalIdentityByType(AWS);
    const uri = `${cloudEndPointBase}/home/v1/property/getBookmarkedPropertyList?digital_id=${awsId}`;
    const headers = { "content-type": "application/json" };
    const response = await callCloudApi({
        uri,
        headers,
        method: METHOD_POST,
        body: JSON.stringify(data),
    });
    return { data: response };
};

export const updatePostLoginBookmarkProperty = async (cloudEndPointBase, data) => {
    const awsId = await getDigitalIdentityByType(AWS);
    const uri = `${cloudEndPointBase}/home/v1/property/updateBookmark?digital_id=${awsId}`;
    const headers = { "content-type": "application/json" };
    const response = await callCloudApi({
        uri,
        headers,
        method: METHOD_POST,
        body: JSON.stringify(data),
    });
    return { data: response };
};
