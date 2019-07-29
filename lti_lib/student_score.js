const axios = require('axios');

function send_score(grade, payload) {

  if (payload.hasOwnProperty('https://purl.imsglobal.org/spec/lti-ags/claim/endpoint') &&
    payload["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"].scope.includes('https://purl.imsglobal.org/spec/lti-ags/scope/score')) {
  
    var headers = {
      'Content-Type': 'application/json',
    }
    axios.post(payload["https://purl.imsglobal.org/spec/lti-ags/scope/score"].lineitem + "/score", {
        "userId":  payload.sub,
        "scoreGiven": grade,
        "scoreMaximum": 1,
        // "comment": "Well done!",
        "timestamp": Date.now.toJSON(),
        "activityProgress": "Completed",
        "gradingProgress": "FullyGraded"

    }, { headers: headers })
    .catch((error) => {
        console.error(error)
    })
  } 
}

module.exports = { send_score };
