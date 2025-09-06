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
  const [userPreferences, setUserPreferences] = useState({
    dietaryLifestyle: "",
    allergies: [] as string[],
    religiousPractice: "",
    calorieGoal: ""
  });
  const [loading, setLoading] = useState(true);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
      }
    });
    return unsubscribe;
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const userDocSnap = await getDoc(doc(db, "users", userId));
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const userIngredients = userData.ingredients || [];
        setIngredients(userIngredients.map((ing: any) => ing.name));

        // Set user preferences
        setUserPreferences({
          dietaryLifestyle: userData.dietaryLifestyle || "",
          allergies: userData.allergies || [],
          religiousPractice: userData.religiousPractice || "",
          calorieGoal: userData.calorieGoal || ""
        });
      } else {
        setIngredients([]);
        setUserPreferences({
          dietaryLifestyle: "",
          allergies: [],
          religiousPractice: "",
          calorieGoal: ""
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch user data:", error);
      alert("Failed to load your data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

      // Build preferences string
      let preferencesString = "";
      if (userPreferences.dietaryLifestyle && userPreferences.dietaryLifestyle !== "None") {
        preferencesString += `Dietary Lifestyle: ${userPreferences.dietaryLifestyle}. `;
      }
      if (userPreferences.allergies && userPreferences.allergies.length > 0) {
        preferencesString += `Allergies to avoid: ${userPreferences.allergies.join(", ")}. `;
      }
      if (userPreferences.religiousPractice && userPreferences.religiousPractice !== "None") {
        preferencesString += `Religious/Cultural Practice: ${userPreferences.religiousPractice}. `;
      }
      if (userPreferences.calorieGoal && userPreferences.calorieGoal !== "None") {
        preferencesString += `Calorie Goal: ${userPreferences.calorieGoal}. `;
      }

      const prompt = `
        Generate 5 different and diverse recipes based on the following ingredients and user preferences.
        Each recipe should be unique and use different combinations of the provided ingredients.
        Make sure to respect all dietary restrictions and preferences.

        IMPORTANT: You MUST ONLY use ingredients from the provided list below.
        Do NOT add any additional ingredients that are not in the user's ingredients list.
        If you cannot create a recipe using only the provided ingredients, you should still try to create the best possible recipe with what's available.
        Do NOT suggest buying or adding new ingredients.

        Ingredients: ${ingredients.join(", ")}
        ${preferencesString ? `User Preferences: ${preferencesString}` : ""}

        IMPORTANT: For the instructions array, provide each step as a separate string starting with "Step X:" where X is the step number.
        Each instruction should be a complete, detailed step that can stand alone.
        Do NOT include the step number in the instruction text itself - just start with "Step X:".
        Add as many steps as needed, 5 is not the limit or the required minimum, just ensure clarity and completeness.

        Please provide the recipes in the following JSON array format:
        [
          {
            "title": "Recipe Title 1",
            "ingredients": ["ingredient 1", "ingredient 2", ...],
            "instructions": [
              "Step 1: Preheat oven to 375°F (190°C)",
              "Step 2: Mix all dry ingredients in a large bowl",
              "Step 3: Add wet ingredients and stir until combined",
              "Step 4: Pour batter into greased pan",
              "Step 5: Bake for 25-30 minutes until golden brown"
            ],
            "cookingTime": "XX minutes/hours and minutes",
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
    setGeneratedRecipes([]);
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
            <Text style={uiStyles.title}>What are you in the mood for? 🍽️</Text>

            {/* User Data Display */}
            <View style={{ width: "100%", marginVertical: 12 }}>
              <Text style={uiStyles.inputLabel}>Your Ingredients</Text>
              <TextInput
                style={[uiStyles.input, uiStyles.readOnlyInput]}
                value={ingredients.length > 0 ? ingredients.join(", ") : "No ingredients added yet"}
                editable={false}
                multiline
                numberOfLines={2}
              />

              <Text style={uiStyles.inputLabel}>Your Preferences</Text>
              <View style={uiStyles.preferencesContainer}>
                {userPreferences.dietaryLifestyle && userPreferences.dietaryLifestyle !== "None" && (
                  <Text style={uiStyles.preferenceText}>
                    🍽️ Dietary: {userPreferences.dietaryLifestyle}
                  </Text>
                )}
                {userPreferences.allergies && userPreferences.allergies.length > 0 && (
                  <Text style={uiStyles.preferenceText}>
                    ⚠️ Allergies: {userPreferences.allergies.join(", ")}
                  </Text>
                )}
                {userPreferences.religiousPractice && userPreferences.religiousPractice !== "None" && (
                  <Text style={uiStyles.preferenceText}>
                    🙏 Practice: {userPreferences.religiousPractice}
                  </Text>
                )}
                {userPreferences.calorieGoal && userPreferences.calorieGoal !== "None" && (
                  <Text style={uiStyles.preferenceText}>
                    🎯 Goal: {userPreferences.calorieGoal}
                  </Text>
                )}
                {(!userPreferences.dietaryLifestyle || userPreferences.dietaryLifestyle === "None") &&
                 (!userPreferences.allergies || userPreferences.allergies.length === 0) &&
                 (!userPreferences.religiousPractice || userPreferences.religiousPractice === "None") &&
                 (!userPreferences.calorieGoal || userPreferences.calorieGoal === "None") && (
                  <Text style={uiStyles.preferenceText}>No preferences set</Text>
                )}
              </View>
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
                  <TouchableOpacity
                    key={idx}
                    style={uiStyles.recipeContainer}
                    onPress={() => navigation.navigate("RecipeDetail", { recipe })}
                    activeOpacity={0.7}
                  >
                    <Text style={uiStyles.recipeTitle}>{recipe.title}</Text>

                    <View style={uiStyles.recipeMeta}>
                      <Text style={uiStyles.metaText}>⏱️ {recipe.cookingTime}</Text>
                      <Text style={uiStyles.metaText}>🎯 {recipe.difficulty}</Text>
                      <Text style={uiStyles.metaText}>👥 Serves {recipe.servings}</Text>
                    </View>
                  </TouchableOpacity>
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
  readOnlyInput: {
    backgroundColor: "#f5f5f5",
    color: "#666",
  },
  preferencesContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  preferenceText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    lineHeight: 20,
  },
  expandButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "center",
    marginTop: 8,
  },
  expandButtonText: {
    fontSize: 14,
    color: "#42A5F5",
    fontWeight: "600",
  },
  detailsContainer: {
    marginTop: 16,
  },
});

export default RecipeGenerator;
