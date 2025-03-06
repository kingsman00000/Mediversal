import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import Modal from "react-native-modal";
import { styled } from "nativewind";
import { theme } from "../assets/theme";
import ResetPasswordModal from "./ResetPasswordModal";
import { IP_ADDR } from "@env";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface OTPModalProps {
  isVisible: boolean;
  onClose: () => void;
  email: string;
}

const ForgotPasswordModal: React.FC<OTPModalProps> = ({ isVisible, onClose, email }) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>(Array(6).fill(null));
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showErrors, setShowErrors] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });


  // ✅ Resend OTP State
  const [resendTimer, setResendTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  
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


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResendDisabled && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [resendTimer, isResendDisabled]);

  // ✅ Handle OTP Input
  const handleOTPChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    setTimeout(() => {
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      } else if (!value && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }, 0);
  };

  // ✅ Verify OTP API Call
  const verifyOTP = async () => {
    const otpCode = otp.join("");

    if (otpCode.length < 6) {
      Alert.alert("Invalid OTP", "Please enter the full 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${IP_ADDR}/api/auth/verifyreset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();
      setLoading(false);

      if (data.jwt) {
        setJwtToken(data.jwt);
        setShowResetModal(true);
      } else {
        Alert.alert("OTP Verification Failed", data.message || "Invalid OTP.");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error(error);
    }
  };

  // ✅ Resend OTP Logic
  const handleResendOTP = async () => {
    setIsResendDisabled(true);
    setResendTimer(30); // Reset timer

    try {
      const response = await fetch(`${IP_ADDR}/api/auth/forgotpassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.message === "OTP Sent") {
        Alert.alert("Success", "A new OTP has been sent to your email.");
      } else {
        Alert.alert("Error", data.message || "Something went wrong.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to resend OTP. Please try again later.");
    }
  };

  return (
    <>
      <Modal isVisible={isVisible} style={{ margin: 0, justifyContent: "flex-end" }}>

        <StyledView className="items-center p-8 bg-white rounded-t-3xl">
         <StyledView className = "items-left" >
         <StyledText className={`mb-3 text-2xl font-bold ${theme.colors.primary}`}>
            Verify to Reset Password
          </StyledText>
          <StyledText className="mb-3 text-base text-gray-600 text-start">
            We've sent a 6-digit OTP to your email. Please enter it here.
          </StyledText>

         </StyledView>
          {/* Email Input */}
            <StyledTextInput
          className="w-full mb-4 mt-4 p-4 text-base text-gray-800 placeholder-[#b3b3b3] border border-gray-300 rounded-xl"
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

          {/* ✅ OTP Input Row */}
          <StyledView className="flex-row justify-center space-x-3">
            {otp.map((digit, index) => (
              <StyledTextInput
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el as TextInput | null;
                }}
                className={`w-12 h-12 text-lg ${theme.colors.black} font-medium text-center border border-gray-400 rounded-lg`}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleOTPChange(value, index)}
              />
            ))}
          </StyledView>

          {/* ✅ Verify Button */}
          <StyledTouchableOpacity
            className="bg-[#0088B1] p-3 rounded-xl mt-5 w-full items-center"
            onPress={verifyOTP}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <StyledText className="text-base font-medium text-[#F8F8F8]">Verify & Continue</StyledText>}
          </StyledTouchableOpacity>

          {/* ✅ Resend OTP Button with Timer */}
          <StyledTouchableOpacity
            className={`mt-3 ${isResendDisabled ? "opacity-50" : ""}`}
            onPress={handleResendOTP}
            disabled={isResendDisabled}
          >
            {/* <StyledText className="text-lg font-bold text-blue-600">
              {isResendDisabled ? `Didn't get OTP? Resend in ${resendTimer}s` : "Resend OTP"}
            </StyledText> */}

            <StyledView className = "mt-6">
            {isResendDisabled ? <StyledText className = "text-base font-regular text-gray-400">
              Didn't get OTP? Resend in <StyledText className="text-[#0088B1]">{resendTimer}s</StyledText></StyledText> : 
              <StyledText className = "text-base font-medium text-[#0088B1]">Resend OTP</StyledText>}
            </StyledView>
            
          </StyledTouchableOpacity>
        </StyledView>
      </Modal>

      {/* ✅ Reset Password Modal after OTP Verification */}
      {showResetModal && (
        <ResetPasswordModal
          isVisible={showResetModal}
          onClose={() => setShowResetModal(false)}
          email={email}
          jwt={jwtToken as string}
        />
      )}
    </>
  );
};

export default ForgotPasswordModal;
