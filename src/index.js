const { ApolloServer } = require('apollo-server');
const typeDefs = require('./typedefs');
const resolvers = require('./resolvers');
const { createToken, getUserFromToken } = require('./auth');
const db = require('./db');
const { FormatDateDirective } = require('./directives');

const server = new ApolloServer({
  typeDefs,
  resolvers,

  context({ req, connection }) {
    const context = { ...db };

    // context for subscriptions
    if (connection) {
      return { ...context, ...connection.context };
      // connection.context is whatver get's returned from onConeect method
    }

    // context for normal requests (mutations and queries)
    const token = req.headers.authorization;
    const user = getUserFromToken(token);
    return { ...context, user, createToken };
  },

  // authentication for subscription
  subscriptions: {
    onConnect(connectionParams) {
      const token = connectionParams.authToken;
      const user = getUserFromToken(token);
      if (!user) {
        throw new Error('Not authenticated');
      }

      // this runs only when it returns truthy value

      // whatever is return from here get's merged with context object
      return { user };
    },
  },

  // error logger/reporting/formatting
  formatError(err) {
    console.log(err);
    return err;
  },

  // custom directives
  schemaDirectives: {
    formatDate: FormatDateDirective,
  },
});

server.listen(4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
