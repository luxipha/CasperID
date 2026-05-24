class DeleteUserProfile {
  var _flag;
  var _code;
  var _messsage;

  DeleteUserProfile.fromJson(json) {
    _flag = json['flag'];
    _code = json['code'];
    _messsage = json['message'];
  }

  get flag => _flag;

  get code => _code;

  get message => _messsage;
}
