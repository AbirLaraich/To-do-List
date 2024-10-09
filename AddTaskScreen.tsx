import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TASKS_STORAGE_KEY = "tasks";
let idCpt = 1;
const AddTaskScreen = ({ navigation }: { navigation: any }) => {
  const [taskName, setTaskName] = useState("");

  const addTask = async () => {
    if (taskName.trim().length === 0) {
      Alert.alert("Error", "Task name cannot be empty");
      return;
    }

    const newTask: Task = {
      id: (idCpt++).toString(),
      text: taskName.trim(),
      completed: false,
    };

    try {
      const storedTasks = await SecureStore.getItemAsync(TASKS_STORAGE_KEY);
      const tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
      const existingTask: Task[] = tasks.filter(
        (task) => task.id == newTask.id
      );
      if (existingTask.length === 0) {
        const updatedTasks = [...tasks, newTask];
        await SecureStore.setItemAsync(
          TASKS_STORAGE_KEY,
          JSON.stringify(updatedTasks)
        );
      }
      navigation.navigate("Home", { newTask });
    } catch (error) {
      console.error("Error saving task", error);
      Alert.alert("Error", "Failed to save task");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <Text style={styles.title}>Add New Task</Text>

        <TextInput
          style={styles.input}
          placeholder="What needs to be done?"
          placeholderTextColor="#8E8E93"
          value={taskName}
          onChangeText={setTaskName}
          multiline
          autoFocus
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.addButton,
              !taskName.trim() && styles.addButtonDisabled,
            ]}
            onPress={addTask}
            disabled={!taskName.trim()}
          >
            <Text
              style={[
                styles.addButtonText,
                !taskName.trim() && styles.addButtonTextDisabled,
              ]}
            >
              Add Task
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  keyboardAvoid: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 30,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonDisabled: {
    backgroundColor: "#B4D0F5",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  addButtonTextDisabled: {
    opacity: 0.7,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    backgroundColor: "#E5E5EA",
  },
  cancelButtonText: {
    color: "#8E8E93",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default AddTaskScreen;
