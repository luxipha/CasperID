class UploadUserProfileModel {
  var _flag;
  var _code;
  var _message;
  var _data;
  var _created;
  var _updated;

  var _id;
  var _userId;
  var _logoUrl;
  var _bigLogoUrl;
  var _hdLogoUrl;
  var _isNow;
  var _uuid;

  UploadUserProfileModel.fromJson(json) {
    _flag = json['flag'];
    _code = json['code'];
    _message = json['message'];
    _data = json['data'];

    _created = _data['created'];
    _updated = _data['updated'];
    _id = _data['id'];
    _userId = _data['userId'];
    _logoUrl = _data['logoUrl'];
    _bigLogoUrl = _data['bigLogoUrl'];
    _hdLogoUrl = _data['hdLogoUrl'];
    _isNow = _data['isNow'];
    _uuid = _data['uuid'];
  }

  get flag => _flag;

  get code => _code;

  get message => _message;

  get created => _created;

  get updated => _updated;

  get id => _id;

  get userId => _userId;

  get logoUrl => _logoUrl;

  get bigLogoUrl => _bigLogoUrl;

  get hdLogoUrl => _hdLogoUrl;

  get isNow => _isNow;

  get uuid => _uuid;
}
