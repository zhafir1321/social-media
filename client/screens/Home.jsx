import { useMutation, useQuery } from "@apollo/client";
import { FlatList, View, Text, StyleSheet, Pressable } from "react-native";
import { GET_POSTS, LIKE_POST } from "../queries";
import { useContext } from "react";
import { LoginContext } from "../context/LoginContext";
import * as SecureStore from "expo-secure-store";
import PostCard from "../components/PostCard";

const HomePage = ({ navigation }) => {
  const { loading, error, data } = useQuery(GET_POSTS);

  const { setIsLoggedIn } = useContext(LoginContext);

  const handleLogOut = async () => {
    await SecureStore.deleteItemAsync("token");

    setIsLoggedIn(false);
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!loading && error) {
    return <Text>Error: {error.message}</Text>;
  }

  if (!loading && data) {
    console.log(JSON.stringify(data, null, 2));
  }

  const posts = data.posts;
  return (
    <View style={styles.container}>
      {/* Button Section */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("AddPost")}
        >
          <Text style={styles.buttonText}>Add Post</Text>
        </Pressable>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText} onPress={handleLogOut}>
            Logout
          </Text>
        </Pressable>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text>No posts available</Text>} // Handle empty list
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  button: {
    padding: 8,
    backgroundColor: "#fef08a",
    borderRadius: 5,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 20,
  },
  item: {
    backgroundColor: "#fef08a",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
  },
  itemTitle: {
    fontSize: 32,
    color: "#334155",
    opacity: 0.9,
  },
});

export default HomePage;
