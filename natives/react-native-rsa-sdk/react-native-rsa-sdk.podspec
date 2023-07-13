require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-rsa-sdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-rsa-sdk
                   DESC
  s.homepage     = "https://github.com/github_account/react-native-rsa-sdk"
  # brief license entry:
  s.license      = "MIT"
  # optional - use expanded license entry instead:
  # s.license    = { :type => "MIT", :file => "LICENSE" }
  s.authors      = { "idraki" => "idrakimuhamad@gmail.com.com" }
  s.platforms    = { :ios => "9.0" }
  s.source       = { :http => 'file:' + __dir__ + '/' }

  s.source_files = "ios/**/*.{h,c,m,swift}"
  s.ios.vendored_libraries = 'ios/simulator/libMobileRsaSDKSimulator.a', 'ios/device/libMobileRsaSDK.a'
  s.requires_arc = false

  s.dependency "React-Core"
end

