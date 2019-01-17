const express = require ('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Event = require('./models/event');
const bcrypt = require('bcryptjs');

const app = express();

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

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input EventInput{
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }
    
        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema{
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () =>{
            return Event.find()
            .then(events => {
                return events.map(event => {
                    return { ...event._doc, _id: event._doc._id.toString() };
                });
            }).catch(err => {
                throw err;
            });
        },
        createEvent: args => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: args.eventInput.price,
                date: new Date(args.eventInput.date) 
            });
            return event
            .save()
            .then(result => {
                console.log(result);
                return {...result._doc, _id: result._doc._id.toString()};                
            }).catch(err => {
                console.log(err);                
                throw err;
            });            
        },
        createUser: args => {
            return bcrypt.hash(args.userInput.password, 12)
              .then(hashedPassword => {
                const user = new User({
                  email: args.userInput.email,
                  password: hashedPassword
                });
                return user.save();
              })
              .then(result => {
                return { ...result._doc, _id: result.id };
              })
              .catch(err => {
                throw err;
              });      
        }
    }, 
    graphiql: true
})
);

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