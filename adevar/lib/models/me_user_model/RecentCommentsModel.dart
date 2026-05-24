class RecentCommentsModel {
  var _flag;
  var _code;
  var _message;
  var _data;

  var _sendUserId;
  var _logo;
  var _firstName;
  var _lastName;
  var _sendDate;
  var _text;
  var _isRead;

  RecentCommentsModel.fromJson(json) {
    _flag = json['flag'];
    _code = json['code'];
    _message = json['message'];
    _data = json['data'];

    _sendUserId = _data['sendUserId'];
    _logo = _data['logo'];
    _firstName = _data['firstName'];
    _lastName = _data['lastName'];
    _sendDate = _data['sendDate'];
    _text = _data['text'];
    _isRead = _data['isRead'];
  }

  get flag => _flag;

  get code => _code;

  get message => _message;

  get data => _data;

  get sendUserId => _sendUserId;

  get logo => _logo;

  get firstName => _firstName;

  get lastName => _lastName;

  get sendDate => _sendDate;

  get text => _text;

  get isRead => _isRead;
}
