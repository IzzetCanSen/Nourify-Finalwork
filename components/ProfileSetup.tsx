import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";

import Icon from "react-native-vector-icons/MaterialIcons";

type ActivityLevel =
  | "Sedentary"
  | "Light"
  | "Moderate"
  | "Active"
  | "Very active";

const ProfileSetup = () => {
  const [step, setStep] = useState(1);
  const [biologicalSex, setBiologicalSex] = useState<string | null>(null);
  const [age, setAge] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [bodyFat, setBodyFat] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(
    null
  );
  const [nutritionTargets, setNutritionTargets] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const [isNextEnabled, setIsNextEnabled] = useState(false);

  const [user] = useAuthState(auth);

  useEffect(() => {
    if (step === 1) {
      setIsNextEnabled(
        biologicalSex !== null &&
          age !== "" &&
          height !== "" &&
          weight !== "" &&
          bodyFat !== null
      );
    } else if (step === 2) {
      setIsNextEnabled(goal !== null && activityLevel !== null);
    }
  }, [biologicalSex, age, height, weight, bodyFat, goal, activityLevel, step]);

  const handleNextStep = () => {
    if (step === 2) {
      calculateNutritionTargets();
    }
    setStep(step + 1);
  };

  const goBack = () => {
    setStep(step - 1);
  };

  const getActivityMultiplier = (activityLevel: ActivityLevel): number => {
    switch (activityLevel) {
      case "Sedentary":
        return 1.2;
      case "Light":
        return 1.375;
      case "Moderate":
        return 1.55;
      case "Active":
        return 1.725;
      case "Very active":
        return 1.9;
      default:
        return 1.2;
    }
  };

  const calculateNutritionTargets = () => {
    const weightFloat = parseFloat(weight);
    const heightFloat = parseFloat(height);
    const ageFloat = parseFloat(age);
    const activityMultiplier = getActivityMultiplier(activityLevel!);

    let BMR: number;

    if (biologicalSex === "Male") {
      BMR = 10 * weightFloat + 6.25 * heightFloat - 5 * ageFloat + 5;
    } else {
      BMR = 10 * weightFloat + 6.25 * heightFloat - 5 * ageFloat - 161;
    }

    const TDEE = BMR * activityMultiplier;

    let adjustedCalories: number;

    switch (goal) {
      case "Lose fat":
        adjustedCalories = TDEE - 500;
        break;
      case "Maintain weight":
        adjustedCalories = TDEE;
        break;
      case "Build muscle":
        adjustedCalories = TDEE + 500;
        break;
      default:
        adjustedCalories = TDEE;
    }

    const proteinCalories = adjustedCalories * 0.4;
    const carbsCalories = adjustedCalories * 0.4;
    const fatCalories = adjustedCalories * 0.2;

    const protein = proteinCalories / 4;
    const carbs = carbsCalories / 4;
    const fat = fatCalories / 9;

    setNutritionTargets({ calories: adjustedCalories, protein, carbs, fat });
  };

  const saveProfileData = async () => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        biologicalSex,
        age: parseInt(age),
        height: parseFloat(height),
        weight: parseFloat(weight),
        bodyFat,
        goal,
        activityLevel,
        adjustedCalories: nutritionTargets.calories,
        protein: nutritionTargets.protein,
        carbs: nutritionTargets.carbs,
        fat: nutritionTargets.fat,
      });
    }
  };

  const handleFinish = async () => {
    await saveProfileData();
  };

  return (
    <>
      {step === 1 && (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Physical Profile</Text>
          </View>
          <View style={styles.formInputsContainer}>
            <View>
              <Text style={styles.label}>Biological sex</Text>
              <View style={styles.radioGroup}>
                {["Male", "Female", "Other"].map((sex) => (
                  <TouchableOpacity
                    key={sex}
                    style={[
                      styles.radioButton,
                      biologicalSex === sex && styles.radioButtonSelected,
                    ]}
                    onPress={() => setBiologicalSex(sex)}
                  >
                    <Text
                      style={[
                        styles.radioButtonText,
                        biologicalSex === sex && styles.radioButtonTextSelected,
                      ]}
                    >
                      {sex}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.profileSetupInputContainer}>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="Age"
                placeholderTextColor="#fff"
              />
              <View style={styles.profileSetupInputLabel}>
                <Text style={styles.profileSetupInputLabelText}>years</Text>
              </View>
            </View>
            <View style={styles.profileSetupInputContainer}>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder="Height"
                placeholderTextColor="#fff"
              />
              <View style={styles.profileSetupInputLabel}>
                <Text style={styles.profileSetupInputLabelText}>cm</Text>
              </View>
            </View>
            <View style={styles.profileSetupInputContainer}>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="Weight"
                placeholderTextColor="#fff"
              />
              <View style={styles.profileSetupInputLabel}>
                <Text style={styles.profileSetupInputLabelText}>kg</Text>
              </View>
            </View>
            <View>
              <Text style={styles.label}>Body fat</Text>
              <View style={styles.radioGroup}>
                {["Low", "Medium", "High"].map((fat) => (
                  <TouchableOpacity
                    key={fat}
                    style={[
                      styles.radioButton,
                      bodyFat === fat && styles.radioButtonSelected,
                    ]}
                    onPress={() => setBodyFat(fat)}
                  >
                    <Text
                      style={[
                        styles.radioButtonText,
                        bodyFat === fat && styles.radioButtonTextSelected,
                      ]}
                    >
                      {fat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.nextButton, !isNextEnabled && styles.disabledButton]}
            onPress={handleNextStep}
            disabled={!isNextEnabled}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 2 && (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Goal and activity level</Text>
          </View>
          <View style={styles.optionsContainer}>
            <Text style={styles.label}>Goal</Text>
            <View style={styles.buttonGroup}>
              {["Lose fat", "Maintain weight", "Build muscle"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.button, goal === g && styles.buttonSelected]}
                  onPress={() => setGoal(g)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      goal === g && styles.buttonTextSelected,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Activity level</Text>
            <View style={styles.buttonGroup}>
              {["Sedentary", "Light", "Moderate", "Active", "Very active"].map(
                (level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.button,
                      activityLevel === level && styles.buttonSelected,
                    ]}
                    onPress={() => setActivityLevel(level as ActivityLevel)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        activityLevel === level && styles.buttonTextSelected,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
          <TouchableOpacity
            style={[styles.nextButton, !isNextEnabled && styles.disabledButton]}
            onPress={handleNextStep}
            disabled={!isNextEnabled}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 3 && (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Nutrition targets</Text>
          </View>
          <View style={styles.nutritionTargetsContainer}>
            <Text style={styles.subtitle}>
              Here are the nutrition targets we have estimated.
            </Text>
            <View style={styles.nutritionContainer}>
              <View style={[styles.nutritionCircle, styles.caloriesCircle]}>
                <Text style={styles.caloriesLabel}>CAL</Text>
                <Text style={styles.nutritionValue}>
                  {nutritionTargets.calories.toFixed(0)}
                </Text>
              </View>
              <View style={[styles.nutritionCircle, styles.proteinCircle]}>
                <Text style={styles.proteinLabel}>PROT</Text>
                <View style={styles.nutritionValueContainer}>
                  <Text style={styles.nutritionValue}>
                    {nutritionTargets.protein.toFixed(0)}g
                  </Text>
                  <Text style={styles.nutritionPercentage}>(40%)</Text>
                </View>
              </View>
              <View style={[styles.nutritionCircle, styles.carbsCircle]}>
                <Text style={styles.carbsLabel}>CARB</Text>
                <View style={styles.nutritionValueContainer}>
                  <Text style={styles.nutritionValue}>
                    {nutritionTargets.carbs.toFixed(0)}g
                  </Text>
                  <Text style={styles.nutritionPercentage}>(40%)</Text>
                </View>
              </View>
              <View style={[styles.nutritionCircle, styles.fatCircle]}>
                <Text style={styles.fatLabel}>FAT</Text>
                <View style={styles.nutritionValueContainer}>
                  <Text style={styles.nutritionValue}>
                    {nutritionTargets.fat.toFixed(0)}g
                  </Text>
                  <Text style={styles.nutritionPercentage}>(20%)</Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.nextButton} onPress={handleFinish}>
            <Text style={styles.nextButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222E3A",
    padding: 20,
    paddingTop: 60,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  radioButton: {
    flex: 1,
    backgroundColor: "#1F2831",
    borderRadius: 10,
    padding: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginRight: 5,
  },
  radioButtonSelected: {
    backgroundColor: "#3fa1ca",
  },
  radioButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  radioButtonTextSelected: {
    color: "#fff",
  },
  input: {
    height: 40,
    width: "85%",
    borderBottomColor: "#fff",
    borderBottomWidth: 1,
    color: "#fff",
  },
  nextButton: {
    backgroundColor: "#3fa1ca",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#555",
  },
  formInputsContainer: {
    marginTop: 20,
    flex: 1,
    gap: 40,
  },
  profileSetupInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: "auto",
    padding: 0,
  },
  profileSetupInputLabel: {
    height: 40,
    width: "15%",
    borderBottomColor: "#fff",
    borderBottomWidth: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  profileSetupInputLabelText: {
    color: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  backArrow: {
    color: "#fff",
    fontSize: 24,
    marginRight: 10,
  },
  buttonGroup: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#1F2831",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonSelected: {
    backgroundColor: "#3fa1ca",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  buttonTextSelected: {
    color: "#fff",
  },
  optionsContainer: {
    marginTop: 20,
    flex: 1,
  },
  nutritionTargetsContainer: {
    height: 680,
  },
  nutritionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    flexWrap: "wrap",
    gap: 20,
    alignItems: "center",
  },
  nutritionValueContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 5,
  },
  nutritionCircle: {
    backgroundColor: "#1F2831",
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 150,
    borderRadius: 80,
    borderWidth: 4,
  },
  caloriesCircle: {
    borderColor: "#EE5858",
  },
  proteinCircle: {
    borderColor: "#72F584",
  },
  carbsCircle: {
    borderColor: "#F9C75C",
  },
  fatCircle: {
    borderColor: "#EE81FA",
  },
  caloriesLabel: {
    color: "#EE5858",
    fontSize: 20,
    fontWeight: "bold",
  },
  proteinLabel: {
    color: "#72F584",
    fontSize: 20,
    fontWeight: "bold",
  },
  carbsLabel: {
    color: "#F9C75C",
    fontSize: 20,
    fontWeight: "bold",
  },
  fatLabel: {
    color: "#EE81FA",
    fontSize: 20,
    fontWeight: "bold",
  },
  nutritionValue: {
    color: "#fff",
    fontSize: 18,
  },
  nutritionPercentage: {
    color: "#fff",
    fontSize: 14,
  },
});

export default ProfileSetup;
