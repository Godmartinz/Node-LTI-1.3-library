# LTI 1.3 Implementation of a Tool Provider

## To install:
```
npm install
```

## To run:
```
npm start
```

The app will run on http://localhost:3000/ in your browser.  

1. POST a properly formatted request to /oauth2/token

Post should be 'application/x-www-form-urlencoded' and in the format:
```
{
  'grant_type': 'client_credentials',
  'client_id': <your client id>,
  'client_secret': <your client private key/secret>
}
```
If successful, you will receive a token authorizing your access to the Tool's API as a JWT.  You can verify the JWT with your client public key.


2. POST a properly formatted request to /project/submit/:projectname

Post should be 'application/json':
```
{ sub: <Tool base URL>,
  'https://purl.imsglobal.org/spec/lti/claim/deployment_id': <your deployment id>,
  'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiResourceLinkRequest',
  'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
  'https://purl.imsglobal.org/spec/lti/claim/roles': 
    [ 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student',
      'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner',
      'http://purl.imsglobal.org/vocab/lis/v2/membership#Mentor' ],
  'https://purl.imsglobal.org/spec/lti/claim/tool_platform': {
      'url': <Tool URL to link to>,
    },    
  'https://purl.imsglobal.org/spec/lti/claim/resource_link': 
    { id: <id for resource>,
      description: <Assignment to introduce who you are>,
      title: <Introduction Assignment> }
}
```
* to launch the tool

## To run tests:
```
npm test
```
You will need to load the test data in your .env file for:
CLIENT_ID
CLIENT_SECRET
CLIENT_PUBLIC

### Contributors:
* Argenis De Los Santos
* Gian Delprado
* Godfrey Martinez
* Sherry Freitas
