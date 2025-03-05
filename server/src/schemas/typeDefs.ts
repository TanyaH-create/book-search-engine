const typeDefs = `
type Book {
   bookId: ID!
   title: String
   authors: [String]
   description: String
   image: String
   link: String
}

type User {
    _id: ID!
    username: String!
    email: String!
    savedBooks: [Book]
    bookCount: Int
  }

  type Auth {
    token: ID!
    user: User!
  }
  
  input BookInput {
    bookId: ID!
    title: String!
    authors: [String]
    description: String!
    image: String
    link: String
  }


  type Query {
    me: User
    getUSer(id: ID, username: String): User
  }

  type Mutation {
    addUser(username: String!, email: Sting!, password: String!): Auth
    login(email: String, password: String!): Auth
    saveBook(BookInput!): User
    removeBook(bookId: ID!): User
  }
`;

export default typeDefs;
