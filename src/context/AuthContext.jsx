import React, { createContext, useContext, useEffect, useState } from "react";
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔐 LOGIN (Firebase Auth)
    const login = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    // 🚪 LOGOUT
    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    // 🔄 AUTH STATE + ROLE FETCH
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            // 🔥 Fetch role from Firestore
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: userDoc.exists() ? userDoc.data().role : "staff",
            });

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
