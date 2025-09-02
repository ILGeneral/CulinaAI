import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

import Background from "../components/background";
import CustomBottomBar from "../components/customBottomBar";
import RecipeCard from "components/recipeCard";
import { fetchRecipes } from "components/backendDapat2";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const Home = ({ navigation }: Props) => {
  const [recipes, setRecipes] = useState<any>(null);

  useEffect(() => {
    fetchRecipes().then(setRecipes);
  }, []);

  if (!recipes) {
    return (
      <Background>
        <Text style={{ marginTop: 50, textAlign: "center" }}>Loading...</Text>
      </Background>
    );
  }

  return (
    <Background>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>CULINA</Text>
            <Text style={styles.subtitle}>What’s on your fridge today?</Text>
          </View>

          {/* Clickable Profile Avatar */}
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Image
              source={require("../assets/profile.png")}
              style={styles.avatar}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>

        {/* Chef Illustration */}
        <Image
          source={require("../assets/homepage.png")}
          style={styles.chef}
          resizeMode="contain"
        />

        {/* Search bar */}
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Type the ingredients you have at home"
            placeholderTextColor="#888"
            style={{ flex: 1, fontSize: 14 }}
          />
          <Image source={require("../assets/camera.png")} style={styles.icon} />
        </View>

        {/* Recently Generated Recipes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Generated Recipe</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>
          <FlatList
            data={recipes.recentlyGenerated}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Community Shared Recipes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Community-Shared Recipes</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>
          <FlatList
            data={recipes.communityShared}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <CustomBottomBar />
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "400",
    color: "#666",
    marginTop: 2,
  },
  avatar: {
    width: 45,
    height: 45,
  },
  chef: {
    width: "100%",
    height: 220,
    alignSelf: "center",
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: { width: 24, height: 24 },
  section: { marginTop: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  seeAll: { fontSize: 14, color: "#42A5F5", fontWeight: "600" },
});

export default Home;
