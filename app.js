const express = require ('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const app = express();

const events = [];

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput{
            title: String!
            description: String!
            price: Float!
            date: String!
        }
    
        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema{
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () =>{
            return events;
        },
        createEvent: args => {
            const event = {
               _id: Math.random().toString(),
               title: args.eventInput.title,
               description: args.eventInput.description,
               price: args.eventInput.price,
               date: args.eventInput.date 
            };
            events.push(event);
            return event;
        }
    },
    graphiql: true
}));

mongoose
.connect(`mongodb://${process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD
 }@main-cluster-shard-00-00-bafpf.mongodb.net:27017,
    main-cluster-shard-00-01-bafpf.mongodb.net:27017,
    main-cluster-shard-00-02-bafpf.mongodb.net:27017/${process.env.MONGO_DB}?ssl=true&replicaSet=Main-Cluster-shard-0&authSource=admin&retryWrites=true
`, { useNewUrlParser: true })
.then(() => {
    app.listen(3000);
})
.catch(err => {
console.log("Error here...");
console.log(err);
});