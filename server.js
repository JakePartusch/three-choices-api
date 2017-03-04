'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
const config = require('./config.js');
const _ = require('lodash');
const mongojs = require('mongojs');
const Boom = require('boom');

server.app.db = mongojs('three_choices');

server.connection({
    host: config.host,
    port: 8000
});

server.route({
    method: 'GET',
    path:'/restaurants/choices',
    handler: function (request, reply) {
        server.app.db.restaurants.find((err, restaurants) => {
            let randomizedRestaurants = _.shuffle(restaurants);
            return reply(randomizedRestaurants.slice(0, 3));
        });
    }
});

server.route({
    method: 'DELETE',
    path:'/restaurants/{id}',
    handler: function (request, reply) {
        server.app.db.restaurants.remove({
            "_id": server.app.db.ObjectId(request.params.id)
        }, (err, result) => {
            if(err) {
                return reply(err);
            }
            if (result.n === 0) {
                return reply(Boom.notFound());
            }
            return reply().code(204);
        });
    }
});

server.route({
    method: 'POST',
    path:'/restaurants',
    handler: function (request, reply) {
        let restaurant = request.payload;
        server.app.db.restaurants.save(restaurant, (err, result) => {
            if (err) {
                return reply(Boom.wrap(err, 'Internal MongoDB error'));
            }

            reply(result);
        });
    }
});


server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
