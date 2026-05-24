class SearchUserModel {
  bool? flag;
  int? counts;
  int? page;
  int? latestCount;
  int? pageSize;
  int? code;
  String? message;
  List<Items>? items;

  SearchUserModel(
      {this.flag,
      this.counts,
      this.page,
      this.latestCount,
      this.pageSize,
      this.code,
      this.message,
      this.items});

  SearchUserModel.fromJson(Map<String, dynamic> json) {
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
  int? userId;
  String? firstName;
  String? lastName;
  String? logoUrl;
  String? badgeUrl;
  String? position;
  String? city;
  String? online;
  int? rating;
  String? distance;

  Items(
      {this.userId,
      this.firstName,
      this.lastName,
      this.logoUrl,
      this.badgeUrl,
      this.position,
      this.city,
      this.rating,
      this.distance,
      this.online});

  Items.fromJson(Map<String, dynamic> json) {
    userId = json['userId'];
    firstName = json['firstName'];
    lastName = json['lastName'];
    logoUrl = json['logoUrl'];
    badgeUrl = json['badgeUrl'];
    position = json['position'];
    city = json['city'];
    online = json['online'];
    rating = json['rating'];
    distance = json['distance'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['userId'] = this.userId;
    data['firstName'] = this.firstName;
    data['lastName'] = this.lastName;
    data['logoUrl'] = this.logoUrl;
    data['badgeUrl'] = this.badgeUrl;
    data['position'] = this.position;
    data['city'] = this.city;
    data['online'] = this.online;
    data['rating'] = this.rating;
    data['distance'] = this.distance;
    return data;
  }
}
