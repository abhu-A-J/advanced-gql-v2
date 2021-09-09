const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    createdAt: String
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

  type Mutations {
    settings(input: NewSettingsInput): Settings!
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
  Mutations: {
    settings(_, { input }) {
      return input;
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
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen(3000).then(() => {
  console.log('Running in http://localhost:3000');
});
