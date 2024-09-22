import { gql } from "@apollo/client";

export const DO_LOGIN = gql`
  mutation Mutation($input: UserLogin) {
    login(input: $input) {
      data {
        token
      }
      statusCode
    }
  }
`;

export const DO_REGISTER = gql`
  mutation Mutation($input: UserRegister) {
    register(input: $input) {
      statusCode
      message
    }
  }
`;

export const GET_POSTS = gql`
  query Query {
    posts {
      _id
      content
      tags
      imgUrl
      authorId
      comments {
        content
        username
        createdAt
        updatedAt
      }
      likes {
        username
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      Author {
        _id
        name
        username
        email
      }
    }
  }
`;

export const ADD_POST = gql`
  mutation Mutation($input: CreatePost) {
    addPost(input: $input) {
      _id
      content
      tags
      imgUrl
      authorId
      comments {
        content
        username
        createdAt
        updatedAt
      }
      likes {
        username
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      Author {
        _id
        name
        username
        email
      }
    }
  }
`;

export const LIKE_POST = gql`
  mutation Mutation($input: LikePost) {
    likePost(input: $input)
  }
`;

export const COMMENT_POST = gql`
  mutation CommentPost($input: CommentPost) {
    commentPost(input: $input)
  }
`;
