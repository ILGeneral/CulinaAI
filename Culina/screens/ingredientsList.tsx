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
  Alert,
  Modal,
} from "react-native";
import Background from "../components/background";
import CustomBottomBar from "../components/customBottomBar";
import { auth } from "../utils/authPersistence";
import { getUserIngredients, addOrUpdateIngredient, deleteIngredient, Ingredient } from "../utils/firestore";
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth as firebaseAuth } from '../firebaseConfig'; // To get current user

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";
import { User } from "firebase/auth";

type Props = NativeStackScreenProps<RootStackParamList, "IngredientsList">;

const IngredientsList = ({ navigation }: Props) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    quantity: "",
    unit: "",
    category: "",
    img: "",
    calories: "",
  });

  const fetchIngredients = async (userId: string) => {
    try {
      const userIngredients = await getUserIngredients(userId);
      setIngredients(userIngredients);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      Alert.alert("Error", "Failed to load ingredients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        fetchIngredients(user.uid);
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleAddIngredient = () => {
    setEditingIngredient(null);
    setNewIngredient({
      name: "",
      quantity: "",
      unit: "",
      category: "",
      img: "",
      calories: "",
    });
    setModalVisible(true);
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setNewIngredient({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      category: ingredient.category || "",
      img: ingredient.img || "",
      calories: ingredient.calories || "",
    });
    setModalVisible(true);
  };

  const handleSaveIngredient = async () => {
    if (!currentUser) return;

    if (!newIngredient.name.trim() || !newIngredient.quantity.trim() || !newIngredient.unit.trim()) {
      Alert.alert("Error", "Please fill in name, quantity, and unit");
      return;
    }

    try {
      const ingredientId = editingIngredient ? editingIngredient.id : `${currentUser.uid}_${Date.now()}`;
      const ingredient: Omit<Ingredient, 'createdAt' | 'updatedAt'> = {
        id: ingredientId,
        name: newIngredient.name,
        quantity: newIngredient.quantity,
        unit: newIngredient.unit,
        category: newIngredient.category || undefined,
        img: newIngredient.img || undefined,
        calories: newIngredient.calories || undefined,
        userId: currentUser.uid,
      };

      await addOrUpdateIngredient(ingredient);
      setModalVisible(false);
      fetchIngredients(currentUser.uid); // Refresh the list
    } catch (error) {
      console.error("Error saving ingredient:", error);
      Alert.alert("Error", "Failed to save ingredient");
    }
  };

  const handleDeleteIngredient = async (ingredientId: string) => {
    Alert.alert(
      "Delete Ingredient",
      "Are you sure you want to delete this ingredient?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteIngredient(ingredientId);
              if (currentUser) {
                fetchIngredients(currentUser.uid);
              }
            } catch (error) {
              console.error("Error deleting ingredient:", error);
              Alert.alert("Error", "Failed to delete ingredient");
            }
          },
        },
      ]
    );
  };

  const saveIngredients = async (ingredients: string[]) => {
    const user = auth.currentUser;
    if (!user) {
      alert('You must be logged in to save ingredients.');
      return;
    }
    try {
      await setDoc(doc(db, 'ingredients', user.uid), {
        items: ingredients,
        updatedAt: new Date(),
      });
      alert('Ingredients saved!');
    } catch (error: any) {
      alert('Failed to save ingredients: ' + error.message);
    }
  };

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

          {/* Add Ingredient Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
            <Text style={styles.addButtonText}>+ Add Ingredient</Text>
          </TouchableOpacity>

          {/* Ingredient List */}
          <FlatList
            data={filteredIngredients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.ingredientCard}>
                <Image source={{ uri: item.img || "https://via.placeholder.com/70" }} style={styles.ingredientImage} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.ingredientName}>{item.name}</Text>
                  <Text style={styles.ingredientMeta}>{item.quantity} {item.unit}</Text>
                  {item.calories && (
                    <View style={styles.metaRow}>
                      <Image source={require("../assets/kcal.png")} style={styles.metaIcon} />
                      <Text style={styles.ingredientMeta}>Estimated Calories {item.calories}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity onPress={() => handleEditIngredient(item)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteIngredient(item.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          {/* Modal for Add/Edit Ingredient */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {editingIngredient ? "Edit Ingredient" : "Add New Ingredient"}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Ingredient Name"
                  value={newIngredient.name}
                  onChangeText={(text) => setNewIngredient({ ...newIngredient, name: text })}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Quantity (e.g., 500)"
                  value={newIngredient.quantity}
                  onChangeText={(text) => setNewIngredient({ ...newIngredient, quantity: text })}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Unit (e.g., g, kg, cups)"
                  value={newIngredient.unit}
                  onChangeText={(text) => setNewIngredient({ ...newIngredient, unit: text })}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Category (optional)"
                  value={newIngredient.category}
                  onChangeText={(text) => setNewIngredient({ ...newIngredient, category: text })}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Image URL (optional)"
                  value={newIngredient.img}
                  onChangeText={(text) => setNewIngredient({ ...newIngredient, img: text })}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Calories (optional)"
                  value={newIngredient.calories}
                  onChangeText={(text) => setNewIngredient({ ...newIngredient, calories: text })}
                  keyboardType="numeric"
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSaveIngredient}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Read-only Ingredients Input */}
          <TextInput
            style={styles.readOnlyInput}
            placeholder="e.g., chicken, rice, vegetables"
            value={ingredients.map(ingredient => ingredient.name).join(", ")}
            editable={false} // <-- Make it read-only
            multiline
            numberOfLines={2}
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
  addButton: {
    backgroundColor: "#42A5F5",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
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
  editText: { color: "#42A5F5", fontWeight: "600", marginBottom: 4 },
  deleteText: { color: "#FF4444", fontWeight: "600" },
  actionButtons: {
    alignItems: "flex-end",
  },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  metaIcon: { width: 16, height: 16, marginRight: 6, resizeMode: "contain" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ddd",
  },
  saveButton: {
    backgroundColor: "#42A5F5",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  readOnlyInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
});

export default IngredientsList;
