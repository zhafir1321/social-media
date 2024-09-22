import { useMutation } from "@apollo/client";
import { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { ADD_POST, GET_POSTS } from "../queries";

const AddPost = ({ navigation }) => {
  const [content, setContent] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [tags, setTags] = useState("");

  const [dispatcher] = useMutation(ADD_POST, {
    onCompleted: (res) => {
      navigation.goBack();
    },
    refetchQueries: [
      {
        query: GET_POSTS,
      },
    ],
  });

  const handleSubmit = () => {
    console.log("Content:", content);
    console.log("Image URL:", imgUrl);
    console.log("Tags:", tags);

    dispatcher({
      variables: {
        input: {
          content,
          imgUrl,
          tags,
        },
      },
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter content"
        value={content}
        onChangeText={setContent}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter image URL"
        value={imgUrl}
        onChangeText={setImgUrl}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter tags (comma-separated)"
        value={tags}
        onChangeText={setTags}
      />

      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default AddPost;
