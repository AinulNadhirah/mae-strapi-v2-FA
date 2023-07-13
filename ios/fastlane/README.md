fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew cask install fastlane`

# Available Actions
## iOS
### ios build
```
fastlane ios build
```
Build the iOS application
### ios fabric
```
fastlane ios fabric
```
Upload the iOS application to Fabric Beta
### ios dev
```
fastlane ios dev
```
iOS Development version distribution flow
### ios sit
```
fastlane ios sit
```
iOS SIT version distribution flow
### ios uat
```
fastlane ios uat
```
iOS UAT version distribution flow
### ios stg
```
fastlane ios stg
```
iOS Staging version distribution flow
### ios production
```
fastlane ios production
```
iOS Production version distribution flow

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
