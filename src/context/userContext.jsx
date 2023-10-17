import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth, db } from "@/configs/firebase/credential";
import { nameDoc } from "@/configs/firebase/nameDoc";
import { doc, getDoc, setDoc } from "firebase/firestore";

const UserContext = createContext();

export function userContext() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const userKey = "userData";

  const [user, setUser] = useState(
    // Recuperar user del localstorage
    JSON.parse(localStorage.getItem(userKey)) || null
  );

  const register = async (name, email, password) => {
    try {
      // await setPersistence(auth, browserSessionPersistence);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      const id = user.uid;
      const inserted = doc(db, `${nameDoc.USERS}/${id}`);
      await setDoc(inserted, { name, email, diagrams: {}, guests: [] });

      const userData = await getDataUser(id);
      localStorage.setItem(userKey, JSON.stringify({ ...userData, id }));

      setUser({ ...userData, id });
    } catch (error) {
      console.error(error);
    }
  };

  const login = async (email, password) => {
    try {
      //   await setPersistence(auth, browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      const id = user.uid;
      const userData = await getDataUser(id);

      localStorage.setItem(userKey, JSON.stringify({ ...userData, id }));
      setUser({ ...userData, id });
    } catch (error) {
      throw new Error(error);
    }
  };

  const getDataUser = async (uid) => {
    const userRef = doc(db, nameDoc.USERS, uid);
    const userDoc = await getDoc(userRef);
    return userDoc.data();
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem(userKey);
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <UserContext.Provider value={{ user, register, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}
