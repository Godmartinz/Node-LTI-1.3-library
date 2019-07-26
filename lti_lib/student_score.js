const axios = require('axios');

function grading_grade(grade, payload) {

    if(payload["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"].scope.includes('https://purl.imsglobal.org/spec/lti-ags/scope/score') ) {
    
        var headers = {
         'Content-Type': 'application/json',
        }
        axios.post(payload["https://purl.imsglobal.org/spec/lti-ags/scope/score"].lineitem + "/score", {
            "userId":  payload.sub,
            "scoreGiven": grade,
            "scoreMaximum": 1,
            "comment": "Well done!",
            "timestamp": Date.now.toJSON(),
            "activityProgress": "Completed",
            "gradingProgress": "FullyGraded"

        }, { headers: headers })
        .catch((error) => {
            console.error(error)
        })
    } 
}

module.exports = { grading_grade };
