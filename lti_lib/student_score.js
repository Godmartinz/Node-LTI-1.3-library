const axios = require('axios');

function grading_grade(grade, payload) {

    var headers = {
        'Content-Type': 'application/json',
    }
    axios.post(payload["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"].lineitems, {
        "userId": "3427",
        "scoreGiven": grade,
        "scoreMaximum": 1,
        "comment": "Well done!",
        "timestamp": "2018-06-12T14:30:23.605Z",
        "activityProgress": "Completed",
        "gradingProgress": "FullyGraded"

    }, { headers: headers })
        .catch((error) => {
            console.error(error)
        })

}

module.exports = { grading_grade };
