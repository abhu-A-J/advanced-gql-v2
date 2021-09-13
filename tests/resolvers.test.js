const resolvers = require('../src/resolvers');

describe('Resolvers', () => {
  test('Feed', () => {
    const result = resolvers.Query.feed(null, null, {
      models: {
        Post: {
          findMany: () => ['Hello', 'Hi'],
        },
      },
    });

    expect(result).toEqual(['Hello', 'Hi']);
  });
});
