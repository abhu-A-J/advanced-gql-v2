const {
  SchemaDirectiveVisitor,
  AuthenticationError,
} = require('apollo-server');

const { defaultFieldResolver, GraphQLString } = require('graphql');
const { formatDate } = require('./utils');

/* Format Date Directive */

class FormatDateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    // use default feild resolver if no resolveer is avaible on schema
    const resolver = field.resolve || defaultFieldResolver;

    // argument passed in the directive for formatting dates
    const { formatString: defaultFormatString } = this.args;

    field.type = GraphQLString;

    // additional put formatString as args
    field.args.push({
      type: GraphQLString,
      name: 'formatString',
    });

    field.resolve = async (root, args, ctx, info) => {
      const { formatString, ...restArgs } = args;

      const result = await resolver.call(this, root, args, ctx, info);

      return formatDate(result, formatString || defaultFormatString);
    };
  }
}

class AuthenticationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;

    field.resolve = async (root, args, ctx, info) => {
      if (!ctx.user) {
        throw new AuthenticationError('Not authenticated');
      }

      return resolver.call(this, root, args, ctx, info);
    };
  }
}

class AuthorizationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    const { role } = this.args;

    field.resolve = async (root, args, ctx, info) => {
      if (role !== ctx.user.role) {
        throw new AuthenticationError('Not authorized');
      }

      return resolver(root, args, ctx, info);
    };
  }
}

module.exports = {
  FormatDateDirective,
  AuthenticationDirective,
  AuthorizationDirective,
};
