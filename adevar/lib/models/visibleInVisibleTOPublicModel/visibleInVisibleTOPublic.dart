class VisibleInVisibleTOPublic {
    int code;
    bool flag;
    String message;

    VisibleInVisibleTOPublic({required this.code, required this.flag, required this.message});

    factory VisibleInVisibleTOPublic.fromJson(Map<String, dynamic> json) {
        return VisibleInVisibleTOPublic(
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