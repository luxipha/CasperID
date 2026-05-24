class LastMeetingModel {
  var _flag;
  var _code;
  var _message;
  var _data;

  var _baseUserView;

  var _userId;
  var _logo;
  var _gender;
  var _firstName;
  var _lastName;
  var _position;

  var _meetingTime;
  var _meetingId;

  LastMeetingModel.fromJson(json) {
    _flag = json['flag'];
    _code = json['code'];
    _message = json['message'];
    _data = json['data'];
    _baseUserView = _data['baseUserView'];
    _userId = _baseUserView['userId'];
    _logo = _baseUserView['logo'];
    _gender = _baseUserView['gender'];
    _firstName = _baseUserView['firstName'];
    _lastName = _baseUserView['lastName'];
    _position = _baseUserView['position'];
    _meetingTime = _data['meetingTime'];
    _meetingId = _data['meetingId'];
  }

  get flag => _flag;

  get code => _code;

  get message => _message;

  get data => _data;

  get baseUserView => _baseUserView;

  get userId => _userId;

  get logo => _logo;

  get gender => _gender;

  get firstName => _firstName;

  get lastName => _lastName;

  get position => _position;

  get meetingTime => _meetingTime;

  get meetingId => _meetingId;
}
