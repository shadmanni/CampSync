import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform
} from "react-native";
import { KeyRound, ArrowLeft, RotateCcw, Check, Sparkles } from "lucide-react-native";
import { colors, borders, radii, spacing, typography } from "../../theme/theme";
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
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={colors.violet} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Code</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <PopCard accent={colors.violet} style={styles.card}>
          <View style={styles.iconWrapper}>
            <KeyRound size={28} color={colors.violet} />
          </View>

          <Text style={styles.title}>Enter 6-Digit Code</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit OTP code to:{"\n"}
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
            accent={colors.violet}
            icon={Check}
            block
            style={{ marginBottom: spacing.lg }}
          />

          {/* Resend */}
          <View style={styles.resendRow}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Resend code in <Text style={styles.timerCount}>{timer}s</Text>
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                style={styles.resendBtn}
                activeOpacity={0.7}
              >
                <RotateCcw size={14} color={colors.coral} />
                <Text style={styles.resendText}>Resend OTP Code</Text>
              </TouchableOpacity>
            )}
          </View>
        </PopCard>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.containerPadding,
    paddingTop: 50,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.violetSoft,
    ...borders.card,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...typography.h3,
    color: colors.violet,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.containerPadding,
  },
  card: {
    padding: spacing.xl,
    alignItems: "center",
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.violetSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.violet,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  emailHighlight: {
    color: colors.violet,
    fontWeight: "700",
  },
  demoNoticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.violetSoft,
    borderRadius: radii.sm,
    ...borders.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    width: "100%",
  },
  demoNoticeText: {
    fontSize: 12,
    color: colors.violet,
    flex: 1,
    fontWeight: "600",
  },
  otpInput: {
    width: "100%",
    height: 58,
    backgroundColor: colors.surfaceInset,
    borderRadius: radii.sm,
    ...borders.card,
    textAlign: "center",
    fontSize: 28,
    letterSpacing: 10,
    fontWeight: "700",
    color: colors.violet,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: 12,
    color: colors.rose,
    marginBottom: spacing.md,
    fontWeight: "600",
    textAlign: "center",
  },
  resendRow: {
    alignItems: "center",
  },
  timerText: {
    fontSize: 12,
    color: colors.inkFaint,
  },
  timerCount: {
    color: colors.coral,
    fontWeight: "700",
  },
  resendBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resendText: {
    fontSize: 12,
    color: colors.coral,
    fontWeight: "700",
  },
});
