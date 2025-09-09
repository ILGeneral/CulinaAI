import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import Background from "../components/background";
import CustomBottomBar from "../components/customBottomBar";
import { auth } from "../utils/authPersistence";
import { saveRecipe, isRecipeSaved, shareRecipeDirectly, deleteSavedRecipe } from "../utils/firestore";
import { User } from "firebase/auth";

type Props = NativeStackScreenProps<RootStackParamList, "RecipeDetail">;

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  difficulty: string;
  servings: number;
  estimatedKcal?: string;
  id?: string;
}

const RecipeDetail = ({ navigation, route }: Props) => {
  const { recipe } = route.params;
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        const saved = await isRecipeSaved(user.uid, recipe);
        setIsSaved(saved);
      }
    });
    return unsubscribe;
  }, [recipe]);

  // Toggle save / unsave
  const handleToggleSave = async () => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to save recipes");
      return;
    }

    setSaving(true);

    try {
      if (isSaved) {
        await deleteSavedRecipe(currentUser.uid, recipe.id || recipe.title);
        setIsSaved(false);
        Alert.alert("Removed", "Recipe has been removed from saved recipes");
      } else {
        await saveRecipe(currentUser.uid, {
          title: recipe.title,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          cookingTime: recipe.cookingTime,
          difficulty: recipe.difficulty,
          servings: recipe.servings,
          estimatedKcal: recipe.estimatedKcal,
        });
        setIsSaved(true);
        Alert.alert("Saved", "Recipe saved successfully!");
      }
    } catch (error) {
      console.error("Error toggling recipe:", error);
      Alert.alert("Error", "Failed to update saved recipe. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleShareRecipe = async () => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to share recipes");
      return;
    }

    try {
      await shareRecipeDirectly(currentUser.uid, {
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cookingTime: recipe.cookingTime,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        estimatedKcal: recipe.estimatedKcal,
      });
      Alert.alert("Success!", "Thanks for sharing!");
    } catch (error) {
      console.error("Error sharing recipe:", error);
      Alert.alert("Error", "Failed to share recipe. Please try again.");
    }
  };

  return (
    <Background>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header: Back button, CULINA title, Share button, and Save button */}
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require("../assets/back.png")}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>CULINA</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareRecipe}
              >
                <Image
                  source={require("../assets/share.png")}
                  style={styles.shareIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              {currentUser && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleToggleSave}
                  disabled={saving}
                >
                  <Image
                    source={
                      isSaved
                        ? require("../assets/Rsave.png")
                        : require("../assets/save.png")
                    }
                    style={styles.saveIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Recipe Title */}
          <Text style={styles.recipeTitle}>{recipe.title}</Text>

          {/* Recipe Meta */}
          <View style={styles.recipeMeta}>
            <Text style={styles.metaText}>⏱️ {recipe.cookingTime}</Text>
            <Text style={styles.metaText}>🥕 {recipe.ingredients.length} ingredients</Text>
            <Text style={styles.metaText}>👥 Serves {recipe.servings}</Text>
            {recipe.estimatedKcal && (
              <Text style={styles.metaText}>🔥 {recipe.estimatedKcal}</Text>
            )}
          </View>

          {/* Ingredients Section */}
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((item: string, index: number) => (
            <Text key={index} style={styles.ingredientItem}>
              • {item}
            </Text>
          ))}

          {/* Instructions Section */}
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.instructions.map((inst: string, index: number) => {
            const isStepFormat = /^Step \d+:/i.test(inst.trim());
            const instructionText = isStepFormat
              ? inst.replace(/^Step \d+:\s*/i, '')
              : inst;

            return (
              <View key={index} style={styles.instructionStep}>
                <Text style={styles.stepNumber}>{index + 1}.</Text>
                <Text style={styles.instructionText}>{instructionText}</Text>
              </View>
            );
          })}

          {/* Spacer to scroll above bottom bar */}
          <View style={{ height: 130 }} />
        </ScrollView>

        <CustomBottomBar />
      </SafeAreaView>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backIcon: {
    width: 45,
    height: 45,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  shareButton: {
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  shareIcon: {
    width: 45,
    height: 45,
  },
  saveButton: {
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  saveIcon: {
    width: 45,
    height: 45,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  recipeMeta: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    marginTop: 20,
    alignSelf: "flex-start",
  },
  ingredientItem: {
    fontSize: 16,
    color: "#444",
    marginBottom: 8,
    lineHeight: 22,
  },
  instructionStep: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  stepNumber: {
    fontWeight: "bold",
    color: "#2196F3",
    marginRight: 8,
    fontSize: 16,
    minWidth: 24,
  },
  instructionText: {
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
    flex: 1,
  },
});

export default RecipeDetail;
