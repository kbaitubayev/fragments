# Lab 9 # Run Hurl -> docker-compose up -d -> npm run test:integration
# 1. POST a new text fragment to http://localhost:8080 as an authorized user. The fragment's body should be the string, Hello S3!.
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
```Hello S3!```

# 2.Confirm that the server returns a 201, and capture the Location header value to a variable named url
HTTP/1.1 201
[Captures]
url: header "Location"

# 3.GET the fragment you just created using the url as an authorized user.
GET {{url}}
[BasicAuth]
user1@email.com:password1

# 4.Confirm that the server returns a 200, that the type of the fragment is text/plain, and that the body is equal to Hello S3!
HTTP/1.1 200
#Content-Type: text/plain; charset=utf-8
[Asserts]
body == "Hello S3!"

# 5.DELETE the fragment using the url as an authorized user.
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# 6.Confirm that the server returns a 200.
# ERROR: ACTUAL VALUE IS 404 NOT FOUND
HTTP/1.1 200

# 7.Try to GET the fragment again using the url as an authorized user.
GET {{url}}
[BasicAuth]
user1@email.com:password1

# 8.Confirm that the server returns a 404(Not Found), since the fragment should be deleted.
HTTP/1.1 404
