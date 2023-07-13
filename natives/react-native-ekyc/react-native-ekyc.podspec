require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-ekyc"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-ekyc
                   DESC
  s.homepage     = "https://github.com/github_account/react-native-ekyc"
  # brief license entry:
  s.license      = "MIT"
  # optional - use expanded license entry instead:
  # s.license    = { :type => "MIT", :file => "LICENSE" }
  s.authors      = { "Your Name" => "yourname@email.com" }
  s.platforms    = { :ios => "11.0" }
  s.source       = { :http => 'file:' + __dir__ + '/' }


  s.source_files = "ios/**/*.{h,m}"
  s.ios.vendored_libraries = 'ios/IDP/device_arch/*.a', 'ios/IDP/simulator_arch/*.a'
  s.vendored_frameworks = 'ios/Frameworks/Ezlogger.xcframework', 'ios/Frameworks/EZBoxerstatic.xcframework'
  # s.exclude_files = 'ios/Frameworks/smma.framework', 'ios/Frameworks/VVUtils.framework'
  s.resources = ['ios/Selfie/images/*.png', 'ios/IDP/eKYCViewController.xib', 'ios/Selfie/SelfieViewController.xib','ios/IDP/hologramdetection.{tflite,txt}', 'ios/IDP/device_arch/HologramProcessor.swiftmodule/*.{swiftdoc,swiftmodule}', 'ios/Selfie/fico_fba_model.tflite', 'ios/Selfie/unknown_embeddings.txt', 'ios/Selfie/PublicKeyCert.plist']
  

  s.dependency "React-Core"
  s.dependency "SSZipArchive"
  s.frameworks = 'AssetsLibrary', 'Accelerate', 'Security'
end

