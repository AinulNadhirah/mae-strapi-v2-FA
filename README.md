# M2ULife

## Getting started

### Migrating to latest codebase

Before checking-out of the branch, make sure to close any running xCode and metro server. Then run the script that will download some require files for eKYC to work on iOS. **Before running the script, make sure to make backup of your eKYC folder in ios path, for you to be able to move back to development based branch**

```bash
./upgrade.sh
```

It will help out with removing some stuff and installing packages and pods. But if it didn't work, you may proceed by installing manually.

Before installing packages, its recommended to use NPM version 7 and above. Version prior to that (at least 6) will still works. Since version 7, npm enforce the peer-deps checking which our codebase will fail, unfortunately due to some packages relying on older packages. To get it work, run the install with legacy-peers-deps.

```bash
npm i --legacy-peer-deps
```

Or to set it globally, use `npm config`

```bash
npm config set legacy-peer-deps true
npm i
```

Then, instal the Pods.

```bash
npx pod-install

// or

cd ios && pod install
```

Start the metro bundler with `reset-cache` flag to make sure you getting latest bundle. You only need this only for this stage. Or in future if you faced any issue with metro you may do the same again.

```bash
npm start -- --reset-cache
```

If you have issue related to node, likely you have an environment issue, which include multi installation of node, probably from standalone installer or `nvm` or from `brew`. To resolve make sure to remove all node installation and once you confirm you no longer have any node, install it through `nvm`. `nvm` makes it easier for you to manage your node version whenever you have to.

## Aliases

Starting from v0.7, we introduced the module resolver for our path resolution. Now, you can import components directly with `@components` alias instead of using relative path. There's no need to know how deep you are in folders with this.

```javascript
// before
import ActionButton from "../../../Buttons/ActionButton";

// now
import ActionButton from "@components/Buttons/ActionButton";
```

A few of aliases listed as below:

-   `@components -> "./src/components/\*"`
-   `@screens" -> "./src/screens/\*"`
-   `@navigation" -> "./src/navigation/\*"`
-   `@constants" -> "./src/constants/\*"`
-   `@assets" -> "./src/assets/\*"`
-   `@services" -> "./src/services/\*"`
-   `@layouts" -> "./src/components/Layouts/\*"`
-   `@utils" -> "./src/utilities/\*"`
-   `@context" -> "./src/context/\*"`
-   `@native" -> "./src/native/\*"`
-   `@config" -> "./src/config/\*"`
-   `@libs" -> "./src/libs/\*"`
-   `@styles" -> "./src/styles/\*"`

## Structures, Components and Screens, Naming Convention

Screens are now moved out from components folder and live inside its own at the root of `.src`. We make sure that there's distinctive differences between a component and screen. Also, several components now live inside its own folder directly under the components folder, instead of inside the `common` folder. Basically, whatever inside a component should be consider as a common anyway, because you do not know a component will be common until you find its common ground and usage, which sometimes we overthinking. And end up being use by one and only screens. The rest might be moved out as well in future, especially good in solving the cyclic dependency with the way it is exported and being imported by the common component's siblings.

All folder/file name will be in smaller `camelCase` eg (pushNotification) except if its a React component, which should be `PascalCase` eg(UserProfile). That means, several folders/files has been renamed to approriately represent this.

For files that act as a utility repositories, where it is being used across the app, make sure that it is not more than 1000 LOC per file. If it do exceed, considering creating another part file for. For example, `services/index.js` from the previous revision are now separated into multi files (current its at 10 files), with the naming strategy simply called `apiServiceDefinition{part-no}.js` where `part-no` represent the current file number. The idea is to add new APIs into the latest file, until it reach around 1k LOC. Once it does, we should _create a new file_ and include any new API in this next file.

There are no performance enhancement to the app by doing such, except it will help boost the editor performance by limiting the number of LOC to around 1k, as anything more will sometimes lock up the editor, especially VSCode with linter and prettier. It is also a good value in managing the APIs so we do not have to clutter our central export (which is the `index.js`) with all of the API functions.

This is also the same `dataModel` and `dataModel/utility. The naming convention for future new creation will be up for discussion.

## Flipper

This upgrade also allows you to use the Flipper, a platform for debugging iOS, Android and React Native apps. The app has been configured to be use with Flipper. Just download the desktop app from [the site](https://fbflipper.com).

Many of you might already use Reactotron and its app. You can continue using Reactotron with Flipper, as the app also been configured with Reactotron Flipper.

Among other plugin configured for the app:

-   flipper-plugin-async-storage
-   flipper-plugin-react-native-performance
-   flipper-plugin-reactotron

Just go to the Plugins manager and look for this plugin to enable the configuration. Do not upgrade your Flipper until its version is same or less than the one defined in the Podfile.

## `ModelContext`

`ModelContext` is a _simplified_ global state management module. In the wild, most projects uses `Redux` or `MobX` as a application state manager, but due to limitation from resources knowledge, we resort to this simplified state management, which leverage on React's `context`. The `ModelContext`'s state are reactive, and will trigger re-render for those that subscribe to it.

### Usage

Within a `class` component, `ModelContext` provide a HOC called `withModelContext`, which expose 4 props: `getModel`, `updateModel`, `resetModel` and `api`. `api`, for now, is unusable as it is a WIP. It will essentially be the way for component to make call to API services, which will provide the `ApiManager` access to the context.

```js
import PropTypes from "prop-types";
import React, { Component } from "react";
import { withModelContext } from "./ModelContext";
class WalletScreen extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        resetModel: PropTypes.func,
    };
    getUserDetails = () => {
        /**
         * getModel - the function will return a specific model with the given key
         * the key will be in strings, and the value must match the ModelContext global state value
         * For example, if we have a global state that have a key of users,
         * INITIALSTATE = {
         *  users: {
         *      username: 'Patrick',
         *      mobileNumber: '0198765432'
         *  },
         *  ... // other state
         * }
         * We can then choose to get the users model by passing the users string as a param for getModel
         */ const { getModel } = this.props;
        const { username, mobileNumber } = getModel("users"); o something with it
    };
    updateUserDetails = () => {
        /**
         * updateModel - the function will set and merge the given value with the global state. It accept an object of objects,
         * which each will need to start with the key of the main object.
         * For example, if we have a global state that have a key of users,
         * INITIALSTATE = {
         *  users: {
         *      username: 'Patrick',
         *      mobileNumber: '0198765432'
         *  },
         *  auth: {
         *      token: ''
         *  }
         *  ... // other state
         * }
         * We can then update users model by passing the object
         * You can update multiple state too.
         */ const { updateModel } = this.props;
        updateModel({
            users: { username: "John", mobileNumber: "0123456789" },
            ust add more object to update
            auth: { token: "12312312" },
        });
    };
    resetDetails = () => {
        /**
         * resetModel - the function will reset the global object based on the given key. The key string must match
         * the value of key within the global object
         * For example, if we have a global state that have a key of users,
         * INITIALSTATE = {
         *  users: {
         *      username: 'Patrick',
         *      mobileNumber: '0198765432'
         *  },
         *  auth: {
         *      token: ''
         *  }
         *  ... // other state
         * }
         * We can then reset the users object, by passing the users strings to the function resetModel
         * You can reset the WHOLE state, by omitting the key.
         */ const { resetModel } = this.props;
        eset specific users state
        resetModel("users");
        eset ALL of the object
        resetModel();
    };
    render() {
        return <View />;
    }
}
export default withModelContext(WalletScreen);
```

As you can see, its _exactly_ like using `setState`, and each of this state is reactive, means it will trigger re-render for the class that uses the HOC. If you **don't** want it to re-render, use `componentWillReceiveProps`, check the value that changes, and only return `true` for those that you want to re-render, and `false` for those that you don't want.

`ModelContext` will try to help out in merging the state with the new state given, so you do not need to do your merging. This is only limited to single level state, and nested state or deeply nested will need to be handle by the one who wanna change the state.

```js
// assuming this is our nested object in the state
const INITIAL_STATE = {
    todo: {
        settings: {
            readOnly: true,
            lock: false,
            active: true,
            //...
        },
        profileName: "Jordan",
    },
};

const { getModel, updateModel } = this.props;

// we want to update the readOnly to be false
// DON"T DO THIS
const newSettings = {
    readOnly: false,
};

updateModel({
    todo: {
        settings: newSettings,
    },
});

// DO THIS
// we get the whole object of settings first
const { settings } = getModel("todo");

updateModel({
    todo: {
        settings: {
            ...settings,
            readOnly: false,
        },
    },
});
// now the whole settings object will be preserve, and readOnly value will be updated

// this is OK and model context will handle the new state merging with the state todo
updateModel({
    todo: {
        profileName: "Oli",
    },
});
```

### Test

The project uses Jest for unit testing, and we do it in conjuction with E2E testing by using Detox.

To get started to run the test suite, follow the steps below.

#### iOS

Install `applesimutils`. Make sure you have install [homebrew](http://brew.sh/) beforehand. Else follow the link to get started.

```sh
brew tap wix/brew
brew install applesimutils
```

#### Android

Not yet set up for the repo. WIP.

~You'll need to make sure you have Java version to be at least `1.8.x_abc`. Run `java -version` to check your version.~
~You'll also need to install Android SDK, android emulators~

#### Running test

Before running the test, make sure to build the app first. If you've run the app for development, check inside the `ios/build/M2ULife SIT/Build/Products/Debug-iphonesimulator/M2ULife SIT.app` folder and make sure the `.app` is there. Else, run the command below to build.

```sh
detox build --configuration ios.sim.debug
```

To run the test, just run the command below.

```sh
 detox test --configuration ios.sim.debug --reuse
```

Make sure to use the flag `--reuse` so Detox won't re-installing the app again. If the app already exists, it will use it. The command above will run all test available.

To run on specific test, include the test file as a source.

```sh
detox test --configuration ios.sim.debug e2e/onboardingIntro.e2e.js --reuse
```

This will run on the `onboardingIntro` test script.
