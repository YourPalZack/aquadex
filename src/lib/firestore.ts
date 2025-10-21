import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from 'firebase/auth';

// User Profile Types
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: {
    notifications: {
      email: boolean;
      push: boolean;
      testReminders: boolean;
      marketplaceUpdates: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private';
      showAquariums: boolean;
    };
  };
}

// Aquarium Types (extending existing types)
export interface FirebaseAquarium {
  id?: string;
  userId: string;
  name: string;
  type: 'freshwater' | 'saltwater' | 'brackish';
  volume: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  setupDate: Timestamp;
  description?: string;
  imageUrls: string[];
  equipment: {
    filter?: string;
    lighting?: string;
    heater?: string;
    substrate?: string;
  };
  livestock: Array<{
    species: string;
    quantity: number;
    addedDate: Timestamp;
  }>;
  plants: Array<{
    species: string;
    quantity: number;
    addedDate: Timestamp;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Water Test Types
export interface FirebaseWaterTest {
  id?: string;
  aquariumId: string;
  userId: string;
  testDate: Timestamp;
  parameters: {
    pH?: number;
    ammonia?: number;
    nitrite?: number;
    nitrate?: number;
    temperature?: number;
    salinity?: number;
    alkalinity?: number;
    phosphate?: number;
    calcium?: number;
    magnesium?: number;
  };
  testStripImageUrl?: string;
  notes?: string;
  createdAt: Timestamp;
}

// Marketplace Listing Types
export interface FirebaseMarketplaceListing {
  id?: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  category: 'fish' | 'plants' | 'equipment' | 'food' | 'accessories';
  subcategory?: string;
  price: number;
  currency: string;
  condition: 'new' | 'used' | 'refurbished';
  imageUrls: string[];
  location: {
    city: string;
    state: string;
    country: string;
    zipCode?: string;
  };
  shipping: {
    local: boolean;
    domestic: boolean;
    international: boolean;
    cost?: number;
  };
  status: 'active' | 'sold' | 'inactive';
  views: number;
  featured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Q&A Types
export interface FirebaseQuestion {
  id?: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  imageUrls: string[];
  votes: number;
  answerCount: number;
  isSolved: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseAnswer {
  id?: string;
  questionId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  content: string;
  votes: number;
  isAccepted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User Profile Operations
export const createUserProfile = async (user: User): Promise<void> => {
  const userProfile: Omit<UserProfile, 'uid'> = {
    email: user.email!,
    displayName: user.displayName || undefined,
    photoURL: user.photoURL || undefined,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    settings: {
      notifications: {
        email: true,
        push: true,
        testReminders: true,
        marketplaceUpdates: false
      },
      privacy: {
        profileVisibility: 'public',
        showAquariums: true
      }
    }
  };

  await updateDoc(doc(db, 'users', user.uid), userProfile);
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

// Aquarium Operations
export const createAquarium = async (aquarium: Omit<FirebaseAquarium, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const aquariumData: Omit<FirebaseAquarium, 'id'> = {
    ...aquarium,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  const docRef = await addDoc(collection(db, 'aquariums'), aquariumData);
  return docRef.id;
};

export const getUserAquariums = async (userId: string): Promise<FirebaseAquarium[]> => {
  const q = query(
    collection(db, 'aquariums'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FirebaseAquarium));
};

export const getAquarium = async (aquariumId: string): Promise<FirebaseAquarium | null> => {
  const docRef = doc(db, 'aquariums', aquariumId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as FirebaseAquarium;
  }
  return null;
};

export const updateAquarium = async (aquariumId: string, updates: Partial<FirebaseAquarium>): Promise<void> => {
  const docRef = doc(db, 'aquariums', aquariumId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

export const deleteAquarium = async (aquariumId: string): Promise<void> => {
  await deleteDoc(doc(db, 'aquariums', aquariumId));
};

// Water Test Operations
export const createWaterTest = async (test: Omit<FirebaseWaterTest, 'id' | 'createdAt'>): Promise<string> => {
  const testData: Omit<FirebaseWaterTest, 'id'> = {
    ...test,
    createdAt: Timestamp.now()
  };

  const docRef = await addDoc(collection(db, 'waterTests'), testData);
  return docRef.id;
};

export const getAquariumWaterTests = async (aquariumId: string, limitCount?: number): Promise<FirebaseWaterTest[]> => {
  const constraints: QueryConstraint[] = [
    where('aquariumId', '==', aquariumId),
    orderBy('testDate', 'desc')
  ];
  
  if (limitCount) {
    constraints.push(limit(limitCount));
  }
  
  const q = query(collection(db, 'waterTests'), ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FirebaseWaterTest));
};

export const getUserWaterTests = async (userId: string, limitCount?: number): Promise<FirebaseWaterTest[]> => {
  const constraints: QueryConstraint[] = [
    where('userId', '==', userId),
    orderBy('testDate', 'desc')
  ];
  
  if (limitCount) {
    constraints.push(limit(limitCount));
  }
  
  const q = query(collection(db, 'waterTests'), ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FirebaseWaterTest));
};

// Marketplace Operations
export const createMarketplaceListing = async (listing: Omit<FirebaseMarketplaceListing, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<string> => {
  const listingData: Omit<FirebaseMarketplaceListing, 'id'> = {
    ...listing,
    views: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  const docRef = await addDoc(collection(db, 'marketplaceListings'), listingData);
  return docRef.id;
};

export const getMarketplaceListings = async (category?: string, limitCount?: number): Promise<FirebaseMarketplaceListing[]> => {
  const constraints: QueryConstraint[] = [
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  ];
  
  if (category) {
    constraints.unshift(where('category', '==', category));
  }
  
  if (limitCount) {
    constraints.push(limit(limitCount));
  }
  
  const q = query(collection(db, 'marketplaceListings'), ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FirebaseMarketplaceListing));
};

// Q&A Operations
export const createQuestion = async (question: Omit<FirebaseQuestion, 'id' | 'votes' | 'answerCount' | 'isSolved' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const questionData: Omit<FirebaseQuestion, 'id'> = {
    ...question,
    votes: 0,
    answerCount: 0,
    isSolved: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  const docRef = await addDoc(collection(db, 'questions'), questionData);
  return docRef.id;
};

export const getQuestions = async (category?: string, limitCount?: number): Promise<FirebaseQuestion[]> => {
  const constraints: QueryConstraint[] = [
    orderBy('createdAt', 'desc')
  ];
  
  if (category) {
    constraints.unshift(where('category', '==', category));
  }
  
  if (limitCount) {
    constraints.push(limit(limitCount));
  }
  
  const q = query(collection(db, 'questions'), ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FirebaseQuestion));
};

export const createAnswer = async (answer: Omit<FirebaseAnswer, 'id' | 'votes' | 'isAccepted' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const answerData: Omit<FirebaseAnswer, 'id'> = {
    ...answer,
    votes: 0,
    isAccepted: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  const docRef = await addDoc(collection(db, 'answers'), answerData);
  return docRef.id;
};