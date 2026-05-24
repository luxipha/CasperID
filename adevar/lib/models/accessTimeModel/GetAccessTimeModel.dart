class GetAccessTimeModel {
  var _flag;

  var _code;

  var _message;

  var _data;

  var _isNever;

  var _years;

  var _months;

  var _days;

  var _hours;

  GetAccessTimeModel.fromJson(json) {
    _flag = json['flag'];
    _code = json['code'];
    _message = json['message'];
    _data = json['data'];
    _isNever = _data['isNever'];
    _years = _data['years'];
    _months = _data['months'];
    _days = _data['days'];
    _hours = _data['hours'];
  }

  get flag => _flag;

  get code => _code;

  get message => _message;

  get isNever => _isNever;

  get years => _years;

  get months => _months;

  get days => _days;

  get hours => _hours;
}
