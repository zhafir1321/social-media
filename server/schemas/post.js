const { ObjectId } = require("mongodb");
const {
  getPosts,
  createPost,
  commentPost,
  likePost,
  getPostById,
} = require("../models");
const redis = require("../config/redisConfig");
const { GraphQLError } = require("graphql");

const postTypeDefs = `#graphql
type Post {
    _id: ID
    content: String!
    tags: [String]
    imgUrl: String
    authorId: ID!
    comments: [Comment]
    likes: [Like]
    createdAt: String
    updatedAt: String
    Author: User
}

input CreatePost {
    content: String!
    tags: [String]
    imgUrl: String
}

input CommentPost {
    postId: ID!
    content: String!
}

input LikePost {
    postId: ID!
}

input GetPostById {
    postId: ID!
}

type Like {
    username: String
    createdAt: String
    updatedAt: String
}

type Comment {
    content: String
    username: String
    createdAt: String
    updatedAt: String
}

type Query {
    posts: [Post]
    getPostById(input: GetPostById): Post
}

type Mutation {
    addPost(input: CreatePost): Post
    commentPost(input: CommentPost): String
    likePost(input: LikePost): String
}
`;

const postResolvers = {
  Query: {
    posts: async (_, __, contextValue) => {
      await contextValue.authentication();
      const posts = await getPosts();
      return posts;
    },

    getPostById: async (_, args, contextValue) => {
      const auth = await contextValue.authentication();
      const { postId } = args.input;
      const post = await getPostById(postId);
      return post;
    },
  },

  Mutation: {
    addPost: async (_, args, contextValue) => {
      const { content, tags, imgUrl } = args.input;
      if (!content)
        throw new GraphQLError("Please input content field", {
          extensions: {
            http: {
              status: 400,
            },
          },
        });
      const payload = await contextValue.authentication();
      const { id } = payload;

      const data = {
        content,
        tags,
        imgUrl,
        authorId: new ObjectId(id),
        comments: [],
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await createPost(data);
      return result;
    },

    commentPost: async (_, args, contextValue) => {
      const commentValue = args.input;
      const payload = await contextValue.authentication();
      const result = await commentPost(commentValue, payload);
      return result;
    },

    likePost: async (_, args, contextValue) => {
      const { postId } = args.input;
      const payload = await contextValue.authentication();
      const result = await likePost(postId, payload);
      return result;
    },
  },
};

module.exports = {
  postResolvers,
  postTypeDefs,
};
