import { request } from "https";
import { doesNotThrow } from "assert";

var userInfo = {
       lti_message_type: "test",
        lti_version: "test",
        Oauth_consumer_key: "test",
        resource_link_id: "test",
        client_id: 1234,
        redirect_uri: "test",
        responce_type: "test",
        scope: "test",
        custom_user_role: "test",
        custom_project_name: ""
    
};

request(app)
.post('/project/authentication/:projectname')
.send(userInfo)
.expect(400)
.end( function (err, res){
    var response = JSON.parse(res.text);
    response.errors.length.should.equal(1);
    response.errors[0].messages.length.should.equal(2);
    done();
});
