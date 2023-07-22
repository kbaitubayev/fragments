# Test that you get back an HTTP 404 response if you request a route that doesn't exist
GET http://localhost:8080/no-such-route

HTTP/1.1 404
