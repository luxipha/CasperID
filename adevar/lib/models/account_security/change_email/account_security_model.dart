import 'dart:convert';

AccountSecurityModel accountSecurityModelFromJson(String str) =>
    AccountSecurityModel.fromJson(json.decode(str));

String accountSecurityModelToJson(AccountSecurityModel data) =>
    json.encode(data.toJson());

class AccountSecurityModel {
  AccountSecurityModel({
    this.code,
    this.flag,
    this.message,
  });

  int? code;
  bool? flag;
  String? message;

  factory AccountSecurityModel.fromJson(Map<String, dynamic> json) =>
      AccountSecurityModel(
        code: json["code"] == null ? null : json["code"],
        flag: json["flag"] == null ? null : json["flag"],
        message: json["message"] == null ? null : json["message"],
      );

  Map<String, dynamic> toJson() => {
        "code": code == null ? null : code,
        "flag": flag == null ? null : flag,
        "message": message == null ? null : message,
      };
}
