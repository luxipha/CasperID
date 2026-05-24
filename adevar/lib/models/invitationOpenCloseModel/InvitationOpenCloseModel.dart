class InvitationOpenCloseModel {
    int code;
    bool flag;
    String message;

    InvitationOpenCloseModel({required this.code, required this.flag, required this.message});

    factory InvitationOpenCloseModel.fromJson(Map<String, dynamic> json) {
        return InvitationOpenCloseModel(
            code: json['code'], 
            flag: json['flag'], 
            message: json['message'], 
        );
    }

    Map<String, dynamic> toJson() {
        final Map<String, dynamic> data = new Map<String, dynamic>();
        data['code'] = this.code;
        data['flag'] = this.flag;
        data['message'] = this.message;
        return data;
    }
}