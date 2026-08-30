import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Clipboard,
  Alert
} from "react-native";
import {
  Compass,
  Percent,
  MapPin,
  Tag,
  Copy,
  Check
} from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { nearbyService } from "../../services/nearbyService";
import { PopHeader } from "../../components/common/PopHeader";
import { PopCard } from "../../components/common/PopCard";
import { PopPill } from "../../components/common/PopPill";
import { PopButton } from "../../components/common/PopButton";

const NEARBY_CATEGORIES = ["All", "Food & Cafe", "Books & Print", "Fitness", "Tech"];

export const NearbyFeedScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchDeals = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await nearbyService.getDeals(selectedCategory);
      setDeals(data || []);
    } catch (err) {
      console.warn("Failed to load nearby deals:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

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
          <View style={styles.discountBadge}>
            <Percent size={12} color="#FFFFFF" />
            <Text style={styles.discountText}>{item.discount || "20% OFF"}</Text>
          </View>
          <View style={styles.distanceBadge}>
            <MapPin size={12} color={colors.sky} />
            <Text style={styles.distanceText}>{item.distance || "0.4 km away"}</Text>
          </View>
        </View>

        <Text style={styles.storeName}>{item.storeName}</Text>
        <Text style={styles.description}>{item.description}</Text>

        {/* Promo Code Box */}
        <View style={styles.couponBox}>
          <View>
            <Text style={styles.couponLabel}>PROMO CODE</Text>
            <Text style={styles.couponCode}>{item.couponCode || "CAMPUS20"}</Text>
          </View>
          <TouchableOpacity
            style={[styles.copyBtn, isCopied && styles.copyBtnSuccess]}
            onPress={() => handleCopy(item.couponCode || "CAMPUS20")}
            activeOpacity={0.8}
          >
            {isCopied ? <Check size={13} color="#FFFFFF" /> : <Copy size={13} color={colors.ink} />}
            <Text style={[styles.copyText, isCopied && { color: "#FFFFFF" }]}>
              {isCopied ? "Copied!" : "Copy Code"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.validText}>{item.validTill || "Show college ID at billing counter"}</Text>
      </PopCard>
    );
  };

  return (
    <View style={styles.container}>
      <PopHeader
        title="CampusNearby"
        subtitle="Exclusive Student Discounts"
        accentColor={colors.sky}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
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
              accentSoft={colors.skySoft}
              onPress={() => setSelectedCategory(item)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* Deals List */}
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas
  },
  categoryContainer: {
    paddingVertical: 12
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100
  },
  card: {
    marginBottom: 14
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.sky,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    ...shadows.hardSm
  },
  discountText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 11
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  distanceText: {
    ...typography.bodySm,
    color: colors.sky,
    fontWeight: "800",
    fontSize: 11
  },
  storeName: {
    ...typography.h3,
    fontSize: 17,
    marginBottom: 4
  },
  description: {
    ...typography.body,
    lineHeight: 20,
    marginBottom: 12
  },
  couponBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceInset,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    borderStyle: "dashed",
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 8
  },
  couponLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.inkFaint,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  couponCode: {
    ...typography.label,
    fontSize: 15,
    color: colors.ink,
    letterSpacing: 1
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    ...shadows.hardSm
  },
  copyBtnSuccess: {
    backgroundColor: colors.mint
  },
  copyText: {
    ...typography.bodySm,
    color: colors.ink,
    fontWeight: "800",
    fontSize: 11
  },
  validText: {
    ...typography.bodySm,
    color: colors.inkFaint,
    fontSize: 11
  }
});
