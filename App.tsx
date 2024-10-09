import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TASKS_STORAGE_KEY = "tasks";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]); 
  const [taskName, setTaskName] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const storedTasks = await SecureStore.getItemAsync(TASKS_STORAGE_KEY);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Error loading tasks", error);
    }
  };

  const saveTasks = async (tasksToSave: Task[]) => {
    try {
      await SecureStore.setItemAsync(TASKS_STORAGE_KEY, JSON.stringify(tasksToSave));
    } catch (error) {
      console.error("Error saving tasks", error);
    }
  };

  const addTask = () => {
    if (taskName.trim().length === 0) return;
    const newTask: Task = { 
      id: Math.random().toString(),
      text: taskName,
      completed: false,
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setTaskName("");
  };

  const removeAllTasks = () => {
    Alert.alert("Confirm", "Are you sure you want to remove all tasks?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => {
          setTasks([]);
          saveTasks([]);
        },
      },
    ]);
  };

  const toggleTaskCompletion = (id: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const renderTaskItem = ({ item }: { item: Task }) => ( 
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => toggleTaskCompletion(item.id)}
    >
      <Text style={styles.taskText}>{item.text}</Text>
      <Text style={styles.statusText}>{item.completed ? "Completed" : "In Progress"}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To do list</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your task"
        value={taskName}
        onChangeText={setTaskName}
      />
      <Button title="Add a new todo" onPress={addTask} />
      <Button title="Remove todos" onPress={removeAllTasks} color="red" />

      <Text style={styles.subTitle}>Pending</Text>
      <FlatList
        data={tasks.filter((task) => !task.completed)}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
      />

      <Text style={styles.subTitle}>Completed</Text>
      <FlatList
        data={tasks.filter((task) => task.completed)}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  taskItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskText: {
    fontSize: 18,
    flex: 1,
  },
  statusText: {
    fontSize: 14,
  },
});
