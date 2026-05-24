class DataStatisticsModel {
  bool? flag;
  int? code;
  String? message;
  Data? data;

  DataStatisticsModel({this.flag, this.code, this.message, this.data});

  DataStatisticsModel.fromJson(Map<String, dynamic> json) {
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
  int? voteCount;
  int? votedCount;
  int? currentCount;

  Data({this.voteCount, this.votedCount, this.currentCount});

  Data.fromJson(Map<String, dynamic> json) {
    voteCount = json['voteCount'];
    votedCount = json['votedCount'];
    currentCount = json['currentCount'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['voteCount'] = this.voteCount;
    data['votedCount'] = this.votedCount;
    data['currentCount'] = this.currentCount;
    return data;
  }
}
