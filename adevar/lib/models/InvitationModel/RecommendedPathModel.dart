class RecommendedPathModel {
  var _flag;
  var _code;
  var _message;
  var _data;

  RecommendedPathModel.fromJson(json) {
    _flag = json['flag'];
    _code = json['code'];
    _message = json['message'];
    _data = json['data'];
  }

  get flag => _flag;

  get code => _code;

  get message => _message;

  get data => _data;
}
