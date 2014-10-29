// Get the C2 yml, or throw exception on error
var fs = require('fs');
var yaml = require('js-yaml');
var configs = require('../configs');


var path = configs.C2_APPLICATION_YML_PATH;
var contents = fs.readFileSync(path, 'utf8');
var c2_doc = yaml.safeLoad(contents);
var c2_rel_doc = c2_doc.constants;


module.exports = {
  reject_reg_exp: new RegExp(c2_rel_doc.reject_reg_exp, "gm"),
  approve_reg_exp: new RegExp(c2_rel_doc.approve_reg_exp, "gm"),
  reject_comment_reg_exp: new RegExp(c2_rel_doc.reject_comment_reg_exp, "gm"),
  approve_comment_reg_exp: new RegExp(c2_rel_doc.approve_comment_reg_exp, "gm"),
  reply_comment_reg_exp: new RegExp(c2_rel_doc.reply_comment_reg_exp, "gm"),
  approval_identifier: new RegExp(c2_rel_doc.email_title_for_approval_request_reg_exp)
};
