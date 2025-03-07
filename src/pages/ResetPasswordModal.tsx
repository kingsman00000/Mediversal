import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import Modal from "react-native-modal";
import { styled } from "nativewind";
import { Eye, EyeOff } from "lucide-react-native";
import { theme } from "../assets/theme";
import { IP_ADDR } from "@env";
import SuccessAnimation from "./SuccessAnimation";

// ✅ Styled Components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface ResetPasswordModalProps {
  isVisible: boolean;
  onClose: () => void;
  email: string;
  jwt: string;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isVisible, onClose, email, jwt }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  // ✅ Password Validation Function
  const isValidPassword = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  };

  // ✅ Handle Password Reset
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (!isValidPassword(password)) {
      Alert.alert(
        "Error",
        "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one special character, and one number."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://13.201.98.12:4000/api/auth/resetpassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const responseData = await response.json();
      setLoading(false);
      Alert.alert("Response", JSON.stringify(responseData));
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <Modal isVisible={isVisible} style={{ margin: 0, justifyContent: "flex-end" }}>
      
      <StyledView className="items-center p-5 bg-[#f8f8f8] rounded-t-3xl">
        <StyledView className="self-start pl-3">
          <StyledText className={`mb-3 text-2xl font-bold ${theme.colors.primary}`}>
            Reset Password
          </StyledText>
          <StyledText className={`mb-3 ${theme.font.sizeLg} ${theme.colors.gray}`}>
            Set a new password. Make sure it's different from the previous one.
          </StyledText>
        </StyledView>

        {/* ✅ Password Input with Eye Icon */}
        <StyledView className="relative w-full">
          <StyledTextInput
            className={`w-full p-4 pr-12 mb-3 ${theme.colors.black} text-lg border ${
              isPasswordFocused ? "border-[#0088b1]" : "border-gray-300"
            } rounded-lg`}
            placeholder="********"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#b3b3b3"
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
          />
          <StyledTouchableOpacity
            className="absolute pl-3 pr-3 right-4 top-4"
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? <EyeOff size={22} color="#0088b1" /> : <Eye size={22} color="#0088b1" />}
          </StyledTouchableOpacity>
        </StyledView>

        {/* ✅ Confirm Password Input with Eye Icon */}
        <StyledView className="relative w-full">
          <StyledTextInput
            className={`w-full p-4 pr-12 mb-3 ${theme.colors.black} text-lg border ${
              isConfirmPasswordFocused ? "border-[#0088b1]" : "border-gray-300"
            } rounded-lg`}
            placeholder="Confirm Password"
            secureTextEntry={!isConfirmPasswordVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor="#b3b3b3"
            onFocus={() => setIsConfirmPasswordFocused(true)}
            onBlur={() => setIsConfirmPasswordFocused(false)}
          />
          <StyledTouchableOpacity
            className="absolute pl-3 pr-3 right-4 top-4"
            onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
          >
            {isConfirmPasswordVisible ? <EyeOff size={22} color="#0088b1" /> : <Eye size={22} color="#0088b1" />}
          </StyledTouchableOpacity>
        </StyledView>

        {/* ✅ Reset Password Button */}
        <StyledTouchableOpacity
          className="bg-[#0088B1] p-3 rounded-xl mt-3 w-full items-center"
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="[#f8f8f8]" /> : <StyledText className="text-lg font-bold text-[#f8f8f8]">Update Password</StyledText>}
        </StyledTouchableOpacity>
      </StyledView>
    </Modal>
  );
};

export default ResetPasswordModal;
