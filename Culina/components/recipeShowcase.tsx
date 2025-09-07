import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { getSharedRecipes } from '../utils/firestore';

interface Recipe {
  id: string;
  title: string;
  image: string;
  duration: string;
  calories: number;
  ingredientsCount: number;
}

interface RecipeShowcaseProps {
  onRecipePress?: (recipe: Recipe) => void;
}

const RecipeShowcase: React.FC<RecipeShowcaseProps> = ({ onRecipePress }) => {
  const [recentlyGenerated, setRecentlyGenerated] = useState<Recipe[]>([]);
  const [communityShared, setCommunityShared] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const sharedRecipes = await getSharedRecipes();

      // Transform shared recipes to match the expected format
      const communitySharedData = sharedRecipes.slice(0, 10).map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        image: "https://img.freepik.com/free-photo/side-view-double-cheeseburger-with-grilled-beef-patties-cheese-lettuce-leaf-burger-buns_141793-4883.jpg", // Default image
        duration: recipe.cookingTime,
        calories: 0,
        ingredientsCount: recipe.ingredients.length,
      }));

      setRecentlyGenerated([]);
      setCommunityShared(communitySharedData);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecentlyGenerated([]);
      setCommunityShared([]);
    } finally {
      setLoading(false);
    }
  };

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
            renderItem={renderRecipeItem}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  listContainer: {
    paddingHorizontal: 4,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recipeImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 18,
  },
  recipeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
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
