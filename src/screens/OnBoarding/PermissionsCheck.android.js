import { Alert, PermissionsAndroid, Platform } from "react-native";

import { ErrorLogger } from "@utils/logs";

export default async function _checkAndroidPermissions() {
    try {
        //TODO: To confirm if this is needed at all.
        //Permissions can always be differed to just before the access is actually needed
        const permissions = await Promise.all(
            parseInt(Platform.Version) > 29
                ? [
                      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA),
                      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION),
                      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS),
                      PermissionsAndroid.check(
                          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                      ),
                  ]
                : [
                      PermissionsAndroid.check(
                          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                      ),
                      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA),
                      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION),
                      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS),
                      PermissionsAndroid.check(
                          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                      ),
                      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE),
                  ]
        );
        const isAllPermissionsGranted = permissions.every((permission) => permission);

        if (!isAllPermissionsGranted) {
            const requests = await PermissionsAndroid.requestMultiple(
                parseInt(Platform.Version) > 29
                    ? [
                          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                          PermissionsAndroid.PERMISSIONS.CAMERA,
                          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                      ]
                    : [
                          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                          PermissionsAndroid.PERMISSIONS.CAMERA,
                          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
                      ],
                {
                    title: "Application Permissions",
                    message: "MAE need to access your Storage, Camera, Location and Contacts.",
                    buttonPositive: "Allow",
                }
            );
            const requestKeys = Object.keys(requests);
            const isAllRequestGranted = requestKeys.every((key) => requests[key] === "granted");

            if (!isAllRequestGranted)
                Alert.alert(
                    "MAE",
                    "Denying the permission request will cause the application to behave unexpectedly.",
                    [{ text: "Ok" }],
                    { cancelable: false }
                );
        }
    } catch (error) {
        ErrorLogger(error);
        throw new Error(error);
    }
}
