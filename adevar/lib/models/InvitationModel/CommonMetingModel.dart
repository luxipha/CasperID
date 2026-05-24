class CommonMeetingModel {
  var _flag;
  var _code;
  var _message;

  CommonMeetingModel.fromJson(json) {
    _flag = json['flag'];
    _code = json['code'];
    _message = json['message'];
  }

  get flag => _flag;

  get code => _code;

  get message => _message;
}
