import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";

export default function CustomBottomBar() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute(); 

  return (
    <View style={styles.container}>
      {/* Left icons */}
      <View style={styles.sideGroup}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate("Home", { userEmail: "" })}
        >
          <Image
            source={
              route.name === "Home"
                ? require("../assets/homeW.png") 
                : require("../assets/home.png")      
            }
            style={styles.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate("RecipeGenerator")}
        >
          <Image
            source={
              route.name === "RecipeGenerator"
                ? require("../assets/bookW.png")
                : require("../assets/book.png")
            }
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      {/* Mascot in center */}
      <TouchableOpacity
        style={styles.mascotContainer}
        onPress={() => navigation.navigate("Gemini")}
      >
        <View style={styles.mascotCircle}>
          <Image
            source={require("../assets/chat.png")}
            style={styles.mascot}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>

      {/* Right icons */}
      <View style={styles.sideGroup}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate("SaveRecipe")}
        >
          <Image
            source={
              route.name === "SaveRecipe"
                ? require("../assets/heartW.png")
                : require("../assets/heart.png")
            }
            style={styles.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate("IngredientsList")}
        >
          <Image
            source={
              route.name === "IngredientsList"
                ? require("../assets/listW.png")
                : require("../assets/list.png")
            }
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#42A5F5",
    height: 70,
    borderRadius: 40,
    position: "absolute",
    bottom: 35,
    left: 20,
    right: 20,
    paddingHorizontal: 25,
  },
  sideGroup: {
    flexDirection: "row",
    gap: 25,
  },
  iconBtn: {
    alignItems: "center",
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  mascotContainer: {
    marginTop: -5,
    zIndex: 2,
  },
  mascotCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#42A5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  mascot: {
    width: 70,
    height: 70,
  },
});
