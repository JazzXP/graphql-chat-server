const {
  ApolloServer,
  gql,
  PubSub,
} = require('apollo-server');

// The GraphQL schema
const typeDefs = gql `
  type Subscription {
    postAdded: Post
  }

  type Query {
    posts: [Post]
  }

  type Mutation {
    addPost(author: String, comment: String): Post
  }

  type Post {
    author: String
    comment: String
  }
`;

const pubsub = new PubSub();

const posts = [];
const addPost = item => {
  posts.push(item);
  return item;
};

const POST_ADDED = 'POST_ADDED';

const resolvers = {
  Subscription: {
    postAdded: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: () => pubsub.asyncIterator([POST_ADDED]),
    },
  },
  Query: {
    posts(root, args, context) {
      return posts;
    },
  },
  Mutation: {
    addPost(root, args, context) {
      pubsub.publish(POST_ADDED, {
        postAdded: args
      });
      return addPost(args);
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({
  url,
  subscriptionsUrl
}) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
});