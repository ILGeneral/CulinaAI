import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Background from "../components/background";
import CustomBottomBar from "../components/customBottomBar";
import { auth } from "../utils/authPersistence";
import { getUserRecipes, SavedRecipe, deleteSavedRecipe } from "../utils/firestore";
import { User } from "firebase/auth";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";

type Props = NativeStackScreenProps<RootStackParamList, "SaveRecipe">;



const SaveRecipe = ({ navigation }: Props) => {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        fetchSavedRecipes(user.uid);
      } else {
        setSavedRecipes([]);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const fetchSavedRecipes = async (userId: string) => {
    try {
      const userRecipes = await getUserRecipes(userId);
      setSavedRecipes(userRecipes);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveRecipe = async (recipeId: string) => {
    if (!currentUser) return;

    try {
      await deleteSavedRecipe(currentUser.uid, recipeId);
      // Update local state by filtering out the deleted recipe
      setSavedRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
    } catch (error) {
      console.error("Error unsaving recipe:", error);
    }
  };

  const filteredRecipes = savedRecipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <Background>
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color="#42A5F5" />
        </View>
        <CustomBottomBar />
      </Background>
    );
  }

  return (
    <Background>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Header: CULINA left, Profile right */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>CULINA</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Image
                source={require("../assets/profile.png")}
                style={styles.profileIcon}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <TextInput
              placeholder="Search here..."
              placeholderTextColor="#888"
              value={searchText}
              onChangeText={setSearchText}
              style={{ flex: 1 }}
            />
            <Image source={require("../assets/search.png")} style={styles.icon} />
          </View>

          {/* Recipe List */}
          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.recipeCard}
                onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
                activeOpacity={0.7}
              >
                <Image source={{ uri: "https://via.placeholder.com/80" }} style={styles.recipeImage} />
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Image source={require("../assets/timer.png")} style={styles.metaIcon} />
                      <Text style={styles.metaText}>{item.cookingTime}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Image source={require("../assets/kcal.png")} style={styles.metaIcon} />
                      <Text style={styles.metaText}>{item.estimatedKcal || "N/A"}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Image source={require("../assets/ingr.png")} style={styles.metaIcon} />
                      <Text style={styles.metaText}>{item.ingredients?.length || 0} ingredients</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.unsaveButton}
                  onPress={() => handleUnsaveRecipe(item.id)}
                >
                  <Text style={styles.unsaveButtonText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </View>
        <CustomBottomBar />
      </SafeAreaView>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 8, 
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  profileIcon: {
    width: 45,
    height: 45,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    marginLeft: 8,
  },
  recipeCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
    justifyContent: "center",
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
    resizeMode: "contain",
  },
  metaText: {
    fontSize: 12,
    color: "#666",
  },
  unsaveButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ff4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  unsaveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default SaveRecipe;
