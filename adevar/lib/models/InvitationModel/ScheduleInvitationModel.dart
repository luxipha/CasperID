class ScheduleInvitationModel {
  var _flag;
  var _counts;
  var _page;
  var _pageSize;
  var _code;
  var _message;

  List<ScheduleInvitationData> _scheduleInvitationData = [];

  ScheduleInvitationModel.fromJson(json) {
    _flag = json['flag'];
    _counts = json['counts'];
    _page = json['page'];
    _pageSize = json['pageSize'];
    _code = json['code'];
    _message = json['message'];

    List<ScheduleInvitationData> tempItems = [];
    if (json['items'] != null) {
      for (var i = 0; i < json['items'].length; i++) {
        ScheduleInvitationData invitationData =
            ScheduleInvitationData(json['items'][i]);
        tempItems.add(invitationData);
      }
    }
    _scheduleInvitationData = tempItems;
  }

  get flag => _flag;

  get counts => _counts;

  get page => _page;

  get pageSize => _pageSize;

  get code => _code;

  get message => _message;

  List<ScheduleInvitationData> get scheduleInvitationData =>
      _scheduleInvitationData;
}

class ScheduleInvitationData {
  var _baseUserView;
  var _meetingTime;
  var _meetingId;

  var _userId;
  var _logo;
  var _firstName;
  var _lastName;
  var _gender;
  var _position;
  var _senderConfirm;
  var _recipientConfirm;

  ScheduleInvitationData(data) {
    _baseUserView = data['baseUserView'];
    _meetingTime = data['meetingTime'];
    _meetingId = data['meetingId'];

    _userId = _baseUserView['userId'];
    _logo = _baseUserView['logo'];
    _firstName = _baseUserView['firstName'];
    _lastName = _baseUserView['lastName'];
    _gender = _baseUserView['gender'];
    _position = _baseUserView['position'];
    _senderConfirm = data['senderConfirm'];
    _recipientConfirm = data['recipientConfirm'];
  }

  get userId => _userId;

  get logo => _logo;

  get firstName => _firstName;

  get lastName => _lastName;

  get meetingId => _meetingId;

  get meetingTime => _meetingTime;

  get gender => _gender;

  get position => _position;
  get senderConfirm => _senderConfirm;
  get recipientConfirm => _recipientConfirm;
}
