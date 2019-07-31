# LTI 1.3 Compliant Library for External Tool Integration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This Javascript-based Library allows an education provider to integrate web-based external Tools into their chosen learning Platform, such as Moodle, Blackboard, Edgenuity, etc, without needing to understand the underlying Learning Tools Interoperability (LTI) standards (https://www.imsglobal.org/activity/learning-tools-interoperability). 

This Library supports the LTI 1.3 Core standards (https://www.imsglobal.org/spec/lti/v1p3), which implements up-to-date privacy and security standards.  It also provides limited support the Assignment and Grade Services (https://www.imsglobal.org/spec/lti-ags/v2p0).

In the future, this Library will be updated to fully support the LTI Advantage extensions (https://www.imsglobal.org/spec/lti/v1p3/impl) for Assignments/Grades.  At this time, LTI Advantage Names and Roles Provisioning Services (https://www.imsglobal.org/spec/lti-nrps/v2p0/) and Deep Linking (https://www.imsglobal.org/spec/lti-dl/v2p0/) is not supported.

## Overview

Follow these steps to implement this Library:

0. Develop a Tool
1. Install Library
2. Setup MongoDB
3. Setup Server and Routes
4. Add Tool to Platform
5. Register Platform with Tool
6. Run your Server

Optionally, you can:

- View the OIDC Tool Launch Flow
- Use the Test Suite
- View the Glossary

### 0. Develop a Tool

It is assumed if you are interested in integrating a Tool into a Platform that you have already developed a working Tool.  If not, Step 0 is to develop your Tool that will be dropped into a learning Platform.  If you are not at that point yet, you can use the Example Tool related to this Library.

### 1. Install Library

To install this Library, use the Node Package Manager (NPM) and run in your terminal:

```
npm install node-lti-v1p3
```

### 2. Setup MongoDB

This library requires MongoDB.  If you do not currently have MongoDB setup, follow these instructions.

< TODO:  add instructions for installing MongoDB for new users >

Once you have MongoDB setup and have a server, you need to add the following to your server.js file:
```
mongoose.connect('mongodb://localhost:27017/TESTLTI', {
  useNewUrlParser: true},
  (err) => {
    if(err) {
      return console.log(err);
    }
  }
);
mongoose.Promise = Promise;
```

### 3. Setup Server and Routes

This library requires the use of an Express server.  Setup a basic Express server, add middleware, and routes within your server.js file to launch your Tool:

*Middleware to store session information*
```
app.use(session({
  name: 'lti_v1p3_library',
  secret: 'iualcoelknasfnk',
  saveUninitialized: true,
  resave: true,
  secure: true,
  ephemeral: true,
  httpOnly: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
````

*Route to Handle OIDC Login Requests*
```
app.post('/oidc', (req, res) => {
  create_oidc_response(req, res);
});
```

*Route to Handle Tool Launches, must provide 'route to add to Base URL' if needed*
```
app.post('/project/submit', (req, res) => {
    launchTool(req, res, < route to add to Base URL, if any >);
});
```

*Send score back to Platform - add to your Tool wherever grade is finalized*
```
  send_score(< student's score >, req.session.decoded_launch)
```

*Route to return from Tool to Platform*
```
app.post('/project/return', (req, res) => {
  res.redirect(req.session.decoded_launch["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"].return_url);
  req.session.destroy();
});
```

### 4. Add Tool to Platform

Within the Platform, the Site Administrator needs to setup the External Tool.  For example, in Moodle s/he goes to Site Administration->Plugins->External Tool->Manage Tools.  At a minimum, the following fields should be setup:

- Tool's Name
- Tool's Base URL <Tool Base URL>
- Tool's Description, if desired
- Mark the tool as a 'LTI1.3' Tool
- Tool's Public Key -- you will need to come back and add this in a moment, see below about generating a Public/Private key pair
- Initiate Login URL - <Tool Base URL> + '/oidc'
- Redirection URIs - all of the endpoints that may be use, for example <Tool Base URL>/project/submit
- Enable Assignment and Grade Services, if Tool should send grades to Platform
- Enable Names and Role Provisioning Services, if Tool should be able to access user information from Platform
- Enable sharing of launcher's name, if Tool should have ability to display this information
- Choose 'Always' Accept grades from the Tool, if Tool should send grades to Platform  

After saving the External Tool, the Platform should assign a Client ID to the Tool and provide endpoints.  Make note of all of this information as it will be used in Step 4.  

### 5. Register Platform with Tool

In order register a Platform with the Tool, add a call to `registerPlatform` in your server file, with the values you received from Step 3.
```
registerPlatform(
  consumerUrl, /* Base url of the Platform. */
  consumerName, /* Domain name of the Platform. */
  consumerToolClientID, /* Client ID of the Tool, created from the Platform. */
  consumerAuthorizationURL, /* URL that the Tool sends OIDC Launch Responses to. */
  consumerAccessTokenURL, /* URL that the Tool can use to obtain an access token/login. */
  consumerAuthorizationconfig, /* Authentication method and key for verifying messages from the Platform. */
);
```
For example:
```
registerPlatform(
  'https://demo.moodle.net',  
  'Moodles demo',
  'BMe642xnf4ag3Pd',
  'https://demo.moodle.net/mod/lti/auth.php',
  'https://demo.moodle.net/mod/lti/token.php', 
  { method: 'JWK_SET', key: 'https://demo.moodle.net/mod/lti/certs.php' }
);
```

### 6. Run your Server

Once the Tool is integrated with the Platform, your server must be up and running so that the Tool can be accessed. In a development environment, start your server in a terminal:
```
npm start
```
You need to access the generated Client Public key by making a GET request to `<your base URL>/publickey` (TODO:  verify endpoint when implemented).  This key must be put into the Tool's Public Key field in Step 4 above on the Platform.

---

### 7. Optional Activities

#### View the OIDC Tool Launch Flow

The Tool example illustrates how the Library can be utilized to drop a Tool into a Platform.  In order to run the example, start the Express server by running in your terminal:

```
npm start
```

The Tool example will run on `http://localhost:3000/` in your browser.  The example walks through what occurs behind-the-scenes during an LTI1.3 Tool launch.  It is important to understand that the Platform users (students, teachers) do not see any of this flow, this all occurs behind the scenes.  Also, the Tool on this page is just an example, see the next section for how you can implement the Example Tool in a running Platform.

##### View Behind the Scenes Launch Flow

> 1. Clicking the 'Initiate Tool from LMS' button will generate a properly formatted OIDC Login Request that a Platform would create:
> ```java
> { iss: 'https://demo.moodle.net',
>   target_link_uri: 'https://piedpiper.localtunnel.me',
>   login_hint: '9',
>   lti_message_hint: '377' }
> ```
> 2. The Library validates the request and constructs a properly formatted OIDC Login Response.  This response is sent to  the Platform's OIDC Authorization endpoint that was received during Registration.  
> 
> ```java
> { 'scope': 'openid', 
>   'response_type': 'id_token', 
>   'client_id': 'SDF7ASDLSFDS9', 
>   'redirect_uri': 'https://piedpiper.localtunnel.me', 
>   'login_hint': '9', 
>   'state': 'vSSRdELr5noUNazBuYmlpYywYBeDlF', 
>   'response_mode': 'form_post', 
>   'nonce': 'oNa1yWsS8erQA2iYqYzEi4pbP', 
>   'prompt': 'none', 
>   'lti_message_hint': '377' }
> 
> 3. The Platform will validate the login response and initiate the Tool launch by sending a JWT, which the Library decodes to an object like:
> 
> ```java
> { nonce: 'oNa1yWsS8erQA2iYqYzEi4pbP',
>   iat: 1564506231,
>   exp: 1564506291,
>   iss: 'https://demo.moodle.net',
>   aud: 'uuYLGWBmhhuZvBf',
>   'https://purl.imsglobal.org/spec/lti/claim/deployment_id': '2',
>   'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': 'https://piedpiper.localtunnel.me/',
>   sub: '9',
>   'https://purl.imsglobal.org/spec/lti/claim/roles':
>    [ 'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner' ],
>   'https://purl.imsglobal.org/spec/lti/claim/context':
>    { id: '47',
>      label: 'AGILE200',
>      title: 'Internship',
>      type: [ 'CourseSection' ] },
>   'https://purl.imsglobal.org/spec/lti/claim/resource_link': { title: 'Test LTI for Team Pied Piper', id: '4' },
>   given_name: 'John',
>   family_name: 'Smith',
>   name: 'John Smith',
>   'https://purl.imsglobal.org/spec/lti/claim/ext':
>    { user_username: 'john.smith@gmail.com', lms: 'moodle-2' },
>   email: 'john.smith@gmail.com',
>   'https://purl.imsglobal.org/spec/lti/claim/launch_presentation':
>    { locale: 'en',
>      document_target: 'window',
>      return_url:
>       'https://demo.moodle.net/mod/lti/return.php?course=47&launch_container=4&instanceid=4&sesskey=xcsU4krTwV' },
>   'https://purl.imsglobal.org/spec/lti/claim/tool_platform':
>    { family_code: 'moodle',
>      version: '2019052000.01',
>      guid: 'demo.moodle.net',
>      name: 'Moodle Demo',
>      description: 'Moodle Demo Sandbox' },
>   'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
>   'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiResourceLinkRequest',
>   'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint':
>    { scope:
>       [ 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly',
>         'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
>         'https://purl.imsglobal.org/spec/lti-ags/scope/score' ],
>      lineitems:
>       'https://demo.moodle.net/mod/lti/services.php/47/lineitems?type_id=2',
>      lineitem:
>       'https://demo.moodle.net/mod/lti/services.php/47/lineitems/109/lineitem?type_id=2' },
>   'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice':
>    { context_memberships_url:
>       'https://demo.moodle.net/mod/lti/services.php/CourseSection/47/bindings/2/memberships',
>      service_versions: [ '1.0', '2.0' ] } }
> ```
> 
> 4. If a valid request was sent, it will redirect the student to the Tool.  Note:  The Tool is not operational in this demo.

##### Generate Access Token

> Clicking the 'Get Token' button will display a JSON Web Token that the Library is able to create:
> 
> ```java
> {
>   sub: <your Tool's Client ID>,
>   expires_in: 3600,             // 1 hour per LTI1.3 spec
>   token_type: 'bearer',
>   scope: <valid scope being requested>
> }
> ```
> If successful, the example will display the token authorizing the Tool to have access to the Platform's API.  This token is secured as a JWT, so the Platform will be able to verify the JWT on their side with the public key.
> 
> If you want to view the JSON object that is being passed through the JWT, copy the token and paste it into the 'JWT String box' on https://www.jsonwebtoken.io/.  This will enable you to view the JSON object on the Payload.

##### Use Example Tool

> Now that you understand the flow of messages, the example Tool can be dropped into a Platform so that you can experience the Library's usage in a live environment.  For example, you can use the setup instructions above to Register the Tool with the Platform and vice/versa within Moodle's sandbox.  
> 
> The example Tool is a Project Submission Grader.  When the Tool is launched, the student will see a form where they can enter a Github URL and a Heroku and/or Now URL.  After the student enters the URLs of their project and clicks Submit, the Tool will grade the project. 
> 
>   In order to Submit a project, URLs should be formatted similar to:
>     
>     http://www.github.com/
>               OR
>     http://www.herokuapp.com  or  http://www.now.sh
> 
> If the URLs are not properly formatted and/or the GitHub URL doesn't launch successfully, the student will see an error message.  With a valid project, when the student clicks Submit, s/he will be shown the resulting grade and the Tool uses the Library to pass the grade back to the Platform.
> 
> Finally, when the student clicks Done, the student is returned to the Platform.  The Teacher or Administrator on the Platform should be able to see that a grade has been used for test student for the example Tool.


---

#### Test Suite

The Tool example provides a test suite to verify portions of the basic functionality of the Library.  

The tests require the use of a .env file, which if you are new to Node, is a a simple configuration text file that is used to pass customized variables into your application’s environment. 

You will need to load the test data in your .env file for the follwoing.  You can use LMS Global's Reference Implementation Tool to generate keys (https://lti-ri.imsglobal.org/keygen/index).
* CLIENT_ID=client12345
* CLIENT_SECRET=<RSA Private Key>
* CLIENT_PUBLIC=<Public Key>

Make sure that your .env file is listed in your .gitignore if you are using live key pairs.

To launch the automated tests for this Library, run in your terminal:

```
npm test
```

---

#### Glossary

JWT - JSON Web Tokens (JWTs) are an open, industry standard that supports securely transmitting information between parties as a JSON object.  Signed tokens can verify the integrity of the claims contained within it.  (https://openid.net/specs/draft-jones-json-web-token-07.html).  

LTI - The IMS Learning Tools Interoperability specification allows Platforms to integrate external Tools and content in a standard way. LTI v1.3 and the LTI Advantage set of services incorporate a new model for secure message and service authentication with OAuth 2.0. (https://www.imsglobal.org/activity/learning-tools-interoperability)

LMS - Learning Management System.  Referred to as Platforms in this document.

OAuth 2.0 - LTI 1.3 specifies the use of the OAuth 2.0 Client Credential Grant mechanism to secure web services between trusted systems.  This Library makes use of JSON Web Tokens, JWT, for the access tokens. (https://www.imsglobal.org/spec/security/v1p0) 

Platform - previously referred to as the Tool Consumer is the Learning Management System (LMS) that the educational provider is using.  Examples are Moodle, Blackboard, Edgenuity, Canvas, Schoology, etc.

Tool - previously referred to as the Tool Provider, this is the external Tool that contains educational material to include in a course.  Tools can range from a single piece of content, for example a quiz, to an extensive interactive website featuring specialized course content.

---

#### Contributors
* Argenis De Los Santos
* Gian Delprado
* Godfrey Martinez
* Michael Roberts
* Sherry Freitas

---

#### Keywords

LTI LMS Tool LTIv1.3 Node/Express Javascript