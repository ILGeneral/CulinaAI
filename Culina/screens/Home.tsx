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
  Alert,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

import Background from "../components/background";
import CustomBottomBar from "../components/customBottomBar";
import RecipeShowcase from "../components/recipeShowcase";
import ProfileScreen from './profile'
import { auth } from "../utils/authPersistence";
import { getUserRecipes, SavedRecipe, deleteSavedRecipe } from "../utils/firestore";
import { User } from "firebase/auth";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const Home = ({ navigation }: Props) => {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(false);

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
      setSavedRecipes(userRecipes.reverse());
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleUnsaveRecipe = async (recipeId: string, recipeTitle: string) => {
    if (!currentUser) return;

    Alert.alert(
      "Delete Saved Recipe",
      `Are you sure you want to delete "${recipeTitle}" from your saved recipes?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSavedRecipe(currentUser.uid, recipeId);
              // Update local state by filtering out the deleted recipe
              setSavedRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
            } catch (error) {
              console.error("Error unsaving recipe:", error);
              Alert.alert("Error", "Failed to delete the recipe. Please try again.");
            }
          },
        },
      ]
    );
  };

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
                keyExtractor={(item: SavedRecipe) => item.id}
                renderItem={({ item }: { item: SavedRecipe }) => (
                  <View style={styles.savedRecipeCardContainer}>
                    <View style={styles.savedRecipeCard}>
                      <TouchableOpacity
                        style={styles.cardContent}
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
                            🥕 {item.ingredients.length} ingredients
                          </Text>
                  <Text style={styles.savedMetaText}>
                    👥 Serves {item.servings}
                  </Text>
                  {item.estimatedKcal && (
                    <Text style={styles.savedMetaText}>
                      🔥 {item.estimatedKcal} kcal
                    </Text>
                  )}
                </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.unsaveButton}
                        onPress={() => handleUnsaveRecipe(item.id, item.title)}
                      >
                        <Text style={styles.unsaveButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  )}



          {/* Recipe Showcase Component */}
          <RecipeShowcase
            onRecipePress={(recipe) => navigation.navigate("RecipeDetail", { recipe })}
          />
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
  savedRecipeCardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  savedRecipeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    maxWidth: 300,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    position: "relative",
  },
  cardContent: {
    flex: 1,
  },
  unsaveButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ff4d4d",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  unsaveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 16,
  },
  savedRecipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  savedRecipeMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 8,
  },
  savedMetaText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    flexShrink: 1,
  },

});

export default Home;
