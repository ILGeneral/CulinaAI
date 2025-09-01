import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as GoogleGenerativeAI from "@google/generative-ai";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import { auth } from "../utils/authPersistence";
import { saveRecipe } from "../utils/firestore";
import { User } from "firebase/auth";

type Props = NativeStackScreenProps<RootStackParamList, "RecipeGenerator">;

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  difficulty: string;
  servings: number;
}

const API_KEY = "AIzaSyA1OAG1LwmqHRIOwPaZNQr6lEuNWaM8XR8";

const RecipeGenerator = ({ navigation }: Props) => {
  const [ingredients, setIngredients] = useState("");
  const [dietaryPreference, setDietaryPreference] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const generateRecipes = async () => {
    if (!ingredients.trim()) {
      Alert.alert("Error", "Please enter at least some ingredients");
      return;
    }

    setLoading(true);
    setGeneratedRecipes([]);

    try {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Generate 5 different and diverse recipes based on the following ingredients and preferences.
        Each recipe should be unique and use different combinations of the provided ingredients.
        
        Ingredients: ${ingredients}
        ${dietaryPreference ? `Dietary Preference: ${dietaryPreference}` : ""}
        ${cuisineType ? `Cuisine Type: ${cuisineType}` : ""}
        
        Please provide the recipes in the following JSON array format:
        [
          {
            "title": "Recipe Title 1",
            "ingredients": ["ingredient 1", "ingredient 2", ...],
            "instructions": ["Step 1: Detailed instruction here", "Step 2: Next instruction here", ...],
            "cookingTime": "XX minutes",
            "difficulty": "Easy/Medium/Hard",
            "servings": X
          },
          {
            "title": "Recipe Title 2",
            "ingredients": ["ingredient 1", "ingredient 2", ...],
            "instructions": ["Step 1: Detailed instruction here", "Step 2: Next instruction here", ...],
            "cookingTime": "XX minutes",
            "difficulty": "Easy/Medium/Hard",
            "servings": X
          },
          ... (at least 5 recipes)
        ]
        
        IMPORTANT FORMATTING RULES:
        1. Each instruction step should be a clear, numbered step starting with "Step X: "
        2. Instructions should be concise but detailed enough to follow
        3. Each step should be a separate array item
        4. Do not combine multiple steps into one instruction
        5. Make sure the recipes are creative, practical, and use the provided ingredients effectively
        6. Each recipe should be distinct and offer variety in cooking style, cuisine influence, or preparation method
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Extract JSON array from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const recipesData = JSON.parse(jsonMatch[0]);
        setGeneratedRecipes(recipesData);
      } else {
        throw new Error("Could not parse recipe data");
      }
    } catch (error: any) {
      console.error("Error generating recipes:", error);
      Alert.alert(
        "Error",
        "Failed to generate recipes. Please try again with different ingredients."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setIngredients("");
    setDietaryPreference("");
    setCuisineType("");
    setGeneratedRecipes([]);
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to save recipes.");
      return;
    }

    try {
      await saveRecipe(currentUser.uid, recipe);
      Alert.alert("Success", "Recipe saved successfully!");
    } catch (error: any) {
      console.error("Error saving recipe:", error);
      Alert.alert("Error", "Failed to save recipe. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Recipe Generator</Text>
            <Text style={styles.subtitle}>
              Generate delicious recipes based on your ingredients
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Ingredients (comma-separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., chicken, rice, vegetables, spices"
              value={ingredients}
              onChangeText={setIngredients}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Dietary Preference (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., vegetarian, gluten-free, keto"
              value={dietaryPreference}
              onChangeText={setDietaryPreference}
            />

            <Text style={styles.label}>Cuisine Type (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Italian, Mexican, Asian"
              value={cuisineType}
              onChangeText={setCuisineType}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.generateButton]}
                onPress={generateRecipes}
                disabled={loading || !ingredients.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Generate Recipes</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={clearForm}
              >
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          {generatedRecipes.length > 0 && (
            <View style={styles.recipesContainer}>
              <Text style={styles.recipesHeader}>Suggested Recipes ({generatedRecipes.length})</Text>
              {generatedRecipes.map((recipe, recipeIndex) => (
                <View key={recipeIndex} style={styles.recipeContainer}>
                  <Text style={styles.recipeTitle}>{recipe.title}</Text>
                  
                  <View style={styles.recipeMeta}>
                    <Text style={styles.metaText}>
                      ⏱️ {recipe.cookingTime}
                    </Text>
                    <Text style={styles.metaText}>
                      🎯 {recipe.difficulty}
                    </Text>
                    <Text style={styles.metaText}>
                      👥 Serves {recipe.servings}
                    </Text>
                  </View>

                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  <View style={styles.ingredientsList}>
                    {recipe.ingredients.map((ingredient: string, index: number) => (
                      <Text key={index} style={styles.ingredientItem}>
                        • {ingredient}
                      </Text>
                    ))}
                  </View>

                  <Text style={styles.sectionTitle}>Instructions</Text>
                  <View style={styles.instructionsList}>
                    {recipe.instructions.map((instruction: string, index: number) => (
                      <View key={index} style={styles.instructionStep}>
                        <Text style={styles.stepNumber}>{index + 1}.</Text>
                        <Text style={styles.instructionText}>{instruction}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={() => handleSaveRecipe(recipe)}
                  >
                    <Text style={styles.buttonText}>Save Recipe</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  generateButton: {
    backgroundColor: "#2196F3",
  },
  clearButton: {
    backgroundColor: "#ff3b30",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  recipeContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
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
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
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
    marginTop: 16,
  },
  ingredientsList: {
    marginBottom: 16,
  },
  ingredientItem: {
    fontSize: 16,
    color: "#444",
    marginBottom: 6,
    lineHeight: 22,
  },
  instructionsList: {
    marginBottom: 16,
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
  recipesContainer: {
    marginTop: 20,
  },
  recipesHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
});

export default RecipeGenerator;
