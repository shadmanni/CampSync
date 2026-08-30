import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from "react-native";
import { ShieldCheck, Mail, ArrowRight, Lock } from "lucide-react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { authService } from "../../services/authService";
import { GlassCard } from "../../components/common/GlassCard";
import { PrimaryButton } from "../../components/common/PrimaryButton";

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
          <View style={styles.shieldIconWrapper}>
            <ShieldCheck size={36} color={colors.accentEmerald} />
          </View>
          <Text style={styles.heroTitle}>Campus Verification</Text>
          <Text style={styles.heroSubtitle}>
            CampusSync is an exclusive, trusted network. Verify your student identity with your official college email.
          </Text>
        </View>

        {/* Input Glass Card */}
        <GlassCard style={styles.card} variant="highlight">
          <Text style={styles.inputLabel}>Official College Email</Text>
          <View style={styles.inputContainer}>
            <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="yourname@college.edu"
              placeholderTextColor={colors.textSubtle}
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

          <View style={styles.domainsRow}>
            <Text style={styles.domainHint}>Supported: @college.edu, @campus.ac.in, @university.edu</Text>
          </View>

          <PrimaryButton
            title="Send Verification Code"
            onPress={handleRequestOtp}
            loading={loading}
            icon={<ArrowRight size={18} color={colors.textMain} />}
            style={styles.submitBtn}
          />
        </GlassCard>

        {/* Trust Badges */}
        <View style={styles.trustBadges}>
          <View style={styles.trustItem}>
            <Lock size={14} color={colors.textMuted} />
            <Text style={styles.trustText}>End-to-End Encrypted OTP</Text>
          </View>
          <View style={styles.trustItem}>
            <ShieldCheck size={14} color={colors.accentEmerald} />
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
  shieldIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md
  },
  heroTitle: {
    ...typography.h1,
    textAlign: "center",
    marginBottom: spacing.sm
  },
  heroSubtitle: {
    ...typography.body,
    textAlign: "center",
    paddingHorizontal: spacing.sm,
    lineHeight: 22
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.xl
  },
  inputLabel: {
    ...typography.label,
    marginBottom: spacing.sm
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm
  },
  inputIcon: {
    marginRight: spacing.sm
  },
  input: {
    flex: 1,
    height: 48,
    color: colors.textMain,
    ...typography.bodyLg,
    fontSize: 15
  },
  errorText: {
    ...typography.bodySm,
    color: colors.accentRose,
    marginBottom: spacing.sm
  },
  domainsRow: {
    marginBottom: spacing.lg
  },
  domainHint: {
    ...typography.bodySm,
    color: colors.textSubtle
  },
  submitBtn: {
    marginTop: spacing.xs
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
    color: colors.textMuted
  }
});
