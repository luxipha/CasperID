class ManageAccessSettingsModel {
  var _flag;
  var _code;
  var _message;
  var _Comment;
  var _Email;
  var _Intro;
  var _Skills;
  var _Phone;
  var _Edu;
  var _Rating;
  var _Work;
  var _Place;
  var _Name;

  ManageAccessSettingsModel.fromJson(json) {
    _flag = json['flag'];
    _code = json['code'];
    _message = json['message'];
    _Comment = json['data']['Comment'];
    _Email = json['data']['Email'];
    _Intro = json['data']['Intro'];
    _Skills = json['data']['Skills'];
    _Phone = json['data']['Phone'];
    _Edu = json['data']['Edu'];
    _Rating = json['data']['Rating'];
    _Work = json['data']['Work'];
    _Place = json['data']['Place'];
    _Name = json['data']['Name'];
  }

  get flag => _flag;

  get code => _code;

  get message => _message;

  get Comment => _Comment;

  get Email => _Email;

  get Intro => _Intro;

  get Skills => _Skills;

  get Phone => _Phone;

  get Edu => _Edu;

  get Rating => _Rating;

  get Work => _Work;

  get Place => _Place;

  get Name => _Name;
}
