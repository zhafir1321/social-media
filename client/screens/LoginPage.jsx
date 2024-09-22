import { useContext, useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { LoginContext } from "../context/LoginContext";
import { useMutation } from "@apollo/client";
import { DO_LOGIN } from "../queries";
import * as SecureStore from "expo-secure-store";

const LoginPage = () => {
  const { setIsLoggedIn } = useContext(LoginContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [dispatcher, { data }] = useMutation(DO_LOGIN, {
    onCompleted: async (res) => {
      let token = null;
      if (res && res.login && res.login.data && res.login.data.token) {
        token = res.login.data.token;
      }

      await SecureStore.setItemAsync("token", token);

      setIsLoggedIn(true);
    },
  });

  const onLoginPress = async () => {
    await dispatcher({
      variables: {
        input: {
          username,
          password,
        },
      },
    });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sign In</Text>
      {/* // !! data is dynamic, so we cannot use console log,  */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        keyboardType="visible-password"
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={onLoginPress}>
        <Text style={styles.buttonText}>Login</Text>
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

export default LoginPage;
