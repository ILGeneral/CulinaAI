import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface SavedRecipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  difficulty: string;
  servings: number;
  userId: string;
  savedAt: Date;
}

export interface UserData {
  email: string;
  username: string;
  dietaryLifestyle: string;
  allergies: string[];
  religiousPractice: string;
  calorieGoal: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category?: string;
  img?: string;
  calories?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const getUserIngredients = async (userId: string): Promise<Ingredient[]> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.ingredients || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching user ingredients:', error);
    throw error;
  }
};

export const addOrUpdateIngredient = async (ingredient: Omit<Ingredient, 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', ingredient.userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User document not found');
    }

    const userData = userSnap.data();
    const existingIngredients = userData.ingredients || [];
    const now = new Date();

    const ingredientData: Ingredient = {
      id: ingredient.id,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      userId: ingredient.userId,
      createdAt: now,
      updatedAt: now,
    };

    // optional fields
    if (ingredient.category !== undefined) {
      ingredientData.category = ingredient.category;
    }
    if (ingredient.img !== undefined) {
      ingredientData.img = ingredient.img;
    }
    if (ingredient.calories !== undefined) {
      ingredientData.calories = ingredient.calories;
    }

    const existingIndex = existingIngredients.findIndex((ing: Ingredient) => ing.id === ingredient.id);

    if (existingIndex >= 0) {
      // Update ingredients
      existingIngredients[existingIndex] = ingredientData;
    } else {
      // Add new ingredients
      existingIngredients.push(ingredientData);
    }

    await updateDoc(userRef, {
      ingredients: existingIngredients,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error adding/updating ingredient:', error);
    throw error;
  }
};

export const deleteIngredient = async (ingredientId: string): Promise<void> => {
  try {
    const userId = ingredientId.split('_')[0];
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User document not found');
    }

    const userData = userSnap.data();
    const existingIngredients = userData.ingredients || [];

    // Filter out the ingredient to delete
    const updatedIngredients = existingIngredients.filter((ing: Ingredient) => ing.id !== ingredientId);

    await updateDoc(userRef, {
      ingredients: updatedIngredients,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    throw error;
  }
};

export const getUserRecipes = async (userId: string): Promise<SavedRecipe[]> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.recipes || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    throw error;
  }
};

export const getRecipeById = async (recipeId: string): Promise<SavedRecipe | null> => {
  try {
    // Since recipeId is in format userId_timestamp, we can extract userId
    const userId = recipeId.split('_')[0];
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const userRecipes = userData.recipes || [];
      const recipe = userRecipes.find((rec: SavedRecipe) => rec.id === recipeId);
      return recipe || null;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
};

// User data functions
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const updateUserData = async (userId: string, updates: Partial<UserData>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};

export const createUserData = async (userId: string, userData: UserData): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      ingredients: [],
      recipes: [],
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error creating user data:', error);
    throw error;
  }
};

export const saveRecipe = async (userId: string, recipe: Omit<SavedRecipe, 'id' | 'userId' | 'savedAt'>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User document not found');
    }

    const userData = userSnap.data();
    const existingRecipes = userData.recipes || [];
    const recipeId = `${userId}_${Date.now()}`;

    const recipeData: SavedRecipe = {
      ...recipe,
      id: recipeId,
      userId,
      savedAt: new Date(),
    };

    existingRecipes.push(recipeData);

    await updateDoc(userRef, {
      recipes: existingRecipes,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
};
