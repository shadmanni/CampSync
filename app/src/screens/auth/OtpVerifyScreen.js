import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
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
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Code</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <PopCard style={styles.card}>
          <View style={styles.iconCircle}>
            <KeyRound size={26} color={colors.violet} />
          </View>

          <Text style={styles.title}>Enter 6-Digit Code</Text>
          <Text style={styles.subtitle}>
            We've sent an access OTP code to:{"\n"}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          {demoNotice ? (
            <View style={styles.demoNoticeBox}>
              <Sparkles size={14} color={colors.violet} />
              <Text style={styles.demoNoticeText}>{demoNotice}</Text>
            </View>
          ) : null}

          {/* 6-Digit OTP Box */}
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={(t) => {
              setOtp(t.replace(/[^0-9]/g, "").slice(0, 6));
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
            icon={<Check size={18} color={colors.surface} />}
            style={styles.verifyBtn}
          />

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
                <RotateCcw size={13} color={colors.coral} />
                <Text style={styles.resendText}>Resend Code</Text>
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
    backgroundColor: colors.canvas
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.containerPadding,
    paddingTop: 50,
    paddingBottom: spacing.sm
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hardSm
  },
  headerTitle: {
    ...typography.heading,
    color: colors.ink
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.containerPadding
  },
  card: {
    padding: spacing.xl,
    alignItems: "center"
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.violetSoft,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    ...shadows.hardSm
  },
  title: {
    ...typography.title,
    fontSize: 22,
    textAlign: "center",
    marginBottom: 4
  },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.md
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
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
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
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    textAlign: "center",
    fontSize: 26,
    letterSpacing: 8,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: spacing.md,
    ...shadows.hardSm
  },
  errorText: {
    ...typography.bodySm,
    color: colors.rose,
    fontWeight: "700",
    marginBottom: spacing.md
  },
  verifyBtn: {
    width: "100%",
    marginBottom: spacing.lg
  },
  resendRow: {
    alignItems: "center"
  },
  timerText: {
    ...typography.bodySm,
    color: colors.inkSoft
  },
  timerCount: {
    color: colors.coral,
    fontWeight: "800"
  },
  resendBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  resendText: {
    ...typography.badge,
    color: colors.coral
  }
});
