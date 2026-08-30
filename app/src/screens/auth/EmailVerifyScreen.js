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
        {/* Deep Indigo Hero Section */}
        <View style={styles.heroBanner}>
          <View style={styles.shieldIconWrapper}>
            <ShieldCheck size={38} color={colors.textInverse} />
          </View>
          <Text style={styles.heroTitle}>Campus Verification</Text>
          <Text style={styles.heroSubtitle}>
            CampusSync is an exclusive network for verified students. Connect with your peers using your university email.
          </Text>
        </View>

        {/* Floating White Input Card */}
        <View style={styles.cardContainer}>
          <GlassCard style={styles.card}>
            <Text style={styles.inputLabel}>Official College Email</Text>
            <View style={styles.inputContainer}>
              <Mail size={18} color={colors.primary} style={styles.inputIcon} />
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
              <CheckCircle2 size={13} color={colors.accentEmerald} />
              <Text style={styles.domainHint}>Supported: @college.edu, @campus.ac.in, @university.edu</Text>
            </View>

            <PrimaryButton
              title="Send Verification Code"
              onPress={handleRequestOtp}
              loading={loading}
              icon={<ArrowRight size={18} color={colors.textInverse} />}
              style={styles.submitBtn}
            />
          </GlassCard>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustBadges}>
          <View style={styles.trustItem}>
            <Lock size={14} color={colors.primary} />
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
    flexGrow: 1
  },
  heroBanner: {
    backgroundColor: colors.primaryHeader, // #180052 Deep Indigo
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: spacing.containerPadding,
    alignItems: "center",
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl
  },
  shieldIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md
  },
  heroTitle: {
    ...typography.h1,
    color: colors.textInverse,
    textAlign: "center",
    marginBottom: spacing.sm,
    fontSize: 26
  },
  heroSubtitle: {
    ...typography.body,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    paddingHorizontal: spacing.md,
    lineHeight: 22,
    fontSize: 14
  },
  cardContainer: {
    paddingHorizontal: spacing.containerPadding,
    marginTop: -30
  },
  card: {
    padding: spacing.lg
  },
  inputLabel: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSubtle,
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
    color: colors.textPrimary,
    ...typography.bodyLg,
    fontSize: 15
  },
  errorText: {
    ...typography.bodySm,
    color: colors.accentRose,
    marginBottom: spacing.sm,
    fontWeight: "600"
  },
  domainsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.lg
  },
  domainHint: {
    ...typography.bodySm,
    color: colors.textSubtle,
    fontSize: 12
  },
  submitBtn: {
    marginTop: spacing.xs
  },
  trustBadges: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.containerPadding
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  trustText: {
    ...typography.bodySm,
    color: colors.textMuted,
    fontWeight: "600"
  }
});
