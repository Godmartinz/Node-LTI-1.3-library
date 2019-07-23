# LTI 1.3 Compliant Library for External Tool Integration

This Javascript-based Library allows an education provider to integrate an external Tool into their chosen Platform/Learning Management System (LMS), such as Moodle, Blackboard, Edgenuity, etc, without needing to understand the underlying Learning Tools Interoperability (LTI) standards (https://www.imsglobal.org/activity/learning-tools-interoperability). 

This Library supports the LTI 1.3 Core standards (https://www.imsglobal.org/spec/lti/v1p3).  It also provides limited support of the LTI Advantage Names and Roles Provisioning Services (https://www.imsglobal.org/spec/lti-nrps/v2p0/) and Assignment and Grade Services (https://www.imsglobal.org/spec/lti-ags/v2p0).

This Library is being updated to fully support the LTI Advantage extensions (https://www.imsglobal.org/spec/lti/v1p3/impl) for Names/Roles, and Assignments/Grades.  At this time, LTI Advantage Deep Linking (https://www.imsglobal.org/spec/lti-dl/v2p0/) is not supported.

## Overview

Follow these steps to use this Library:

1. Install Library
2. Setup Routes
3. Register Platform with Tool
4. Add Tool to Platform

Optionally, you can:

- Experiment with Example Tool
- Use the Test Suite
- View the Glossary

### 1. Install Library

To install this Library, use the Node Package Manager (NPM) and run in your terminal:

```
npm install
```

### 2. Setup Routes

In the server/server.js file, add routes to launch your Tool


### 3. Register Platform with Tool

TBD


### 4. Add Tool to Platform

TBD, give Moodle as example


---

### 5. Optional Activities

#### Example Tool

The Tool example illustrates how the Library can be utilized to drop a Tool into a Platform.  In order to run the example, start the Express server by running in your terminal:

```
npm start
```

The Tool example will run on `http://localhost:3000/` in your browser.

##### Generate Access Token

> Clicking the 'Get Token' button will:
> 
> POST a properly formatted 'application/x-www-form-urlencoded' request to /oauth2/token in the format:
> ```java
> {
>   'grant_type': 'client_credentials',
>   'client_id': <your client id, like client12345>,
>   'client_secret': <your RSA Private Key/Secret, like was generated under Testing above>
> }
> ```
> If successful, the example will display the token authorizing the Platform to have access to the Tool's API.  This token is secured as a JWT.  In this example, the Platform will be able to verify the JWT on their side with the public key.
> 
> If you want to view the JSON object that is being passed through the JWT, copy the token and paste it into the 'JWT String box' on https://www.jsonwebtoken.io/.  This will enable you to view the JSON object on the Payload.

##### Launch Example Tool

> Clicking the 'Launch Tool' button will:
> 
> [//]: # (Need to add correct route)
> 1. POST a properly formatted 'application/json' request to /project/submit in the format:
> 
> [//]: # (Need to update to exact JSON object we are expecting)
> ```java
> { 'sub': <Tool base URL>,
>   'https://purl.imsglobal.org/spec/lti/claim/deployment_id': <your deployment id>,
>   'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiResourceLinkRequest',
>   'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
>   'https://purl.imsglobal.org/spec/lti/claim/roles': 
>     [ 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student',
>       'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner' ],
>   'https://purl.imsglobal.org/spec/lti/claim/tool_platform': {
>       'url': <Tool URL to link to>,
>     },    
>   'https://purl.imsglobal.org/spec/lti/claim/resource_link': 
>     { 'id': <resource link id>,
>       'description': <Project Grading Tool>,
>       'title': <Project Submission> }
> }
> ```
> 
> 2. The Library will validate the request
> 
> 3. If a valid request was sent, it will redirect the student to the Tool.

##### Use Example Tool

> The example Tool is a Project Submission Grader.  When the Tool is launched, the student will see a form where they can enter a Github URL and a Heroku and/or Now URL.  After the student enters the URLs of their project and clicks Submit, the Tool will grade the project. 
> 
>   In order to Submit a project, URLs should be formatted similar to:
>     
>     http://www.github.com/
>               OR
>     http://www.herokuapp.com  /  http://www.now.sh
> 
> When the student clicks Submit, the student be shown their grade, unless the URLs are not properly formatted and/or the GitHub URL doesn't launch successfully.
> 
> When the student clicks Done, the Tool uses the Library to pass the grade back to the Platform.

---

#### Test Suite

The Tool example provides a test suite to verify the basic functionality of the Library.  

The tests require the use of a .env file, which if you are new to Node is a a simple configuration text file that is used to pass customized variables into your application’s environment. You can use LMS Global's Reference Implementation Tool to generate keys (https://lti-ri.imsglobal.org/keygen/index.

You will need to load the test data in your .env file for:
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

OAuth 2.0 - LTI 1.3 specifies the use of the OAuth 2.0 Client Credential Grant mechanism to secure web services between trusted systems.  This Library makes use of JSON Web Tokens, JWT, for the access tokens) (https://www.imsglobal.org/spec/security/v1p0) 

Platform - also referred to as the Tool Consumer or the Learning Management System (LMS).  Example are Moodle, Blackboard, Edgenuity, etc.

Tool - also referred to as Tool Provider, this is the external Tool that contains educational material to include in a course.  For example, a quiz, specialized course content, or customized grading module.

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