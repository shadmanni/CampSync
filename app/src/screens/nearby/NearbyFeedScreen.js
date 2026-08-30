import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput
} from "react-native";
import {
  Compass,
  Percent,
  MapPin,
  Tag,
  Copy,
  Check,
  Search,
  Sparkles
} from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { nearbyService } from "../../services/nearbyService";
import { HeaderBar } from "../../components/common/HeaderBar";
import { PopCard } from "../../components/common/PopCard";
import { PopPill } from "../../components/common/PopPill";
import { PopButton } from "../../components/common/PopButton";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";

const NEARBY_CATEGORIES = ["All Perks", "Food & Cafe", "Books & Print", "Fitness", "Tech"];

export const NearbyFeedScreen = () => {
  const [deals, setDeals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Perks");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchDeals = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await nearbyService.getDeals(selectedCategory, searchQuery);
      setDeals(data || []);
    } catch (err) {
      setError(err.message || "Failed to load partner deals.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeals(true);
  };

  const handleCopy = (code) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const renderDealCard = ({ item }) => {
    const isCopied = copiedCode === item.couponCode;

    return (
      <PopCard style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.discountBadge, { backgroundColor: colors.skySoft }]}>
            <Percent size={13} color={colors.sky} />
            <Text style={styles.discountText}>{item.discount || "DEAL"}</Text>
          </View>
          <View style={styles.distanceBadge}>
            <MapPin size={12} color={colors.inkFaint} />
            <Text style={styles.distanceText}>{item.distance || "Near Campus"}</Text>
          </View>
        </View>

        <Text style={styles.storeName}>{item.storeName || item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>

        {/* Promo Code Box */}
        {item.couponCode ? (
          <PopCard style={styles.couponCard} variant="inset">
            <View>
              <Text style={styles.couponLabel}>PROMO CODE</Text>
              <Text style={styles.couponCode}>{item.couponCode}</Text>
            </View>

            <TouchableOpacity
              style={[styles.copyBtn, isCopied && styles.copyBtnSuccess]}
              onPress={() => handleCopy(item.couponCode)}
              activeOpacity={0.8}
            >
              {isCopied ? (
                <>
                  <Check size={13} color={colors.surface} />
                  <Text style={styles.copyTextSuccess}>Copied!</Text>
                </>
              ) : (
                <>
                  <Copy size={13} color={colors.ink} />
                  <Text style={styles.copyText}>Copy</Text>
                </>
              )}
            </TouchableOpacity>
          </PopCard>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={styles.validText}>{item.validTill || "Valid with College ID"}</Text>
        </View>
      </PopCard>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="CampusNearby"
        subtitle="Exclusive Local Student Discounts"
        accentColor={colors.sky}
        onNotificationPress={() => {}}
      />

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Search size={16} color={colors.inkFaint} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search partner discounts or stores..."
          placeholderTextColor={colors.inkFaint}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoryRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={NEARBY_CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <PopPill
              label={item}
              active={selectedCategory === item}
              accentColor={colors.sky}
              accentSoftColor={colors.skySoft}
              onPress={() => setSelectedCategory(item)}
            />
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Deals List */}
      {loading && !refreshing ? (
        <SkeletonLoader count={3} />
      ) : error ? (
        <ErrorState
          title="Could not load local perks"
          message={error}
          onRetry={() => fetchDeals()}
        />
      ) : (
        <FlatList
          data={deals}
          keyExtractor={(item) => item.id}
          renderItem={renderDealCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.sky}
              colors={[colors.sky]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<Compass size={32} color={colors.sky} />}
              title="No perks found"
              description="Check back soon for new partner discounts around campus!"
              accentVariant="sky"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    marginHorizontal: spacing.containerPadding,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 44,
    ...shadows.hardSm
  },
  searchIcon: {
    marginRight: spacing.sm
  },
  searchInput: {
    flex: 1,
    color: colors.ink,
    fontSize: 14,
    fontWeight: "500"
  },
  categoryRow: {
    paddingVertical: spacing.md
  },
  categoryList: {
    paddingHorizontal: spacing.containerPadding
  },
  listContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 90
  },
  card: {
    marginBottom: spacing.md
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
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    ...shadows.hardSm
  },
  discountText: {
    ...typography.badge,
    color: colors.sky,
    fontSize: 12
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  distanceText: {
    ...typography.bodySm,
    fontSize: 11
  },
  storeName: {
    ...typography.heading,
    fontSize: 17,
    marginBottom: 4
  },
  description: {
    ...typography.body,
    marginBottom: spacing.md
  },
  couponCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  couponLabel: {
    ...typography.caption,
    fontSize: 9.5,
    color: colors.inkFaint,
    marginBottom: 2
  },
  couponCode: {
    ...typography.mono,
    fontSize: 14,
    color: colors.ink,
    letterSpacing: 1
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.sm,
    ...shadows.hardSm
  },
  copyBtnSuccess: {
    backgroundColor: colors.mint
  },
  copyText: {
    ...typography.badge,
    color: colors.ink,
    fontSize: 12
  },
  copyTextSuccess: {
    ...typography.badge,
    color: colors.surface,
    fontSize: 12
  },
  cardFooter: {
    marginTop: 2
  },
  validText: {
    ...typography.bodySm,
    fontSize: 11
  }
});
