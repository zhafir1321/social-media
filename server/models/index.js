const { compare } = require("../helpers/bcrypt");
const { getDB } = require("../config/config");
const { GraphQLError } = require("graphql");
const { signToken } = require("../helpers/jwt");
const { ObjectId } = require("mongodb");
const redis = require("../config/redisConfig");

// ======================= USER ==========================

const getUsers = async () => {
  const db = await getDB();

  const agg = [
    {
      $lookup: {
        from: "follows",
        localField: "_id",
        foreignField: "followingId",
        as: "followings",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "followings.followerId",
        foreignField: "_id",
        as: "followings",
      },
    },
    {
      $project: {
        password: 0,
        "followings.password": 0,
      },
    },
    {
      $lookup: {
        from: "follows",
        localField: "_id",
        foreignField: "followerId",
        as: "followers",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "followers.followingId",
        foreignField: "_id",
        as: "followers",
      },
    },
    {
      $project: {
        "followers.password": 0,
      },
    },
  ];

  const users = await db.collection("users").aggregate(agg).toArray();
  return users;
};
const registerUser = async (newUser) => {
  const db = await getDB();

  const { username, email, name, password } = newUser;

  if (!name)
    throw new GraphQLError("Name is required", {
      extensions: {
        http: {
          status: 401,
        },
      },
    });

  if (!username)
    throw new GraphQLError("Username is required", {
      extensions: {
        http: {
          status: 401,
        },
      },
    });

  if (!email)
    throw new GraphQLError("Email is required", {
      extensions: {
        http: {
          status: 401,
        },
      },
    });

  if (!password)
    throw new GraphQLError("Password is required", {
      extensions: {
        http: {
          status: 401,
        },
      },
    });

  const userUsername = await db.collection("users").findOne({ username });

  const userEmail = await db.collection("users").findOne({ email });

  if (userUsername)
    throw new GraphQLError("Username already taken", {
      extensions: {
        http: {
          status: 403,
        },
      },
    });

  if (userEmail)
    throw new GraphQLError("Email already taken", {
      extensions: {
        http: {
          status: 403,
        },
      },
    });

  if (email) {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!regex.test(email))
      throw new GraphQLError("Invalid email format", {
        extensions: {
          http: {
            status: 403,
          },
        },
      });
  }

  await db.collection("users").insertOne(newUser);

  const registeredUser = await db
    .collection("users")
    .findOne({ username }, { projection: { password: 0 } });

  return registeredUser;
};

const loginUser = async (loginUser) => {
  const db = await getDB();
  const { username, password } = loginUser;
  const user = await db.collection("users").findOne({ username });

  if (!user) {
    throw new GraphQLError("Invalid username or password", {
      extensions: {
        http: {
          status: 401,
        },
      },
    });
  }

  if (!compare(password, user.password)) {
    throw new GraphQLError("Invalid username or password", {
      extensions: {
        http: {
          status: 401,
        },
      },
    });
  }

  const payload = {
    id: user._id,
    username: user.username,
  };

  const token = signToken(payload);
  return token;
};

const searchUserById = async (userId) => {
  const db = await getDB();

  const agg = [
    {
      $match: {
        _id: new ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "follows",
        localField: "_id",
        foreignField: "followingId",
        as: "followings",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "followings.followerId",
        foreignField: "_id",
        as: "followings",
      },
    },
    {
      $project: {
        password: 0,
        "followings.password": 0,
      },
    },
    {
      $lookup: {
        from: "follows",
        localField: "_id",
        foreignField: "followerId",
        as: "followers",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "followers.followingId",
        foreignField: "_id",
        as: "followers",
      },
    },
    {
      $project: {
        "followers.password": 0,
      },
    },
  ];
  const user = await db.collection("users").aggregate(agg).toArray();
  return user[0];
};

const searchUserByUsername = async (username) => {
  const db = await getDB();

  const agg = [
    {
      $match: {
        username: {
          $regex: username,
          $options: "i",
        },
      },
    },
    {
      $lookup: {
        from: "follows",
        localField: "_id",
        foreignField: "followingId",
        as: "followings",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "followings.followerId",
        foreignField: "_id",
        as: "followings",
      },
    },
    {
      $project: {
        password: 0,
        "followings.password": 0,
      },
    },
    {
      $lookup: {
        from: "follows",
        localField: "_id",
        foreignField: "followerId",
        as: "followers",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "followers.followingId",
        foreignField: "_id",
        as: "followers",
      },
    },
    {
      $project: {
        "followers.password": 0,
      },
    },
  ];

  const users = await db.collection("users").aggregate(agg).toArray();

  return users;
};

// =================== END OF USER =======================

// =============================== POST ==============================

const getPosts = async () => {
  const db = await getDB();

  const postsCache = await redis.get("posts");

  if (postsCache) {
    return JSON.parse(postsCache);
  }

  const agg = [
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "Author",
      },
    },
    { $project: { "Author.password": 0 } },
    { $sort: { createdAt: -1 } },
    {
      $unwind: {
        path: "$Author",
      },
    },
  ];
  const posts = await db.collection("posts").aggregate(agg).toArray();

  if (!posts)
    throw new GraphQLError("Post not found", {
      extensions: {
        http: {
          status: 404,
        },
      },
    });
  redis.set("posts", JSON.stringify(posts));
  return posts;
};

const getPostById = async (postId) => {
  const db = await getDB();
  const agg = [
    {
      $match: {
        _id: new ObjectId(postId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "Author",
      },
    },
    { $project: { "Author.password": 0 } },
    { $sort: { createdAt: -1 } },
    {
      $unwind: {
        path: "$Author",
      },
    },
  ];

  const post = await db.collection("posts").aggregate(agg).toArray();
  return post[0];
};

const createPost = async (data) => {
  const db = await getDB();

  const result = await db.collection("posts").insertOne(data);

  if (!result)
    throw new GraphQLError("Post not found", {
      extensions: {
        http: {
          status: 404,
        },
      },
    });

  const post = await db.collection("posts").findOne({ _id: result.insertedId });

  if (!post)
    throw new GraphQLError("Post not found", {
      extensions: {
        http: {
          status: 404,
        },
      },
    });
  redis.del("posts");
  return post;
};

const commentPost = async (comment, payload) => {
  const { postId, content } = comment;
  const { id, username } = payload;
  const db = await getDB();
  const post = await db
    .collection("posts")
    .findOne({ _id: new ObjectId(postId) });

  if (!post)
    throw new GraphQLError("Post not found", {
      extensions: {
        http: {
          status: 404,
        },
      },
    });

  await db.collection("posts").updateOne(
    { _id: new ObjectId(postId) },
    {
      $push: {
        comments: {
          content,
          username,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
  );
  redis.del("posts");
  return "Comment success";
};

const likePost = async (postId, payload) => {
  const { id, username } = payload;
  const db = await getDB();
  const post = await db
    .collection("posts")
    .findOne({ _id: new ObjectId(postId) });

  if (!post)
    throw new GraphQLError("Post not found", {
      extensions: {
        http: {
          status: 404,
        },
      },
    });
  await db.collection("posts").updateOne(
    { _id: new ObjectId(postId) },
    {
      $push: {
        likes: {
          username,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
  );
  redis.del("posts");
  return "Like success";
};

// ================================== END OF POST =================================================

// ================================== FOLLOW =================================================

const addFollow = async (followerId, payload) => {
  const { id, username } = payload;
  const db = await getDB();
  const user = await db.collection("users").findOne({ _id: new ObjectId(id) });

  if (followerId === id)
    throw new GraphQLError("Cannot follow yourself", {
      extensions: {
        http: {
          status: 400,
        },
      },
    });

  if (!user)
    throw new GraphQLError("User not found", {
      extensions: {
        http: {
          status: 404,
        },
      },
    });

  const existsFollow = await db.collection("follows").findOne({
    followerId: new ObjectId(followerId),
    followingId: new ObjectId(id),
  });

  if (existsFollow)
    throw new GraphQLError("Already Followed", {
      extensions: {
        http: {
          status: 400,
        },
      },
    });

  const follow = await db.collection("follows").insertOne({
    followingId: new ObjectId(id),
    followerId: new ObjectId(followerId),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const result = await db.collection("follows").findOne({
    _id: follow.insertedId,
  });

  return result;
};

module.exports = {
  registerUser,
  loginUser,
  searchUserByUsername,
  getPosts,
  createPost,
  commentPost,
  likePost,
  getPostById,
  addFollow,
  getUsers,
  searchUserById,
};
