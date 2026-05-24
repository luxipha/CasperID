class RecentContactsModel {
  var _flag;
  var _counts;
  var _page;
  var _pageSize;
  var _code;
  var _message;
  var _items;
  List<RecentContactsData> _recentContactsData = [];

  RecentContactsModel.fromJson(json) {
    _flag = json['flag'];
    _counts = json['counts'];
    _page = json['page'];
    _pageSize = json['pageSize'];
    _code = json['code'];
    _message = json['message'];
    _items = json['items'];
    if (_items != null) {
      List<RecentContactsData> tempRecentContacts = [];
      for (int i = 0; i < _items.length; i++) {
        RecentContactsData recentContactsData = RecentContactsData(_items[i]);
        tempRecentContacts.add(recentContactsData);
      }
      _recentContactsData = tempRecentContacts;
    }
  }

  get flag => _flag;

  get counts => _counts;

  get page => _page;

  get pageSize => _pageSize;

  get code => _code;

  get message => _message;

  List<RecentContactsData> get recentContacts => _recentContactsData;
}

class RecentContactsData {
  var _myFriendId;
  var _logo;
  var _vipLv;
  var _firstName;
  var _lastName;
  var _gender;
  var _introduction;
  var _created;
  var _lastOnline;
  var _city;
  var _position;
  var _companyName;

  RecentContactsData(data) {
    _myFriendId = data['myFriendId'];
    _logo = data['logo'];
    _vipLv = data['vipLv'];
    _firstName = data['firstName'];
    _lastName = data['lastName'];
    _gender = data['gender'];
    _introduction = data['introduction'];
    _created = data['created'];
    _lastOnline = data['lastOnline'];
    _city = data['city'];
    _position = data['position'];
    _companyName = data['companyName'];
  }

  get myFriendId => _myFriendId;

  get logo => _logo;

  get vipLv => _vipLv;

  get firstName => _firstName;

  get lastName => _lastName;

  get gender => _gender;

  get introduction => _introduction;

  get created => _created;

  get lastOnline => _lastOnline;

  get city => _city;

  get position => _position;

  get companyName => _companyName;


}
