import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CoffeeSupportModal({ visible, onClose }) {
  const [selectedTier, setSelectedTier] = useState(5);

  const tiers = [
    { amount: 3, label: "1 Coffee", desc: "Espresso" },
    { amount: 5, label: "2 Coffees", desc: "Cappuccino" },
    { amount: 10, label: "Coffee Pack", desc: "Pour Over" },
  ];

  const handleContribute = () => {
    // Replace with your real Buy Me A Coffee, Ko-fi, or UPI link
    const url = `https://buymeacoffee.com`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open payment browser.");
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.badge}>
              <Ionicons name="cafe" size={24} color="#FFB800" />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#7E7E8A" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Buy Me a Coffee</Text>
          <Text style={styles.subtitle}>
            Support ongoing Stream-Hub development, server integrations, and continuous updates.
          </Text>

          <View style={styles.tiersRow}>
            {tiers.map((t) => {
              const active = selectedTier === t.amount;
              return (
                <TouchableOpacity
                  key={t.amount}
                  style={[styles.tierCard, active && styles.tierCardActive]}
                  onPress={() => setSelectedTier(t.amount)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tierPrice, active && styles.tierTextActive]}>
                    ${t.amount}
                  </Text>
                  <Text style={[styles.tierLabel, active && styles.tierTextActive]}>
                    {t.label}
                  </Text>
                  <Text style={styles.tierDesc}>{t.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.payBtn}
            onPress={handleContribute}
            activeOpacity={0.85}
          >
            <Ionicons name="heart" size={18} color="#0D0C13" />
            <Text style={styles.payBtnText}>Support ${selectedTier}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#16161F",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderColor: "#282838",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 184, 0, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 14,
  },
  subtitle: {
    fontSize: 13,
    color: "#9E9EA8",
    lineHeight: 18,
    marginTop: 6,
  },
  tiersRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  tierCard: {
    flex: 1,
    backgroundColor: "#0D0C13",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#22222E",
  },
  tierCardActive: {
    borderColor: "#FFB800",
    backgroundColor: "rgba(255, 184, 0, 0.08)",
  },
  tierPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7E7E8A",
    marginTop: 2,
  },
  tierDesc: {
    fontSize: 9.5,
    color: "#5A5A6A",
    marginTop: 2,
  },
  tierTextActive: {
    color: "#FFB800",
  },
  payBtn: {
    flexDirection: "row",
    backgroundColor: "#FFB800",
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    gap: 8,
  },
  payBtnText: {
    color: "#0D0C13",
    fontSize: 15,
    fontWeight: "800",
  },
});
