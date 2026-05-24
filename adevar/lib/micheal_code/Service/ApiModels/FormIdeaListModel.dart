class FormIdeaListModel {
  bool? flag;
  int? counts;
  int? page;
  int? pageSize;
  int? code;
  String? message;
  List<Items>? items;

  FormIdeaListModel(
      {this.flag,
      this.counts,
      this.page,
      this.pageSize,
      this.code,
      this.message,
      this.items});

  FormIdeaListModel.fromJson(Map<String, dynamic> json) {
    flag = json['flag'];
    counts = json['counts'];
    page = json['page'];
    pageSize = json['pageSize'];
    code = json['code'];
    message = json['message'];
    if (json['items'] != null) {
      items = [];
      json['items'].forEach((v) {
        items!.add(new Items.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['flag'] = this.flag;
    data['counts'] = this.counts;
    data['page'] = this.page;
    data['pageSize'] = this.pageSize;
    data['code'] = this.code;
    data['message'] = this.message;
    if (this.items != null) {
      data['items'] = this.items!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Items {
  String? id;
  String? title;
  int? type;
  int? commentCount;
  int? commentUserCount;
  int? likeCount;
  int? created;
  List<LatestUserInfo>? latestUserInfo;
  String? ideaId;

  Items({
    this.id,
    this.title,
    this.type,
    this.commentCount,
    this.commentUserCount,
    this.likeCount,
    this.created,
    this.latestUserInfo,
    this.ideaId,
  });

  Items.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    title = json['title'];
    type = json['type'];
    commentCount = json['commentCount'];
    commentUserCount = json['commentUserCount'];
    likeCount = json['likeCount'];
    created = json['created'];
    ideaId = json['ideaId'];
    if (json['latestUserInfo'] != null) {
      latestUserInfo = [];
      json['latestUserInfo'].forEach((v) {
        if (v != null) {
          latestUserInfo!.add(new LatestUserInfo.fromJson(v));
        }
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['id'] = this.id;
    data['title'] = this.title;
    data['type'] = this.type;
    data['commentCount'] = this.commentCount;
    data['commentUserCount'] = this.commentUserCount;
    data['likeCount'] = this.likeCount;
    data['created'] = this.created;
    data['ideaId'] = this.ideaId;
    if (this.latestUserInfo != null) {
      data['latestUserInfo'] =
          this.latestUserInfo!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class LatestUserInfo {
  int? userId;
  String? logo;
  String? gender;
  String? firstName;
  String? lastName;
  String? position;

  LatestUserInfo(
      {this.userId,
      this.logo,
      this.gender,
      this.firstName,
      this.lastName,
      this.position});

  LatestUserInfo.fromJson(Map<String, dynamic> json) {
    userId = json['userId'];
    logo = json['logo'];
    gender = json['gender'];
    firstName = json['firstName'];
    lastName = json['lastName'];
    position = json['position'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['userId'] = this.userId;
    data['logo'] = this.logo;
    data['gender'] = this.gender;
    data['firstName'] = this.firstName;
    data['lastName'] = this.lastName;
    data['position'] = this.position;
    return data;
  }
}
