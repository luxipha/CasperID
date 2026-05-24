class MyPersonViewModel {
  var _flag;
  var _code;
  var _message;
  var _data;

  var _userId;
  var _logo;
  var _firstName;
  var _lastName;
  var _idNumber;
  var _badgeUrl;
  var _exp;
  var _todayVisit;
  var _newNotificationCount;

  var _completenessOfInfo;
  var _proportion;
  var _isRealPerson;

  MyPersonViewModel.fromJson(json) {
    _flag = json['flag'];
    _code = json['code'];
    _message = json['message'];
    _data = json['data'];

    _userId = _data['userId'];
    _logo = _data['logo'];
    _firstName = _data['firstName'];
    _lastName = _data['lastName'];
    _idNumber = _data['idNumber'];
    _badgeUrl = _data['badgeUrl'];
    _exp = _data['exp'];
    _todayVisit = _data['todayVisit'];
    _newNotificationCount = _data['newNotificationCount'];
    _completenessOfInfo = _data['completenessOfInfo'];

    _proportion = _completenessOfInfo['proportion'];
    _isRealPerson = _completenessOfInfo['isRealPerson'];
  }

  get flag => _flag;

  get code => _code;

  get message => _message;

  get data => _data;

  get userId => _userId;

  get logo => _logo;

  get firstName => _firstName;

  get lastName => _lastName;

  get idNumber => _idNumber;

  get badgeUrl => _badgeUrl;

  get exp => _exp;

  get todayVisit => _todayVisit;

  get newNotificationCount => _newNotificationCount;

  get completenessOfInfo => _completenessOfInfo;

  get proportion => _proportion;

  get isRealPerson => _isRealPerson;
}
