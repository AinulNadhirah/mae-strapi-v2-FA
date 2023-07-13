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
or alternatively using `brew install fastlane`

# Available Actions
### generate_git_tag
```
fastlane generate_git_tag
```
Generate a git tag locally for version or build number bump
### get_previous_tag
```
fastlane get_previous_tag
```
Get previous local git tag value
### push_tag_to_remote
```
fastlane push_tag_to_remote
```
Push last generated local git tag to remote
### update_android_version
```
fastlane update_android_version
```
Update android versioning
### update_ios_version
```
fastlane update_ios_version
```
Update ios versioning
### commit_android_version_bump
```
fastlane commit_android_version_bump
```
Commit android version bump
### commit_ios_version_bump
```
fastlane commit_ios_version_bump
```
Commit ios version bump
### get_git_tag_array
```
fastlane get_git_tag_array
```
Get git tag array
### upload_android_sourcemaps
```
fastlane upload_android_sourcemaps
```
Upload android sourcemaps
### upload_ios_sourcemaps
```
fastlane upload_ios_sourcemaps
```
Upload ios sourcemaps

----

## iOS
### ios build
```
fastlane ios build
```
Build iOS app
### ios appcenter
```
fastlane ios appcenter
```
Upload iOS app to App Center
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
### ios cind
```
fastlane ios cind
```
iOS CIND version distribution flow
### ios ntt
```
fastlane ios ntt
```
iOS NTT version distribution flow
### ios kldc
```
fastlane ios kldc
```
iOS KLDC version distribution flow
### ios production
```
fastlane ios production
```
iOS Production version distribution flow

----

## Android
### android build
```
fastlane android build
```
Build the Android application
### android appcenter
```
fastlane android appcenter
```
Upload Android app to App Center
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
### android cind
```
fastlane android cind
```
Android CIND version distribution flow
### android ntt
```
fastlane android ntt
```
Android NTT version distribution flow
### android kldc
```
fastlane android kldc
```
Android KLDC version distribution flow
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
