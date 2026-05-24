class DeleteUserFromBlackListModel {
  var _flag;
  var _code;
  var _message;

  DeleteUserFromBlackListModel.fromJson(parsedJson) {
    _flag = parsedJson['flag'];
    _code = parsedJson['code'];
    _message = parsedJson['message'];
  }

  DeleteUserFromBlackListModel.withError(error) {
    print(error);
  }

  get flag => _flag;

  get code => _code;

  get message => _message;
}
