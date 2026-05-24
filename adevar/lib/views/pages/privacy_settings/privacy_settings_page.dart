import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_switch/flutter_switch.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/invitation_open_close_controller/InvitationOpenCloseController.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/micheal_screens/access_settings.dart';
import 'package:highfedilityadevar/models/invitationOpenCloseModel/InvitationOpenCloseModel.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/models/visibleInVisibleTOPublicModel/visibleInVisibleTOPublic.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/pages/authorization_setting/authorization_setting_page.dart';
import 'package:highfedilityadevar/views/pages/block_user/block_user_page.dart';
import 'package:highfedilityadevar/views/pages/manage_public_setting/manage_public_setting_page.dart';

import '../../../controllers/visible_to_public_controller/VisibleToPublicController.dart';

class PrivacySettingsPage extends StatefulWidget {
  @override
  _PrivacySettingsPageState createState() => _PrivacySettingsPageState();
}

class _PrivacySettingsPageState extends State<PrivacySettingsPage>
    with BaseClass {
  bool invitationStatus = true;
  bool publicStatus = true;

  final GetSharedPref _getSharedPref = Get.put(GetSharedPref());

  final InvitationOpenCloseController _updateInvitationStatusController =
      Get.isRegistered<InvitationOpenCloseController>()
          ? Get.find<InvitationOpenCloseController>()
          : Get.put(InvitationOpenCloseController());

  final VisibleToPublicController _updateVisibleToPublicStatusController =
      Get.isRegistered<VisibleToPublicController>()
          ? Get.find<VisibleToPublicController>()
          : Get.put(VisibleToPublicController());

  @override
  void initState() {
    super.initState();
    getInvitationAndVisibleSettings();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
        child: Container(
      padding: EdgeInsets.symmetric(horizontal: 30),
      child: Column(
        children: [
          _getSettingsWidget(
            onTileTap: () {},
            title: 'Invitation',
            subTitle: 'Your information will be searchable by others',
            leadingImage: AppImages.INVITATION,
            trailingWidget: Container(
              width: 50,
              child: FlutterSwitch(
                width: 50.0,
                height: 30.0,

                /*  valueFontSize: 20.0,
                toggleSize: 15.0,*/
                value: invitationStatus,
                borderRadius: 30.0,
                showOnOff: false,
                onToggle: (val) {
                  setState(() {
                    hitInvitationOpenClose(val);
                  });
                },
              ),
            ),
          ),
          Divider(
            thickness: 1,
          ),
          _getSettingsWidget(
            onTileTap: () {},
            title: 'Visible to public',
            subTitle: 'Your information will be searchable by others',
            leadingImage: AppImages.VISIBLE_TO_PUBLIC,
            trailingWidget: Container(
              width: 50,
              child: FlutterSwitch(
                width: 50.0,
                height: 30.0,

                /*  valueFontSize: 20.0,
                toggleSize: 15.0,*/
                value: publicStatus,
                borderRadius: 30.0,
                showOnOff: false,
                onToggle: (val) {
                  setState(() {
                    publicStatus = val;

                    hitPublicVisibleInvisible(publicStatus);
                  });
                },
              ),
            ),
          ),
          Divider(
            thickness: 1,
          ),
          _getSettingsWidget(
            onTileTap: () {
              Get.to(() => BlockUserPage());
            },
            title: 'Block users',
            subTitle: 'See which user you have blocked',
            leadingImage: AppImages.NOTIFICATION,
            trailingWidget: Icon(
              Icons.arrow_forward_ios_rounded,
              color: AppColors.FORWARD_COLOR_LIGHT,
            ),
          ),
          Divider(
            thickness: 1,
          ),
          _getSettingsWidget(
            onTileTap: () {
              Get.to(() => ManagePublicAccessSettingPage());
            },
            title: 'Manage Access settings',
            subTitle: 'Set the public information you show',
            leadingImage: AppImages.MANAGE_ACCESS,
            trailingWidget: Icon(
              Icons.arrow_forward_ios_rounded,
              color: AppColors.FORWARD_COLOR_LIGHT,
            ),
          ),
          Divider(
            thickness: 1,
          ),
          // _getSettingsWidget(
          //   onTileTap: () {
          //     Get.to(() => AuthorizationSettingPage());
          //   },
          //   title: 'Authorization',
          //   subTitle: 'Set the public information you show',
          //   leadingImage: AppImages.AUTHORIZATION,
          //   trailingWidget: Icon(
          //     Icons.arrow_forward_ios_rounded,
          //     color: AppColors.FORWARD_COLOR_LIGHT,
          //   ),
          // ),
          // Divider(
          //   thickness: 1,
          // ),
          _getSettingsWidget(
            onTileTap: () {
              Get.to(() => AccessSettings());
            },
            title: 'Access settings',
            subTitle: 'Set the public information you show',
            leadingImage: AppImages.ACCESS_SETTINGS,
            trailingWidget: Icon(
              Icons.arrow_forward_ios_rounded,
              color: AppColors.FORWARD_COLOR_LIGHT,
            ),
          ),
          Divider(
            thickness: 1,
          ),
        ],
      ),
    ));
  }

  Widget _getSettingsWidget({
    required String title,
    required Widget trailingWidget,
    required String leadingImage,
    required String subTitle,
    required Function onTileTap,
  }) {
    return ListTile(
        onTap: () {
          onTileTap();
          //Get.to(()=>InviteFriendsPage());
        },
        leading: Image(
          image: AssetImage(leadingImage),
          height: 22,
          width: 22,
        ),
        subtitle: Text(
          subTitle,
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w400, fontSize: 12, color: Colors.grey),
        ),
        title: Text(
          title,
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w400,
              fontSize: 18,
              color: AppColors.BLACK_SHADE),
        ),
        trailing: trailingWidget);
  }

  void hitInvitationOpenClose(bool status) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    showCircularDialog(context);
    if (status) {
      try {
        InvitationOpenCloseModel model = await _updateInvitationStatusController
            .invitationOpen(userDataModel.authToken!);

        if (model.flag) {
          setState(() {
            invitationStatus = status;
          });
          Navigator.pop(context);
          showSuccess(title: 'Success', message: model.message);
        } else {
          throw model.message;
        }
      } catch (e) {
        Navigator.pop(context);
        // showError(title: 'Error', message: e.toString());
      }
    } else {
      try {
        InvitationOpenCloseModel model = await _updateInvitationStatusController
            .invitationClose(userDataModel.authToken!);

        if (model.flag) {
          setState(() {
            invitationStatus = status;
          });
          Navigator.pop(context);
          showSuccess(title: 'Success', message: model.message);
        } else {
          throw model.message;
        }
      } catch (e) {
        Navigator.pop(context);
        // showError(title: 'Error', message: e.toString());
      }
    }
  }

  void hitPublicVisibleInvisible(bool publicStatus) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    showCircularDialog(context);
    if (publicStatus) {
      try {
        VisibleInVisibleTOPublic model =
            await _updateVisibleToPublicStatusController
                .openVisiblePublic(userDataModel.authToken!);

        if (model.flag) {
          print(model.toJson());
          Navigator.pop(context);
          showSuccess(title: 'Success', message: model.message);
        } else {
          throw model.message;
        }
      } catch (e) {
        Navigator.pop(context);
        // showError(title: 'Error', message: e.toString());
      }
    } else {
      try {
        VisibleInVisibleTOPublic model =
            await _updateVisibleToPublicStatusController
                .closeVisiblePublic(userDataModel.authToken!);

        if (model.flag) {
          print(model.toJson());
          Navigator.pop(context);
          showSuccess(title: 'Success', message: model.message);
        } else {
          throw model.message;
        }
      } catch (e) {
        Navigator.pop(context);
        // showError(title: 'Error', message: e.toString());
      }
    }
  }

  void getInvitationAndVisibleSettings() async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    showCircularDialog(context);
    try {
      var model = await _updateInvitationStatusController
          .getInvitationVisibleSetting(userDataModel.authToken!);

      if (model.flag) {
        setState(() {
          invitationStatus = model.invitationSwitch == 0 ? false : true;
          publicStatus = model.visbleToPublicSwitch == 0 ? false : true;
        });
        Navigator.pop(context);
        // showSuccess(title: 'Success', message: model.message);
      } else {
        Navigator.pop(context);
        showError(title: 'Error', message: model.message.toString());
      }
    } catch (e) {
      Navigator.pop(context);
      // showError(title: 'Error', message: e.toString());
    }
  }
}
