class ReceivedInvitationModel {
  var _flag;
  var _counts;
  var _page;
  var _pageSize;
  var _code;
  var _message;
  var _latestCount;
  var _items;
  List<ReceivedInvitationData> _receivedInvitationData = [];

  ReceivedInvitationModel.fromJson(json) {
    _flag = json['flag'];
    _counts = json['counts'];
    _page = json['page'];
    _pageSize = json['pageSize'];
    _code = json['code'];
    _message = json['message'];
    _latestCount = json['latestCount'];
    _items = json['items'];

    List<ReceivedInvitationData> tempReceivedInvitation = [];
    for (int i = 0; i < _items.length; i++) {
      ReceivedInvitationData receivedInvitationData =
          ReceivedInvitationData(_items[i]);
      tempReceivedInvitation.add(receivedInvitationData);
    }

    _receivedInvitationData = tempReceivedInvitation;
  }

  get flag => _flag;

  get counts => _counts;

  get latestCount => _latestCount;

  get page => _page;

  get pageSize => _pageSize;

  get code => _code;

  get message => _message;

  List<ReceivedInvitationData> get receivedInvitationData => _receivedInvitationData;
}

class ReceivedInvitationData {
  var _viewUserId;
  var _logo;
  var _badgeUrl;
  var _vipLv;
  var _firstName;
  var _lastName;
  var _gender;
  var _city;
  var _position;
  var _mobile;
  var _introduction;
  var _meetingId;
  var _isRead;
  var _isConsent;
  var _isMeet;
  var _isContact;
  var _icon;
  var _background;

  ReceivedInvitationData(data) {
    _viewUserId = data['viewUserId'];
    _logo = data['logo'];
    _badgeUrl = data['badgeUrl'];
    _vipLv = data['vipLv'];
    _firstName = data['firstName'];
    _lastName = data['lastName'];
    _gender = data['gender'];
    _city = data['city'];
    _position = data['position'];
    _mobile = data['mobile'];
    _introduction = data['introduction'];
    _meetingId = data['meetingId'];
    _isRead = data['isRead'];
      _isConsent = data['isConsent'];
    _isMeet = data['isMeet'];
    _isContact = data['isContact'];
    _icon = data['icon'];
    _background = data['background'];
  }

  get viewUserId => _viewUserId;

  get logo => _logo;

  get badgeUrl => _badgeUrl;

  get vipLv => _vipLv;

  get firstName => _firstName;

  get lastName => _lastName;

  get gender => _gender;

  get city => _city;

  get position => _position;

  get mobile => _mobile;

  get introduction => _introduction;

  get meetingId => _meetingId;

  get isRead => _isRead;

  get isConsent => _isConsent;

  get isMeet => _isMeet;

  get isContact => _isContact;

  get background => _background;

  get icon => _icon;


  setMeetingStatus(int status){
    _isMeet = status;
  }

  setReadStatus(int status){
    _isRead = status;
  }

  setConsentStatus(int status){
    _isConsent = status;
  }

  setCallStatus(int status){
  _isContact = status;
  }


}
