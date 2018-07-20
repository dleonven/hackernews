/*
constants.js file that we use to define the key for the credentials that we’re
storing in the browser’s localStorage

Warning: Storing JWTs in localStorage is not a safe approach to implement
authentication on the frontend. Because this tutorial is focused on GraphQL, we
want to keep things simple and therefore are using it here
*/

export const AUTH_TOKEN = 'auth-token'
export const LINKS_PER_PAGE = 5
