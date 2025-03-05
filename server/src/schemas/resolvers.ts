import { GraphQLError } from 'graphql';
import User from '../models/User.js';
import { signToken } from '../utils/auth.js';
import { Request } from 'express';

const resolvers = {
    Query: {
      me: async (_parent: any, _args: any, context: { req: Request }) => {
        if (!context.req.user) {
          throw new GraphQLError('You must be logged in to perform this action', {
            extensions: {
              code: 'UNAUTHENTICATED',
            },
          });
        }
        
        return await User.findById(context.req.user._id);
      },
  
      getSingleUser: async (_parent: any, { id, username }: { id?: string, username?: string }) => {
        const foundUser = await User.findOne({
          $or: [
            { _id: id },
            { username: username },
          ],
        });
  
        if (!foundUser) {
          throw new GraphQLError('Cannot find a user with this id or username!', {
            extensions: {
              code: 'NOT_FOUND',
            },
          });
        }
  
        return foundUser;
      },
    },
  
    Mutation: {
      addUser: async (_parent: any, { username, email, password }: { username: string, email: string, password: string }) => {
        try {
          const user = await User.create({ username, email, password });
          const token = signToken(user.username, user.password, user._id);
          return { token, user };
        } catch (err) {
          throw new GraphQLError('Something went wrong creating the user!', {
            extensions: {
              code: 'BAD_USER_INPUT',
              err,
            },
          });
        }
      },
  
      login: async (_parent: any, { email, password }: {  email?: string, password: string }) => {
        const user = await User.findOne({
          $or: [
            { username: username },
            { email: email },
          ],
        });
  
        if (!user) {
          throw new GraphQLError('Cannot find this user', {
            extensions: {
              code: 'NOT_FOUND',
            },
          });
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new GraphQLError('Wrong password!', {
            extensions: {
              code: 'UNAUTHORIZED',
            },
          });
        }
  
        const token = signToken(user.username, user.password, user._id);
        return { token, user };
      },
  
      saveBook: async (_parent: any, { bookData }: { bookData: any }, context: { req: Request }) => {
        if (!context.req.user) {
          throw new GraphQLError('You must be logged in to save a book', {
            extensions: {
              code: 'UNAUTHENTICATED',
            },
          });
        }
  
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.req.user._id },
            { $addToSet: { savedBooks: bookData } },
            { new: true, runValidators: true }
          );
  
          return updatedUser;
        } catch (err) {
          throw new GraphQLError('Could not save book', {
            extensions: {
              code: 'BAD_USER_INPUT',
              err,
            },
          });
        }
      },
  
      removeBook: async (_parent: any, { bookId }: { bookId: string }, context: { req: Request }) => {
        if (!context.req.user) {
          throw new GraphQLError('You must be logged in to delete a book', {
            extensions: {
              code: 'UNAUTHENTICATED',
            },
          });
        }
  
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.req.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
  
        if (!updatedUser) {
          throw new GraphQLError('Could not find user with this id!', {
            extensions: {
              code: 'NOT_FOUND',
            },
          });
        }
  
        return updatedUser;
      },
    },
  };
  
  export default resolvers;


