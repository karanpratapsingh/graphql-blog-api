import { GraphQLServer } from 'graphql-yoga'
import db from './db';
import Query from './resolvers/User';
import Mutation from './resolvers/Mutation';
import User from './resolvers/User';
import Post from './resolvers/Mutation';
import Comment from './resolvers/Comment';

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers: {
        Query,
        Mutation,
        Post,
        Comment,
        User
    },
    context: { db }
})

server.start(() => {
    console.log('The server is up!')
})