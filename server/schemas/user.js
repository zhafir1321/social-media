const { GraphQLError } = require("graphql");
const { hash } = require("../helpers/bcrypt");
const {
  registerUser,
  loginUser,
  searchUserByUsername,
  getUsers,
  searchUserById,
} = require("../models");

const userTypeDefs = `#graphql

type User {
    _id: ID
    name: String
    username: String
    email: String
    password: String
    followers: [User]
    followings: [User]
}

type UserMongoDb {
  name: String
    username: String
    email: String
    password: String
}

input UserRegister {
    name: String!
    username: String!
    email: String!
    password: String!
}

input UserLogin {
  username: String!
  password: String!
}

input UserById {
  userId: ID!
}

type Query {
    users: [User]
    searchUserById(input: UserById): User
    searchUserByUsername(username: String): [User]
}

type Mutation {
    register(input: UserRegister): UserResponse
    login(input: UserLogin): UserLoginResponse
}
`;

const userResolvers = {
  Query: {
    users: async (_, __, contextValue) => {
      const auth = await contextValue.authentication();
      const users = await getUsers();

      return users;
    },
    searchUserById: async (_, args) => {
      const { userId } = args.input;
      const user = await searchUserById(userId);
      return user;
    },
    searchUserByUsername: async (_, args) => {
      const { username } = args;

      const users = await searchUserByUsername(username);

      return users;
    },
  },
  Mutation: {
    login: async (_, args) => {
      const { username, password } = args.input;

      const loginInfo = {
        username,
        password,
      };

      const token = await loginUser(loginInfo);
      return {
        statusCode: 200,
        data: {
          token,
        },
      };
    },
    register: async (_, args) => {
      const { name, username, email, password } = args.input;

      if (password.length < 5)
        throw new GraphQLError("Password is too short", {
          extensions: {
            http: {
              status: 401,
            },
          },
        });

      const newUser = { name, username, email, password: hash(password) };

      const registeredUser = await registerUser(newUser);

      return {
        statusCode: "201",
        message: "Success",
        data: registeredUser,
      };
    },
  },
};

module.exports = {
  userResolvers,
  userTypeDefs,
};
