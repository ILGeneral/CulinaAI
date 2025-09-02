import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Background from "../components/background";
import CustomBottomBar from "../components/customBottomBar";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";

type Props = NativeStackScreenProps<RootStackParamList, "IngredientsList">;

interface Ingredient {
  id: string;
  name: string;
  calories: string;
  unit: string;
  img: string;
}

const IngredientsList = ({ navigation }: Props) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response: Ingredient[] = [
          {
            id: "1",
            name: "Ground Beef",
            calories: "600–640",
            unit: "250g",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMSrWoWb6Q43m9l8KFilAiuMWO8uVm5zy5fw&s",
          },
          {
            id: "2",
            name: "Burger buns",
            calories: "150–200 per bun",
            unit: "250g",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI41gvSKUWzMJiqcvPeOkQacRUeh4BEsITYQ&s",
          },
          {
            id: "3",
            name: "Cheese slice",
            calories: "60–80 per slice",
            unit: "1 pack",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXnR7lPA2j5SNu50tdg4Xpg05c2FN2kmHmpA&s",
          },
        ];
        setIngredients(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchIngredients();
  }, []);

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchText.toLowerCase())
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
              placeholder="Type the ingredients you have at home"
              placeholderTextColor="#888"
              style={{ flex: 1, fontSize: 14 }}
              value={searchText}
              onChangeText={setSearchText}
            />
            <Image source={require("../assets/camera.png")} style={styles.icon} />
          </View>

          {/* Ingredient List */}
          <FlatList
            data={filteredIngredients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.ingredientCard}>
                <Image source={{ uri: item.img }} style={styles.ingredientImage} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.ingredientName}>{item.name}</Text>
                  <Text style={styles.ingredientMeta}>{item.unit}</Text>
                  <View style={styles.metaRow}>
                    <Image source={require("../assets/kcal.png")} style={styles.metaIcon} />
                    <Text style={styles.ingredientMeta}>Estimated Calories {item.calories}</Text>
                  </View>
                </View>
                <Text style={styles.editText}>Edit</Text>
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
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: { width: 24, height: 24, resizeMode: "contain", marginLeft: 8 },
  ingredientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  ingredientImage: { width: 70, height: 70, borderRadius: 8, marginRight: 12 },
  ingredientName: { fontSize: 16, fontWeight: "600" },
  ingredientMeta: { fontSize: 13, color: "#666" },
  editText: { color: "#42A5F5", fontWeight: "600", marginLeft: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  metaIcon: { width: 16, height: 16, marginRight: 6, resizeMode: "contain" },
});

export default IngredientsList;
