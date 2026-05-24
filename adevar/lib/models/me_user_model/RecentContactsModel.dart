class RecentContactsModel {
  var _flag;
  var _code;
  var _message;
  var _data;
  List<RecentContactsData> _recentContacts = [];

  RecentContactsModel.fromJson(json) {
    _flag = json['flag'];
    _code = json['code'];
    _message = json['message'];
    _data = json['data'];
    if (_data != null) {
      List<RecentContactsData> tempRecentCommentsData = [];
      for (int i = 0; i < _data.length; i++) {
        RecentContactsData recentContactsData = RecentContactsData(_data[i]);
        tempRecentCommentsData.add(recentContactsData);
      }

      _recentContacts = tempRecentCommentsData;
    }
  }

  get flag => _flag;

  get code => _code;

  get message => _message;

  get data => _data;

  List<RecentContactsData> get recentContacts => _recentContacts;
}

class RecentContactsData {
  var _myFriendId;
  var _logo;
  var _firstName;
  var _lastName;

  RecentContactsData(result) {
    _myFriendId = result['myFriendId'];
    _logo = result['logo'];
    _firstName = result['firstName'];
    _lastName = result['lastName'];
  }

  get myFriendId => _myFriendId;

  get logo => _logo;

  get firstName => _firstName;

  get lastName => _lastName;
}
