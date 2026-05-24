class BlackListModel {
  List<Item> _item = [];
  var _flag;
  var _counts;
  var _page;
  var _pageSize;
  var _code;
  var _message;

  BlackListModel.fromJson(parsedJson) {
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

  BlackListModel.withError(error) {
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
  var _userId;
  var _logo;
  var _gender;
  var _firstName;
  var _lastName;
  var _position;

  Item(itemData) {
    _userId = itemData['userId'];
    _logo = itemData['logo'];
    print("image $_logo");
    _gender = itemData['gender'];
    _firstName = itemData['firstName'];
    _lastName = itemData['lastName'];
    _position = itemData['position'] ?? "";
  }

  get userId => _userId;

  get logo => _logo;

  get gender => _gender;

  get firstName => _firstName;

  get lastName => _lastName;

  get position => _position;
}
