const {
  ApolloServer,
  gql,
  PubSub,
  SchemaDirectiveVisitor,
} = require('apollo-server');

const { defaultFieldResolver, GraphQLString } = require('graphql');

const pubSub = new PubSub();

const NEW_ITEM = 'NEW_ITEM';

class LogDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    // we need default field resolver since we don't have a custom resolver for
    // ID field where log directive is used

    const resolver = field.resolve || defaultFieldResolver;

    field.args.push({
      type: GraphQLString,
      name: 'message',
    });

    field.resolve = (root, args, ctx, info) => {
      const { message, ...restArgs } = args;

      const { message: defaultMessage } = this.args;

      console.log(message || defaultMessage);

      return resolver.call(this, root, restArgs, ctx, info);
    };

    // all field have a resolve method which is used to resolve the value
  }
}

const typeDefs = gql`
  directive @log(message: String = "Default message") on FIELD_DEFINITION

  type User {
    id: ID! @log
    username: String!
    createdAt: String!

    # default directive called depreacted
    error: String! @deprecated(reason: "Use hasError instead")
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
      return 'Throw an error here';
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    log: LogDirective,
  },
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
