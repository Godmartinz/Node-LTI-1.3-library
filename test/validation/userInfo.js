var Joi = require('joi');

module.exports = {
    body: 
        {   lti_message_type: Joi.string().required(),
            lti_version: Joi.string().required(),
            Oauth_consumer_key: Joi.string().required(),
            resource_link_id: Joi.string().required(),
            client_id: [Joi.string().required(), Joi.number().required()],
            redirect_uri: Joi.string().required(),
            responce_type: Joi.string().required(),
            scope: Joi.string().required(),
            custom_user_role: Joi.string().required(),
            custom_project_name: Joi.string().required()
        }
    };
