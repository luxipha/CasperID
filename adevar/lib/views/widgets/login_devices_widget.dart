import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';

class LoginDevicesWidget extends StatelessWidget {
  final String title;
  final Widget trailingWidget;
  final String leadingImage;
  final String subTitle;
  final Function onTileTap;

  LoginDevicesWidget({
    required this.title,
    required this.trailingWidget,
    required this.leadingImage,
    required this.subTitle,
    required this.onTileTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
        onTap: () {
          onTileTap();
        },
        child: Row(
          children: [
            Image(
              image: AssetImage(leadingImage),
              height: 22,
              width: 22,
            ),
            SizedBox(
              width: 15,
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.roboto(
                        fontWeight: FontWeight.w500,
                        fontSize: 14,
                        color: AppColors.BLACK_SHADE),
                  ),
                  Text(
                    subTitle,
                    style: GoogleFonts.roboto(
                        fontWeight: FontWeight.w400,
                        fontSize: 12,
                        color: Colors.grey),
                  ),
                ],
              ),
            ),
            trailingWidget
          ],
        ));
  }
}
