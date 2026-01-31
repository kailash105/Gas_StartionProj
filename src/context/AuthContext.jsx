import React, { createContext, useContext, useEffect, useState } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = (email, password) =>
        signInWithEmailAndPassword(auth, email, password);

    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    useEffect(() => {
        return onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            const snap = await getDoc(doc(db, "users", firebaseUser.uid));
            if (!snap.exists()) {
                await signOut(auth);
                setUser(null);
                setLoading(false);
                return;
            }

            const { role, name } = snap.data();

            if (!["admin", "manager"].includes(role)) {
                await signOut(auth);
                setUser(null);
                setLoading(false);
                return;
            }

            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role,
                name,
            });

            setLoading(false);
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
