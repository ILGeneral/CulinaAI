import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Image,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import { auth } from "../utils/authPersistence";
import { saveRecipe, shareRecipe, isRecipeSaved, getUserRecipes } from "../utils/firestore";
import { User } from "firebase/auth";
import Background from "../components/background";
import CustomBottomBar from "../components/customBottomBar";

type Props = NativeStackScreenProps<RootStackParamList, "RecipeDetail">;

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  difficulty: string;
  servings: number;
}

const RecipeDetail = ({ navigation, route }: Props) => {
  const { recipe } = route.params;
  const currentUser = auth.currentUser;
  const [isSaved, setIsSaved] = useState(false);
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    const checkIfRecipeIsSaved = async () => {
      if (currentUser) {
        const saved = await isRecipeSaved(currentUser.uid, recipe);
        setIsSaved(saved);
      }
    };
    checkIfRecipeIsSaved();
  }, [currentUser, recipe]);

  const handleSaveRecipe = async () => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to save recipes.");
      return;
    }

    try {
      await saveRecipe(currentUser.uid, recipe);
      setIsSaved(true);
      Alert.alert("Success", "Recipe saved successfully!");
    } catch (error: any) {
      console.error("Error saving recipe:", error);
      Alert.alert("Error", "Failed to save recipe. Please try again.");
    }
  };

  const handleShareRecipe = async () => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to share recipes.");
      return;
    }

    if (!isSaved) {
      Alert.alert("Error", "You must save the recipe first before sharing.");
      return;
    }

    try {
      // For now, we'll need to get the recipe ID from the saved recipes
      // This is a simplified approach - in a real app, you'd pass the recipe ID
      const userRecipes = await getUserRecipes(currentUser.uid);
      const savedRecipe = userRecipes.find(r =>
        r.title === recipe.title &&
        JSON.stringify(r.ingredients) === JSON.stringify(recipe.ingredients)
      );

      if (savedRecipe) {
        await shareRecipe(currentUser.uid, savedRecipe.id);
        setIsShared(true);
        Alert.alert("Success", "Recipe shared successfully!");
      } else {
        Alert.alert("Error", "Could not find saved recipe to share.");
      }
    } catch (error: any) {
      console.error("Error sharing recipe:", error);
      Alert.alert("Error", "Failed to share recipe. Please try again.");
    }
  };

  return (
    <Background>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header: Back button and CULINA */}
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require("../assets/back.png")}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>CULINA</Text>
          </View>

          {/* Recipe Title */}
          <Text style={styles.recipeTitle}>{recipe.title}</Text>

          {/* Recipe Meta */}
          <View style={styles.recipeMeta}>
            <Text style={styles.metaText}>⏱️ {recipe.cookingTime}</Text>
            <Text style={styles.metaText}>🎯 {recipe.difficulty}</Text>
            <Text style={styles.metaText}>👥 Serves {recipe.servings}</Text>
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
            // Check if instruction already starts with "Step X:" format
            const isStepFormat = /^Step \d+:/i.test(inst.trim());

            if (isStepFormat) {
              // Remove "Step X:" and display with our own numbering
              const instructionText = inst.replace(/^Step \d+:\s*/i, '');
              return (
                <View key={index} style={styles.instructionStep}>
                  <Text style={styles.stepNumber}>{index + 1}.</Text>
                  <Text style={styles.instructionText}>{instructionText}</Text>
                </View>
              );
            } else {
              // Display as-is with our numbering
              return (
                <View key={index} style={styles.instructionStep}>
                  <Text style={styles.stepNumber}>{index + 1}.</Text>
                  <Text style={styles.instructionText}>{inst}</Text>
                </View>
              );
            }
          })}

          {/* Action Buttons */}
          {!isSaved ? (
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSaveRecipe}
            >
              <Text style={styles.buttonText}>Save Recipe</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.shareButton]}
                onPress={handleShareRecipe}
              >
                <Text style={styles.buttonText}>
                  {isShared ? "Shared ✓" : "Share Recipe"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
    marginBottom: 20,
  },
  backIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
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
  button: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  shareButton: {
    backgroundColor: "#2196F3",
  },
  buttonContainer: {
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default RecipeDetail;
