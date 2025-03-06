import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native";
import { styled } from "nativewind";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { IP_ADDR } from "@env";
import { Eye, EyeOff } from "lucide-react-native"; //  Import password toggle icons

// ✅ Styled Components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

const EmailLogin = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // ✅ Validate user input
  const validateInput = () => {
    let emailError = "";
    let passwordError = "";

    if (!credentials.email.trim()) {
      emailError = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        emailError = "Invalid email format";
      }
    }

    if (!credentials.password.trim()) {
      passwordError = "Password is required";
    } else {
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z]).{8,}$/;
      if (!passwordRegex.test(credentials.password)) {
        passwordError =
          "Password must be at least 8 characters, include a capital letter, a number & a special character";
      }
    }

    setErrors({ email: emailError, password: passwordError });
    return !(emailError || passwordError);
  };

  // ✅ Handle login request
  const handleLogin = async () => {
    setShowErrors(true);
    if (!validateInput()) return;

    setLoading(true);
    try {
      const response = await fetch(`${IP_ADDR}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.user) {
        Alert.alert("Success", "Logged in successfully!");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials.");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    }
  };

  // ✅ Handle forgot password request
  const handleForgotPassword = async () => {
    if (!credentials.email.trim()) {
      Alert.alert("Error", "Please enter your email before resetting the password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      Alert.alert("Error", "Invalid email format.");
      return;
    }

    try {
      const response = await fetch(`${IP_ADDR}/api/auth/forgotpassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: credentials.email }),
      });

      const data = await response.json();

      if (data.message !== "Email not registered") {
        setForgotPasswordVisible(true);
      } else {
        Alert.alert("Error", data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again later.");
    }
  };

  return (
    <StyledView>
      {/* Email Input */}
      <StyledTextInput
        className="p-4 mb-1 mt-2 text-base text-gray-800 placeholder-[#b3b3b3] border border-gray-300 rounded-xl"
        placeholder="mediversal@gmail.com"
        value={credentials.email}
        onChangeText={(text) => setCredentials({ ...credentials, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        returnKeyType="done"
        placeholderTextColor="#b3b3b3"
      />
      {showErrors && errors.email && (
        <StyledText className="mb-2 text-red-500">{errors.email}</StyledText>
      )}

      {/* Password Input with Toggle Visibility */}
      <StyledView className="relative">
        <StyledTextInput
          className={`p-4 pr-12 mt-4 text-base text-gray-500 border border-gray-300 rounded-xl`}
          placeholder="********"
          value={credentials.password}
          onChangeText={(text) => setCredentials({ ...credentials, password: text })}
          secureTextEntry={!isPasswordVisible}
          returnKeyType="done"
          blurOnSubmit
          placeholderTextColor="#b3b3b3"
        />
        <StyledTouchableOpacity
          className="absolute right-4 top-8"
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          {isPasswordVisible ? <EyeOff size={24} color="#0088b1" /> : <Eye size={24} color="#0088b1" />}
        </StyledTouchableOpacity>
      </StyledView>
      {showErrors && errors.password && (
        <StyledText className="mt-2 text-red-500">{errors.password}</StyledText>
      )}

      {/* Forgot Password Link */}
      <StyledView className="flex flex-row justify-end w-full pt-2 pb-4">
        <StyledTouchableOpacity onPress={handleForgotPassword} className="mt-3">
          <StyledText className="text-[#0088B1] text-base font-xl font-regular">
            Forgot Password?
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>

      {/* Login Button */}
      <StyledTouchableOpacity
        className="p-4 rounded-xl items-center bg-[#0088B1]"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#E8F4F7" />
        ) : (
          <StyledText className="text-base font-medium text-[#F8F8F8]">Login</StyledText>
        )}
      </StyledTouchableOpacity>
      

      {/* Forgot Password Modal */}
      {forgotPasswordVisible && (
        <ForgotPasswordModal
          isVisible={forgotPasswordVisible}
          onClose={() => setForgotPasswordVisible(false)}
          email={credentials.email}
        />
      )}
    </StyledView>
  );
};

export default EmailLogin;
