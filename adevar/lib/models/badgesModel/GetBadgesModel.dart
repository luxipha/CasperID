import 'package:badges/badges.dart';

class GetBadgesModel {
  var _flag;
  var _counts;
  var _page;
  var _pageSize;
  var _code;
  var _message;
  var _items;
  List<BadgesData> _badgesData = [];

  GetBadgesModel.fromJson(json) {
    _flag = json['flag'];
    _counts = json['counts'];
    _page = json['page'];
    _pageSize = json['pageSize'];
    _code = json['code'];
    _message = json['message'];
    _items = json['items'];

    if (_items != null) {
      List<BadgesData> tempBadges = [];
      for (int i = 0; i < _items.length; i++) {
        BadgesData badgesData = BadgesData(_items[i]);
        tempBadges.add(badgesData);
      }
      _badgesData = tempBadges;
    }
  }

  get flag => _flag;

  get counts => _counts;

  get page => _page;

  get pageSize => _pageSize;

  get code => _code;

  get message => _message;

  List<BadgesData> get badgesData => _badgesData;
}

class BadgesData {
  var _id;
  var _name;
  var _code;
  var _imgUrl;
  var _badgeType;
  var _remark;

  BadgesData(result) {
    _id = result['id'];
    _name = result['name'];
    _code = result['code'];
    _imgUrl = result['imgUrl'];
    _badgeType = result['badgeType'];
    _remark = result['remark'];
  }

  get id => _id;

  get name => _name;

  get code => _code;

  get imgUrl => _imgUrl;

  get badgeType => _badgeType;

  get remark => _remark;
}
