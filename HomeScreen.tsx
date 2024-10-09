import React, { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, View, Alert, TouchableOpacity } from "react-native";
import * as SecureStore from "expo-secure-store";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TASKS_STORAGE_KEY = "tasks";

const HomeScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();

    if (route.params?.newTask) {
      setTasks((prevTasks) => [...prevTasks, route.params.newTask]);
    }
  }, [route.params]); 

  const loadTasks = async () => {
    try {
      const storedTasks = await SecureStore.getItemAsync(TASKS_STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        console.log("Chargement des tâches:", parsedTasks); 
        setTasks(parsedTasks);
      } else {
        console.log("Aucune tâche trouvée dans le stockage."); 
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

  const updateTaskStatus = (id: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    console.log("Rendu de la tâche:", item); 
    return (
      <TouchableOpacity
        style={styles.taskItem}
        onPress={() => updateTaskStatus(item.id)}
      >
        <Text style={styles.taskText}>{item.text}</Text>
        <Text style={styles.statusText}>{item.completed ? "Completed" : "In Progress"}</Text>
      </TouchableOpacity>
    );
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To do list</Text>
      <Button title="Add a new todo" onPress={() => navigation.navigate("AddTask")} />
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
    </View>
  );
};

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

export default HomeScreen;