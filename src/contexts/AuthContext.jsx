import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebasecongif";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("=== AUTH STATE CHANGED ===");
      console.log("User:", user ? user.email : "None");

      if (user) {
        setUser(user);

        try {
          // First check Admin collection for admin users
          const adminDocRef = doc(db, "Admin", user.uid);
          const adminDoc = await getDoc(adminDocRef);

          if (adminDoc.exists()) {
            const adminData = adminDoc.data();
            const role = adminData.role || "admin";
            setUserRole(role);
            console.log("✅ Admin found in Admin collection:", role);
            console.log("📊 Admin data:", adminData);
          } else {
            // If not in Admin collection, check users collection
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              const role = userData.role || "user";
              setUserRole(role);
              console.log("✅ User found in users collection:", role);
              console.log("📊 User data:", userData);
            } else {
              // Fallback if user document doesn't exist in either collection
              setUserRole("user");
              console.log(
                "⚠️ User document not found in either collection, defaulting to user role",
              );
            }
          }
        } catch (error) {
          console.error("❌ Error fetching user data from Firestore:", error);
          setUserRole("user"); // Fallback role
        }
      } else {
        console.log("🚪 User logged out");
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
      console.log("=== AUTH STATE UPDATE COMPLETE ===");
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    currentUser: user, // Alias for compatibility
    userRole,
    loading,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
