import express from "express";
import { Request, Response } from "express";
import path from "node:path";
import db from "./config/connection.js";
//import routes from './routes/index.js';

// Import the ApolloServer class
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

// Import the two parts of a GraphQL schema
import { typeDefs, resolvers } from "./schemas/index.js";
// Import authentication
import { authenticateToken } from "./utils/auth.js";

//create new instance of Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async () => {
  await server.start();
  console.log("Apollo Server started successfully");


  const PORT = process.env.PORT || 3001;
  const app = express();

  //Express middleware
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Important for MERN Setup: Any client-side requests that begin with '/graphql' will be handled by our Apollo Server
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: authenticateToken as any,
    })
  );

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));
  }

  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });

  //app.use(routes);

  db.once("open", () => {
    app.listen(PORT, () =>
      console.log(`🌍 Now listening on localhost:${PORT}`)
    );
  });

  db.on("error", console.error.bind(console, "MongoDB connection error:"));

  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

// Call the async function to start the server
startApolloServer();
