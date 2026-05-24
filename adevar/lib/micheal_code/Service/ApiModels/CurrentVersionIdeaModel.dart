class CurrentVersionIdeaModel {
  bool? flag;
  int? counts;
  int? page;
  int? pageSize;
  int? code;
  String? message;
  List<Items>? items;

  CurrentVersionIdeaModel(
      {this.flag,
        this.counts,
        this.page,
        this.pageSize,
        this.code,
        this.message,
        this.items});

  CurrentVersionIdeaModel.fromJson(Map<String, dynamic> json) {
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
  UserIdeaView? userIdeaView;
  int? commentCount;
  int? likeCount;
  bool? isLike;

  Items(
      {this.baseUserView,
        this.userIdeaView,
        this.commentCount,
        this.likeCount,
        this.isLike});

  Items.fromJson(Map<String, dynamic> json) {
    baseUserView = json['baseUserView'] != null
        ? new BaseUserView.fromJson(json['baseUserView'])
        : null;
    userIdeaView = json['userIdeaView'] != null
        ? new UserIdeaView.fromJson(json['userIdeaView'])
        : null;
    commentCount = json['commentCount'];
    likeCount = json['likeCount'];
    isLike = json['isLike'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.baseUserView != null) {
      data['baseUserView'] = this.baseUserView!.toJson();
    }
    if (this.userIdeaView != null) {
      data['userIdeaView'] = this.userIdeaView!.toJson();
    }
    data['commentCount'] = this.commentCount;
    data['likeCount'] = this.likeCount;
    data['isLike'] = this.isLike;
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

class UserIdeaView {
  String? id;
  int? userId;
  String? title;
  int? type;
  String? text;
  int? created;
  int? updated;
  int? appVersion;
  int? status;
  IdeaStatusLog? ideaStatusLog;
  int? gold;

  UserIdeaView(
      {this.id,
        this.userId,
        this.title,
        this.type,
        this.text,
        this.created,
        this.updated,
        this.appVersion,
        this.status,
        this.ideaStatusLog,
        this.gold});

  UserIdeaView.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    userId = json['userId'];
    title = json['title'];
    type = json['type'];
    text = json['text'];
    created = json['created'];
    updated = json['updated'];
    appVersion = json['appVersion'];
    status = json['status'];
    ideaStatusLog = json['ideaStatusLog'] != null
        ? new IdeaStatusLog.fromJson(json['ideaStatusLog'])
        : null;
    gold = json['gold'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['id'] = this.id;
    data['userId'] = this.userId;
    data['title'] = this.title;
    data['type'] = this.type;
    data['text'] = this.text;
    data['created'] = this.created;
    data['updated'] = this.updated;
    data['appVersion'] = this.appVersion;
    data['status'] = this.status;
    if (this.ideaStatusLog != null) {
      data['ideaStatusLog'] = this.ideaStatusLog!.toJson();
    }
    data['gold'] = this.gold;
    return data;
  }
}

class IdeaStatusLog {
  int? toDo;
  int? inProgress;
  int? done;

  IdeaStatusLog({this.toDo, this.inProgress, this.done});

  IdeaStatusLog.fromJson(Map<String, dynamic> json) {
    toDo = json['toDo'];
    inProgress = json['inProgress'];
    done = json['done'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['toDo'] = this.toDo;
    data['inProgress'] = this.inProgress;
    data['done'] = this.done;
    return data;
  }
}
