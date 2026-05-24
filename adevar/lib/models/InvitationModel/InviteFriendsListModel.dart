import 'package:flutter/material.dart';

class InviteFriendsListModel {
  var _flag;
  var _counts;
  var _page;
  var _pageSize;
  var _code;
  var _message;
  var _items;
  List<InviteFriendsData> _inviteFriendsData = [];

  InviteFriendsListModel.fromJson(json) {
    _flag = json['flag'];
    _counts = json['counts'];
    _page = json['page'];
    _pageSize = json['pageSize'];
    _code = json['code'];
    _message = json['message'];
    _items = json['items'];

    if (_items != null) {
      List<InviteFriendsData> tempInviteData = [];
      for (int i = 0; i < _items.length; i++) {
        InviteFriendsData inviteFriendsData =
        InviteFriendsData(_items[i]);
        tempInviteData.add(inviteFriendsData);
      }
      _inviteFriendsData = tempInviteData;
    }
  }

  get flag => _flag;

  get counts => _counts;

  get page => _page;

  get pageSize => _pageSize;

  get code => _code;

  get message => _message;

  List<InviteFriendsData> get inviteFriendsData =>
      _inviteFriendsData;
}

class InviteFriendsData {
  var _userView;
  var _lastOnline;
  var _userId;
  var _logo;
  var _firstName;
  var _lastName;

  InviteFriendsData(data) {
    _userView = data['userView'];
    _lastOnline = data['lastOnline'];

    _userId = _userView['userId'];
    _logo = _userView['logo'];
    _firstName = _userView['firstName'];
    _lastName = _userView['lastName'];

  }

  get lastOnline => _lastOnline;

  get userId => _userId;

  get logo => _logo;

  get firstName => _firstName;

  get lastName => _lastName;
}
