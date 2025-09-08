import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
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
  estimatedKcal?: string;
  id?: string;
}

const RecipeDetail = ({ navigation, route }: Props) => {
  const { recipe } = route.params;

  return (
    <Background>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header: Back button and CULINA title */}
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
          {/* Removed save recipe button below the recipe screen as per user request */}
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
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
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
