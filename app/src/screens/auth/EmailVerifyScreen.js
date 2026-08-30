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
import { ShieldCheck, Mail, ArrowRight, Lock, CheckCircle2, Sparkles } from "lucide-react-native";
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
        <View style={styles.brandHero}>
          <View style={styles.badgeRow}>
            <View style={styles.csLogoBadge}>
              <Text style={styles.csLogoText}>CS</Text>
            </View>
            <View style={styles.tagBadge}>
              <Sparkles size={13} color={colors.violet} />
              <Text style={styles.tagText}>ONE CAMPUS • ONE APP</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>CampusSync</Text>
          <Text style={styles.heroSubtitle}>
            Verified university community for discussions, peer carpools, live bidding, and local perks.
          </Text>
        </View>

        {/* Floating Input Card */}
        <View style={styles.cardWrapper}>
          <PopCard style={styles.card}>
            <Text style={styles.cardTitle}>Student Verification</Text>
            <Text style={styles.cardSubtitle}>
              Enter your official college email address to receive your 6-digit access code.
            </Text>

            <Text style={styles.inputLabel}>OFFICIAL COLLEGE EMAIL</Text>
            <View style={styles.inputBox}>
              <Mail size={18} color={colors.ink} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="yourname@college.edu"
                placeholderTextColor={colors.inkFaint}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErrorMsg("");
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <View style={styles.hintRow}>
              <CheckCircle2 size={13} color={colors.mint} />
              <Text style={styles.hintText}>Accepts @college.edu, @campus.ac.in, etc.</Text>
            </View>

            <PopButton
              title="Send Verification Code"
              onPress={handleRequestOtp}
              loading={loading}
              variant="violet"
              size="lg"
              icon={<ArrowRight size={18} color={colors.surface} />}
              style={styles.submitBtn}
            />
          </PopCard>
        </View>

        {/* Security Badges */}
        <View style={styles.trustBadges}>
          <View style={styles.trustItem}>
            <Lock size={14} color={colors.ink} />
            <Text style={styles.trustText}>Encrypted Auth</Text>
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
    flexGrow: 1,
    paddingBottom: spacing.xl
  },
  brandHero: {
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: spacing.containerPadding,
    alignItems: "center"
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  csLogoBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.violet,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hardSm
  },
  csLogoText: {
    color: colors.surface,
    fontWeight: "900",
    fontSize: 16
  },
  tagBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.violetSoft,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill
  },
  tagText: {
    ...typography.badge,
    color: colors.violet,
    fontSize: 11
  },
  heroTitle: {
    ...typography.hero,
    fontSize: 32,
    textAlign: "center",
    marginBottom: 6
  },
  heroSubtitle: {
    ...typography.body,
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 20
  },
  cardWrapper: {
    paddingHorizontal: spacing.containerPadding
  },
  card: {
    padding: spacing.lg
  },
  cardTitle: {
    ...typography.heading,
    fontSize: 18,
    marginBottom: 4
  },
  cardSubtitle: {
    ...typography.body,
    fontSize: 13,
    marginBottom: spacing.lg
  },
  inputLabel: {
    ...typography.caption,
    color: colors.ink,
    fontSize: 11,
    marginBottom: 6
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.sm
  },
  inputIcon: {
    marginRight: spacing.sm
  },
  input: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: "600"
  },
  errorText: {
    ...typography.bodySm,
    color: colors.rose,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.lg
  },
  hintText: {
    ...typography.bodySm,
    fontSize: 11.5,
    color: colors.inkSoft
  },
  submitBtn: {
    width: "100%"
  },
  trustBadges: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.containerPadding
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  trustText: {
    ...typography.caption,
    color: colors.ink,
    fontSize: 12
  }
});
