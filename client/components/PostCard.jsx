import { useMutation } from "@apollo/client";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";
import { COMMENT_POST, GET_POSTS, LIKE_POST } from "../queries";

const PostCard = ({ post, onLikePress, onCommentPress }) => {
  const [addLike] = useMutation(LIKE_POST, {
    refetchQueries: [GET_POSTS],
  });

  const [comment] = useMutation(COMMENT_POST, {
    refetchQueries: [GET_POSTS],
  });

  const like = async (postId) => {
    try {
      await addLike({ variables: { input: { postId } } });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.authorContainer}>
        <Text style={styles.authorName}>{post.Author.name}</Text>
        <Text style={styles.authorUsername}>@{post.Author.username}</Text>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.imgUrl && (
        <Image source={{ uri: post.imgUrl }} style={styles.postImage} />
      )}

      <FlatList
        data={post.tags}
        horizontal
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>#{item}</Text>
          </View>
        )}
      />

      <View style={styles.buttonsContainer}>
        <Pressable style={styles.button} onPress={() => like(post._id)}>
          <Text style={styles.buttonText}>Like ({post.likes.length})</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => onCommentPress(post._id)}
        >
          <Text style={styles.buttonText}>Comment</Text>
        </Pressable>
      </View>

      <View style={styles.commentsContainer}>
        <Text style={styles.commentsHeader}>Comments:</Text>
        {post.comments.map((comment, index) => (
          <View key={index} style={styles.comment}>
            <Text style={styles.commentUsername}>{comment.username}:</Text>
            <Text style={styles.commentContent}>{comment.content}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.timestamp}>
        Posted on: {new Date(post.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  authorName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  authorUsername: {
    marginLeft: 10,
    color: "gray",
  },
  content: {
    fontSize: 14,
    marginVertical: 10,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  tagContainer: {
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    padding: 5,
    marginRight: 5,
  },
  tagText: {
    color: "#333",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  button: {
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  commentsContainer: {
    marginTop: 10,
  },
  commentsHeader: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  comment: {
    flexDirection: "row",
    marginBottom: 5,
  },
  commentUsername: {
    fontWeight: "bold",
    marginRight: 5,
  },
  commentContent: {
    color: "#555",
  },
  timestamp: {
    marginTop: 5,
    color: "gray",
    fontSize: 12,
  },
});

export default PostCard;
