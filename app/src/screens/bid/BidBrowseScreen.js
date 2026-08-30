import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import {
  Gavel,
  Search,
  Plus,
  Clock,
  TrendingUp,
  Tag,
  CheckCircle2,
  X,
  Send
} from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { bidService } from "../../services/bidService";
import { socketService } from "../../services/socketService";
import { PopHeader } from "../../components/common/PopHeader";
import { PopCard } from "../../components/common/PopCard";
import { PopPill } from "../../components/common/PopPill";
import { PopButton } from "../../components/common/PopButton";
import { PopAvatar } from "../../components/common/PopAvatar";

const BID_CATEGORIES = ["All", "Electronics", "Books", "Hostel", "Cycles"];
const TYPE_FILTERS = ["All Items", "Auctions", "Fixed Price"];

export const BidBrowseScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeBidItem, setActiveBidItem] = useState(null);
  const [bidIncrement, setBidIncrement] = useState(50);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidError, setBidError] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchItems = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const typeParam = selectedType === "Auctions" ? "AUCTION" : selectedType === "Fixed Price" ? "FIXED" : "ALL";
      const data = await bidService.getItems(selectedCategory, typeParam, searchQuery);
      setItems(data || []);
    } catch (err) {
      console.warn("Failed to load marketplace items:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedType, searchQuery]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Real-time socket updates for new highest bids
  useEffect(() => {
    const handleBidUpdate = (updatedItem) => {
      setItems((prev) =>
        prev.map((it) => (it.id === updatedItem.id ? { ...it, ...updatedItem } : it))
      );
      if (activeBidItem?.id === updatedItem.id) {
        setActiveBidItem((prev) => ({ ...prev, ...updatedItem }));
      }
    };

    socketService.on("bid:new_highest", handleBidUpdate);
    return () => {
      socketService.off("bid:new_highest", handleBidUpdate);
    };
  }, [activeBidItem]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems(true);
  };

  const handlePlaceBid = async () => {
    if (!activeBidItem) return;
    setBidError("");
    setSubmittingBid(true);

    const minNextBid = (activeBidItem.currentBid || activeBidItem.startingPrice || 100) + bidIncrement;
    try {
      const res = await bidService.placeBid(activeBidItem.id, minNextBid);
      setItems((prev) =>
        prev.map((it) => (it.id === activeBidItem.id ? { ...it, ...res.item } : it))
      );
      setSubmittingBid(false);
      setActiveBidItem(null);
    } catch (err) {
      setSubmittingBid(false);
      setBidError(err.message || "Failed to place bid.");
    }
  };

  const renderItemCard = ({ item }) => {
    const isAuction = item.listingType === "AUCTION" || !item.listingType;
    const currentPrice = item.currentBid || item.startingPrice || item.price || 0;

    return (
      <PopCard style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.typeBadge, !isAuction && styles.typeBadgeFixed]}>
            <Text style={[styles.typeBadgeText, !isAuction && styles.typeBadgeFixedText]}>
              {isAuction ? "⚡ LIVE AUCTION" : "🏷️ FIXED PRICE"}
            </Text>
          </View>
          {isAuction && (
            <View style={styles.timerRow}>
              <Clock size={13} color={colors.coral} />
              <Text style={styles.timerText}>{item.endsIn || "2h left"}</Text>
            </View>
          )}
        </View>

        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemCategory}>{item.category} · Seller: {item.sellerName || "Student"}</Text>

        <View style={styles.priceContainer}>
          <View>
            <Text style={styles.priceLabel}>{isAuction ? "CURRENT HIGHEST BID" : "PRICE"}</Text>
            <Text style={styles.priceValue}>₹{currentPrice.toLocaleString()}</Text>
          </View>
          {isAuction && (
            <View style={styles.bidCountBadge}>
              <TrendingUp size={13} color={colors.coral} />
              <Text style={styles.bidCountText}>{item.bidsCount || 0} bids</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <PopButton
            title={isAuction ? "Place Bid" : "Contact Seller"}
            onPress={() => {
              if (isAuction) {
                setBidError("");
                setActiveBidItem(item);
              }
            }}
            variant="coral"
            size="sm"
            style={{ width: "100%" }}
          />
        </View>
      </PopCard>
    );
  };

  return (
    <View style={styles.container}>
      <PopHeader
        title="CampusBid"
        subtitle="Marketplace & Auctions"
        accentColor={colors.coral}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      {/* Search Input */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <Search size={16} color={colors.inkFaint} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search textbooks, gadgets, gear..."
            placeholderTextColor={colors.inkFaint}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
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
              accentSoft={colors.coralSoft}
              onPress={() => setSelectedCategory(item)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* Listings List */}
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
      />

      {/* Bid Modal Sheet */}
      <Modal visible={Boolean(activeBidItem)} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Place Live Bid</Text>
              <TouchableOpacity onPress={() => setActiveBidItem(null)} style={styles.modalClose}>
                <X size={18} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalItemTitle}>{activeBidItem?.title}</Text>
              <Text style={styles.currentPriceText}>
                Current Bid: <Text style={{ color: colors.coral }}>₹{(activeBidItem?.currentBid || activeBidItem?.startingPrice || 0).toLocaleString()}</Text>
              </Text>

              <Text style={styles.incrementLabel}>SELECT BID INCREMENT</Text>
              <View style={styles.incrementRow}>
                {[50, 100, 250, 500].map((inc) => (
                  <TouchableOpacity
                    key={inc}
                    style={[
                      styles.incBtn,
                      bidIncrement === inc && styles.incBtnActive
                    ]}
                    onPress={() => setBidIncrement(inc)}
                  >
                    <Text
                      style={[
                        styles.incText,
                        bidIncrement === inc && styles.incTextActive
                      ]}
                    >
                      +₹{inc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.totalBidBox}>
                <Text style={styles.totalBidLabel}>YOUR TOTAL BID AMOUNT</Text>
                <Text style={styles.totalBidValue}>
                  ₹{((activeBidItem?.currentBid || activeBidItem?.startingPrice || 0) + bidIncrement).toLocaleString()}
                </Text>
              </View>

              {bidError ? <Text style={styles.errorText}>{bidError}</Text> : null}

              <PopButton
                title="Submit Atomic Bid"
                onPress={handlePlaceBid}
                loading={submittingBid}
                variant="coral"
                size="lg"
                icon={<Gavel size={18} color="#FFFFFF" />}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 12,
    height: 44,
    ...shadows.hardSm
  },
  searchInput: {
    flex: 1,
    color: colors.ink,
    fontSize: 14,
    fontWeight: "600"
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  typeBadge: {
    backgroundColor: colors.coralSoft,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.full
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.coral
  },
  typeBadgeFixed: {
    backgroundColor: colors.skySoft
  },
  typeBadgeFixedText: {
    color: colors.sky
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  timerText: {
    ...typography.bodySm,
    color: colors.coral,
    fontWeight: "800"
  },
  itemTitle: {
    ...typography.h3,
    fontSize: 16,
    marginBottom: 2
  },
  itemCategory: {
    ...typography.bodySm,
    color: colors.inkFaint,
    marginBottom: 12
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceInset,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 12
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.inkFaint,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  priceValue: {
    ...typography.h2,
    fontSize: 20,
    color: colors.ink
  },
  bidCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.coralSoft,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full
  },
  bidCountText: {
    ...typography.bodySm,
    color: colors.coral,
    fontWeight: "800"
  },
  cardFooter: {
    marginTop: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(23, 21, 15, 0.5)",
    justifyContent: "flex-end"
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: colors.lineStrong,
    paddingBottom: 30,
    ...shadows.hardLg
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.lineStrong
  },
  modalTitle: {
    ...typography.h3,
    fontSize: 18
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.canvas,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center"
  },
  modalBody: {
    padding: 20
  },
  modalItemTitle: {
    ...typography.h3,
    fontSize: 17,
    marginBottom: 4
  },
  currentPriceText: {
    ...typography.body,
    fontWeight: "700",
    marginBottom: 16
  },
  incrementLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.inkFaint,
    letterSpacing: 0.5,
    marginBottom: 10
  },
  incrementRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16
  },
  incBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surfaceInset,
    alignItems: "center",
    ...shadows.hardSm
  },
  incBtnActive: {
    backgroundColor: colors.coral
  },
  incText: {
    ...typography.label,
    fontSize: 13,
    color: colors.ink
  },
  incTextActive: {
    color: "#FFFFFF"
  },
  totalBidBox: {
    backgroundColor: colors.canvasTint,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    padding: 14,
    alignItems: "center",
    marginBottom: 16
  },
  totalBidLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.inkFaint,
    letterSpacing: 0.5,
    marginBottom: 4
  },
  totalBidValue: {
    ...typography.h1,
    fontSize: 26,
    color: colors.coral
  },
  errorText: {
    ...typography.bodySm,
    color: colors.danger,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center"
  }
});
