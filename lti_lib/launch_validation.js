/* 
 * Validate LTI 1.3 Launch Request
 * @param req - HTTP request to validate
 * @returns an array, which if empty indicates 0 errors, otherwise, contains description of each error
*/
function valid_launch_request(req) {
  let body = req.body;
  let errors = [];

  // Per the LTI1.3 spec, the following are the minimum valid roles
  const VALID_ROLES = [
    'http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator', 
    'http://purl.imsglobal.org/vocab/lis/v2/system/person#None',
    'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator', 
    'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Faculty', 
    'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Guest', 
    'http://purl.imsglobal.org/vocab/lis/v2/institution/person#None', 
    'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Other', 
    'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Staff', 
    'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student',
    'http://purl.imsglobal.org/vocab/lis/v2/membership#Administrator', 
    'http://purl.imsglobal.org/vocab/lis/v2/membership#ContentDeveloper', 
    'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor', 
    'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner', 
    'http://purl.imsglobal.org/vocab/lis/v2/membership#Mentor' 
  ];

  // Check it is a POST request
  if (req.method !== 'POST') {
    errors.push('Method invalid');
  };

  // Check the LTI message type
  if (body.hasOwnProperty('https://purl.imsglobal.org/spec/lti/claim/message_type')) {
    if (body['https://purl.imsglobal.org/spec/lti/claim/message_type'] !== 'LtiResourceLinkRequest') {
      errors.push('LTI message type invalid');
    }
  } else {
    errors.push('LTI message type missing');
  }

  // Check the LTI version
  if (body.hasOwnProperty('https://purl.imsglobal.org/spec/lti/claim/version')) {
    if (body['https://purl.imsglobal.org/spec/lti/claim/version'] !== '1.3.0') {
      errors.push('LTI Version invalid');
    }
  } else {
    errors.push('LTI Version missing');
  }

  // Check the Deployment ID.  For a given client_id, the deployment_id is a stable locally unique 
  // identifier within the iss (Issuer).
  // TODO:  check actual value once we have real data
  if (body.hasOwnProperty('https://purl.imsglobal.org/spec/lti/claim/deployment_id')) {
    if (body['https://purl.imsglobal.org/spec/lti/claim/deployment_id'].length > 255) {
      errors.push('Deployment ID invalid');
    }
  } else {
    errors.push('Deployment ID missing')
  }

  // Check Target Link URI - MUST be the same value as the target_link_uri passed by the platform in the OIDC third party initiated login request.
  // TODO:  check actual value once we have real data
  if (body.hasOwnProperty('https://purl.imsglobal.org/spec/lti/claim/tool_platform') && body['https://purl.imsglobal.org/spec/lti/claim/tool_platform'].hasOwnProperty('url')) {
    if (body['https://purl.imsglobal.org/spec/lti/claim/tool_platform'].url === '') {
      errors.push('Target Link URI invalid');
    }    
  } else {
    errors.push('Target Link URI missing');
  }

  // Check a resource link ID exists
  // TODO:  check actual value once we have real data
  if (body.hasOwnProperty('https://purl.imsglobal.org/spec/lti/claim/resource_link') && body['https://purl.imsglobal.org/spec/lti/claim/resource_link'].hasOwnProperty('id')) {
    if (body['https://purl.imsglobal.org/spec/lti/claim/resource_link'].id.length > 255) {
      errors.push('Resource Link invalid');
    }
  } else {
    errors.push('Resource Link missing');
  }

  // Check sub exists for OIDC request, we do not allow Anonymous requests
  // TODO: check actual value once we have real data
  // TODO:  allow Anonymous requests
  if (body.hasOwnProperty('sub')) {
    if (body['sub'].length > 255) {
      errors.push('Sub invalid');
    }
  } else {
    errors.push('Sub missing');
  }

  // Check any user roles provided are valid, ok if array is empty, but if non-empty, must contain
  // at least one of the VALID_ROLES defined in this function
  if (body.hasOwnProperty('https://purl.imsglobal.org/spec/lti/claim/roles')) {
    if (body['https://purl.imsglobal.org/spec/lti/claim/roles'].length !== 0 &&
      !body['https://purl.imsglobal.org/spec/lti/claim/roles'].some(role => VALID_ROLES.indexOf(role) >= 0)) {
      errors.push('Role invalid');
    }
  } else {
    errors.push('Role missing');
  }





  
  return errors;
}

module.exports = { valid_launch_request };
