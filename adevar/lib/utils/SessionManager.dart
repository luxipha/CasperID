
import 'package:shared_preferences/shared_preferences.dart';

class UserPref {
  static final KEY_USER_PROFILE_UPDATED = "user_profile_updated";
  static final KEY_CROPPED_PROFILE = "cropped_profile";
  static final KEY_BADGE_URL = "badge_url";

  static SharedPreferences? userPref;

  static bool isUserProfileUpdated() {
    bool? status = userPref?.getBool(KEY_USER_PROFILE_UPDATED);
    return status??false;
  }

  static bool setUserProfileUpdateStatus(bool status) {
    userPref?.setBool(KEY_USER_PROFILE_UPDATED, status);
    return status;
  }

  static String getCroppedProfileImage() {
    String? status = userPref?.getString(KEY_CROPPED_PROFILE);
    return status??"";
  }

  static String setCroppedProfileImage(String status) {
    userPref?.setString(KEY_CROPPED_PROFILE, status);
    return status;
  }

  static String getBadgeUrl() {
    String? status = userPref?.getString(KEY_BADGE_URL);
    return status??"";
  }

  static String setBadgeUrl(String status) {
    userPref?.setString(KEY_BADGE_URL, status);
    return status;
  }
}
