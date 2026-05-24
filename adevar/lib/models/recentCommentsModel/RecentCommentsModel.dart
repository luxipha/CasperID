class RecentCommentsModel {
  var _flag;
  var _counts;
  var _page;
  var _pageSize;
  var _code;
  var _message;
  var _items;
  List<RecentCommentsData> _recentCommentsData = [];

  RecentCommentsModel.fromJson(json) {
    _flag = json['flag'];
    _counts = json['counts'];
    _page = json['page'];
    _pageSize = json['pageSize'];
    _code = json['code'];
    _message = json['message'];
    _items = json['items'];

    if (_items != null) {
      List<RecentCommentsData> tempRecentCommentData = [];
      for (int i = 0; i < _items.length; i++) {
        RecentCommentsData recentCommentsData = RecentCommentsData(_items[i]);
        tempRecentCommentData.add(recentCommentsData);
      }
      _recentCommentsData = tempRecentCommentData;
    }
  }

  get flag => _flag;

  get counts => _counts;

  get page => _page;

  get pageSize => _pageSize;

  get code => _code;

  get message => _message;

  get items => _items;

  List<RecentCommentsData> get recentCommentsData => _recentCommentsData;
}

class RecentCommentsData {
  var _viewUserId;
  var _logo;
  var _firstName;
  var _lastName;
  var _mobile;
  var _position;
  var _vipLv;
  var _commentText;
  var _commentObjId;
  var _likeType;
  var _createdDate;
  bool _commentExpanded = false;

  RecentCommentsData(data) {
    _viewUserId = data['viewUserId'];
    _logo = data['logo'];
    _firstName = data['firstName'];
    _lastName = data['lastName'];
    _mobile = data['mobile'];
    _position = data['position'];
    _vipLv = data['vipLv'];
    _commentText = data['commentText'];
    _commentObjId = data['commentObjId'];
    _likeType = data['likeType'];
    _createdDate = data['createdDate'];
  }

  get viewUserId => _viewUserId;

  get logo => _logo;

  get firstName => _firstName;

  get lastName => _lastName;

  get mobile => _mobile;

  get position => _position;

  get vipLv => _vipLv;

  get commentText => _commentText;

  get commentObjId => _commentObjId;

  get likeType => _likeType;

  get createdDate => _createdDate;

  get commentExpanded => _commentExpanded;

  set expandedValue(bool status){
    _commentExpanded = status;
  }
}
