import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { ShieldCheck, Mail, ArrowRight, Lock, CheckCircle2 } from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { authService } from "../../services/authService";
import { PopCard } from "../../components/common/PopCard";
import { PopButton } from "../../components/common/PopButton";

export const EmailVerifyScreen = ({ navigation }) => {
  const [email, setEmail] = useState("alex.tech@college.edu");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRequestOtp = async () => {
    setErrorMsg("");
    if (!email || !email.trim()) {
      setErrorMsg("Please enter your college email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.requestOtp(email.trim().toLowerCase());
      setLoading(false);
      navigation.navigate("OtpVerify", {
        email: email.trim().toLowerCase(),
        demoNotice: response?.demoNotice
      });
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || "Failed to send OTP code.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Banner */}
        <View style={styles.heroSection}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>CS</Text>
          </View>
          <Text style={styles.heroTitle}>Campus Verification</Text>
          <Text style={styles.heroSubtitle}>
            One app for everything that happens on campus. Enter your official university email to join.
          </Text>
        </View>

        {/* Pop Card Form */}
        <PopCard style={styles.card}>
          <Text style={styles.inputLabel}>Official College Email</Text>
          <View style={styles.inputWrapper}>
            <Mail size={18} color={colors.inkFaint} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="yourname@college.edu"
              placeholderTextColor={colors.inkFaint}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMsg("");
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <View style={styles.domainPill}>
            <CheckCircle2 size={13} color={colors.mint} />
            <Text style={styles.domainText}>Allowed: @college.edu, @campus.ac.in, @univ.edu</Text>
          </View>

          <PopButton
            title="Send Verification Code"
            onPress={handleRequestOtp}
            loading={loading}
            variant="violet"
            size="lg"
            icon={<ArrowRight size={18} color="#FFFFFF" />}
            style={styles.submitBtn}
          />
        </PopCard>

        {/* Security Badges */}
        <View style={styles.trustBadges}>
          <View style={styles.trustItem}>
            <Lock size={14} color={colors.violet} />
            <Text style={styles.trustText}>6-Digit OTP Protected</Text>
          </View>
          <View style={styles.trustItem}>
            <ShieldCheck size={14} color={colors.mint} />
            <Text style={styles.trustText}>Verified Students Only</Text>
          </View>
        </View>
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
    paddingTop: 60,
    flexGrow: 1
  },
  heroSection: {
    alignItems: "center",
    marginBottom: spacing.xl
  },
  brandBadge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.lineStrong,
    ...shadows.hard,
    marginBottom: spacing.md
  },
  brandText: {
    color: colors.inkInvert,
    fontWeight: "900",
    fontSize: 22,
    letterSpacing: -1
  },
  heroTitle: {
    ...typography.h1,
    textAlign: "center",
    marginBottom: spacing.xs
  },
  heroSubtitle: {
    ...typography.body,
    textAlign: "center",
    paddingHorizontal: spacing.md,
    lineHeight: 20
  },
  card: {
    marginBottom: spacing.xl
  },
  inputLabel: {
    ...typography.label,
    fontSize: 13,
    marginBottom: 8
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceInset,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 12,
    marginBottom: 10
  },
  inputIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    height: 48,
    color: colors.ink,
    fontSize: 15,
    fontWeight: "600"
  },
  errorText: {
    ...typography.bodySm,
    color: colors.danger,
    fontWeight: "700",
    marginBottom: 8
  },
  domainPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.lg
  },
  domainText: {
    ...typography.bodySm,
    color: colors.inkFaint,
    fontSize: 11
  },
  submitBtn: {
    width: "100%"
  },
  trustBadges: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: spacing.md
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  trustText: {
    ...typography.bodySm,
    color: colors.inkSoft,
    fontWeight: "700"
  }
});
