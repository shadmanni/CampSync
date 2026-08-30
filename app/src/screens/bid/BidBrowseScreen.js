import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image
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
import { colors, radii, spacing, typography } from "../../theme/theme";
import { HeaderBar } from "../../components/common/HeaderBar";
import { GlassCard } from "../../components/common/GlassCard";
import { CategoryPill } from "../../components/common/CategoryPill";
import { PrimaryButton } from "../../components/common/PrimaryButton";

const BID_CATEGORIES = ["All Items", "Electronics", "Textbooks", "Hostel Gear", "Cycles"];

const SAMPLE_LISTINGS = [
  {
    id: "bid-1",
    title: "Sony WH-1000XM4 Noise Canceling Headphones",
    category: "Electronics",
    currentBid: 14500,
    startingPrice: 10000,
    bidsCount: 14,
    endsIn: "2h 45m",
    sellerName: "Rohan V.",
    status: "ACTIVE"
  },
  {
    id: "bid-2",
    title: "Engineering Mechanics & Dynamics (Hibbeler 14th Ed)",
    category: "Textbooks",
    currentBid: 650,
    startingPrice: 300,
    bidsCount: 8,
    endsIn: "5h 12m",
    sellerName: "Priya S.",
    status: "ACTIVE"
  },
  {
    id: "bid-3",
    title: "Hero Sprint Pro 21-Speed Mountain Bicycle",
    category: "Cycles",
    currentBid: 4200,
    startingPrice: 2500,
    bidsCount: 19,
    endsIn: "1h 10m",
    sellerName: "Alex R.",
    status: "ACTIVE"
  },
  {
    id: "bid-4",
    title: "Ergonomic Mesh Study Chair with Lumbar Support",
    category: "Hostel Gear",
    currentBid: 1800,
    startingPrice: 1200,
    bidsCount: 6,
    endsIn: "8h 30m",
    sellerName: "Ananya M.",
    status: "ACTIVE"
  }
];

export const BidBrowseScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState(SAMPLE_LISTINGS);

  const filteredListings = listings.filter((item) => {
    const matchesCategory =
      selectedCategory === "All Items" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderBidCard = ({ item }) => {
    return (
      <GlassCard style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE AUCTION</Text>
          </View>
          <View style={styles.timerRow}>
            <Clock size={13} color={colors.secondary} />
            <Text style={styles.timerText}>{item.endsIn}</Text>
          </View>
        </View>

        <Text style={styles.itemTitle}>{item.title}</Text>

        <View style={styles.categoryChip}>
          <Tag size={12} color={colors.primary} />
          <Text style={styles.categoryChipText}>{item.category}</Text>
        </View>

        <View style={styles.priceContainer}>
          <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>CURRENT HIGHEST BID</Text>
            <Text style={styles.currentBidValue}>₹{item.currentBid.toLocaleString()}</Text>
          </View>
          <View style={styles.bidCountBadge}>
            <TrendingUp size={13} color={colors.primary} />
            <Text style={styles.bidCountText}>{item.bidsCount} bids</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <Text style={styles.sellerText}>Seller: <Text style={styles.sellerName}>{item.sellerName}</Text></Text>
          <PrimaryButton
            title="Place Bid"
            onPress={() => {}}
            style={styles.bidBtn}
            textStyle={{ fontSize: 13 }}
          />
        </View>
      </GlassCard>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="CampusBid" subtitle="Live Verified Student Marketplace" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={17} color={colors.textSubtle} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items, textbooks, gadgets..."
          placeholderTextColor={colors.textSubtle}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={BID_CATEGORIES}
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

      {/* Listings List */}
      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id}
        renderItem={renderBidCard}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    marginHorizontal: spacing.containerPadding,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 46
  },
  searchIcon: {
    marginRight: spacing.sm
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14
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
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accentOrangeLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
    marginRight: 6
  },
  liveText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.secondary,
    letterSpacing: 0.5
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  timerText: {
    ...typography.bodySm,
    color: colors.secondary,
    fontWeight: "700"
  },
  itemTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 6
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.bgDim,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.full,
    marginBottom: spacing.md
  },
  categoryChipText: {
    ...typography.bodySm,
    color: colors.primary,
    fontSize: 11,
    fontWeight: "600"
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.bgSubtle,
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.md
  },
  priceBlock: {
    justifyContent: "center"
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSubtle,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  currentBidValue: {
    ...typography.h2,
    fontSize: 22,
    color: colors.primary
  },
  bidCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.bgDim,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full
  },
  bidCountText: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: "700"
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginBottom: spacing.sm
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sellerText: {
    ...typography.bodySm,
    color: colors.textSubtle
  },
  sellerName: {
    color: colors.textPrimary,
    fontWeight: "700"
  },
  bidBtn: {
    paddingVertical: 9,
    paddingHorizontal: 18
  }
});
