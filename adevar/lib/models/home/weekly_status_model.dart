class WeeklyStatusModel {
  bool? flag;
  int? code;
  String? message;
  Data? data;

  WeeklyStatusModel({this.flag, this.code, this.message, this.data});

  WeeklyStatusModel.fromJson(Map<String, dynamic> json) {
    flag = json['flag'];
    code = json['code'];
    message = json['message'];
    data = json['data'] != null ? new Data.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['flag'] = this.flag;
    data['code'] = this.code;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class Data {
  int? invitationCount;
  String? invitationLast7Day;
  int? likesCount;
  String? likesLast7Day;
  int? reachCount;
  String? reachLast7Day;
  int? commentsCount;
  String? commentsLast7Day;

  Data(
      {this.invitationCount,
      this.invitationLast7Day,
      this.likesCount,
      this.likesLast7Day,
      this.reachCount,
      this.reachLast7Day,
      this.commentsCount,
      this.commentsLast7Day});

  Data.fromJson(Map<String, dynamic> json) {
    invitationCount = json['invitationCount'];
    invitationLast7Day = json['invitationLast7Day'];
    likesCount = json['likesCount'];
    likesLast7Day = json['likesLast7Day'];
    reachCount = json['reachCount'];
    reachLast7Day = json['reachLast7Day'];
    commentsCount = json['commentsCount'];
    commentsLast7Day = json['commentsLast7Day'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['invitationCount'] = this.invitationCount;
    data['invitationLast7Day'] = this.invitationLast7Day;
    data['likesCount'] = this.likesCount;
    data['likesLast7Day'] = this.likesLast7Day;
    data['reachCount'] = this.reachCount;
    data['reachLast7Day'] = this.reachLast7Day;
    data['commentsCount'] = this.commentsCount;
    data['commentsLast7Day'] = this.commentsLast7Day;
    return data;
  }
}
