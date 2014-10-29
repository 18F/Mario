// Get the Mario yml, or throw exception on error
var fs = require('fs');
var yaml = require('js-yaml');
var configs = require('../configs');


var path = configs.GSA_ADVANTAGE_PATH;
var contents = fs.readFileSync(path, 'utf8');
var mario_doc = yaml.safeLoad(contents);
var mario_rel_doc = mario_doc.constants;

console.log(mario_rel_doc);


module.exports = {
  cart_id: new RegExp(mario_rel_doc.cart_id_from_GSA_Advantage, "gm"),
  atn: new RegExp(mario_rel_doc.atn_from_gsa_advantage, "gm"),
  email: new RegExp(mario_rel_doc.email_from_gsa_advantage, "gm"),
  init_comment: new RegExp(mario_rel_doc.init_comment_from_gsa, "gm")
};
