import React from "react";
import { TouchableOpacity, Text, Image, Alert, View } from "react-native";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { styled } from "nativewind";
import { theme } from "../assets/theme";
import { IP_ADDR } from "@env"; // ✅ Load API URL from .env

// ✅ Styled Components
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledView = styled(View);

// ✅ Google Sign-In Configuration
GoogleSignin.configure({
  scopes: ["profile","email"],
  webClientId: "46248115272-m66gnu362gmi9uflfojcm53a3ihulq90.apps.googleusercontent.com",
});

const GoogleLoginButton = () => {
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
  
      const signInData = await GoogleSignin.signIn();
      const idToken = signInData?.data?.idToken;

      console.log(idToken);
      // Display full sign-in data
      Alert.alert("Google Sign-In Success", JSON.stringify(idToken, null, 2));
    } catch (error: any) {
      // Display full error details
      Alert.alert("Google Sign-In Error", JSON.stringify(error, null, 2));
  
      // Extract error message and code safely
      const errorMessage = typeof error === "object" && error?.message
        ? String(error.message) 
        : "Unknown error occurred";
  
      const errorCode = error?.code ? `Error Code: ${error.code}` : "";
  
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          Alert.alert("Cancelled", "Google Sign-In was cancelled.");
          break;
        case statusCodes.IN_PROGRESS:
          Alert.alert("In Progress", "Google Sign-In is already in progress.");
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          Alert.alert("Error", "Google Play Services is not available.");
          break;
        default:
          Alert.alert("Error", `${errorMessage}\n${errorCode}`);
      }
    }
  };  

  return (
    <StyledTouchableOpacity
      className={`flex-row items-center justify-center px-4 py-3  bg-[#E8F4F7] rounded-xl border-[1px] border-[#0088b1]`}
      onPress={handleGoogleLogin}
    >
      <StyledImage
        source={require("../assets/icons/Google_Icon_png.png")}
        className="w-6 h-6 "
        resizeMode="contain"
      />
      <StyledView className="w-[1px] h-6 bg-gray-400 mx-4" />
      <StyledText className={`text-base font-medium ${theme.colors.black}`}>Login with Google</StyledText>
    </StyledTouchableOpacity>
  );
};

export default GoogleLoginButton;
