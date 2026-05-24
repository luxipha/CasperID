class UserPreviousProfileModel {
  var _flag;
  var _code;
  var _message;
  var _data;
  List<UserProfileData> data = [];

  UserPreviousProfileModel.fromJson(json) {
    _flag = json['flag'];
    _code = json['code'];
    _message = json['message'];
    _data = json['data'];
    if (_data != null) {
      List<UserProfileData> tempImages = [];
      for (var i = 0; i < json['data'].length; i++) {
        UserProfileData userProfiles = UserProfileData(_data[i]);
        tempImages.add(userProfiles);
      }
      data = tempImages;
    }
  }

  get flag => _flag;

  get code => _code;

  get message => _message;

  List<UserProfileData> get userProfileData => data;
}

class UserProfileData {
  var _logoId;
  var _logoUrl;
  var _bigLogoUrl;
  var _isNow;

  UserProfileData(json) {
    _logoId = json['logoId'];
    _logoUrl = json['logoUrl'];
    _bigLogoUrl = json['bigLogoUrl'];
    _isNow = json['isNow'];
  }

  get logoId => _logoId;

  get logoUrl => _logoUrl;

  get bigLogoUrl => _bigLogoUrl;

  get isNow => _isNow;
}
