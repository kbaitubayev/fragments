# tests/integration/post-fragments.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
`This is a fragment!`

# 1. We expect to get back an HTTP 201
HTTP/1.1 201
# We have various assertions about the response that we want to check
[Asserts]
# The Location header should look like what we expect (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
jsonpath "$.fragments.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragments.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.fragments.created" isString
jsonpath "$.fragments.updated" isString
jsonpath "$.fragments.type" == "text/plain"
# 19 is the length of our fragment data: 'This is a fragment!'
jsonpath "$.fragments.size" == 19
# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"
idCreated: jsonpath "$.fragments.id"
size: jsonpath "$.fragments.size"
type: jsonpath "$.fragments.type"


# 2. Try to GET the fragment we just posted by its URL
GET {{url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{idCreated}}
jsonpath "$.fragment.size" == {{size}}
jsonpath "$.fragment.type" == {{type}}
