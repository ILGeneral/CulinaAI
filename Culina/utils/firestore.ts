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

export const saveRecipe = async (userId: string, recipe: Omit<SavedRecipe, 'id' | 'userId' | 'savedAt'>): Promise<void> => {
  try {
    const recipeId = `${userId}_${recipe.title.replace(/\s+/g, '_').toLowerCase()}`;
    const recipeRef = doc(db, 'recipes', recipeId);

    const savedRecipe: SavedRecipe = {
      ...recipe,
      id: recipeId,
      userId,
      savedAt: new Date(),
    };

    await setDoc(recipeRef, savedRecipe);
  } catch (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
};

export const getUserRecipes = async (userId: string): Promise<SavedRecipe[]> => {
  try {
    const recipesRef = collection(db, 'recipes');
    const q = query(recipesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const recipes: SavedRecipe[] = [];
    querySnapshot.forEach((doc) => {
      recipes.push(doc.data() as SavedRecipe);
    });

    return recipes;
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    throw error;
  }
};

export const getRecipeById = async (recipeId: string): Promise<SavedRecipe | null> => {
  try {
    const recipeRef = doc(db, 'recipes', recipeId);
    const recipeSnap = await getDoc(recipeRef);

    if (recipeSnap.exists()) {
      return recipeSnap.data() as SavedRecipe;
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
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error creating user data:', error);
    throw error;
  }
};
