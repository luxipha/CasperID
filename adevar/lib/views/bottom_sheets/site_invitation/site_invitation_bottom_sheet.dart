import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/views/bottom_sheets/site_invitation/site_invitation_widget.dart';
import 'package:highfedilityadevar/views/pages/public_qr_portfolio/public_invite_controller.dart';
import 'package:highfedilityadevar/views/widgets/form_input_with_hint_on_top.dart';

class SiteInvitationBottomSheet {

  void sitInvitationBottomSheet(
      BuildContext context, Function onSubmitTap, bool isSucc) {
    showModalBottomSheet<dynamic>(
        barrierColor: AppColors.BLACK.withOpacity(0.8),
        backgroundColor: Colors.transparent,
        isScrollControlled: true,
        isDismissible: true,
        context: context,
        elevation: 15,
        builder: (BuildContext bc) {
                return SiteInvitationWidget(onSubmitTap, isSucc);
              });
  
  }
}
