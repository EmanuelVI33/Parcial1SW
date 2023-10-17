import { useState, useEffect } from "react";
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

export const userKey = "userData";

export function useAuth() {
  const [user, setUser] = useState(null);

  // Escucha el cambio de estado de autenticación y actualiza el estado del usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        // El usuario está autenticado
        setUser(authUser);
      } else {
        // No hay usuario autenticado
        setUser(null);
      }
    });

    // Limpia el listener cuando se desmonta el componente
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    // Obtén los datos de usuario desde el almacenamiento local al cargar la aplicación
    const storedUserData = JSON.parse(localStorage.getItem(userKey));

    if (storedUserData) {
      console.log("Obtener datos");
      setUserData(storedUserData);
    }
  }, []);

  // Función para registrar un usuario
  const register = async (name, email, password) => {
    try {
      // Configura la persistencia de la sesión
      await setPersistence(auth, browserSessionPersistence);

      // Realiza el inicio de sesión
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Especificar el doc y el id
      const inserted = doc(db, `${nameDoc.USERS}/${user.uid}`);
      setDoc(inserted, { name, email, diagrams: [] });

      //   const userRef = doc(db, nameDoc.USERS, user.uid); // Obtener ref de users registrado
      //   const docSnap = await getDoc(userRef);

      const data = await getDataUser(user.uid);

      console.log(data);

      if (data) {
        localStorage.setItem(userKey, JSON.stringify(user));
        setUser(data);
      }
    } catch (error) {
      // Maneja los errores
      const errorCode = error.code;
      const errorMessage = error.message;
      //   throw new Error(`${errorCode}: ${errorMessage}`);
      console.log(errorMessage, errorCode);
    }
  };

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      await setPersistence(auth, browserSessionPersistence);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = await getDataUser(userCredential.user.uid);

      console.log(user);

      setUser(user);
    } catch (error) {
      throw new Error(error);
    }
  };

  const getDataUser = async (uid) => {
    const userRef = doc(db, nameDoc.USERS, uid); // Obtener ref de users registrado
    const user = await getDoc(userRef);
    return user.data();
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem(userKey);
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    user,
    register,
    login,
    logout,
  };
}
