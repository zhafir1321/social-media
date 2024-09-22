const { addFollow } = require("../models");

const followTypeDefs = `#graphql

type Follow {
    _id: ID
    followingId: ID
    followerId: ID
    createdAt: String
    updatedAt: String
}

input AddFollow {
    followerId: ID!
}

type Mutation {
    addFollow(input: AddFollow): Follow
}
`;

const followResolvers = {
  Mutation: {
    addFollow: async (_, args, contextValue) => {
      const { followerId } = args.input;
      const payload = await contextValue.authentication();
      const result = await addFollow(followerId, payload);
      return result;
    },
  },
};

module.exports = {
  followResolvers,
  followTypeDefs,
};
