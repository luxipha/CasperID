class AboutSoftwareModel {
  bool? flag;
  int? code;
  String? message;
  Data? data;

  AboutSoftwareModel({this.flag, this.code, this.message, this.data});

  AboutSoftwareModel.fromJson(Map<String, dynamic> json) {
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
  String? officialPhone;
  String? latestVersion;
  String? latestVersionUrl;
  AppVersionIntroduce? appVersionIntroduce;
  String? userAgreement;
  String? privacyPolicy;

  Data(
      {this.officialPhone,
      this.latestVersion,
      this.latestVersionUrl,
      this.appVersionIntroduce,
      this.userAgreement,
      this.privacyPolicy});

  Data.fromJson(Map<String, dynamic> json) {
    officialPhone = json['officialPhone'];
    latestVersion = json['latestVersion'];
    latestVersionUrl = json['latestVersionUrl'];
    appVersionIntroduce = json['appVersionIntroduce'] != null
        ? new AppVersionIntroduce.fromJson(json['appVersionIntroduce'])
        : null;
    userAgreement = json['userAgreement'];
    privacyPolicy = json['privacyPolicy'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['officialPhone'] = this.officialPhone;
    data['latestVersion'] = this.latestVersion;
    data['latestVersionUrl'] = this.latestVersionUrl;
    if (this.appVersionIntroduce != null) {
      data['appVersionIntroduce'] = this.appVersionIntroduce!.toJson();
    }
    data['userAgreement'] = this.userAgreement;
    data['privacyPolicy'] = this.privacyPolicy;
    return data;
  }
}

class AppVersionIntroduce {
  String? title;
  String? body;

  AppVersionIntroduce({this.title, this.body});

  AppVersionIntroduce.fromJson(Map<String, dynamic> json) {
    title = json['title'];
    body = json['body'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['title'] = this.title;
    data['body'] = this.body;
    return data;
  }
}
