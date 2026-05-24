class ShareIdeaCommentModel {
  bool? flag;
  int? counts;
  int? page;
  int? pageSize;
  int? code;
  String? message;
  List<Items>? items;

  ShareIdeaCommentModel(
      {this.flag,
        this.counts,
        this.page,
        this.pageSize,
        this.code,
        this.message,
        this.items});

  ShareIdeaCommentModel.fromJson(Map<String, dynamic> json) {
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
  BaseUserView? baseUserView;
  String? id;
  String? ideaId;
  String? parentCommentId;
  String? commentBody;
  int? commentUserId;
  String? callUserFirstName;
  String? callUserLastName;
  int? callUserId;
  bool? isLike;
  int? commentCount;
  int? likeCount;
  int? created;

  Items(
      {this.baseUserView,
        this.id,
        this.ideaId,
        this.parentCommentId,
        this.commentBody,
        this.commentUserId,
        this.callUserFirstName,
        this.callUserLastName,
        this.callUserId,
        this.isLike,
        this.commentCount,
        this.likeCount,
        this.created});

  Items.fromJson(Map<String, dynamic> json) {
    baseUserView = json['baseUserView'] != null
        ? new BaseUserView.fromJson(json['baseUserView'])
        : null;
    id = json['id'];
    ideaId = json['ideaId'];
    parentCommentId = json['parentCommentId'];
    commentBody = json['commentBody'];
    commentUserId = json['commentUserId'];
    callUserFirstName = json['callUserFirstName'];
    callUserLastName = json['callUserLastName'];
    callUserId = json['callUserId'];
    isLike = json['isLike'];
    commentCount = json['commentCount'];
    likeCount = json['likeCount'];
    created = json['created'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.baseUserView != null) {
      data['baseUserView'] = this.baseUserView!.toJson();
    }
    data['id'] = this.id;
    data['ideaId'] = this.ideaId;
    data['parentCommentId'] = this.parentCommentId;
    data['commentBody'] = this.commentBody;
    data['commentUserId'] = this.commentUserId;
    data['callUserFirstName'] = this.callUserFirstName;
    data['callUserLastName'] = this.callUserLastName;
    data['callUserId'] = this.callUserId;
    data['isLike'] = this.isLike;
    data['commentCount'] = this.commentCount;
    data['likeCount'] = this.likeCount;
    data['created'] = this.created;
    return data;
  }
}

class BaseUserView {
  int? userId;
  String? logo;
  String? gender;
  String? firstName;
  String? lastName;
  String? position;

  BaseUserView(
      {this.userId,
        this.logo,
        this.gender,
        this.firstName,
        this.lastName,
        this.position});

  BaseUserView.fromJson(Map<String, dynamic> json) {
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
