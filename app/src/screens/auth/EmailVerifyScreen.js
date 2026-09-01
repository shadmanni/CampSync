import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { ShieldCheck, Mail, ArrowRight, Lock, CheckCircle2 } from "lucide-react-native";
import { colors, shadows, borders, radii, spacing, typography } from "../../theme/theme";
import { authService } from "../../services/authService";
import { PopCard } from "../../components/common/PopCard";
import { PopButton } from "../../components/common/PopButton";

export const EmailVerifyScreen = ({ navigation }) => {
  const [email, setEmail] = useState("alex.tech@learner.manipal.edu");
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
        {/* Violet Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.shieldIconWrapper}>
            <ShieldCheck size={38} color={colors.onAccent} />
          </View>
          <Text style={styles.heroTitle}>Campus Verification</Text>
          <Text style={styles.heroSubtitle}>
            CampusSync is an exclusive network for verified students. Connect with your peers using your university email.
          </Text>
        </View>

        {/* Floating Pop Card */}
        <View style={styles.cardContainer}>
          <PopCard accent={colors.violet} style={styles.card}>
            <Text style={styles.inputLabel}>Official College Email</Text>
            <View style={styles.inputContainer}>
              <Mail size={18} color={colors.violet} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="yourname@learner.manipal.edu"
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

            <View style={styles.domainsRow}>
              <CheckCircle2 size={13} color={colors.mint} />
              <Text style={styles.domainHint}>Supported: @learner.manipal.edu</Text>
            </View>

            <PopButton
              title="Send Verification Code"
              onPress={handleRequestOtp}
              loading={loading}
              accent={colors.violet}
              icon={ArrowRight}
              block
            />
          </PopCard>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustBadges}>
          <View style={styles.trustItem}>
            <Lock size={14} color={colors.violet} />
            <Text style={styles.trustText}>End-to-End Encrypted OTP</Text>
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
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroBanner: {
    backgroundColor: colors.violet,
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: spacing.containerPadding,
    alignItems: "center",
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    ...borders.card,
    borderTopWidth: 0,
  },
  shieldIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.onAccent,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    paddingHorizontal: spacing.md,
    lineHeight: 22,
  },
  cardContainer: {
    paddingHorizontal: spacing.containerPadding,
    marginTop: -30,
  },
  card: {
    padding: spacing.lg,
  },
  inputLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceInset,
    borderRadius: radii.sm,
    ...borders.card,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    color: colors.ink,
    fontSize: 15,
    fontWeight: "400",
  },
  errorText: {
    fontSize: 12,
    color: colors.rose,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  domainsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.lg,
  },
  domainHint: {
    fontSize: 12,
    color: colors.inkFaint,
  },
  trustBadges: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.containerPadding,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trustText: {
    fontSize: 12,
    color: colors.inkSoft,
    fontWeight: "600",
  },
});
