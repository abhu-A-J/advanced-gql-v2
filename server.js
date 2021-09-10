const { ApolloServer, gql, PubSub } = require('apollo-server');

const pubSub = new PubSub();

const NEW_ITEM = 'NEW_ITEM';

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    createdAt: String!
    error: String!
  }

  type Settings {
    user: User!
    theme: String!
  }

  type Query {
    me: User!
    settings(user: ID!): Settings!
  }

  input NewSettingsInput {
    user: ID!
    theme: String!
  }

  type Item {
    task: String!
  }

  type Mutation {
    settings(input: NewSettingsInput): Settings!
    createItem(input: String!): Item!
  }

  type Subscription {
    newItem: Item!
  }
`;

const resolvers = {
  Query: {
    me() {
      return {
        id: '121212',
        username: 'abhu',
        createdAt: Date.now(),
      };
    },

    settings(_, { user }) {
      return {
        user: {
          id: '121212',
          username: 'abhu',
          createdAt: Date.now(),
        },
        theme: 'DARK',
      };
    },
  },

  Mutation: {
    settings(_, { input }) {
      return input;
    },

    createItem(_, { input }) {
      const item = { task: input };

      pubSub.publish(NEW_ITEM, { newItem: item });

      return item;
    },
  },

  Subscription: {
    newItem: {
      subscribe: () => {
        return pubSub.asyncIterator(NEW_ITEM);
      },
    },
  },

  Settings: {
    user(settings) {
      return {
        id: '121212',
        username: 'abhu',
        createdAt: Date.now(),
      };
    },
  },

  User: {
    error() {
      throw new Error('noooo');
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context({ connection }) {
    if (connection) {
      return {
        ...connection.context,
      };
    }
  },
  subscriptions: {
    onConnect(params) {
      // params is similar to req.header
    },
  },
});

server.listen(3000).then(() => {
  console.log('Running in http://localhost:3000');
});
