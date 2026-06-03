import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCV9muAQjo2Otxz2DVRX_Yk3eTNYWgaZtY",
  authDomain: "govtholiday.firebaseapp.com",
  projectId: "govtholiday",
  storageBucket: "govtholiday.firebasestorage.app",
  messagingSenderId: "106364980583",
  appId: "1:106364980583:web:b322c22359fd1e1b0333c2",
  measurementId: "G-HTB4V7DMN5",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Anonymous sign-in
export async function loginAnonymously(): Promise<User> {
  const cred = await signInAnonymously(auth);
  return cred.user;
}

// Wait for auth state
export function onAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

// Leaderboard
export interface LeaderboardEntry {
  nickname: string;
  score: number;
  wave: number;
  timestamp?: unknown;
  uid?: string;
}

export async function submitScore(entry: Omit<LeaderboardEntry, "timestamp">) {
  try {
    await addDoc(collection(db, "leaderboard"), {
      ...entry,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.warn("Score submission failed:", e);
  }
}

export async function getTopScores(
  count: number = 10
): Promise<LeaderboardEntry[]> {
  try {
    const q = query(
      collection(db, "leaderboard"),
      orderBy("score", "desc"),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as LeaderboardEntry);
  } catch (e) {
    console.warn("Leaderboard fetch failed:", e);
    return [];
  }
}
