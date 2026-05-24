class UserProfileModel {
  var _flag;
  var _code;
  var _message;
  var _data;

  var _businessCardView;
  var _invitationCount;
  var _newInvitationCount;
  var _meetUpCount;
  var _evaluateCount;
  var _newEvaluateCount;

  var _logo;
  var _userId;
  var _firstName;
  var _lastName;
  var _vipLv;
  var _registerDate;
  var _mobile;
  var _email;
  var _position;
  var _city;
  var _country;

  UserProfileModel.fromJson(json) {
    _flag = json['flag'];
    _code = json['code'];
    _message = json['message'];
    _data = json['data'];
    if(_data!=null){

    _businessCardView = _data['businessCardView'];
    _invitationCount = _data['invitationCount'];
    _newInvitationCount = _data['newInvitationCount'];
    _meetUpCount = _data['meetUpCount'];
    _evaluateCount = _data['evaluateCount'];
    _newEvaluateCount = _data['newEvaluateCount'];
    _logo = _businessCardView['logo'];
    _userId = _businessCardView['userId'];
    _firstName = _businessCardView['firstName'];
    _lastName = _businessCardView['lastName'];
    _vipLv = _businessCardView['vipLv'];
    _registerDate = _businessCardView['registerDate'];
    _mobile = _businessCardView['mobile'];
    _email = _businessCardView['email'];
    _position = _businessCardView['position'];
    _city = _businessCardView['city'];
    _country = _businessCardView['country'];
    }
  }

  get flag => _flag;

  get code => _code;

  get message => _message;

  get data => _data;

  get invitationCount => _invitationCount;

  get newInvitationCount => _newInvitationCount;

  get meetUpCount => _meetUpCount;

  get evaluateCount => _evaluateCount;

  get newEvaluateCount => _newEvaluateCount;

  get logo => _logo;

  get userId => _userId;

  get firstName => _firstName;

  get lastName => _lastName;

  get vipLv => _vipLv;

  get registerDate => _registerDate;

  get mobile => _mobile;

  get email => _email;

  get position => _position;

  get city => _city;

  get country => _country;
}
