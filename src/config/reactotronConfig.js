import AsyncStorage from "@react-native-community/async-storage";
import Reactotron from "reactotron-react-native";
import ReactotronFlipper from "reactotron-react-native/dist/flipper";
import RNAsyncStorageFlipper from "rn-async-storage-flipper";

if (__DEV__) {
    Reactotron.setAsyncStorageHandler(AsyncStorage)
        .configure({
            // host: "192.168.0.185", // use when tethered to physical device
            name: "MAE",
            createSocket: (path) => new ReactotronFlipper(path),
        })
        .useReactNative({
            errors: { veto: (frame) => frame.fileName.indexOf("/node_modules/react-native/") >= 0 },
        });

    Reactotron.connect();
    Reactotron.clear();

    console.tron = Reactotron;

    RNAsyncStorageFlipper(AsyncStorage);
} else {
    console.tron = console;
}
