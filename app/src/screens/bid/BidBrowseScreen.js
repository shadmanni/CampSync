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
  Gavel,
  Search,
  Plus,
  Clock,
  TrendingUp,
  Tag,
  Sparkles
} from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { bidService } from "../../services/bidService";
import { socketService } from "../../services/socketService";
import { HeaderBar } from "../../components/common/HeaderBar";
import { PopCard } from "../../components/common/PopCard";
import { PopPill } from "../../components/common/PopPill";
import { PopButton } from "../../components/common/PopButton";
import { PopAvatar } from "../../components/common/PopAvatar";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { BidDetailModal } from "./BidDetailModal";
import { CreateListingModal } from "./CreateListingModal";

const BID_CATEGORIES = ["All Items", "Electronics", "Textbooks", "Hostel Gear", "Cycles"];

export const BidBrowseScreen = () => {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const fetchItems = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await bidService.getItems(selectedCategory, "ALL", searchQuery);
      setItems(data || []);
    } catch (err) {
      setError(err.message || "Failed to load marketplace items.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Real-time highest bid updates
  useEffect(() => {
    const handleNewHighestBid = (update) => {
      setItems((prev) =>
        prev.map((it) =>
          it.id === update.itemId
            ? { ...it, currentBid: update.amount, highestBidder: update.bidderName, bidsCount: (it.bidsCount || 0) + 1 }
            : it
        )
      );
    };

    socketService.on("bid:new_highest", handleNewHighestBid);
    return () => {
      socketService.off("bid:new_highest", handleNewHighestBid);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems(true);
  };

  const renderItemCard = ({ item }) => {
    const isAuction = item.type === "AUCTION";
    const currentPrice = item.currentBid || item.startingPrice || 0;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelectedItem(item)}
      >
        <PopCard style={styles.card}>
          <View style={styles.cardTop}>
            <View style={[styles.badge, { backgroundColor: isAuction ? colors.coralSoft : colors.mintSoft }]}>
              <Text style={[styles.badgeText, { color: isAuction ? colors.coral : colors.mint }]}>
                {isAuction ? "⚡ LIVE AUCTION" : "🏷️ FIXED PRICE"}
              </Text>
            </View>
            <View style={styles.timerRow}>
              <Clock size={12} color={colors.inkFaint} />
              <Text style={styles.timerText}>{item.endsIn || "Ends today"}</Text>
            </View>
          </View>

          <Text style={styles.itemTitle}>{item.title}</Text>

          <View style={styles.categoryChip}>
            <Tag size={11} color={colors.coral} />
            <Text style={styles.categoryChipText}>{item.category || "General"}</Text>
          </View>

          {/* Price Block */}
          <PopCard style={styles.priceContainer} variant="inset">
            <View>
              <Text style={styles.priceLabel}>
                {isAuction ? "CURRENT HIGHEST BID" : "LISTED PRICE"}
              </Text>
              <Text style={styles.priceValue}>₹{currentPrice.toLocaleString()}</Text>
            </View>
            {isAuction && (
              <View style={styles.bidsBadge}>
                <TrendingUp size={12} color={colors.coral} />
                <Text style={styles.bidsText}>{item.bidsCount || 0} bids</Text>
              </View>
            )}
          </PopCard>

          <View style={styles.cardFooter}>
            <View style={styles.sellerInfo}>
              <PopAvatar name={item.sellerName || "Student"} size={26} />
              <Text style={styles.sellerName} numberOfLines={1}>
                {item.sellerName || "Student"}
              </Text>
            </View>

            <PopButton
              title={isAuction ? "Place Bid" : "Buy Now"}
              onPress={() => setSelectedItem(item)}
              variant="coral"
              size="sm"
            />
          </View>
        </PopCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="CampusBid"
        subtitle="Verified Peer Marketplace & Auctions"
        accentColor={colors.coral}
        onNotificationPress={() => {}}
      />

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Search size={16} color={colors.inkFaint} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items, textbooks, electronics..."
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
          data={BID_CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <PopPill
              label={item}
              active={selectedCategory === item}
              accentColor={colors.coral}
              accentSoftColor={colors.coralSoft}
              onPress={() => setSelectedCategory(item)}
            />
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Items List */}
      {loading && !refreshing ? (
        <SkeletonLoader count={3} />
      ) : error ? (
        <ErrorState
          title="Could not load marketplace"
          message={error}
          onRetry={() => fetchItems()}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItemCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.coral}
              colors={[colors.coral]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<Gavel size={32} color={colors.coral} />}
              title="No items found"
              description="Be the first student to list a textbook, cycle, or electronic gadget!"
              actionTitle="List an Item"
              onAction={() => setCreateModalVisible(true)}
              accentVariant="coral"
            />
          }
        />
      )}

      {/* Floating Plus Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setCreateModalVisible(true)}
      >
        <Plus size={24} color={colors.surface} />
      </TouchableOpacity>

      {/* Detail & Create Modals */}
      <BidDetailModal
        visible={Boolean(selectedItem)}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onBidSuccess={(updated) => {
          setItems((prev) =>
            prev.map((it) => (it.id === updated.id ? { ...it, ...updated } : it))
          );
        }}
      />

      <CreateListingModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreated={(newItem) => {
          setItems((prev) => [newItem, ...prev]);
        }}
      />
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
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderInk
  },
  badgeText: {
    ...typography.badge,
    fontSize: 10.5
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  timerText: {
    ...typography.bodySm,
    fontSize: 11
  },
  itemTitle: {
    ...typography.heading,
    fontSize: 16,
    marginBottom: 4
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.md
  },
  categoryChipText: {
    ...typography.caption,
    color: colors.inkFaint,
    fontSize: 11
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    marginBottom: spacing.md
  },
  priceLabel: {
    ...typography.caption,
    fontSize: 9.5,
    color: colors.inkFaint
  },
  priceValue: {
    ...typography.title,
    fontSize: 22,
    color: colors.coral
  },
  bidsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.coralSoft,
    borderWidth: 1,
    borderColor: colors.borderInk,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill
  },
  bidsText: {
    ...typography.badge,
    color: colors.coral,
    fontSize: 11
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    maxWidth: 160
  },
  sellerName: {
    ...typography.bodySm,
    color: colors.ink,
    fontWeight: "700"
  },
  fab: {
    position: "absolute",
    bottom: 22,
    right: 18,
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.coral,
    borderWidth: 2,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hard
  }
});
