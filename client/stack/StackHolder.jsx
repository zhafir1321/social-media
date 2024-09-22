import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useContext } from "react";
import { LoginContext } from "../context/LoginContext";
import { NavigationContainer } from "@react-navigation/native";
import LoginPage from "../screens/LoginPage";
import RegisterPage from "../screens/RegisterPage";
import HomePage from "../screens/Home";
import AddPost from "../screens/AddPost";

const Tab = createBottomTabNavigator();

const StackHolder = () => {
  const { isLoggedIn } = useContext(LoginContext);
  return (
    <NavigationContainer>
      <Tab.Navigator>
        {isLoggedIn ? (
          <>
            <Tab.Screen name="Home" component={HomePage} />
            <Tab.Screen name="AddPost" component={AddPost} />
            {/* <Tab.Screen name="Profile" /> */}
          </>
        ) : (
          <>
            <Tab.Screen name="Login" component={LoginPage} />
            <Tab.Screen name="Register" component={RegisterPage} />
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default StackHolder;
