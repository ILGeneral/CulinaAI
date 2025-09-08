import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { getSharedRecipes, SharedRecipe } from '../utils/firestore';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Recipe {
  id: string;
  title: string;
  image: string;
  duration: string;
  calories: number;
  ingredientsCount: number;
}

interface RecipeShowcaseProps {
  onRecipePress?: (recipe: any) => void;
}

const RecipeShowcase: React.FC<RecipeShowcaseProps> = ({ onRecipePress }) => {
  const [recentlyGenerated, setRecentlyGenerated] = useState<Recipe[]>([]);
  const [communityShared, setCommunityShared] = useState<SharedRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up real-time listener for shared recipes
    const sharedRecipesRef = collection(db, 'sharedRecipes');
    const q = query(sharedRecipesRef, orderBy('sharedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sharedRecipes: SharedRecipe[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sharedRecipes.push({
          id: doc.id,
          ...data,
          sharedAt: data.sharedAt.toDate(),
        } as SharedRecipe);
      });

      setRecentlyGenerated([]);
      setCommunityShared(sharedRecipes.slice(0, 10));
      setLoading(false);
    }, (error) => {
      console.error('Error listening to shared recipes:', error);
      setRecentlyGenerated([]);
      setCommunityShared([]);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => onRecipePress?.(item)}
    >
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.recipeMeta}>
          <Text style={styles.metaText}>⏱️ {item.duration}</Text>
          <Text style={styles.metaText}>🔥 {item.calories} cal</Text>
          <Text style={styles.metaText}>🥕 {item.ingredientsCount} ingredients</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSharedRecipeItem = ({ item }: { item: SharedRecipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => onRecipePress?.(item)}
    >
      <Image source={{ uri: "https://img.freepik.com/free-photo/side-view-double-cheeseburger-with-grilled-beef-patties-cheese-lettuce-leaf-burger-buns_141793-4883.jpg" }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.recipeMeta}>
          <Text style={styles.metaText}>⏱️ {item.cookingTime}</Text>
          <Text style={styles.metaText}>🔥 {item.estimatedKcal ? parseInt(item.estimatedKcal.replace(/\D/g, '')) || 0 : 0} cal</Text>
          <Text style={styles.metaText}>🥕 {item.ingredients.length} ingredients</Text>
        </View>
      </View>
    </TouchableOpacity>
  );



  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Loading recipes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {recentlyGenerated.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Generated</Text>
          <FlatList
            data={recentlyGenerated}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Community Shared</Text>
        {communityShared.length > 0 ? (
          <FlatList
            data={communityShared}
            renderItem={renderSharedRecipeItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <Text style={styles.emptyText}>No shared recipes yet. Be the first to share!</Text>
        )}
      </View>
    </View>
  );
};

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 16 * 2 - 12 * 2) / 2.2; // Dynamic width based on screen size

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listContainer: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    width: cardWidth,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  recipeInfo: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    lineHeight: 18,
  },
  recipeMeta: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    flexShrink: 1,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
});

export default RecipeShowcase;
