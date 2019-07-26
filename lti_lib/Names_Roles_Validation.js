

function getUsers() {
    userType=`http%3A%2%2Fpurl.imsglobal.org%2Fvocab%2Flis%2Fv2%2Fmembership%23${role}`
   
    fetch('ENDPOINT PROVIDED BY PLATFORM'), {
        method: 'get',
        headers: {
            Accept: 'application/vnd.ims.lti-nrps.v2.membershipcontainer+json'
        }
    }.then( (users) =>{
       return users.filter(user =>user.role==`${userType}`);
    }

