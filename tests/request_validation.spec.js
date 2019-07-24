const expect = require('chai').expect;
const { valid_launch_request } = require('../lti_lib/launch_validation.js');

describe('Validate Launch Request', () => {
  let req = null;

  beforeEach(() => {
    req = { 
      method: 'POST',
      url: 'http://this.is.a.fake.url',
      headers: {
        'Content-Type': 'application/json' 
      },
      body: {
        sub: 'a6d5c443-1f51-4783-ba1a-7686ffe3b54a',
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
        'https://purl.imsglobal.org/spec/lti/claim/resource_link': {
            id: '200d101f-2c14-434a-a0f3-57c2a42369fd',
            description: 'Assignment to introduce who you are',
            title: 'Introduction Assignment' 
        }, 
        'https://purl.imsglobal.org/spec/lti/claim/context': {
            id: 'random-id-with-cha.dfokasdf',
            label: 'react100',
            title: 'React for Beginners',
            type: [ 'http://purl.imsglobal.org/vocab/lis/v2/course#CourseOffering' ]
        },
        given_name: 'Joe',
        family_name: 'Schmoo',
        name: 'Joe Schmoo',
        'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint': {
          scope: ['https://purl.imsglobal.org/spec/lti-ags/scope/score'],
          'lineitems': 'https://www.myuniv.example.com/2344/lineitems/',
          'lineitem': 'https://www.myuniv.example.com/2344/lineitems/1234/lineitem'
        }
      },
      json: true 
    };
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
    req.body['https://purl.imsglobal.org/spec/lti/claim/roles'] = ['WRONGhttp://purl.imsglobal.org/vocab/lis/v2/institution/person#Student'];
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Role invalid');
    delete req.body['https://purl.imsglobal.org/spec/lti/claim/roles'];
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Role missing');
  });

  it('should correctly validate Context if it is present', () => {
    expect(valid_launch_request(req)).to.have.lengthOf(0);
    delete req.body['https://purl.imsglobal.org/spec/lti/claim/context'].title;
    expect(valid_launch_request(req)).to.have.lengthOf(0);
    delete req.body['https://purl.imsglobal.org/spec/lti/claim/context'].label;
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Context invalid: does not contain label OR title');
    req.body['https://purl.imsglobal.org/spec/lti/claim/context'].type = ['WRONGhttp://purl.imsglobal.org/vocab/lis/v2/course#CourseOffering'];
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Context invalid: type invalid');
    req.body['https://purl.imsglobal.org/spec/lti/claim/context'].type = [];
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Context invalid: type invalid')
    delete req.body['https://purl.imsglobal.org/spec/lti/claim/context'].type;
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Context type missing')
  });
  
  it('should not give an error if Context is NOT present', () => {
    delete req.body['https://purl.imsglobal.org/spec/lti/claim/context'];
    expect(valid_launch_request(req)).to.be.an('array').that.is.empty;
  });
  
  it('should check name information correctly', () => {
    expect(valid_launch_request(req)).to.have.lengthOf(0);
    req.body.name = 5;
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Name information invalid')
  });

  it('should not give an error if Name information is NOT present', () => {
    delete req.body.name;
    expect(valid_launch_request(req)).to.be.an('array').that.is.empty;
    delete req.body.given_name;
    expect(valid_launch_request(req)).to.be.an('array').that.is.empty;
    delete req.body.family_name;
    expect(valid_launch_request(req)).to.be.an('array').that.is.empty;
  });

  it('should correctly validate Endpoint if it is present', () => {
    expect(valid_launch_request(req)).to.have.lengthOf(0);
    delete req.body['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'].lineitem;
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Score setup invalid');
    delete req.body['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'].lineitems;
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Score setup invalid');
    req.body['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'].scope = [];
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Score setup invalid')
    delete req.body['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'].scope;
    expect(valid_launch_request(req)).to.be.an('array').that.includes('Score setup invalid')
  });
  
  it('should not give an error if Endpoint is NOT present', () => {
    delete req.body['https://purl.imsglobal.org/spec/lti/claim/endpoint'];
    expect(valid_launch_request(req)).to.be.an('array').that.is.empty;
  });
  
});
