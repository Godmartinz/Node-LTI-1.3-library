const axios = require('axios');

function grading_grade(grade, payload) {

axios.post(payload["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"].lineitems, {
    "userId": "3427",
    "scoreGiven": grade, 
    "scoreMaximum": 1, 
    "comment": "Well done!", 
    "timestamp": "2018-06-12T14:30:23.605Z", 
    "activityProgress": "Completed",
    "gradingProgress": "FullyGraded"
})
.then((res) => {
  console.log(`statusCode: ${res.statusCode}`)
  console.log(res)
})
.catch((error) => {
  console.error(error)
})

}

module.exports = { grading_grade };
