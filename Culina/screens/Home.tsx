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
  SafeAreaView,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

import Background from "../components/background";
import CustomBottomBar from "../components/customBottomBar";
import RecipeCard from "components/recipeCard";
import { fetchRecipes } from "components/backendDapat2";
import ProfileScreen from "./profile";
import { auth } from "../utils/authPersistence";
import { getUserRecipes, SavedRecipe } from "../utils/firestore";
import { User } from "firebase/auth";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const Home = ({ navigation }: Props) => {
  const [recipes, setRecipes] = useState<any>(null);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    fetchRecipes().then(setRecipes);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        fetchSavedRecipes(user.uid);
      } else {
        setSavedRecipes([]);
      }
    });
    return unsubscribe;
  }, []);

  const fetchSavedRecipes = async (userId: string) => {
    try {
      setLoadingSaved(true);
      const userRecipes = await getUserRecipes(userId);
      setSavedRecipes(userRecipes);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
    } finally {
      setLoadingSaved(false);
    }
  };

  if (!recipes) {
    return (
      <Background>
        <Text style={{ marginTop: 50, textAlign: "center" }}>Loading...</Text>
      </Background>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
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

            {/* Camera button navigates to Permission screen */}
            <TouchableOpacity onPress={() => navigation.navigate("Permission")}>
              <Image
                source={require("../assets/camera.png")}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>

          {/* Saved Recipes Section */}
          {currentUser && savedRecipes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Saved Recipes</Text>
                <Text style={styles.seeAll}>See All</Text>
              </View>
              <FlatList
                data={savedRecipes.slice(0, 5)} // Show only first 5 saved recipes
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.savedRecipeCard}
                    onPress={() =>
                      navigation.navigate("RecipeDetail", { recipe: item })
                    }
                  >
                    <Text style={styles.savedRecipeTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.savedRecipeMeta}>
                      <Text style={styles.savedMetaText}>
                        ⏱️ {item.cookingTime}
                      </Text>
                      <Text style={styles.savedMetaText}>
                        🎯 {item.difficulty}
                      </Text>
                      <Text style={styles.savedMetaText}>
                        👥 Serves {item.servings}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

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
              renderItem={({ item }) => (
                <RecipeCard
                  recipe={item}
                  onPress={() =>
                    navigation.navigate("RecipeDetail", { recipe: item })
                  }
                />
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          {/* Community Shared Recipes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Top Community-Shared Recipes
              </Text>
              <Text style={styles.seeAll}>See All</Text>
            </View>
            <FlatList
              data={recipes.communityShared}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <RecipeCard
                  recipe={item}
                  onPress={() =>
                    navigation.navigate("RecipeDetail", { recipe: item })
                  }
                />
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </ScrollView>

        {/* Floating Bottom Bar */}
        <CustomBottomBar />
      </Background>
    </SafeAreaView>
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
  savedRecipeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  savedRecipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  savedRecipeMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  savedMetaText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
});

export default Home;
