import React, { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  Text,
  Platform,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { router } from "expo-router";
import ProfileSetup from "@/components/ProfileSetup";
import { FirebaseError } from "firebase/app"; // Import FirebaseError

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [keyboardIsShown, setKeyboardIsShown] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardIsShown(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardIsShown(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save the username and other profile information to Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        createdAt: new Date(),
      });

      setIsSignedUp(true);
    } catch (error) {
      // Explicitly type error as FirebaseError
      if (error instanceof FirebaseError) {
        console.error("Error signing up:", error.code, error.message);
      } else {
        console.error("Unknown error:", error);
      }
    }
  };

  if (isSignedUp) {
    return <ProfileSetup />;
  }

  return (
    <View style={styles.authScreenContainer}>
      {!keyboardIsShown && (
        <Image source={require("@/assets/images/nourify-logo.png")} />
      )}

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Sign Up</Text>
        <View style={styles.formInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#fff"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#fff"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#fff"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <View style={styles.formExtraInformation}>
          <Text style={styles.formExtraInformationText}>
            Already have an account?
          </Text>
          <Text
            style={styles.formExtraInformationButton}
            onPress={() => router.push("signin")}
          >
            Sign In
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  authScreenContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#222E3A",
    padding: 20,
    paddingTop: 150,
    gap: 50,
  },
  formContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 50,
    width: "100%",
  },
  formTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: "#fff",
  },
  formInputContainer: {
    width: "100%",
  },
  input: {
    height: 40,
    width: "100%",
    borderBottomColor: "#fff",
    borderBottomWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: "#fff",
  },
  button: {
    backgroundColor: "#3fa1ca",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  formExtraInformation: {
    flexDirection: "row",
    gap: 10,
  },
  formExtraInformationText: {
    color: "#fff",
    fontWeight: "300",
  },
  formExtraInformationButton: {
    color: "#fff",
    textDecorationLine: "underline",
  },
});
