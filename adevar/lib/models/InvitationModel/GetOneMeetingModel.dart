class GetOneMeetingModel {
  var _flag;
  var _code;
  var _message;
  var _data;
  var _userView;
  var _meetingId;
  var _meeting;
  var _meetingDateTime;
  var _userId;
  var _logo;
  var _gender;
  var _firstName;
  var _lastName;
  var _position;

  var _city;
  var _state;
  var _country;
  var _mobile;

  var _id;
  var _sendUserId;
  var _recUserId;
  var _meetAddress;
  var _addressLatitude;
  var _addressLongitude;
  var _meetTime;
  var _inviteText;
  var _refuseText;
  var _cancelText;
  var _isConsent;
  var _isMeet;
  var _isContact;
  var _created;
  var _badgeUrl;

  GetOneMeetingModel.fromJson(json) {
    _flag = json['flag'];
    _code = json['code'];
    _message = json['message'];
    _data = json['data'];

    _userView = _data['userView'];
    _meetingId = _data['meetingId'];
    _meetingDateTime = _data['meetingDateTime'];
    _meeting = _data['meeting'];

    _userId = _userView['userId'];
    _logo = _userView['logo'];
    _gender = _userView['gender'];
    _firstName = _userView['firstName'];
    _lastName = _userView['lastName'];
    _position = _userView['position'];
    _city = _userView['city'];
    _state = _userView['state'];
    _country = _userView['country'];
    _mobile = _userView['mobile'];
    _badgeUrl = _userView['badgeUrl'];

    _id = _meeting['id'];
    _sendUserId = _meeting['sendUserId'];
    _recUserId = _meeting['recUserId'];
    _meetAddress = _meeting['meetAddress'];
    _addressLatitude = _meeting['addressLatitude'];
    _addressLongitude = _meeting['addressLongitude'];
    _meetTime = _meeting['meetTime'];
    _inviteText = _meeting['inviteText'];
    _refuseText = _meeting['refuseText'];
    _cancelText = _meeting['cancelText'];
    _isConsent = _meeting['isConsent'];
    _isMeet = _meeting['isMeet'];
    _isContact = _meeting['isContact'];
    _created = _meeting['created'];
  }

  get flag => _flag;

  get code => _code;

  get message => _message;

  get data => _data;

  get meetingId => _meetingId;

  get meeting => _meeting;

  get meetingDateTime => _meetingDateTime;

  get userId => _userId;

  get logo => _logo;

  get gender => _gender;

  get firstName => _firstName;

  get lastName => _lastName;

  get position => _position;

  get city => _city;

  get state => _state;

  get country => _country;

  get mobile => _mobile;

  get id => _id;

  get sendUserId => _sendUserId;

  get recUserId => _recUserId;

  get meetAddress => _meetAddress;

  get addressLatitude => _addressLatitude;

  get addressLongitude => _addressLongitude;

  get meetTime => _meetTime;

  get inviteText => _inviteText;

  get refuseText => _refuseText;

  get cancelText => _cancelText;

  get isConsent => _isConsent;

  get isMeet => _isMeet;

  get isContact => _isContact;

  get created => _created;

  get badgeUrl => _badgeUrl;
}
