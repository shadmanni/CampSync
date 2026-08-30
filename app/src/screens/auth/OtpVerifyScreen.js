import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { KeyRound, ArrowLeft, RotateCcw, Check, Sparkles } from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { PopCard } from "../../components/common/PopCard";
import { PopButton } from "../../components/common/PopButton";

export const OtpVerifyScreen = ({ route, navigation }) => {
  const { email, demoNotice } = route.params;
  const { login } = useAuth();

  const [otp, setOtp] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerifyOtp = async () => {
    setErrorMsg("");
    if (!otp || otp.trim().length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      await login(email, otp.trim());
      setLoading(false);
      navigation.navigate("VerifiedDone");
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || "Invalid OTP code. Please try again.");
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setErrorMsg("");
    try {
      await authService.requestOtp(email);
      setTimer(60);
    } catch (err) {
      setErrorMsg(err.message || "Failed to resend code.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <ArrowLeft size={18} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify OTP</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Card */}
        <PopCard style={styles.card}>
          <View style={styles.iconCircle}>
            <KeyRound size={26} color={colors.violet} />
          </View>

          <Text style={styles.title}>Enter 6-Digit Code</Text>
          <Text style={styles.subtitle}>
            We've sent a verification code to{"\n"}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          {demoNotice ? (
            <View style={styles.demoNoticeBox}>
              <Sparkles size={14} color={colors.violet} />
              <Text style={styles.demoNoticeText}>{demoNotice}</Text>
            </View>
          ) : null}

          {/* OTP Input */}
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={(text) => {
              setOtp(text.replace(/[^0-9]/g, "").slice(0, 6));
              setErrorMsg("");
            }}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor={colors.inkFaint}
          />

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <PopButton
            title="Verify & Enter Campus"
            onPress={handleVerifyOtp}
            loading={loading}
            variant="violet"
            size="lg"
            icon={<Check size={18} color="#FFFFFF" />}
            style={styles.verifyBtn}
          />

          {/* Resend Cooldown */}
          <View style={styles.resendRow}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Resend code in <Text style={styles.timerCount}>{timer}s</Text>
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                style={styles.resendBtn}
                activeOpacity={0.8}
              >
                <RotateCcw size={14} color={colors.violet} />
                <Text style={styles.resendText}>Resend OTP Code</Text>
              </TouchableOpacity>
            )}
          </View>
        </PopCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas
  },
  scrollContent: {
    padding: spacing.containerPadding,
    paddingTop: 50,
    flexGrow: 1
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hardSm
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18
  },
  card: {
    alignItems: "center",
    padding: spacing.xl
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.violetSoft,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md
  },
  title: {
    ...typography.h2,
    fontSize: 22,
    marginBottom: 4,
    textAlign: "center"
  },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.lg
  },
  emailHighlight: {
    color: colors.ink,
    fontWeight: "800"
  },
  demoNoticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.violetSoft,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    width: "100%"
  },
  demoNoticeText: {
    ...typography.bodySm,
    color: colors.violet,
    fontWeight: "700",
    flex: 1
  },
  otpInput: {
    width: "100%",
    height: 58,
    backgroundColor: colors.surfaceInset,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    textAlign: "center",
    fontSize: 28,
    letterSpacing: 8,
    fontWeight: "900",
    color: colors.ink,
    marginBottom: spacing.md
  },
  errorText: {
    ...typography.bodySm,
    color: colors.danger,
    fontWeight: "700",
    marginBottom: spacing.md,
    textAlign: "center"
  },
  verifyBtn: {
    width: "100%",
    marginBottom: spacing.md
  },
  resendRow: {
    alignItems: "center"
  },
  timerText: {
    ...typography.bodySm,
    color: colors.inkFaint
  },
  timerCount: {
    color: colors.violet,
    fontWeight: "800"
  },
  resendBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  resendText: {
    ...typography.bodySm,
    color: colors.violet,
    fontWeight: "800"
  }
});
