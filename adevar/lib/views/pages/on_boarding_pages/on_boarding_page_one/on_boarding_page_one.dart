import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class OnBoardingPageOne extends StatelessWidget {
  final String assetImage;
  final String title;
  final String subTitle;

  OnBoardingPageOne({
    required this.assetImage,
    required this.title,
    required this.subTitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 378,
      width: 300,
      child: Image(
          image: ExactAssetImage(
              assetImage),
          height: 378,
          width: 300,

      ),
    );
  }
}
