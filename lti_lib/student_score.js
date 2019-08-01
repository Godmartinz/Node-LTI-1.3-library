const axios = require('axios');
const {tokenRequest}= require('../lti_lib/token_generator');

function send_score(grade, req) {
  tokenRequest(req);

  if (req.session.payload.hasOwnProperty('https://purl.imsglobal.org/spec/lti-ags/claim/endpoint') &&
    req.session.payload["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"].scope.includes('https://purl.imsglobal.org/spec/lti-ags/scope/score')) {
  
    var headers = {
      'Content-Type': 'application/vnd.ims.lis.v1.score+json',
    }
    axios.post(req.session.payload["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"].lineitem + "/scores", {
        "userId":  req.session.payload.sub,
        "scoreGiven": grade,
        "scoreMaximum": 1,
        "timestamp": new Date(Date.now()).toJSON(),
        "activityProgress": "Completed",
        "gradingProgress": "FullyGraded" 
    }, { headers: headers })
    .catch((error) => {
        console.error(error)
    })
  } 
}

module.exports = { send_score };
