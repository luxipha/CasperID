class GetAllNotificationModel {
  bool? flag;
  int? counts;
  dynamic page;
  int? latestCount;
  int? pageSize;
  int? code;
  String? message;
  List<Items>? items;

  GetAllNotificationModel(
      {this.flag,
      this.counts,
      this.page,
      this.latestCount,
      this.pageSize,
      this.code,
      this.message,
      this.items});

  GetAllNotificationModel.fromJson(Map<String, dynamic> json) {
    flag = json['flag'];
    counts = json['counts'];
    page = json['page'];
    latestCount = json['latestCount'];
    pageSize = json['pageSize'];
    code = json['code'];
    message = json['message'];
    if (json['items'] != null) {
      items = <Items>[];
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
    data['latestCount'] = this.latestCount;
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
  int? viewUserId;
  String? userLogo;
  String? firstName;
  String? lastName;
  int? vipLv;
  int? recUserId;
  String? recordObjectId;
  int? recordLongId;
  int? notificationType;
  String? sendDate;
  int? isRead;
  String? text;
  String? notificationId;

  Items(
      {this.viewUserId,
      this.userLogo,
      this.firstName,
      this.lastName,
      this.vipLv,
      this.recUserId,
      this.recordObjectId,
      this.recordLongId,
      this.notificationType,
      this.sendDate,
      this.isRead,
      this.notificationId,
      this.text});

  Items.fromJson(Map<String, dynamic> json) {
    viewUserId = json['viewUserId'];
    userLogo = json['userLogo'];
    firstName = json['firstName'];
    lastName = json['lastName'];
    vipLv = json['vipLv'];
    recUserId = json['recUserId'];
    recordObjectId = json['recordObjectId'];
    recordLongId = json['recordLongId'];
    notificationType = json['notificationType'];
    sendDate = json['sendDate'];
    isRead = json['isRead'];
    text = json['text'];
    notificationId = json['notificationId'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['viewUserId'] = this.viewUserId;
    data['userLogo'] = this.userLogo;
    data['firstName'] = this.firstName;
    data['lastName'] = this.lastName;
    data['vipLv'] = this.vipLv;
    data['recUserId'] = this.recUserId;
    data['recordObjectId'] = this.recordObjectId;
    data['recordLongId'] = this.recordLongId;
    data['notificationType'] = this.notificationType;
    data['sendDate'] = this.sendDate;
    data['isRead'] = this.isRead;
    data['text'] = this.text;
    data['notificationId'] = this.notificationId;
    return data;
  }
}
