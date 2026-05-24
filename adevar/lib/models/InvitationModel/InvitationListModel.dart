class InvitationListModel {
  var _flag;
  var _counts;
  var _page;
  var _pageSize;
  var _code;
  var _message;
  List<MyInvitationData> _items = [];

  InvitationListModel.fromJson(json) {
    _flag = json['flag'];
    _counts = json['counts'];
    _page = json['page'];
    _pageSize = json['pageSize'];
    _code = json['code'];
    _message = json['message'];

    List<MyInvitationData> tempItems = [];
    if (json['items'] != null) {
      for (var i = 0; i < json['items'].length; i++) {
        MyInvitationData invitationData = MyInvitationData(json['items'][i]);
        tempItems.add(invitationData);
      }
    }
    _items = tempItems;
  }

  get flag => _flag;

  get counts => _counts;

  get page => _page;

  get pageSize => _pageSize;

  get code => _code;

  get message => _message;

  List<MyInvitationData> get myInvitationData => _items;
}

class MyInvitationData {
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

  MyInvitationData(result) {
    _viewUserId = result['viewUserId'];
    _logo = result['logo'];
    _badgeUrl = result['badgeUrl'];
    _vipLv = result['vipLv'];
    _firstName = result['firstName'];
    _lastName = result['lastName'];
    _gender = result['gender'];
    _city = result['city'];
    _position = result['position'];
    _mobile = result['mobile'];
    _introduction = result['introduction'];
    _meetingId = result['meetingId'];
    _isRead = result['isRead'];
    _isConsent = result['isConsent'];
    _isMeet = result['isMeet'];
    _isContact = result['isContact'];
    _icon = result['icon'];
    _background = result['background'];
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

  get icon => _icon;

  get background => _background;



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
