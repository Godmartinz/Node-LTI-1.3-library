const expect = require('chai').expect;
const axios = require('axios');
const qs = require('qs');
const app = require('../server/server.js');
require('dotenv').config();
const Database = require('./mongoDB/Database.js');
const Schema = mongoose.Schema;

const platformSchema = new Schema({
  consumerUrl: String,
  consumerName: String,
  consumerToolClientID: String,
  consumerAuthorizationURL: String,
  consumerAccessTokenURL: String,
  consumerRedirect_URI: String,
  kid: Array,
  consumerAuthorizationconfig: {
    method: String,
    key: String
  }
});
let platformData = Database.Get('platform', platformSchema, { consumerURL: 'thisNeedsMockData'})

describe('OAuth2.0 flow', function() {
  let httpServer = null;
  let url = 'http://localhost:8888';
  let token_url = url + '/oauth2/token';
  let good_data = null;
  let saved_token = null;

  beforeEach(() => {
    good_data = {
      'grant_type': 'client_credentials',
      'client_id': 'uuYLGWBmhhuZvBf',
      'client_secret': process.env.CLIENT_SECRET
    };
  });
  
  before(done => {
    httpServer = app.listen(8888);
    done();
  });
  
  after((done) => {
    httpServer.close();
    done();
  });

  it('should load successfully', () => {
    return axios.get(url)
    .then(r => expect(r.status).to.equal(200))
    .catch(error => console.log(`***error caught ${error}`));
  });

  it('should post correctly with good data', () => {
    return axios({
      method: 'POST',
      url: token_url,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        ...good_data
      })
    })
    .then(res => {
      saved_token = res.data;
      expect(res.status).to.equal(200);
    })
    .catch(err => {
      console.log(`***error caught: ${err}`);
    });
  });

  it('should get an error if it is missing the data', () => {
    return axios({
      method: 'POST',
      url: token_url,
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    .catch(err => {
      expect(err.response.status).to.equal(400);
      expect(err.response.data.error).to.equal('invalid_request');
    })
    .catch(error => console.log(`***error caught ${error}`));
  });

  it('should get an error if it is missing the client id', () => {
    return axios({
      method: 'POST',
      url: token_url,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        'grant_type': 'client_credentials',
        'client_secret': process.env.CLIENT_SECRET
        })
      })
    .catch(err => {
      expect(err.response.status).to.equal(400);
      expect(err.response.data.error).to.equal('invalid_request');
    })
    .catch(error => console.log(`***error caught ${error}`));
  });

  it('should get an error with an invalid grant type', () => {
    return axios({
      method: 'POST',
      url: token_url,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        ...good_data,
        'grant_type': 'WHATis THIS?'
      })
    })
    .catch(err => {
      expect(err.response.status).to.equal(400);
      expect(err.response.data.error).to.equal('unsupported_grant_type');
    })
    .catch(error => console.log(`***error caught ${error}`));
  });

  it('should get an error with an invalid client id', () => {
    return axios({
      method: 'POST',
      url: token_url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        ...good_data,
        'client_id': 'WHOis THIS?'
      })
    })
    .catch(err => {
      expect(err.response.status).to.equal(401);
      expect(err.response.data.error).to.equal('invalid_client');
    })
    .catch(error => console.log(`***error caught ${error}`));
  });

  it('should get an error with an invalid secret', () => {
    return axios({
      method: 'POST',
      url: token_url,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        ...good_data,
        'client_secret': 'thisISwrong' 
      })
    })
    .catch(err => {
      expect(err.response.status).to.equal(401);
      expect(err.response.data.error).to.equal('invalid_client');
    })
    .catch(error => {
      console.log(`***error caught ${error}`);
    });
  });

  // it('should make a GET successfully with a valid token', () => {
  //   return axios.get(url+'/project/submit', {headers: {Authorization: 'Bearer ' + saved_token}})
  //     .then(r => expect(r.status).to.equal(200))
  //     .catch(error => console.log(`***error caught ${error}`));
  // });

  // it('should make a POST successfully with a valid token', () => {
    //   const body = {
    //     sub: 'a6d5c443-1f51-4783-ba1a-7686ffe3b54a',
    //     'https://purl.imsglobal.org/spec/lti/claim/deployment_id': '07940580-b309-415e-a37c-914d387c1150',
    //     'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiResourceLinkRequest',
    //     'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
    //     'https://purl.imsglobal.org/spec/lti/claim/roles': 
    //       [ 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student',
    //         'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner',
    //         'http://purl.imsglobal.org/vocab/lis/v2/membership#Mentor' ],
    //     'https://purl.imsglobal.org/spec/lti/claim/tool_platform': {
    //         'url': "https://platform.example.edu",
    //       },    
    //     'https://purl.imsglobal.org/spec/lti/claim/resource_link': 
    //       { id: '200d101f-2c14-434a-a0f3-57c2a42369fd',
    //         description: 'Assignment to introduce who you are',
    //         title: 'Introduction Assignment' } };
    // return axios.post(url+'/project/submit/react100',
    //       body, 
    //       {headers: {
    //         Authorization: 'Bearer ' + saved_token,
    //         'Content-Type': 'application/json'
    //       }}
    //   )
    //   .catch(r => expect(r.response.status).to.equal(200))
    //   .catch(error => console.log(`***error caught ${error}`));
  // });
});

