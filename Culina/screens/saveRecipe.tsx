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

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";

type Props = NativeStackScreenProps<RootStackParamList, "IngredientsList">;

interface Recipe {
  id: string;
  title: string;
  image: string;
  cookingTime: string;
  calories: string;
  ingredientsCount: number;
}

const SaveRecipe = ({ navigation }: Props) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response: Recipe[] = [
          {
            id: "1",
            title: "Double cheeseburger with grilled beef patties cheese lettuce leaf burger buns",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRC2R7IqQ73E-NUscaXalW0osiz_muqQ52WGA&s",
            cookingTime: "24 mins",
            calories: "755 kcal",
            ingredientsCount: 12,
          },
          {
            id: "2",
            title: "Tonkatsu (Japanese Pork Cutlet)",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWBxI6_5VzKn8y1TCsNYlnyWX7FQHFxsrq9A&s",
            cookingTime: "30 mins",
            calories: "500 kcal",
            ingredientsCount: 9,
          },
        ];
        setRecipes(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe) =>
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
              <View style={styles.recipeCard}>
                <Image source={{ uri: item.image }} style={styles.recipeImage} />
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
                      <Text style={styles.metaText}>{item.calories}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Image source={require("../assets/ingr.png")} style={styles.metaIcon} />
                      <Text style={styles.metaText}>{item.ingredientsCount} ingredients</Text>
                    </View>
                  </View>
                </View>
              </View>
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
});

export default SaveRecipe;
