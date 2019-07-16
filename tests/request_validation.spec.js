const expect = require('chai').expect;
const { valid_launch_request } = require('../server/launch_validation.js');

describe('Validate Launch Request', () => {
  let req = null;

  beforeEach(() => {
    req = { method: 'POST',
      url: 'http://this.is.a.fake.url',
      headers: 
      { 'Content-Type': 'application/json' },
      body: 
      { sub: 'a6d5c443-1f51-4783-ba1a-7686ffe3b54a',
        'https://purl.imsglobal.org/spec/lti/claim/deployment_id': '07940580-b309-415e-a37c-914d387c1150',
        'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiResourceLinkRequest',
        'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
        'https://purl.imsglobal.org/spec/lti/claim/roles': 
          [ 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student',
            'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner',
            'http://purl.imsglobal.org/vocab/lis/v2/membership#Mentor' ],
        'https://purl.imsglobal.org/spec/lti/claim/tool_platform': {
            'url': "https://platform.example.edu",
          },    
        'https://purl.imsglobal.org/spec/lti/claim/resource_link': 
          { id: '200d101f-2c14-434a-a0f3-57c2a42369fd',
            description: 'Assignment to introduce who you are',
            title: 'Introduction Assignment' } },
      json: true };
    });

  it('should reject non-POST requests', () => {
    expect(valid_launch_request(req)).to.have.lengthOf(0);
    req.method = 'GET';
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Method invalid');
  });

  it('should correctly validate that message has a type that is LtiResourceLinkRequest and reject if message type is not LtiResourceLinkRequest', () => {
    expect(valid_launch_request(req)).to.have.lengthOf(0);
    req.body['https://purl.imsglobal.org/spec/lti/claim/message_type'] = 'not correct';
    expect(valid_launch_request(req)).to.be.an('array').that.includes('LTI message type invalid');
    delete req.body['https://purl.imsglobal.org/spec/lti/claim/message_type'];
    expect(valid_launch_request(req)).to.be.an('array').that.includes('LTI message type missing');
  });

  it('should correctly validate that message has a version that is 1.3.0 and reject if not', () => {
    expect(valid_launch_request(req)).to.have.lengthOf(0);
    req.body['https://purl.imsglobal.org/spec/lti/claim/version'] = 'not correct';
    expect(valid_launch_request(req)).to.be.an('array').that.includes('LTI Version invalid');
    delete req.body['https://purl.imsglobal.org/spec/lti/claim/version'];
    expect(valid_launch_request(req)).to.be.an('array').that.includes('LTI Version missing');
  });

  it('should correctly validate that message has a deployment id that is no more than 255 characters', () => {
    expect(valid_launch_request(req)).to.have.lengthOf(0);
    req.body['https://purl.imsglobal.org/spec/lti/claim/deployment_id'] = 'a'.repeat(266);
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Deployment ID invalid');
    delete req.body['https://purl.imsglobal.org/spec/lti/claim/deployment_id'];
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Deployment ID missing');
  });

  it('should correctly validate that message has a target link URI to exist', () => {
    expect(valid_launch_request(req)).to.have.lengthOf(0);
    delete req.body['https://purl.imsglobal.org/spec/lti/claim/tool_platform'].url;
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Target Link URI missing');
    delete req.body['https://purl.imsglobal.org/spec/lti/claim/tool_platform'];
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Target Link URI missing');
  });

  it('should correctly validate that message has a resource link id that is no more than 255 characters', () => {
    expect(valid_launch_request(req)).to.have.lengthOf(0);
    req.body['https://purl.imsglobal.org/spec/lti/claim/resource_link'].id = 'a'.repeat(266);
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Resource Link invalid');
    delete req.body['https://purl.imsglobal.org/spec/lti/claim/resource_link'].id;
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Resource Link missing');
    delete req.body['https://purl.imsglobal.org/spec/lti/claim/resource_link'];
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Resource Link missing');
  });

  it('should correctly validate that message has a sub specified that is no more than 255 characters', () => {
    expect(valid_launch_request(req)).to.have.lengthOf(0);
    req.body['sub'] = 'a'.repeat(266);
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Sub invalid');
    delete req.body['sub'];
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Sub missing');
  });

  it('should correctly validate that message has a role specified that is valid', () => {
    expect(valid_launch_request(req)).to.have.lengthOf(0);
    req.body['https://purl.imsglobal.org/spec/lti/claim/roles'] = [];
    expect(valid_launch_request(req)).to.have.lengthOf(0);
    req.body['https://purl.imsglobal.org/spec/lti/claim/roles'] = ['Ehttp://purl.imsglobal.org/vocab/lis/v2/institution/person#Student'];
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Role invalid');
    delete req.body['https://purl.imsglobal.org/spec/lti/claim/roles'];
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Role missing');
  });

});
