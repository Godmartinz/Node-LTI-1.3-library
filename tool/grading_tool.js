const axios = require('axios');

/*
* Performs grading of a SDCS Project. Requirements are valid GitHub URL and Heroku/Now URL.  GitHub URL is tested to 
* ensure it returns a 200 response
* @param req
* @returns grading object containing URLs submitted and results of grading, including status code, errors, and the grade
*/
async function grade_project(req) {
  const url = req.body;
  let grading = {
    gitUrl: url.github,
    heroUrl: url.heroku,
    error: true,
    grade: null,
  };

  if ( url.github.includes('github.com') && (url.heroku.includes('.herokuapp.com') || url.heroku.includes('now.sh'))) {
    let response = await axios.get(url.github);

    if (response.status === 200) {
      grading = {
        ...grading,
        urlStatus: response.status,
        error: false,
        grade: 1
      }
      } else {
        grading = {
          ...grading,
          urlStatus: 'The URLs do not launch correctly'
      }  
    }
  } else {
    grading = {
      ...grading,
      urlStatus: 'Sorry, the URLs you provided are not valid.'
    };
  }

  return grading;
}

module.exports = { grade_project };
