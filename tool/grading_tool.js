const axios = require('axios');

async function grade_project(req) {
  const url = req.body;
  let grading = {
    gitUrl: url.github,
    heroUrl: url.heroku
  };

  if ( url.github.includes('github.com') && (url.heroku.includes('.herokuapp.com') || url.heroku.includes('now.sh'))) {
    let response = await axios.get(url.github);

    if (response.status === 200) {
      grading = {
        ...grading,
        urlStatus: response.status,
        grade: 1
      }
      } else {
        grading = {
          ...grading,
          urlStatus: 'The URLs do not launch correctly',
          grade: null
      }  
    }
  } else {
    grading = {
      ...grading,
      urlStatus: 'Sorry, the URLs you provided are not valid.',
      grade: null
    };
  }

  return grading;
}

module.exports = { grade_project };
