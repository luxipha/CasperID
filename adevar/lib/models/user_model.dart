class UserModel {
  final String? userId;
  final String? email;
  final String? firstName;
  final String? lastName;
  final String? walletAddress;
  final String? did;
  final String? profilePicture;
  final int verificationLevel;
  final String? authToken;

  UserModel({
    this.userId,
    this.email,
    this.firstName,
    this.lastName,
    this.walletAddress,
    this.did,
    this.profilePicture,
    this.verificationLevel = 0,
    this.authToken,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      userId: json['userId']?.toString(),
      email: json['email'] as String?,
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      walletAddress: json['walletAddress'] as String?,
      did: json['did'] as String?,
      profilePicture: json['profilePicture'] as String?,
      verificationLevel: json['verificationLevel'] as int? ?? 0,
      authToken: json['authToken'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        if (userId != null) 'userId': userId,
        if (email != null) 'email': email,
        if (firstName != null) 'firstName': firstName,
        if (lastName != null) 'lastName': lastName,
        if (walletAddress != null) 'walletAddress': walletAddress,
        if (did != null) 'did': did,
        if (profilePicture != null) 'profilePicture': profilePicture,
        'verificationLevel': verificationLevel,
        if (authToken != null) 'authToken': authToken,
      };

  String get displayName {
    if (firstName != null && lastName != null) return '$firstName $lastName';
    if (firstName != null) return firstName!;
    return email ?? 'User';
  }

  String get verificationLabel {
    switch (verificationLevel) {
      case 0:
        return 'Unverified';
      case 1:
        return 'Email Verified';
      case 2:
        return 'Liveness Verified';
      case 3:
        return 'Full KYC';
      default:
        return 'Level $verificationLevel';
    }
  }
}
