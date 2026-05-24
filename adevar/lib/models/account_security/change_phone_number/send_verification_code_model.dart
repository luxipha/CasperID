import 'dart:convert';

SendVerificationCodeToPhoneModel sendVerificationCodeToPhoneModelFromJson(
        String str) =>
    SendVerificationCodeToPhoneModel.fromJson(json.decode(str));

String sendVerificationCodeToPhoneModelToJson(
        SendVerificationCodeToPhoneModel data) =>
    json.encode(data.toJson());

class SendVerificationCodeToPhoneModel {
  SendVerificationCodeToPhoneModel({
    this.code,
    this.flag,
    this.message,
  });

  int? code;
  bool? flag;
  String? message;

  factory SendVerificationCodeToPhoneModel.fromJson(
          Map<String, dynamic> json) =>
      SendVerificationCodeToPhoneModel(
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
