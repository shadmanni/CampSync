import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { KeyRound, CheckCircle2, RotateCcw } from "lucide-react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { GlassCard } from "../../components/common/GlassCard";
import { PrimaryButton } from "../../components/common/PrimaryButton";

export const OtpVerifyScreen = ({ route, navigation }) => {
  const { email, demoNotice } = route.params || { email: "alex.tech@college.edu" };
  const { login } = useAuth();

  const [otp, setOtp] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async () => {
    setErrorMsg("");
    if (!otp || otp.trim().length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, otp.trim());
      setLoading(false);
      navigation.navigate("VerifiedDone", { user: result.user });
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || "Invalid OTP code. Please try again.");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await authService.requestOtp(email);
      setCooldown(60);
      setErrorMsg("");
    } catch (err) {
      setErrorMsg(err.message || "Failed to resend OTP.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.heroSection}>
          <View style={styles.iconWrapper}>
            <KeyRound size={32} color={colors.primaryLight} />
          </View>
          <Text style={styles.heroTitle}>Enter Verification Code</Text>
          <Text style={styles.heroSubtitle}>
            We sent a 6-digit security code to{"\n"}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
        </View>

        <GlassCard style={styles.card} variant="highlight">
          <Text style={styles.inputLabel}>6-Digit Security Code</Text>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={(text) => {
              setOtp(text);
              setErrorMsg("");
            }}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="123456"
            placeholderTextColor={colors.textSubtle}
            textAlign="center"
          />

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          {demoNotice ? (
            <View style={styles.demoBox}>
              <CheckCircle2 size={14} color={colors.accentCyan} />
              <Text style={styles.demoText}>{demoNotice}</Text>
            </View>
          ) : null}

          <PrimaryButton
            title="Verify & Enter Campus"
            onPress={handleVerify}
            loading={loading}
            style={styles.verifyBtn}
          />

          <View style={styles.resendRow}>
            {cooldown > 0 ? (
              <Text style={styles.cooldownText}>Resend code in {cooldown}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
                <RotateCcw size={14} color={colors.primaryLight} />
                <Text style={styles.resendText}>Resend OTP Code</Text>
              </TouchableOpacity>
            )}
          </View>
        </GlassCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.containerPadding
  },
  heroSection: {
    alignItems: "center",
    marginBottom: spacing.xl
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md
  },
  heroTitle: {
    ...typography.h2,
    textAlign: "center",
    marginBottom: spacing.sm
  },
  heroSubtitle: {
    ...typography.body,
    textAlign: "center",
    lineHeight: 22
  },
  emailHighlight: {
    color: colors.primaryLight,
    fontWeight: "600"
  },
  card: {
    padding: spacing.lg
  },
  inputLabel: {
    ...typography.label,
    textAlign: "center",
    marginBottom: spacing.md
  },
  otpInput: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    height: 56,
    color: colors.textMain,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 8,
    marginBottom: spacing.md
  },
  errorText: {
    ...typography.bodySm,
    color: colors.accentRose,
    textAlign: "center",
    marginBottom: spacing.sm
  },
  demoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
    gap: 6
  },
  demoText: {
    ...typography.bodySm,
    color: colors.accentCyan,
    fontSize: 12
  },
  verifyBtn: {
    marginTop: spacing.xs
  },
  resendRow: {
    alignItems: "center",
    marginTop: spacing.lg
  },
  cooldownText: {
    ...typography.bodySm,
    color: colors.textSubtle
  },
  resendBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  resendText: {
    ...typography.bodySm,
    color: colors.primaryLight,
    fontWeight: "600"
  }
});
