# react-native-ekyc

## Getting started

Our repo limit the size for files to push to the server, so after pulling, before npm install, make sure to copy and below files into respectives folder, and then npm install and pod install

-   `VVUtils.framework` into ios/Frameworks (copy from iOS ekyc folder)
-   `smma.framework` into ios/Frameworks (copy from iOS ekyc folder)
-   `libEzBioSDK.a` into ios/Selfie/device_arch (copy from iOS ekyc folder)
-   `libEzBioSDK.a` into ios/Selfie/simulator_arch and rename it to `libEzBioSDKSimulator.a` (copy from iOS ekyc folder)

Ezlogger.framework are included since it is not that big, and it is not the same one exists in our existing ios folder, because i've build the framework with the combination of both simulator and device framework to become a universal framework.

Before running npm and pod install, after you've copied `smma.framework`, go into the folder, into `Versions` > `A` and copy everything inside that folder, and copy it to the root of `smma.framework` so it should be like below.

```
> smma.framework
    > Headers
    > Modules
    > Resources
    > smma
```

TODO:

Create a shell script to copy the files automatically and all the configuration itself.
