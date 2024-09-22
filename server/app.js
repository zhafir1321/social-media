require("dotenv").config();

const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { GraphQLError } = require("graphql");

const { userResolvers, userTypeDefs } = require("./schemas/user");

const { connect, getDB } = require("./config/config");
const { responseTypeDefs } = require("./schemas/response");
const { verify } = require("./helpers/jwt");
const { ObjectId } = require("mongodb");
const { postResolvers, postTypeDefs } = require("./schemas/post");
const { followTypeDefs, followResolvers } = require("./schemas/follow");

const server = new ApolloServer({
  typeDefs: [userTypeDefs, responseTypeDefs, postTypeDefs, followTypeDefs],
  resolvers: [userResolvers, postResolvers, followResolvers],
  introspection: true,
});

// IIFE
(async () => {
  // ? Connect to MongoDB
  await connect();
  const db = await getDB();

  const { url } = await startStandaloneServer(server, {
    listen: process.env.PORT,
    // context in Apollo GraphQL always a(n) async function
    context: async ({ req, res }) => {
      // We can make the global logic inside here (middleware)
      //   console.log("this console will be triggered on every request");

      // Always return an object
      return {
        // We can make the global function definition inside here
        dummyFunction: () => {
          console.log("We can read headers here", req.headers);

          // Let's make it error
          throw new GraphQLError("This is an error", {
            // This is the extension for the error (to show in the response)
            extensions: {
              // https://www.apollographql.com/docs/apollo-server/data/errors#built-in-error-codes
              // https://www.apollographql.com/docs/apollo-server/data/errors#custom-errors
              code: "INTERNAL_SERVER_ERROR",
            },
          });
        },
        authentication: async () => {
          const { authorization } = req.headers;

          if (!authorization) {
            throw new GraphQLError("You are not authenticated", {
              extensions: {
                http: "401",
                code: "UNAUTHENTICATED",
              },
            });
          }

          const token = authorization.split(" ")[1];
          if (!token) {
            throw new GraphQLError("You are not authenticated", {
              extensions: {
                http: "401",
                code: "UNAUTHENTICATED",
              },
            });
          }

          const payload = verify(token);
          const db = await getDB();
          const user = await db.collection("users").findOne({
            _id: new ObjectId(payload.id),
          });

          if (!user) {
            throw new GraphQLError("You are not authenticated", {
              extensions: {
                code: "UNAUTHENTICATED",
                http: "401",
              },
            });
          }
          return payload;
        },

        // Use db as the contextValue
        db,
      };
    },
  });

  console.log(`🚀 Server ready at ${url}`);
})();
