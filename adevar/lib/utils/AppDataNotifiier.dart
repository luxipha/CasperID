import 'package:flutter/material.dart';

class AppDataNotifier extends ChangeNotifier {
  var croppedImageUrl = "";

  Future<void> updateProfileImage(String imageUrl) async {
    croppedImageUrl = imageUrl;
    notifyListeners();
  }

  var badgeUrlUpdated = 0;

  Future<void> updateBadgeUrl(int status) async {
    badgeUrlUpdated = status;
    notifyListeners();
  }

  var invitationStatus = 0;
  var invitationIndex = 0;
  var updateInvitationOf = "";

  Future<void> setInvitationStatus(int status) async {
    invitationStatus = status;
    notifyListeners();
  }

  Future<void> setInvitationIndex(int index) async {
    invitationIndex = index;
    notifyListeners();
  }

  Future<void> updateInvitationAt(String updateAt) async {
    updateInvitationOf = updateAt;
    notifyListeners();
  }
}
