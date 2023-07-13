GREEN='\033[1;32m'
NC='\033[0m'

# echo "*************************************"
# echo "   Migrating to the eKYC package"
# echo "*************************************"
# echo ""
# echo "▸ ${GREEN}Creating temporary folder (if not exists).${NC}"
# echo ""

# create temp folder and download the ekyc files that do not fit the repo
# rm -rf "ekycTemp"
# mkdir -p "ekycTemp"

# echo "▸ ${GREEN}Downloading library zip...${NC}"

# (cd ekycTemp/ && curl -L "http://dl.dropboxusercontent.com/s/av2mv6royujeyvg/ekyc.zip?dl=0" -o "ekyc.zip")

# echo ""
# echo "● ${GREEN}Download completed${NC}"
# echo ""


# unzip with password (M@ya123)
# echo "▸ ${GREEN}Unzipping...${NC}"
# echo ""
# unzip -P "M@ya123" "ekycTemp/ekyc.zip" -d "ekycTemp/"
# echo ""

# copy the files into rn-ekyc/ios
# echo "▸ ${GREEN}Copying files to eKYC package folder${NC}"
# echo ""
# rsync -a "ekycTemp/ekyc/" "natives/react-native-ekyc/ios"

# delete the one inside the iOS folder
# echo "▸ ${GREEN}Removing legacy files from iOS project${NC}"
# rm -rf ios/eKYC ios/eKYC.h ios/eKYC.m ios/EzBio.h ios/EzBio.m ios/LibSodiumReact.h ios/LibSodiumReact.m ios/libRSAMobileSDK.a ios/libRSAMobileSDKSimulator.a ios/MobileAPI.h ios/RSAReactNative.h ios/RSAReactNative.m
# echo ""

# once done, delete the temp folder and lock files
echo "▸ ${GREEN}Deleting node modules and lock files, and clean up.${NC}"
rm -rf ios/build ios/Pods ios/Podfile.lock node_modules ekycTemp
echo ""

# install packages
echo "▸ ${GREEN}Installing packages${NC}"
npm i --legacy-peer-deps
echo ""

# install PODS
echo "▸ ${GREEN}Installing Pods${NC}"
npx pod-install
echo ""

echo "● ${GREEN}Finish.${NC}"