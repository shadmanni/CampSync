import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput
} from "react-native";
import {
  Compass,
  Percent,
  MapPin,
  Tag,
  Copy,
  ExternalLink,
  Sparkles
} from "lucide-react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { HeaderBar } from "../../components/common/HeaderBar";
import { GlassCard } from "../../components/common/GlassCard";
import { CategoryPill } from "../../components/common/CategoryPill";
import { PrimaryButton } from "../../components/common/PrimaryButton";

const NEARBY_CATEGORIES = ["All Perks", "Food & Cafe", "Books & Print", "Fitness", "Tech"];

const SAMPLE_DEALS = [
  {
    id: "deal-1",
    storeName: "The Campus Brew & Bakery",
    category: "Food & Cafe",
    discount: "25% OFF",
    description: "Flat 25% discount on all artisan coffees, sandwiches, and combo platters with valid college ID.",
    distance: "0.2 km away",
    couponCode: "STUDENTBREW25",
    validTill: "Valid till end of semester"
  },
  {
    id: "deal-2",
    storeName: "Apex Stationers & Print Lab",
    category: "Books & Print",
    discount: "15% OFF",
    description: "15% discount on thesis binding, color laser printing, and all engineering drawing kits.",
    distance: "0.4 km away",
    couponCode: "PRINTAPEX15",
    validTill: "Open daily 8 AM - 10 PM"
  },
  {
    id: "deal-3",
    storeName: "PowerZone Student Gym & Spa",
    category: "Fitness",
    discount: "₹999 / mo",
    description: "Exclusive student semester pass with free trainer guidance and locker access.",
    distance: "0.8 km away",
    couponCode: "FITCAMPUS999",
    validTill: "Limited student slots"
  }
];

export const NearbyFeedScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Perks");
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const renderDealCard = ({ item }) => {
    const isCopied = copiedCode === item.couponCode;

    return (
      <GlassCard style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.discountBadge}>
            <Percent size={13} color={colors.textInverse} />
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
          <View style={styles.distanceBadge}>
            <MapPin size={12} color={colors.primary} />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>

        <Text style={styles.storeName}>{item.storeName}</Text>
        <Text style={styles.description}>{item.description}</Text>

        {/* Coupon Box */}
        <View style={styles.couponContainer}>
          <View style={styles.couponLeft}>
            <Text style={styles.couponLabel}>PROMO CODE</Text>
            <Text style={styles.couponCode}>{item.couponCode}</Text>
          </View>
          <TouchableOpacity
            style={[styles.copyBtn, isCopied && styles.copyBtnSuccess]}
            onPress={() => handleCopy(item.couponCode)}
            activeOpacity={0.7}
          >
            <Copy size={13} color={isCopied ? colors.textInverse : colors.primary} />
            <Text style={[styles.copyText, isCopied && styles.copyTextSuccess]}>
              {isCopied ? "Copied!" : "Copy"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.validText}>{item.validTill}</Text>
        </View>
      </GlassCard>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="CampusNearby" subtitle="Exclusive Local Student Discounts" />

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={NEARBY_CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <CategoryPill
              label={item}
              active={selectedCategory === item}
              onPress={() => setSelectedCategory(item)}
            />
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Deals List */}
      <FlatList
        data={SAMPLE_DEALS}
        keyExtractor={(item) => item.id}
        renderItem={renderDealCard}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary
  },
  categoryContainer: {
    paddingVertical: spacing.md
  },
  categoriesList: {
    paddingHorizontal: spacing.containerPadding
  },
  listContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 100
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm
  },
  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.secondary, // Warm Orange #FF6F3C
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full
  },
  discountText: {
    color: colors.textInverse,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.3
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.bgDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full
  },
  distanceText: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: "700",
    fontSize: 11
  },
  storeName: {
    ...typography.h3,
    color: colors.textPrimary,
    fontSize: 17,
    marginBottom: 4
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.md
  },
  couponContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.bgSubtle,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    borderStyle: "dashed",
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.sm
  },
  couponLeft: {
    justifyContent: "center"
  },
  couponLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textSubtle,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  couponCode: {
    ...typography.label,
    color: colors.primary,
    fontSize: 14,
    letterSpacing: 1
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.bgDim,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full
  },
  copyBtnSuccess: {
    backgroundColor: colors.accentEmerald
  },
  copyText: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12
  },
  copyTextSuccess: {
    color: colors.textInverse
  },
  cardFooter: {
    marginTop: 2
  },
  validText: {
    ...typography.bodySm,
    color: colors.textSubtle,
    fontSize: 11
  }
});
