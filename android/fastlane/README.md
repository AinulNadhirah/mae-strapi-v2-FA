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
## Android
### android build
```
fastlane android build
```
Build the Android application
### android fabric
```
fastlane android fabric
```
Upload the Android application to Fabric Beta
### android dev
```
fastlane android dev
```
Android Development version distribution flow
### android sit
```
fastlane android sit
```
Android SIT version distribution flow
### android uat
```
fastlane android uat
```
Android UAT version distribution flow
### android stg
```
fastlane android stg
```
Android Staging version distribution flow
### android production
```
fastlane android production
```
Android Production version distribution flow

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
