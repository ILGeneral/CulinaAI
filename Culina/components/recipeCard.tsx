import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

export default function RecipeCard({ recipe, onPress }: { recipe: any; onPress?: () => void }) {
  const CardContent = () => (
    <View style={styles.card}>
      <Image source={{ uri: recipe.image }} style={styles.image} />
      <Text numberOfLines={2} style={styles.title}>
        {recipe.title}
      </Text>

      {/* Meta info with icons */}
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Image source={require("../assets/timer.png")} style={styles.metaIcon} />
          <Text style={styles.metaText}>{recipe.duration}</Text>
        </View>

        <View style={styles.metaItem}>
          <Image source={require("../assets/kcal.png")} style={styles.metaIcon} />
          <Text style={styles.metaText}>{recipe.calories} kcal</Text>
        </View>

        <View style={styles.metaItem}>
          <Image source={require("../assets/ingr.png")} style={styles.metaIcon} />
          <Text style={styles.metaText}>{recipe.ingredientsCount} ingr</Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  image: {
    width: "100%",
    height: 120,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    margin: 8,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
  },
});
