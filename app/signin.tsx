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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { router } from "expo-router";

export default function HomeScreen() {
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [keyboardIsShown, setKeyboardIsShown] = useState(false);

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

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, signinEmail, signinPassword)
      .then((userCredential) => {
        const user = userCredential.user;
        router.push("(tabs)");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
      });
  };

  return (
    <View style={styles.authScreenContainer}>
      {!keyboardIsShown && (
        <Image source={require("@/assets/images/nourify-logo.png")} />
      )}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Sign In</Text>
        <View style={styles.formInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#fff"
            value={signinEmail}
            onChangeText={setSigninEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#fff"
            value={signinPassword}
            onChangeText={setSigninPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <View style={styles.formExtraInformation}>
          <Text style={styles.formExtraInformationText}>
            Don't have an account?
          </Text>
          <Text
            style={styles.formExtraInformationButton}
            onPress={() => router.push("signup")}
          >
            Sign Up
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
