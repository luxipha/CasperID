class InvitationAndVisibleStatusModel {
  var _flag;
  var _code;
  var _message;
  var _visbleToPublicSwitch;
  var _invitationSwitch;

  InvitationAndVisibleStatusModel.fromJson(json) {
    _flag = json['flag'];
    _code = json['code'];
    _message = json['message'];
    _visbleToPublicSwitch = json['data']['visbleToPublicSwitch'];
    _invitationSwitch = json['data']['invitationSwitch'];

  }

  get flag => _flag;

  get code => _code;

  get message => _message;

  get visbleToPublicSwitch => _visbleToPublicSwitch;

  get invitationSwitch => _invitationSwitch;
}
