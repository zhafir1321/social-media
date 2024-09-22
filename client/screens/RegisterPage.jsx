import { useMutation } from "@apollo/client";
import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { DO_REGISTER } from "../queries";

const RegisterPage = ({ navigation }) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [dispatcher, { data }] = useMutation(DO_REGISTER, {
    onCompleted: async (res) => {
      navigation.goBack();
    },
  });

  const onRegisterPress = () => {
    dispatcher({
      variables: {
        input: {
          email: email.toLowerCase(),
          name: name.toLowerCase(),
          username: username.toLowerCase(),
          password: password.toLowerCase(),
        },
      },
    });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Join LinkedIn</Text>
      {/* // !! data is dynamic, so we cannot use console log,  */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        keyboardType="visible-password"
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={onRegisterPress}>
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 32,
    marginBottom: 12,
  },
  text1: {
    marginBottom: 15,
  },
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fffbeb",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 48,
    marginBottom: 8,
    borderWidth: 1,
    padding: 10,
    width: "75%",
    fontSize: 24,
    borderRadius: 5,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10,
    width: "25%",
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 24,
  },
});

export default RegisterPage;
