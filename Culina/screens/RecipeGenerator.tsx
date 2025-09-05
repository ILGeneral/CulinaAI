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
  Image,
} from "react-native";
import * as GoogleGenerativeAI from "@google/generative-ai";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import { auth } from "../utils/authPersistence";
import { saveRecipe } from "../utils/firestore";
import { User } from "firebase/auth";
import Background from "../components/background";
import CustomBottomBar from "../components/customBottomBar";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

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
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [dietaryPreference, setDietaryPreference] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [loading, setLoading] = useState(true);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchIngredients = async () => {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to generate recipes.");
        setLoading(false);
        return;
      }
      try {
        const docSnap = await getDoc(doc(db, "ingredients", user.uid));
        if (docSnap.exists()) {
          setIngredients(docSnap.data().items || []);
        } else {
          setIngredients([]);
        }
      } catch (error: any) {
        alert("Failed to fetch ingredients: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIngredients();
  }, []);

  const generateRecipes = async () => {
    if (ingredients.length === 0) {
      alert("No ingredients found. Please add ingredients first.");
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
        
        Ingredients: ${ingredients.join(", ")}
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
          ...
        ]
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
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
    setIngredients([]);
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
    <Background>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={uiStyles.container}>
            {/* Header: CULINA and Profile aligned in a row */}
            <View style={uiStyles.headerContainer}>
              <Text style={uiStyles.headerTitle}>CULINA</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                <Image
                  source={require("../assets/profile.png")}
                  style={uiStyles.profileIcon}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>

            {/* Character Illustration */}
            <Image
              source={require("../assets/GenerateRecipe.png")}
              style={uiStyles.character}
              resizeMode="contain"
            />

            {/* Title */}
            <Text style={uiStyles.title}>What do you want to make?</Text>

            {/* Input Fields */}
            <View style={{ width: "100%", marginVertical: 12 }}>
              <Text style={uiStyles.inputLabel}>Ingredients</Text>
              <TextInput
                style={uiStyles.input}
                placeholder="e.g., chicken, rice, vegetables"
                value={ingredients.join(", ")}
                onChangeText={(text) => setIngredients(text.split(",").map(item => item.trim()))}
                multiline
                numberOfLines={2}
              />

              <Text style={uiStyles.inputLabel}>Dietary Preference</Text>
              <TextInput
                style={uiStyles.input}
                placeholder="e.g., vegetarian, gluten-free"
                value={dietaryPreference}
                onChangeText={setDietaryPreference}
              />

              <Text style={uiStyles.inputLabel}>Cuisine Type</Text>
              <TextInput
                style={uiStyles.input}
                placeholder="e.g., Italian, Mexican"
                value={cuisineType}
                onChangeText={setCuisineType}
              />
            </View>

            {/* Buttons */}
            <View style={uiStyles.buttonRow}>
              <TouchableOpacity
                style={[uiStyles.button, uiStyles.primaryButton]}
                onPress={generateRecipes}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Image source={require("../assets/generate.png")} />
                    <Text style={uiStyles.buttonText}>Generate</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[uiStyles.button, uiStyles.secondaryButton]}
                onPress={() => navigation.navigate("IngredientsList")}
              >
                <Image source={require("../assets/book.png")} style={uiStyles.icon} />
                <Text style={uiStyles.secondaryText}>Edit Ingredients</Text>
              </TouchableOpacity>
            </View>

            {/* Display generated recipes */}
            {generatedRecipes.length > 0 && (
              <View style={uiStyles.recipesContainer}>
                {generatedRecipes.map((recipe, idx) => (
                  <View key={idx} style={uiStyles.recipeContainer}>
                    <Text style={uiStyles.recipeTitle}>{recipe.title}</Text>

                    <View style={uiStyles.recipeMeta}>
                      <Text style={uiStyles.metaText}>⏱️ {recipe.cookingTime}</Text>
                      <Text style={uiStyles.metaText}>🎯 {recipe.difficulty}</Text>
                      <Text style={uiStyles.metaText}>👥 Serves {recipe.servings}</Text>
                    </View>

                    <Text style={uiStyles.sectionTitle}>Ingredients</Text>
                    {recipe.ingredients.map((item, index) => (
                      <Text key={index} style={uiStyles.ingredientItem}>
                        • {item}
                      </Text>
                    ))}

                    <Text style={uiStyles.sectionTitle}>Instructions</Text>
                    {recipe.instructions.map((inst, index) => (
                      <View key={index} style={uiStyles.instructionStep}>
                        <Text style={uiStyles.stepNumber}>{index + 1}.</Text>
                        <Text style={uiStyles.instructionText}>{inst}</Text>
                      </View>
                    ))}

                    <TouchableOpacity
                      style={[uiStyles.button, uiStyles.saveButton]}
                      onPress={() => handleSaveRecipe(recipe)}
                    >
                      <Text style={uiStyles.buttonText}>Save Recipe</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        <CustomBottomBar />
      </SafeAreaView>
    </Background>
  );
};

const uiStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  profileIcon: {
    width: 45,
    height: 45,
  },
  character: {
    width: "70%",
    height: 260,
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 12,
  },
  inputLabel: {
    fontWeight: "600",
    marginBottom: 6,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 6,
  },
  primaryButton: {
    backgroundColor: "#42A5F5",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  secondaryText: {
    marginLeft: 6,
    color: "#000",
    fontWeight: "500",
    fontSize: 14,
  },
  icon: {},
  recipesContainer: {
    width: "100%",
    marginTop: 20,
  },
  recipeContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  recipeMeta: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  ingredientItem: {
    fontSize: 16,
    color: "#444",
    marginBottom: 6,
    lineHeight: 22,
  },
  instructionStep: {
    flexDirection: "row",
    marginBottom: 8,
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
  saveButton: {
    backgroundColor: "#4CAF50",
    marginTop: 12,
  },
});

export default RecipeGenerator;
