const Joi = require("@hapi/joi");
const jwt = require('jsonwebtoken');

/*
 * Validate LTI 1.3 Launch Request
 * @param req - HTTP request to validate
 * @returns an array, which if empty indicates 0 errors, otherwise, contains description of each error
 * 
 * this validates all the the required fields as per LTI 1.3 standards in conjunction with the OAuth_validation before launch.
 * 
 * launchTool() should be called inside the route block that the project will be submitted.
 */
function valid_launch_request(req) {
  let body = req.body;
  let errors = [];

  // Per the LTI1.3 spec, the following are the minimum valid roles
  const VALID_ROLES = [
    "http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator",
    "http://purl.imsglobal.org/vocab/lis/v2/system/person#None",
    "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator",
    "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Faculty",
    "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Guest",
    "http://purl.imsglobal.org/vocab/lis/v2/institution/person#None",
    "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Other",
    "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Staff",
    "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student",
    "http://purl.imsglobal.org/vocab/lis/v2/membership#Administrator",
    "http://purl.imsglobal.org/vocab/lis/v2/membership#ContentDeveloper",
    "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor",
    "http://purl.imsglobal.org/vocab/lis/v2/membership#Learner",
    "http://purl.imsglobal.org/vocab/lis/v2/membership#Mentor"
  ];

  // Check it is a POST request
  if (req.method !== "POST") {
    errors.push("Method invalid");
  }

  // Check the LTI message type
  if (
    body.hasOwnProperty(
      "https://purl.imsglobal.org/spec/lti/claim/message_type"
    )
  ) {
    if (
      body["https://purl.imsglobal.org/spec/lti/claim/message_type"] !==
      "LtiResourceLinkRequest"
    ) {
      errors.push("LTI message type invalid");
    }
  } else {
    errors.push("LTI message type missing");
  }

  // Check the LTI version
  if (
    body.hasOwnProperty("https://purl.imsglobal.org/spec/lti/claim/version")
  ) {
    if (body["https://purl.imsglobal.org/spec/lti/claim/version"] !== "1.3.0") {
      errors.push("LTI Version invalid");
    }
  } else {
    errors.push("LTI Version missing");
  }

  // Check the Deployment ID.  For a given client_id, the deployment_id is a stable locally unique
  // identifier within the iss (Issuer).
  // TODO:  check actual value once we have registration data
  if (
    body.hasOwnProperty(
      "https://purl.imsglobal.org/spec/lti/claim/deployment_id"
    )
  ) {
    if (
      body["https://purl.imsglobal.org/spec/lti/claim/deployment_id"].length >
      255
    ) {
      errors.push("Deployment ID invalid");
    }
  } else {
    errors.push("Deployment ID missing");
  }

  // Check Target Link URI - MUST be the same value as the target_link_uri passed by the platform in the OIDC third party initiated login request.
  // TODO:  check actual value once we have registration data
  if (
    body.hasOwnProperty(
      "https://purl.imsglobal.org/spec/lti/claim/tool_platform"
    ) &&
    body[
      "https://purl.imsglobal.org/spec/lti/claim/tool_platform"
    ].hasOwnProperty("url")
  ) {
    if (
      body["https://purl.imsglobal.org/spec/lti/claim/tool_platform"].url === ""
    ) {
      errors.push("Target Link URI invalid");
    }
  } else {
    errors.push("Target Link URI missing");
  }

  // Check a resource link ID exists
  // TODO:  check actual value once we have registration data
  if (
    body.hasOwnProperty(
      "https://purl.imsglobal.org/spec/lti/claim/resource_link"
    ) &&
    body[
      "https://purl.imsglobal.org/spec/lti/claim/resource_link"
    ].hasOwnProperty("id")
  ) {
    if (
      body["https://purl.imsglobal.org/spec/lti/claim/resource_link"].id
        .length > 255
    ) {
      errors.push("Resource Link invalid");
    }
  } else {
    errors.push("Resource Link missing");
  }

  // Check sub exists for OIDC request, we do not allow Anonymous requests
  // TODO: check actual value once we have user data
  if (body.hasOwnProperty('sub')) {
    if (body['sub'].length > 255) {
      errors.push('Sub invalid');
    }
  } else {
    errors.push("Sub missing");
  }

  // Check any user roles provided are valid, ok if array is empty, but if non-empty, must contain
  // at least one of the VALID_ROLES defined in this function
  if (body.hasOwnProperty("https://purl.imsglobal.org/spec/lti/claim/roles")) {
    if (
      body["https://purl.imsglobal.org/spec/lti/claim/roles"].length !== 0 &&
      !body["https://purl.imsglobal.org/spec/lti/claim/roles"].some(
        role => VALID_ROLES.indexOf(role) >= 0
      )
    ) {
      errors.push("Role invalid");
    }
  } else {
    errors.push("Role missing");
  }

  // Context is optional, but if present, check validity of those provided.
  // The Context type should be 'http://purl.imsglobal.org/vocab/lis/v2/course#CourseOffering'
  if (body.hasOwnProperty('https://purl.imsglobal.org/spec/lti/claim/context')) {
    if (!body['https://purl.imsglobal.org/spec/lti/claim/context'].hasOwnProperty('label') &&
      !body['https://purl.imsglobal.org/spec/lti/claim/context'].hasOwnProperty('title') ) {
        errors.push('Context invalid: does not contain label OR title');
    }
    if (body['https://purl.imsglobal.org/spec/lti/claim/context'].hasOwnProperty('type')) {
      if (!body['https://purl.imsglobal.org/spec/lti/claim/context'].type.includes('http://purl.imsglobal.org/vocab/lis/v2/course#CourseOffering')) {
        errors.push('Context invalid: type invalid');
      }
    } else {
      errors.push('Context type missing');
    }
  }    

  // User name information is optional, but if present, check validity of what is provided.
  if (body.hasOwnProperty('given_name') && typeof body['given_name'] !== 'string') {
    errors.push('Name information invalid');
  }
  if (body.hasOwnProperty('family_name') && typeof body['family_name'] !== 'string') {
    errors.push('Name information invalid');
  }
  if (body.hasOwnProperty('name') && typeof body['name'] !== 'string') {
    errors.push('Name information invalid');
  }

  // Returning scores is optional, but if requested, check validity of what is provided.
  if (body.hasOwnProperty('https://purl.imsglobal.org/spec/lti-ags/claim/endpoint')) {
    if (!body['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'].hasOwnProperty('scope') || 
      body['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'].scope.length === 0) {
        errors.push('Score setup invalid');
    }
    if (!body['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'].hasOwnProperty('lineitems') ||
      typeof body['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'].lineitems !== 'string') {
        errors.push('Score setup invalid');
    }
    if (!body['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'].hasOwnProperty('lineitem') ||
      typeof body['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'].lineitem !== 'string') {
        errors.push('Score setup invalid');
    }
  }

  return errors;
}

//Validates that the authorization keys are present and filled.
function launchTool(req, res) {
  const schema = Joi.object().keys({
    "https://purl.imsglobal.org/spec/lti/claim/message_type": Joi.string()
      .exist()
      .required(),
    "https://purl.imsglobal.org/spec/lti/claim/deployment_id": Joi.string()
      .exist()
      .required()
      .max(255),
    "https://purl.imsglobal.org/spec/lti/claim/resource_link": Joi.string()
      .exist()
      .required()
      .max(255),
    client_id: Joi.string()
      .exist()
      .required()
      .empty(),
    sub: Joi.string().exist(),
    "https://purl.imsglobal.org/spec/lti/claim/roles": Joi.exist().required(),
    redirect_uri: Joi.exist().required(),
    response_type: Joi.string().exist(),
    scope: Joi.string().exist()
  });
  if (!schema.validate(req) ) {
    res.status(422).json({ errors: errors.array() });
  } else {
    const jwt_string = req.headers.authorization.split(" ")[1];
    jwt.verify(
      jwt_string,
      process.env.CLIENT_PUBLIC,
      { algorithm: ["RS256"] },
      (err, decoded) => {
        if (err) {
          return res.status(401).send("invalid_token");
        } else {
          const errors = valid_launch_request(req);
          if (errors.length === 0) {
            return res.send({ payload: req.session.payload });// && res.redirect(req.body.project_name));
          } else {
            return res.status(400).send({
              error: "invalid_request",
              error: errors
            });
          }
        }
      }
    );
    }}
// /* Redirects to another page based on the redirect URI. Still waiting to implement, need more info on what the LMS payload will be. */
//   function targetRedirect(req, res){
//     target_URI= req.body.redirect_uri

//     res.redirect(target_URI);
//   }
// }

module.exports = { launchTool, valid_launch_request };
