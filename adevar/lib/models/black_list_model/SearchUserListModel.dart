class SearchUserListModel {
  List<Item> _item = [];
  var _flag;
  var _counts;
  var _page;
  var _pageSize;
  var _code;
  var _message;

  SearchUserListModel.fromJson(parsedJson) {
    print("proList $parsedJson)");
    _flag = parsedJson['flag'];
    if (_flag) {
      _counts = parsedJson['counts'];
      _page = parsedJson['page'];
      _pageSize = parsedJson['pageSize'];
      _code = parsedJson['code'];
      _message = parsedJson['message'];

      var itemData = parsedJson['items'];
      List<Item> temp = [];
      for (int i = 0; i < itemData.length; i++) {
        Item res = Item(itemData[i]);
        temp.add(res);
      }
      _item = temp;
    }
  }

  SearchUserListModel.withError(error) {
    print(error);
  }

  get flag => _flag;

  get counts => _counts;

  get page => _page;

  get pageSize => _pageSize;

  get code => _code;

  get message => _message;

  List<Item> get item => _item;
}

class Item {
  var _logo;
  var _lastName;
  var _firstName;
  var _gender;
  var _position;
  var _city;
  var _company;
  var _mobile;
  var _isActivate;
  var _ecuserId;

  Item(itemData) {
    _logo = itemData['logo'];
    _lastName = itemData['lastName'];
    _firstName = itemData['firstName'];
    _gender = itemData['gender'];
    _position = itemData['position'];
    _city = itemData['city'];
    _company = itemData['company'];
    _mobile = itemData['mobile'];
    _isActivate = itemData['isActivate'];
    _ecuserId = itemData['eCUserId'];
  }

  get logo => _logo;

  get lastName => _lastName;

  get firstName => _firstName;

  get gender => _gender;

  get position => _position;

  get city => _city;

  get company => _company;

  get mobile => _mobile;

  get isActivate => _isActivate;

  get ecuserId => _ecuserId;
}
